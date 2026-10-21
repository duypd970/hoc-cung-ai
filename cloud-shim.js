// window.claude trên HCA_BACKEND: use("db"|"user"|"sample"|"mcp"). API db giống dsa-app/offline-shim.js.
(function () {
  'use strict';
  var B = window.HCA_BACKEND;
  var MAX_BODY = 4 * 1024 * 1024;
  var MAX_SIDE = 1600;

  function fail(code, message) { return { code: code, message: message }; }
  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function isNum(n) { return typeof n === 'number' && isFinite(n); }

  // ---- phiên ----
  var cur = null;
  var ready = B.auth.session().then(function (s) { cur = s && s.user ? s : null; return cur; }, function () { return null; });
  Promise.resolve(B.auth.onChange(function (ev, s) { cur = s && s.user ? s : null; })).catch(function () { /* bỏ qua */ });
  function me() { return ready.then(function () { return cur ? cur.user : null; }); }

  // ---- db ----
  function snapOf(path, data) {
    var d = data == null ? null : data;
    return { id: path.split('/').pop(), exists: d != null, data: function () { return d == null ? undefined : clone(d); },
      metadata: { fromCache: false, hasPendingWrites: false } };
  }
  function subscribeBackend(target, fn) {
    var off = null, dead = false;
    Promise.resolve(B.docs.subscribe(target, fn)).then(function (u) {
      if (typeof u !== 'function') return;
      if (dead) u(); else off = u;
    }, function () { /* không có realtime: vẫn dùng được */ });
    return function () { dead = true; if (typeof off === 'function') { off(); off = null; } };
  }
  function listen(target, load, next, onError) {
    var seq = 0, alive = true;
    function run() {
      var mine = ++seq;
      ready.then(load).then(function (v) { if (alive && mine === seq) next(v); },
        function (e) { if (alive && mine === seq && typeof onError === 'function') onError(e); });
    }
    var off = subscribeBackend(target, run);
    run();
    return function () { alive = false; off(); };
  }

  function docRef(p) {
    function load() { return B.docs.get(p).then(function (d) { return snapOf(p, d); }); }
    return {
      id: p.split('/').pop(), path: p,
      get: function () { return ready.then(load); },
      set: function (o) { return ready.then(function () { return B.docs.set(p, clone(o)); }); },
      update: function (o) { return ready.then(function () { return B.docs.update(p, clone(o)); }); },
      delete: function () { return ready.then(function () { return B.docs.remove(p); }); },
      collection: function (c) { return coll(p + '/' + c); },
      onSnapshot: function (next, onError) { return listen(p, load, next, onError); }
    };
  }
  function field(d, name) {
    if (d == null) return undefined;
    if (name.indexOf('.') < 0) return d[name];
    return name.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, d);
  }
  function test(v, op, x) {
    switch (op) {
      case '==': return v === x; case '!=': return v !== x;
      case '<': return v < x; case '<=': return v <= x; case '>': return v > x; case '>=': return v >= x;
      case 'in': return Array.isArray(x) && x.indexOf(v) >= 0; case 'not-in': return Array.isArray(x) && x.indexOf(v) < 0;
      case 'array-contains': return Array.isArray(v) && v.indexOf(x) >= 0;
      default: return true;
    }
  }
  function newDocId() { return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function coll(c, q) {
    q = q || { where: [], order: null, limit: 1000 };
    function load() {
      return B.docs.list(c).then(function (rows) {
        var snaps = (rows || []).map(function (r) { return snapOf(r.path, r.data); }).filter(function (s) {
          var d = s.data();
          return q.where.every(function (w) { return test(field(d, w[0]), w[1], w[2]); });
        });
        if (q.order) {
          var f = q.order[0], desc = q.order[1] === 'desc';
          snaps.sort(function (a, b) {
            var x = field(a.data(), f), y = field(b.data(), f);
            return (x < y ? -1 : x > y ? 1 : 0) * (desc ? -1 : 1);
          });
        }
        snaps = snaps.slice(0, q.limit);
        return { docs: snaps, size: snaps.length, empty: !snaps.length,
          docChanges: function () { return snaps.map(function (d, i) { return { type: 'added', doc: d, oldIndex: -1, newIndex: i }; }); },
          metadata: { fromCache: false, hasPendingWrites: false } };
      });
    }
    function next(extra) {
      return coll(c, { where: q.where.concat(extra.where || []), order: extra.order || q.order, limit: extra.limit || q.limit });
    }
    return {
      path: c,
      where: function (f, op, v) { return next({ where: [[f, op, v]] }); },
      orderBy: function (f, dir) { return next({ order: [f, dir || 'asc'] }); },
      limit: function (n) { return next({ limit: n }); },
      get: function () { return ready.then(load); },
      doc: function (id) { return docRef(c + '/' + (id || newDocId())); },
      add: function (o) { var r = this.doc(); return r.set(o).then(function () { return r; }); },
      onSnapshot: function (cb, onError) { return listen(c, load, cb, onError); }
    };
  }
  var db = { doc: docRef, collection: function (c) { return coll(c); } };

  // ---- user ----
  var user = {
    id: function () { return me().then(function (u) { return u ? u.id : null; }); },
    me: function () { return me().then(function (u) { return u ? { id: u.id, name: u.name, isMe: true, guest: false } : null; }); },
    name: function () { return me().then(function (u) { return u ? u.name : 'Khách'; }); },
    isOwner: function () {
      return me().then(function (u) { return u ? B.isAdmin().then(function (v) { return !!v; }, function () { return false; }) : false; });
    },
    canEdit: function () { return me().then(function (u) { return !!u; }); },
    can: function () { return me().then(function (u) { return !!u; }); },
    profiles: function (ids) {
      var list = [].concat(ids || []).filter(function (i) { return i; });
      return me().then(function (u) {
        return Promise.resolve(list.length ? B.profiles(list) : {}).then(function (m) { return m || {}; }, function () { return {}; })
          .then(function (m) {
            var out = {};
            list.forEach(function (id) {
              var isMe = !!u && u.id === id;
              var p = m[id];
              out[id] = { id: id, name: p && p.name ? p.name : (isMe ? u.name : 'Người học'), isMe: isMe, guest: false };
            });
            return out;
          });
      });
    },
    search: function () { return Promise.resolve([]); }
  };

  // ---- tiện ích văn bản ----
  function ndjsonLines(buf) {
    var parts = String(buf).split('\n');
    var rest = parts.pop();
    var items = [];
    parts.forEach(function (ln) {
      var s = ln.trim();
      if (!s) return;
      try { var o = JSON.parse(s); if (o && typeof o === 'object') items.push(o); } catch (e) { /* bỏ dòng hỏng */ }
    });
    return { items: items, rest: rest };
  }
  function tryParse(s) { try { return { ok: true, value: JSON.parse(s) }; } catch (e) { return { ok: false }; } }
  function extractJSON(text) {
    var t = String(text == null ? '' : text).replace(/^﻿/, '').trim();
    var cands = [];
    var re = /```(?:json|JSON)?[ \t]*\r?\n?([\s\S]*?)```/g, m, blocks = [];
    while ((m = re.exec(t))) blocks.push(m[1].trim());
    var tagged = /```json/i.test(t);
    blocks.forEach(function (b) { if (tagged || /^[\[{]/.test(b)) cands.push(b); });
    cands.push(t);
    var stripped = t.replace(/```(?:json|JSON)?/g, '').trim();
    if (stripped !== t) cands.push(stripped);
    var o1 = t.indexOf('{'), o2 = t.lastIndexOf('}'), a1 = t.indexOf('['), a2 = t.lastIndexOf(']');
    var obj = o1 >= 0 && o2 > o1 ? t.slice(o1, o2 + 1) : null;
    var arr = a1 >= 0 && a2 > a1 ? t.slice(a1, a2 + 1) : null;
    // mở ngoặc nào trước thì thử trước (tránh lấy phần tử đầu của mảng một-phần-tử)
    if (obj && arr && a1 < o1) { cands.push(arr); cands.push(obj); } else { if (obj) cands.push(obj); if (arr) cands.push(arr); }
    for (var i = 0; i < cands.length; i++) {
      var r = tryParse(cands[i]);
      if (r.ok && r.value !== null && typeof r.value === 'object') return r.value;
    }
    throw fail('bad_output', 'Claude trả về dữ liệu không đọc được. Hãy thử lại.');
  }

  // ---- ảnh ----
  function stripDataUrl(s) { var i = s.indexOf('base64,'); return i >= 0 ? s.slice(i + 7) : s; }
  function loadBitmap(blob) {
    if (typeof window.createImageBitmap === 'function') {
      return window.createImageBitmap(blob).then(function (bm) {
        return { w: bm.width, h: bm.height, src: bm, done: function () { if (bm.close) bm.close(); } };
      });
    }
    return new Promise(function (resolve, reject) {
      var url = window.URL.createObjectURL(blob), img = new window.Image();
      img.onload = function () {
        resolve({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height, src: img,
          done: function () { window.URL.revokeObjectURL(url); } });
      };
      img.onerror = function () { window.URL.revokeObjectURL(url); reject(fail('invalid_argument', 'Không đọc được ảnh.')); };
      img.src = url;
    });
  }
  function imageToBase64(img) {
    if (typeof img === 'string') return Promise.resolve(stripDataUrl(img));
    return loadBitmap(img).then(function (bm) {
      var scale = Math.min(1, MAX_SIDE / Math.max(bm.w, bm.h, 1));
      var w = Math.max(1, Math.round(bm.w * scale)), h = Math.max(1, Math.round(bm.h * scale));
      var cv = window.document.createElement('canvas');
      cv.width = w; cv.height = h;
      var ctx = cv.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(bm.src, 0, 0, w, h);
      var url = cv.toDataURL('image/jpeg', 0.85);
      bm.done();
      return stripDataUrl(url);
    });
  }

  // ---- sample ----
  function toMessages(input) {
    if (typeof input === 'string') return [{ role: 'user', content: input }];
    return [].concat(input || []).map(function (m) {
      var c = m && m.content;
      if (Array.isArray(c)) c = c.map(function (p) { return typeof p === 'string' ? p : (p && p.text) || ''; }).join('');
      return { role: m && m.role === 'assistant' ? 'assistant' : 'user', content: String(c == null ? '' : c) };
    });
  }
  function isAbort(e, signal) { return (e && e.name === 'AbortError') || !!(signal && signal.aborted); }
  function cancelled() { return fail('cancelled', 'Đã huỷ.'); }
  function loginRequired() {
    try { if (window.HCA_AUTH && typeof window.HCA_AUTH.promptLogin === 'function') window.HCA_AUTH.promptLogin(); } catch (e) { /* bỏ qua */ }
    return fail('login_required', 'Hãy đăng nhập để dùng Claude.');
  }
  function errorFromResponse(res) {
    return Promise.resolve(typeof res.json === 'function' ? res.json() : null).then(function (j) {
      var e = j && j.error;
      return fail((e && e.code) || 'unavailable', (e && e.message) || 'Máy chủ không phản hồi đúng. Hãy thử lại sau.');
    }, function () { return fail('unavailable', 'Máy chủ không phản hồi đúng. Hãy thử lại sau.'); });
  }

  function stopReader(reader) {
    try {
      var p = reader.cancel();
      if (p && typeof p.catch === 'function') p.catch(function () { /* luồng đã lỗi: bỏ qua */ });
    } catch (e) { /* bỏ qua */ }
  }
  function readStream(res, opts) {
    var reader = res.body.getReader(), decoder = new window.TextDecoder();
    var buf = '', text = '', finished = false, meta = {}, signal = opts.signal;
    function handle(items) {
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (it.error) throw fail(it.error.code || 'unavailable', it.error.message || 'Claude gặp lỗi. Hãy thử lại.');
        if (typeof it.t === 'string' && it.t) {
          text += it.t;
          if (typeof opts.onText === 'function') { try { opts.onText({ text: text, delta: it.t }); } catch (e) { /* bỏ qua */ } }
        }
        if (it.done) {
          finished = true; meta = it;
        }
      }
    }
    function step() {
      if (signal && signal.aborted) { stopReader(reader); throw cancelled(); }
      return reader.read().then(function (r) {
        if (r.done) {
          buf += decoder.decode();
          var tail = ndjsonLines(buf + '\n');
          handle(tail.items);
          return null;
        }
        buf += decoder.decode(r.value, { stream: true });
        var parsed = ndjsonLines(buf);
        buf = parsed.rest;
        handle(parsed.items);
        return finished ? null : step();
      });
    }
    return step().then(function () {
      stopReader(reader);
      if (!finished) throw fail('unavailable', 'Kết nối bị gián đoạn trước khi Claude trả lời xong. Hãy thử lại.');
      return { text: text, truncated: !!meta.truncated, model: meta.model, usage: meta.usage, quota: meta.quota || null };
    }, function (e) {
      stopReader(reader);
      throw isAbort(e, signal) ? cancelled() : e;
    });
  }

  function sampleImpl(input, opts, forceJson) {
    opts = opts || {};
    var signal = opts.signal;
    return ready.then(function () {
      if (!cur) throw fail('login_required', 'Hãy đăng nhập để dùng Claude.');
      if (signal && signal.aborted) throw cancelled();
      var imgs = [].concat(opts.images || []).filter(function (x) { return x; });
      return Promise.all(imgs.map(imageToBase64)).then(function (b64) {
        var body = { messages: toMessages(input), tier: opts.modelTier === 'small' ? 'small' : 'default', json: !!forceJson };
        if (b64.length) body.images = b64.map(function (d) { return { media_type: 'image/jpeg', data: d }; });
        if (isNum(opts.maxTokens) && opts.maxTokens > 0) body.maxTokens = Math.floor(opts.maxTokens);
        if (JSON.stringify(body).length >= MAX_BODY) {
          throw fail('prompt_too_large', 'Nội dung gửi đi quá lớn. Hãy rút gọn hoặc dùng ít ảnh hơn.');
        }
        return B.api('/api/claude', body, { stream: true, signal: signal });
      }).then(function (res) {
        if (!res || res.ok === false || !res.body || typeof res.body.getReader !== 'function') {
          return res && res.ok === false ? errorFromResponse(res).then(function (e) { throw e; })
            : Promise.reject(fail('unavailable', 'Máy chủ không phản hồi đúng. Hãy thử lại sau.'));
        }
        return readStream(res, { signal: signal, onText: opts.onText });
      });
    }).catch(function (e) {
      if (isAbort(e, signal)) throw cancelled();
      if (e && e.code === 'login_required') throw loginRequired();
      if (e && typeof e.code === 'string') throw e;
      throw fail('unavailable', 'Không kết nối được Claude. Hãy thử lại sau.');
    });
  }

  function sample(input, opts) { return sampleImpl(input, opts, !!(opts && opts.json)); }
  sample.json = function (prompt, opts) {
    return sampleImpl(prompt, opts, true).then(function (r) { return extractJSON(r.text); });
  };
  sample.limits = function () { return { images: true, tiers: ['default', 'small'] }; };

  window.claude = {
    use: function (name) {
      return ready.then(function () {
        // Bản web không bật AI (HCA_CONFIG.ai = false): không có sample → app tự ẩn các tính năng cần Claude.
        var aiOn = !!(window.HCA_CONFIG && window.HCA_CONFIG.ai);
        return name === 'db' ? db : name === 'user' ? user : name === 'sample' ? (aiOn ? sample : null) : null;
      });
    }
  };
  window.HCA_SHIM = { extractJSON: extractJSON, ndjsonLines: ndjsonLines };
}());
