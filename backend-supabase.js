// HCA_BACKEND thật: đăng nhập + bảng docs trên Supabase (supabase-js v2, nạp sẵn ở window.supabase).
// Mọi lỗi ném ra đều là { code, message } (message tiếng Việt) theo CONTRACT.md.
(function () {
  'use strict';
  var cfg = window.HCA_CONFIG || {};
  var MAX_DOC_BYTES = 262144;
  var CODES = ['bad_credentials', 'email_not_confirmed', 'email_taken', 'weak_password', 'rate_limited', 'invalid_argument',
    'not_found', 'unavailable', 'login_required', 'bad_key', 'free_quota', 'owner_cap', 'prompt_too_large', 'bad_request', 'refused'];

  function fail(code, message) { return { code: code, message: message }; }
  function unavailable() { return fail('unavailable', 'Máy chủ đang bận hoặc mất kết nối. Hãy thử lại sau.'); }
  function unsubscribable(fn) {
    var plain = function () { fn(); };
    var h = function () { fn(); };
    h.then = function (res, rej) { return Promise.resolve(plain).then(res, rej); };
    return h;
  }

  // ---- lỗi OAuth trả về trên URL (đọc TRƯỚC khi supabase-js xử lý ?code=) ----
  var backend = { lastAuthError: null };
  function readUrlParams() {
    var out = { query: null, hash: null };
    try {
      var q = new URLSearchParams(window.location.search || '');
      if (q.get('error') || q.get('error_description') || q.get('code')) out.query = q;
      var h = window.location.hash || '';
      if (/^#[^/]*error/.test(h) || h.indexOf('error_description=') >= 0) out.hash = new URLSearchParams(h.slice(1));
    } catch (e) { /* trình duyệt cũ: bỏ qua */ }
    return out;
  }
  var urlInfo = readUrlParams();
  [urlInfo.query, urlInfo.hash].forEach(function (p) {
    if (p && !backend.lastAuthError && (p.get('error_description') || p.get('error'))) {
      backend.lastAuthError = String(p.get('error_description') || p.get('error')).replace(/\+/g, ' ');
    }
  });

  function cleanUrl() {
    try {
      var u = new URL(window.location.href);
      var changed = false;
      ['code', 'error', 'error_description', 'error_code'].forEach(function (k) {
        if (u.searchParams.has(k)) { u.searchParams.delete(k); changed = true; }
      });
      if (/^#[^/]*error/.test(u.hash) || u.hash.indexOf('error_description=') >= 0) { u.hash = ''; changed = true; }
      if (changed) window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
    } catch (e) { /* bỏ qua */ }
  }

  var sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true, autoRefreshToken: true }
  });

  // ---- ánh xạ lỗi Supabase → mã hợp đồng ----
  function mapError(err) {
    if (err && typeof err === 'object' && typeof err.code === 'string' && CODES.indexOf(err.code) >= 0 && typeof err.message === 'string') return err;
    if (err && err.name === 'AbortError') return err;
    var code = String((err && err.code) || '');
    var msg = String((err && err.message) || '');
    var status = Number(err && err.status) || 0;
    var low = msg.toLowerCase();

    if (code === '42501' || low.indexOf('row-level security') >= 0) return fail('invalid_argument', 'Bạn không có quyền ghi.');
    if (code === '23514') return fail('invalid_argument', 'Dữ liệu quá lớn.');
    if (code === 'P0002') return fail('not_found', 'Không tìm thấy dữ liệu.');
    if (code === 'PGRST301' || low.indexOf('jwt expired') >= 0) return fail('login_required', 'Hãy đăng nhập lại.');

    if (code === 'invalid_credentials' || low.indexOf('invalid login credentials') >= 0) {
      return fail('bad_credentials', 'Email hoặc mật khẩu không đúng.');
    }
    if (code === 'email_not_confirmed' || low.indexOf('email not confirmed') >= 0) {
      return fail('email_not_confirmed', 'Email chưa được xác nhận. Hãy mở thư xác nhận rồi đăng nhập lại.');
    }
    if (code === 'user_already_exists' || code === 'email_exists' || low.indexOf('already registered') >= 0) {
      return fail('email_taken', 'Email này đã được đăng ký.');
    }
    if (code === 'weak_password' || low.indexOf('password should be') >= 0 || low.indexOf('password is too') >= 0) {
      return fail('weak_password', 'Mật khẩu quá yếu. Hãy dùng ít nhất 8 ký tự, có cả chữ và số.');
    }
    if (code === 'same_password') return fail('weak_password', 'Mật khẩu mới phải khác mật khẩu cũ.');
    if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || code === 'over_sms_send_rate_limit' || status === 429) {
      return fail('rate_limited', 'Bạn thao tác quá nhanh. Hãy đợi một lát rồi thử lại.');
    }
    if (code === 'validation_failed' || code === 'email_address_invalid' || low.indexOf('unable to validate email') >= 0) {
      return fail('invalid_argument', 'Email không hợp lệ.');
    }
    if (code === 'user_not_found') return fail('not_found', 'Không tìm thấy tài khoản.');
    if (code === 'session_not_found' || code === 'refresh_token_not_found' || low.indexOf('auth session missing') >= 0) {
      return fail('login_required', 'Hãy đăng nhập lại.');
    }
    if (status === 401) return fail('login_required', 'Hãy đăng nhập lại.');
    if (status === 403) return fail('invalid_argument', 'Bạn không có quyền ghi.');
    return unavailable();
  }
  function reject(err) { return Promise.reject(mapError(err)); }
  function check(res) { if (res && res.error) throw mapError(res.error); return res; }
  function wrap(fn) {
    return function () {
      var args = arguments;
      try { return Promise.resolve(fn.apply(null, args)).catch(reject); } catch (e) { return reject(e); }
    };
  }

  // ---- User từ phiên ----
  function toUser(u) {
    var um = (u && u.user_metadata) || {}, am = (u && u.app_metadata) || {};
    var email = (u && u.email) || '';
    var providers = Array.isArray(am.providers) ? am.providers.slice() : (am.provider ? [am.provider] : []);
    return { id: u.id, email: email, name: um.full_name || um.name || email.split('@')[0] || 'Bạn',
      avatarUrl: um.avatar_url || um.picture || null, providers: providers };
  }
  function toSession(s) { return s && s.user ? { user: toUser(s.user), accessToken: s.access_token } : null; }

  var initDone = null;
  function init() {
    if (!initDone) {
      initDone = Promise.resolve(sb.auth.getSession()).then(function (r) { cleanUrl(); return r; }, function () { cleanUrl(); return null; });
    }
    return initDone;
  }
  function getSession() {
    return init().then(function () { return sb.auth.getSession(); }).then(function (r) {
      return r && r.data && r.data.session ? r.data.session : null;
    }, function () { return null; });
  }
  function redirectTo() { return window.location.origin + window.location.pathname; }

  var adminCache = null; // { id, value }
  var profileCache = {};

  // ---- auth ----
  var lastUserId = null;
  var auth = {
    session: wrap(function () { return getSession().then(toSession); }),
    onChange: function (cb) {
      var res = sb.auth.onAuthStateChange(function (event, session) {
        if (event === 'INITIAL_SESSION') { lastUserId = session && session.user ? session.user.id : null; return; }
        if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'PASSWORD_RECOVERY' && event !== 'USER_UPDATED') return;
        var uid = session && session.user ? session.user.id : null;
        if (event === 'SIGNED_IN') {
          if (uid && uid === lastUserId) return; // supabase-js bắn lại SIGNED_IN khi tab được focus
          lastUserId = uid;
        } else if (event === 'SIGNED_OUT') { lastUserId = null; adminCache = null; }
        // gọi sau để cb có thể gọi lại supabase-js mà không bị kẹt khoá nội bộ
        setTimeout(function () { try { cb(event, toSession(session)); } catch (e) { /* bỏ qua */ } }, 0);
      });
      var sub = res && res.data && res.data.subscription;
      return unsubscribable(function () { if (sub && sub.unsubscribe) sub.unsubscribe(); });
    },
    signIn: wrap(function (email, password) {
      return sb.auth.signInWithPassword({ email: String(email || '').trim(), password: password }).then(function (r) {
        check(r);
        var s = toSession(r.data && r.data.session);
        if (!s) throw unavailable();
        return s;
      });
    }),
    signUp: wrap(function (email, password, name) {
      var n = String(name || '').trim();
      return sb.auth.signUp({ email: String(email || '').trim(), password: password,
        options: { data: n ? { full_name: n } : {}, emailRedirectTo: redirectTo() } }).then(function (r) {
        check(r);
        var u = r.data && r.data.user;
        // email đã tồn tại: Supabase (bật xác nhận email) trả user giả với identities rỗng
        if (u && Array.isArray(u.identities) && u.identities.length === 0) throw fail('email_taken', 'Email này đã được đăng ký.');
        return { needsConfirm: !(r.data && r.data.session) };
      });
    }),
    signInWith: wrap(function (provider) {
      return sb.auth.signInWithOAuth({ provider: provider, options: { redirectTo: redirectTo() } }).then(check).then(function () { return undefined; });
    }),
    signOut: function () {
      adminCache = null;
      return Promise.resolve(sb.auth.signOut()).then(function () { return undefined; }, function () { return undefined; });
    },
    resetPassword: wrap(function (email) {
      return sb.auth.resetPasswordForEmail(String(email || '').trim(), { redirectTo: redirectTo() }).then(check).then(function () { return undefined; });
    }),
    updatePassword: wrap(function (pw) {
      return sb.auth.updateUser({ password: pw }).then(check).then(function () { return undefined; });
    }),
    updateProfile: wrap(function (patch) {
      var name = String((patch && patch.name) || '').trim();
      return sb.auth.updateUser({ data: { full_name: name } }).then(check).then(function (r) {
        var id = r.data && r.data.user && r.data.user.id;
        if (!id) return undefined;
        delete profileCache[id];
        return sb.from('profiles').update({ name: name }).eq('id', id).then(check).then(function () { return undefined; });
      });
    })
  };

  // ---- docs ----
  function byteLen(s) {
    try { return new window.TextEncoder().encode(s).length; } catch (e) { return s.length; }
  }
  function checkSize(data) {
    var s = JSON.stringify(data);
    if (s === undefined) throw fail('invalid_argument', 'Dữ liệu không hợp lệ.');
    if (byteLen(s) > MAX_DOC_BYTES) throw fail('invalid_argument', 'Dữ liệu quá lớn.');
  }
  function parentOf(p) { var s = String(p).split('/'); s.pop(); return s.join('/'); }

  var localSubs = [];
  function emitLocal(path) {
    var par = parentOf(path);
    localSubs.slice().forEach(function (s) {
      if (s.target === path || s.target === par) { try { s.fire(); } catch (e) { /* bỏ qua */ } }
    });
  }

  var chSeq = 0;
  var docs = {
    get: wrap(function (path) {
      return sb.from('docs').select('data').eq('path', path).maybeSingle().then(check).then(function (r) {
        return r.data ? r.data.data : null;
      });
    }),
    list: wrap(function (parent, limit) {
      return sb.from('docs').select('path,data').eq('parent', parent).order('path', { ascending: true })
        .limit(limit > 0 ? limit : 1000).then(check).then(function (r) { return r.data || []; });
    }),
    set: wrap(function (path, data) {
      checkSize(data);
      return sb.from('docs').upsert({ path: path, data: data }, { onConflict: 'path' }).then(check).then(function () {
        emitLocal(path);
      });
    }),
    update: wrap(function (path, patch) {
      checkSize(patch);
      return sb.rpc('doc_update', { p_path: path, p_patch: patch }).then(check).then(function () { emitLocal(path); });
    }),
    remove: wrap(function (path) {
      return sb.from('docs').delete().eq('path', path).then(check).then(function () { emitLocal(path); });
    }),
    subscribe: function (target, cb) {
      var isDoc = String(target).split('/').length % 2 === 0;
      var timer = null, dead = false;
      function fire() { if (!dead) cb(); }
      function remoteFire() { // gộp các sự kiện dồn dập
        if (timer || dead) return;
        timer = setTimeout(function () { timer = null; fire(); }, 100);
      }
      var entry = { target: target, fire: fire };
      localSubs.push(entry);
      var ch = null;
      try {
        ch = sb.channel('hca-docs-' + (++chSeq) + '-' + Math.random().toString(36).slice(2, 6))
          .on('postgres_changes', { event: '*', schema: 'public', table: 'docs',
            filter: (isDoc ? 'path=eq.' : 'parent=eq.') + target }, remoteFire)
          .subscribe();
      } catch (e) { ch = null; }
      return unsubscribable(function () {
        dead = true;
        if (timer) { clearTimeout(timer); timer = null; }
        localSubs = localSubs.filter(function (x) { return x !== entry; });
        if (ch) { try { sb.removeChannel(ch); } catch (e) { /* bỏ qua */ } }
      });
    }
  };

  // ---- profiles / isAdmin ----
  var profiles = wrap(function (ids) {
    var want = [], seen = {};
    [].concat(ids || []).forEach(function (id) {
      if (id && !seen[id]) { seen[id] = true; want.push(id); }
    });
    var missing = want.filter(function (id) { return !profileCache[id]; });
    var load = missing.length ? sb.from('profiles').select('id,name,avatar_url').in('id', missing).then(check).then(function (r) {
      (r.data || []).forEach(function (p) { profileCache[p.id] = { id: p.id, name: p.name || 'Người học', avatarUrl: p.avatar_url || null }; });
    }) : Promise.resolve();
    return load.then(function () {
      var out = {};
      want.forEach(function (id) { out[id] = profileCache[id] || { id: id, name: 'Người học', avatarUrl: null }; });
      return out;
    });
  });
  var isAdmin = wrap(function () {
    return getSession().then(function (s) {
      if (!s || !s.user) return false;
      if (adminCache && adminCache.id === s.user.id) return adminCache.value;
      return sb.rpc('is_admin').then(check).then(function (r) {
        adminCache = { id: s.user.id, value: r.data === true };
        return adminCache.value;
      });
    });
  });

  // ---- gọi API server ----
  function api(path, body, opts) {
    opts = opts || {};
    return getSession().then(function (s) {
      if (!s) throw fail('login_required', 'Hãy đăng nhập lại.');
      var headers = { Authorization: 'Bearer ' + s.access_token };
      if (body) headers['Content-Type'] = 'application/json';
      return window.fetch(path, { method: opts.method || (body ? 'POST' : 'GET'), headers: headers,
        body: body ? JSON.stringify(body) : undefined, signal: opts.signal });
    }).then(function (res) {
      if (!res.ok) {
        return res.json().then(function (j) {
          var e = j && j.error;
          throw fail((e && e.code) || 'unavailable', (e && e.message) || 'Máy chủ không phản hồi đúng. Hãy thử lại sau.');
        }, function () { throw unavailable(); });
      }
      if (opts.stream) return res;
      return res.text().then(function (t) {
        if (!t) return null;
        try { return JSON.parse(t); } catch (e) { throw unavailable(); }
      });
    }).catch(function (err) {
      if (err && err.name === 'AbortError') throw err;
      if (err && typeof err.code === 'string' && typeof err.message === 'string') throw err;
      throw unavailable();
    });
  }

  // Xoá tài khoản: rpc delete_my_account (SQL security definer) — không cần máy chủ riêng.
  var deleteAccount = wrap(function () {
    return sb.rpc('delete_my_account').then(check).then(function () {
      adminCache = null;
      // phiên trên máy chủ đã mất cùng tài khoản; chỉ dọn phiên cục bộ
      return Promise.resolve(sb.auth.signOut({ scope: 'local' })).then(function () { return undefined; }, function () { return undefined; });
    });
  });

  init(); // đổi ?code= lấy phiên và dọn URL ngay khi tải trang

  backend.auth = auth;
  backend.docs = docs;
  backend.profiles = profiles;
  backend.isAdmin = isAdmin;
  backend.api = api;
  backend.deleteAccount = deleteAccount;
  window.HCA_BACKEND = backend;
}());
