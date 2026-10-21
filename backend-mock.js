// HCA_BACKEND giả: dữ liệu trong bộ nhớ + localStorage (hca-mock-v1). Dùng để thử giao diện không cần Supabase.
// ?as=guest|user|admin chọn vai khi tải trang (mặc định: user đã đăng nhập "Bạn Thử").
(function () {
  'use strict';
  var KEY = 'hca-mock-v1';
  var FREE_DAILY = 25;
  var MAX_DOC = 262144;
  var USER_ID = 'u-mock-user';
  var ADMIN_ID = 'u-mock-admin';
  var DEFAULT_EMAIL = 'thu@vi.du';
  var MODELS = { default: 'claude-opus-5-5', small: 'claude-haiku-5-5' };

  function fail(code, message) { return { code: code, message: message }; }
  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function isObj(x) { return x && typeof x === 'object' && !Array.isArray(x); }
  function ls() { try { return window.localStorage; } catch (e) { return null; } }

  // ---- trạng thái ----
  var state = { accounts: {}, session: null, sessionSet: false, docs: {}, key: null, usage: {} };
  try {
    var raw = ls() && ls().getItem(KEY);
    var saved = raw ? JSON.parse(raw) : null;
    if (isObj(saved)) {
      state.accounts = isObj(saved.accounts) ? saved.accounts : {};
      state.session = saved.session || null;
      state.sessionSet = !!saved.sessionSet;
      state.docs = isObj(saved.docs) ? saved.docs : {};
      state.key = saved.key || null;
      state.usage = isObj(saved.usage) ? saved.usage : {};
    }
  } catch (e) { /* dữ liệu hỏng: bắt đầu lại */ }

  function persist() {
    try { if (ls()) ls().setItem(KEY, JSON.stringify(state)); } catch (e) { /* đầy bộ nhớ: bỏ qua */ }
  }

  function demoAccount(id, email, name) {
    if (!state.accounts[email]) state.accounts[email] = { id: id, email: email, name: name, avatarUrl: null, providers: ['email'], registered: true };
    return state.accounts[email];
  }
  demoAccount(USER_ID, DEFAULT_EMAIL, 'Bạn Thử');
  demoAccount(ADMIN_ID, 'admin@vi.du', 'Quản Trị');

  function userOf(rec) {
    return { id: rec.id, email: rec.email, name: rec.name, avatarUrl: rec.avatarUrl || null, providers: (rec.providers || ['email']).slice() };
  }
  function findById(id) {
    var out = null;
    Object.keys(state.accounts).forEach(function (k) { if (state.accounts[k].id === id) out = state.accounts[k]; });
    return out;
  }
  function current() { return state.session ? findById(state.session.userId) : null; }

  // chọn vai theo ?as= khi tải trang
  (function () {
    var as = null;
    try { var m = /[?&]as=([a-z]+)/.exec(window.location.search || ''); as = m ? m[1] : null; } catch (e) { as = null; }
    if (as === 'guest') { state.session = null; state.sessionSet = true; }
    else if (as === 'admin') { state.session = { userId: ADMIN_ID }; state.sessionSet = true; }
    else if (as === 'user' || !state.sessionSet) { state.session = { userId: USER_ID }; state.sessionSet = true; }
    persist();
    // áp dụng ?as= một lần rồi bỏ khỏi URL, để lần tải lại sau đăng nhập/đăng xuất giữ đúng phiên giả
    if (as) {
      try {
        var u = new URL(window.location.href); u.searchParams.delete('as');
        window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash);
      } catch (e) { /* bỏ qua */ }
    }
  }());

  // ---- tiện ích ----
  function unsubscribable(fn) {
    var plain = function () { fn(); };
    var h = function () { fn(); };
    h.then = function (res, rej) { return Promise.resolve(plain).then(res, rej); };
    return h;
  }
  function merge(a, b) {
    Object.keys(b || {}).forEach(function (k) {
      var v = b[k];
      if (isObj(v) && isObj(a[k])) merge(a[k], v); else a[k] = clone(v);
    });
    return a;
  }
  function parentOf(p) { var s = p.split('/'); s.pop(); return s.join('/'); }
  function dayKey() { return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10); }

  // ---- auth ----
  var authListeners = [];
  function emitAuth(event, session) {
    authListeners.slice().forEach(function (fn) { try { fn(event, session); } catch (e) { /* bỏ qua */ } });
  }
  function sessionObj() {
    var rec = current();
    return rec ? { user: userOf(rec), accessToken: 'mock-token-' + rec.id } : null;
  }
  function login(rec, event) {
    state.session = { userId: rec.id }; state.sessionSet = true; persist();
    var s = sessionObj(); emitAuth(event || 'SIGNED_IN', s); return s;
  }
  function checkEmail(email) {
    var e = String(email || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+$/.test(e)) throw fail('bad_credentials', 'Email không hợp lệ.');
    return e;
  }
  function newId() { return 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  var auth = {
    session: function () { return Promise.resolve(sessionObj()); },
    onChange: function (cb) {
      authListeners.push(cb);
      return unsubscribable(function () { authListeners = authListeners.filter(function (x) { return x !== cb; }); });
    },
    signIn: function (email, password) {
      try {
        var e = checkEmail(email);
        if (String(password || '').length < 6) throw fail('bad_credentials', 'Email hoặc mật khẩu không đúng.');
        var rec = state.accounts[e];
        if (!rec) rec = state.accounts[e] = { id: newId(), email: e, name: e.split('@')[0], avatarUrl: null, providers: ['email'], registered: false };
        return Promise.resolve(login(rec));
      } catch (err) { return Promise.reject(err); }
    },
    signUp: function (email, password, name) {
      try {
        var e = checkEmail(email);
        if (String(password || '').length < 6) throw fail('weak_password', 'Mật khẩu cần ít nhất 6 ký tự.');
        if (state.accounts[e] && state.accounts[e].registered) throw fail('email_taken', 'Email này đã được đăng ký.');
        var rec = state.accounts[e] = { id: newId(), email: e, name: String(name || '').trim() || e.split('@')[0],
          avatarUrl: null, providers: ['email'], registered: true };
        login(rec);
        return Promise.resolve({ needsConfirm: false });
      } catch (err) { return Promise.reject(err); }
    },
    signInWith: function (provider) {
      var label = provider === 'facebook' ? 'Facebook' : 'Google';
      var email = 'nguoidung.' + provider + '@vi.du';
      var rec = state.accounts[email];
      if (!rec) rec = state.accounts[email] = { id: 'u-mock-' + provider, email: email, name: 'Người dùng ' + label,
        avatarUrl: null, providers: [provider], registered: true };
      login(rec);
      return Promise.resolve();
    },
    signOut: function () {
      state.session = null; state.sessionSet = true; persist();
      emitAuth('SIGNED_OUT', null);
      return Promise.resolve();
    },
    resetPassword: function (email) {
      try { checkEmail(email); return Promise.resolve(); } catch (err) { return Promise.reject(err); }
    },
    updatePassword: function (pw) {
      if (!current()) return Promise.reject(fail('login_required', 'Hãy đăng nhập lại.'));
      if (String(pw || '').length < 6) return Promise.reject(fail('weak_password', 'Mật khẩu cần ít nhất 6 ký tự.'));
      return Promise.resolve();
    },
    updateProfile: function (patch) {
      var rec = current();
      if (!rec) return Promise.reject(fail('login_required', 'Hãy đăng nhập lại.'));
      var name = String((patch && patch.name) || '').trim();
      if (name) rec.name = name.slice(0, 80);
      persist();
      emitAuth('USER_UPDATED', sessionObj());
      return Promise.resolve();
    }
  };

  // ---- docs (RLS giả) ----
  var subs = [];
  function emitDocs(path) {
    var par = parentOf(path);
    subs.slice().forEach(function (s) {
      if (s.target === path || s.target === par) { try { s.cb(); } catch (e) { /* bỏ qua */ } }
    });
  }
  function canRead(path) {
    var rec = current();
    if (!rec) return !/^data(\/|$)/.test(path) ? true : false;
    if (rec.id === ADMIN_ID) return true;
    if (/^data(\/|$)/.test(path)) return path.indexOf('data/users/' + rec.id + '/') === 0;
    return true;
  }
  function canWrite(path) {
    var rec = current();
    if (!rec) return false;
    if (rec.id === ADMIN_ID) return true;
    if (/^data(\/|$)/.test(path)) return path.indexOf('data/users/' + rec.id + '/') === 0;
    return true;
  }
  function noWrite() { return fail('invalid_argument', 'Bạn không có quyền ghi.'); }
  function checkSize(data) {
    if (JSON.stringify(data).length > MAX_DOC) throw fail('invalid_argument', 'Dữ liệu quá lớn.');
  }
  function checkPath(path) {
    var s = String(path || '').split('/');
    if (s.length % 2 !== 0 || s.some(function (x) { return !x; })) throw fail('invalid_argument', 'Đường dẫn không hợp lệ.');
  }

  var docs = {
    get: function (path) {
      if (!canRead(path)) return Promise.resolve(null);
      var d = state.docs[path];
      return Promise.resolve(d == null ? null : clone(d));
    },
    list: function (parent, limit) {
      var depth = String(parent).split('/').length + 1;
      var n = limit > 0 ? limit : 1000;
      var out = Object.keys(state.docs).filter(function (k) {
        return k.indexOf(parent + '/') === 0 && k.split('/').length === depth && state.docs[k] != null && canRead(k);
      }).sort().slice(0, n).map(function (k) { return { path: k, data: clone(state.docs[k]) }; });
      return Promise.resolve(out);
    },
    set: function (path, data) {
      try {
        checkPath(path);
        if (!canWrite(path)) throw noWrite();
        checkSize(data);
        state.docs[path] = clone(data); persist(); emitDocs(path);
        return Promise.resolve();
      } catch (err) { return Promise.reject(err); }
    },
    update: function (path, patch) {
      try {
        checkPath(path);
        if (!canWrite(path)) throw noWrite();
        if (state.docs[path] == null) throw fail('not_found', 'Không tìm thấy tài liệu để cập nhật.');
        var next = merge(clone(state.docs[path]), patch);
        checkSize(next);
        state.docs[path] = next; persist(); emitDocs(path);
        return Promise.resolve();
      } catch (err) { return Promise.reject(err); }
    },
    remove: function (path) {
      try {
        checkPath(path);
        if (!canWrite(path)) throw noWrite();
        delete state.docs[path]; persist(); emitDocs(path);
        return Promise.resolve();
      } catch (err) { return Promise.reject(err); }
    },
    subscribe: function (target, cb) {
      var s = { target: target, cb: cb };
      subs.push(s);
      return unsubscribable(function () { subs = subs.filter(function (x) { return x !== s; }); });
    }
  };

  function profiles(ids) {
    var out = {};
    [].concat(ids || []).forEach(function (id) {
      var rec = findById(id);
      out[id] = { id: id, name: rec ? rec.name : 'Người học', avatarUrl: rec ? rec.avatarUrl : null };
    });
    return Promise.resolve(out);
  }
  function isAdmin() { var rec = current(); return Promise.resolve(!!rec && rec.id === ADMIN_ID); }

  // ---- câu trả lời mẫu (chép từ dsa-app/dev.html) ----
  var rv = 0;
  function mockPlan(tag) {
    return { summary: 'Chiến lược ' + tag, whyItWorks: 'Vì **ưu tiên** phần hay thi.', milestones: ['Sau 7 ngày tự code được stack, sort'],
      days: [1, 2, 3, 4, 5, 6, 7].map(function (d) {
        return { day: d, title: 'Ngày ' + d + ' ' + tag, minutes: 45, task: 'Nhiệm vụ ' + d, steps: ['Bước A (20 phút)', 'Bước B (25 phút)'],
          passCriteria: ['Đúng 4/5 câu'], avoid: ['Không xem video'], selfCheck: [{ q: 'Vì sao LIFO?', a: 'Vì ngoặc mở sau đóng trước' }],
          lessonRefs: ['ch4-l1', 'zz-l9'], exerciseRefs: d === 1 ? ['ch1-e6', 'ch4-e2', 'khong-co'] : [],
          exercises: d === 2 ? [{ title: 'Bài tự soạn', difficulty: 'Dễ', kind: 'text', statement: 'Giải thích O(n)',
            hint: 'Đếm vòng lặp', solution: 'Một vòng lặp n lần' }] : [] };
      }),
      scale: [{ min: 90, label: '🟢 Rất tốt' }, { min: 75, label: '🟡 Được' }, { min: 60, label: '🟠 Củng cố' }, { min: 0, label: '🔴 Học lại' }],
      nextSteps: 'Tuần 2: cây' };
  }
  var KNOWN = /^(Soạn 10-20 từ|Đánh giá ảnh chữ viết tay|Chấm bài viết|Bạn là chuyên gia thiết kế lộ trình|Tự kiểm định lộ trình|Tạo đề cương|Tạo học liệu|Tóm tắt trung thành)/;
  function answer(p) {
    if (/^Soạn 10-20 từ/.test(p)) {
      return { words: [
        { word: '食べる', reading: 'たべる', romaji: 'taberu', meaning: 'ăn', pos: 'động từ', example: 'りんごを食べる。', exampleMeaning: 'Ăn táo.' },
        { word: '学校', reading: 'がっこう', romaji: 'gakkou', meaning: 'trường học', pos: 'danh từ', example: '学校へ行きます。', exampleMeaning: 'Tôi đi đến trường.' },
        { word: '水', reading: 'みず', romaji: 'mizu', meaning: 'nước', pos: 'danh từ', example: '水を飲みます。', exampleMeaning: 'Tôi uống nước.' }] };
    }
    if (/^Đánh giá ảnh chữ viết tay/.test(p)) {
      return { correct: true, score: 8, feedback: 'Viết đúng chữ, nét thứ hai hơi ngắn.', tips: ['Kéo dài nét móc cuối'] };
    }
    if (/^Chấm bài viết/.test(p)) {
      return { score: 7, corrected: '私は毎日学校へ行きます。',
        errors: [{ original: '学校に行く', fix: '学校へ行きます', explain: 'Dùng thể lịch sự ます với người lạ.' }],
        usedWords: ['学校'], missingWords: ['食べる'], feedback: 'Câu đúng ý, cần thêm từ 食べる.' };
    }
    if (/^Bạn là chuyên gia thiết kế lộ trình/.test(p)) return mockPlan('nháp');
    if (/^Tự kiểm định lộ trình/.test(p)) {
      rv++;
      return rv % 2 === 1 ? { verdict: 'chưa đạt', problems: ['Ngày 3 mơ hồ'], changes: ['Đổi tiêu chí ngày 3 thành đo được'], plan: mockPlan('sửa') }
        : { verdict: 'đạt', problems: [], changes: [] };
    }
    if (/^Tạo đề cương/.test(p)) {
      return { title: 'Kinh tế vĩ mô nhập môn', topic: 'kinh tế vĩ mô', summary: 'Khoá thử nghiệm.', level: 'Mới bắt đầu', tags: ['kinh tế', 'vĩ mô'],
        chapters: [1, 2, 3].map(function (i) {
          return { title: 'Chương ' + i + ': GDP và tăng trưởng', summary: 'Tóm tắt ' + i, lessons: [1, 2, 3].map(function (j) {
            return { title: 'Bài ' + i + '.' + j + ' Tổng sản phẩm quốc nội', minutes: 10, sourceRefs: ['s1', 's99'] };
          }) };
        }) };
    }
    if (/^Tạo học liệu/.test(p)) {
      return { flashcards: [{ front: 'GDP là gì?', back: 'Tổng giá trị hàng hoá dịch vụ cuối cùng.' }, { front: 'CPI?', back: 'Chỉ số giá tiêu dùng.' }],
        quiz: [1, 2, 3, 4].map(function (k) {
          return { question: 'Câu hỏi ' + k + '?', options: ['Đáp án đúng ' + k, 'Sai A', 'Sai B', 'Sai C'], answer: 'A', explanation: 'Vì...' };
        }),
        exercises: [{ title: 'Tính GDP', difficulty: 'Dễ', kind: 'text', statement: 'Cho C=100, I=50, G=30, NX=-10. Tính GDP.',
          hint: 'Y=C+I+G+NX', solution: '170' }] };
    }
    if (/^Tóm tắt trung thành/.test(p)) return { sections: [{ chunkIds: ['s1'], summary: 'Tóm tắt' }] };
    if (/chấm|score/i.test(p)) return { score: 8, verdict: 'Gần đúng', feedback: 'Khá tốt.', missing: ['Thiếu đơn vị'] };
    return { minutes: 10, sections: [{ heading: 'Khái niệm', body: 'GDP là **tổng giá trị**.\n\n- Ý một\n- Ý hai' },
      { heading: 'Công thức', body: '`Y = C + I + G + NX`' }], keyPoints: ['GDP đo sản lượng', 'Có 3 cách tính'],
      pitfalls: ['Nhầm GDP với GNP'], reviewNote: 'Số liệu minh hoạ.' };
  }
  var GENERIC = 'Trả lời: xem [[ch3-l1]] và [[khong-co]]. Code: `vector<int> a;` **Ví dụ** ...';

  function lastUserText(body) {
    var msgs = body && body.messages;
    if (Array.isArray(msgs)) {
      for (var i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i] && msgs[i].role === 'user') return String(msgs[i].content == null ? '' : msgs[i].content);
      }
    }
    return String((body && body.prompt) || '');
  }
  function replyFor(body) {
    var p = lastUserText(body);
    var hasImages = body && Array.isArray(body.images) && body.images.length;
    if (body && body.json) {
      if (hasImages && !/^Đánh giá ảnh chữ viết tay/.test(p)) {
        return JSON.stringify({ pages: body.images.map(function (_, k) {
          return { text: 'Đề thi giữa kỳ (OCR ' + (k + 1) + '): Câu 1 cài đặt hàng đợi bằng mảng vòng.' };
        }) });
      }
      return JSON.stringify(answer(p));
    }
    return KNOWN.test(p) ? JSON.stringify(answer(p)) : GENERIC;
  }

  // ---- hạn mức + khoá giả ----
  function usageToday() {
    var rec = current(); var k = (rec ? rec.id : '-') + '|' + dayKey();
    if (!state.usage[k]) state.usage[k] = { requests: 0, outputTokens: 0 };
    return state.usage[k];
  }
  function keyInfo() {
    var u = usageToday();
    return { connected: !!state.key, last4: state.key ? state.key.last4 : null, verifiedAt: state.key ? state.key.verifiedAt : null,
      model: { default: MODELS.default, small: MODELS.small }, usage: { requests: u.requests, outputTokens: u.outputTokens },
      limits: { requests: FREE_DAILY, outputTokens: 60000 }, ownerAvailable: true };
  }
  var QUOTA_MSG = 'Bạn đã dùng hết lượt Claude miễn phí hôm nay. Vào Tài khoản → Kết nối Claude để dùng khoá riêng, hoặc quay lại ngày mai.';

  function abortError() {
    var e;
    try { e = new window.DOMException('Đã huỷ.', 'AbortError'); } catch (x) { e = new Error('Đã huỷ.'); e.name = 'AbortError'; }
    return e;
  }
  function chunkText(text) {
    var out = [], i = 0;
    while (i < text.length) {
      var end = Math.min(text.length, i + 40);
      var c = text.charCodeAt(end - 1);
      if (end < text.length && c >= 0xd800 && c <= 0xdbff) end++;
      out.push(text.slice(i, end)); i = end;
    }
    return out;
  }
  function streamResponse(text, signal, quota) {
    var enc = new window.TextEncoder();
    var parts = chunkText(text), at = 0, timer = null, ctl = null, closed = false, onAbort = null;
    function finish() {
      closed = true;
      if (timer) { clearTimeout(timer); timer = null; }
      if (signal && onAbort && signal.removeEventListener) signal.removeEventListener('abort', onAbort);
    }
    var stream = new window.ReadableStream({
      start: function (c) {
        ctl = c;
        if (signal) {
          onAbort = function () { if (closed) return; finish(); try { c.error(abortError()); } catch (e) { /* đã đóng */ } };
          if (signal.aborted) onAbort(); else signal.addEventListener('abort', onAbort);
        }
      },
      pull: function (c) {
        if (closed) return undefined;
        return new Promise(function (resolve) {
          timer = setTimeout(function () {
            timer = null;
            if (closed) { resolve(); return; }
            try {
              if (at < parts.length) {
                c.enqueue(enc.encode(JSON.stringify({ t: parts[at++] }) + '\n'));
              } else {
                c.enqueue(enc.encode(JSON.stringify({ done: true, model: MODELS.default,
                  usage: { input: 0, output: Math.ceil(text.length / 4) }, quota: quota || null }) + '\n'));
                finish(); c.close();
              }
            } catch (e) { /* luồng đã lỗi/đóng */ }
            resolve();
          }, 30);
        });
      },
      cancel: function () { finish(); }
    });
    return { ok: true, status: 200, headers: { get: function () { return 'application/x-ndjson'; } }, body: stream };
  }
  function errorResponse(status, code, message) {
    var payload = { error: { code: code, message: message } };
    return { ok: false, status: status, headers: { get: function () { return 'application/json'; } },
      json: function () { return Promise.resolve(clone(payload)); },
      text: function () { return Promise.resolve(JSON.stringify(payload)); } };
  }

  function api(path, body, opts) {
    opts = opts || {};
    var rec = current();
    if (!rec) return Promise.reject(fail('login_required', 'Hãy đăng nhập lại.'));
    var method = String(opts.method || (body ? 'POST' : 'GET')).toUpperCase();

    if (path === '/api/claude') {
      if (opts.signal && opts.signal.aborted) return Promise.reject(abortError());
      var u = usageToday();
      if (!state.key && u.requests >= FREE_DAILY) {
        var r429 = errorResponse(429, 'free_quota', QUOTA_MSG);
        return opts.stream ? Promise.resolve(r429) : Promise.reject(fail('free_quota', QUOTA_MSG));
      }
      u.requests += 1;
      var text = replyFor(body || {});
      u.outputTokens += Math.ceil(text.length / 4);
      persist();
      return Promise.resolve(streamResponse(text, opts.signal, state.key ? null : { requests: u.requests, limit: FREE_DAILY }));
    }
    if (path === '/api/key') {
      if (method === 'POST') {
        var k = String((body && body.apiKey) || '').trim();
        if (!/^sk-ant-/.test(k) || k.length < 20) {
          return Promise.reject(fail('bad_key', 'Khoá Claude không hợp lệ. Khoá phải bắt đầu bằng sk-ant- và đủ dài.'));
        }
        state.key = { last4: k.slice(-4), verifiedAt: new Date().toISOString() }; persist();
      } else if (method === 'DELETE') {
        state.key = null; persist();
      }
      return Promise.resolve(keyInfo());
    }
    if (path === '/api/account' && method === 'DELETE') {
      var prefix = 'data/users/' + rec.id + '/';
      Object.keys(state.docs).forEach(function (p) { if (p.indexOf(prefix) === 0) delete state.docs[p]; });
      Object.keys(state.usage).forEach(function (kk) { if (kk.indexOf(rec.id + '|') === 0) delete state.usage[kk]; });
      delete state.accounts[rec.email];
      state.key = null; state.session = null; state.sessionSet = true; persist();
      emitAuth('SIGNED_OUT', null);
      return Promise.resolve({ ok: true });
    }
    return Promise.reject(fail('not_found', 'Không tìm thấy đường dẫn ' + path + '.'));
  }

  function deleteAccount() { return api('/api/account', null, { method: 'DELETE' }).then(function () { return undefined; }); }

  window.HCA_BACKEND = { mock: true, lastAuthError: null, auth: auth, docs: docs, profiles: profiles, isAdmin: isAdmin, api: api,
    deleteAccount: deleteAccount };
}());
