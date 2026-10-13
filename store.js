// Lưu tiến độ học: trên claude.ai dùng db riêng của từng người (data/users/<id>/progress),
// chạy cục bộ thì dùng localStorage.
(function () {
  'use strict';
  var KEY = 'dsa-progress-v1';
  var ref = null;
  var timer = null;
  var pending = null;
  var writing = Promise.resolve();
  var lastWriteError = null;
  var saveWaiters = [];

  function compact(value) {
    var copy;
    try { copy = JSON.parse(JSON.stringify(value || {})); } catch (_) { copy = {}; }
    // Keep the single progress document below the 256 KiB platform limit.
    function bytes() { return new TextEncoder().encode(JSON.stringify(copy)).length; }
    var buckets = [copy.answers, copy.days, copy.mock, copy.courses];
    buckets.forEach(function (bucket) {
      if (!bucket || typeof bucket !== 'object') return;
      Object.keys(bucket).forEach(function (key) {
        var item = bucket[key];
        if (typeof item === 'string' && item.length > 500) bucket[key] = item.slice(0, 500);
        else if (item && typeof item === 'object') {
          ['code', 'draft', 'answer', 'note', 'weakNotes'].forEach(function (field) {
            if (typeof item[field] === 'string' && item[field].length > 500) item[field] = item[field].slice(0, 500);
          });
        }
      });
    });
    while (bytes() > 240 * 1024) {
      var changed = false;
      buckets.forEach(function (bucket) {
        if (!bucket || typeof bucket !== 'object') return;
        Object.keys(bucket).forEach(function (key) {
          var item = bucket[key];
          if (typeof item === 'string' && item.length > 500) { bucket[key] = item.slice(0, 500); changed = true; }
          else if (item && typeof item === 'object') {
            ['code', 'draft', 'answer', 'note', 'weakNotes'].forEach(function (field) {
              if (typeof item[field] === 'string' && item[field].length > 500) { item[field] = item[field].slice(0, 500); changed = true; }
            });
          }
        });
      });
      if (!changed) {
        if (copy.mock && copy.mock.length) copy.mock.shift();
        else if (copy.days) delete copy.days;
        else if (copy.courses) delete copy.courses;
        else break;
      }
    }
    return copy;
  }

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function writeLocal(obj) {
    try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) { /* bỏ qua */ }
  }

  async function connect() {
    if (!window.claude || typeof window.claude.use !== 'function') return null;
    try {
      var results = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      var db = results[0], user = results[1];
      if (!db || !user) return null;
      var id = await user.id();
      if (!id) return null;
      if (typeof user.can === 'function' && await user.can('data.write') === false) return null;
      return db.doc('data/users/' + id + '/progress');
    } catch (e) { return null; }
  }

  async function load() {
    var local = readLocal();
    ref = await connect();
    if (!ref) return local;
    try {
      var snap = await ref.get();
      if (snap.exists) {
        var data = JSON.parse(JSON.stringify(snap.data().state || {}));
        writeLocal(data);
        return data;
      }
      // Lần đầu trên cloud: mang tiến độ cục bộ (nếu có) lên.
      if (Object.keys(local).length) save(local);
      return local;
    } catch (e) {
      ref = null;
      return local;
    }
  }

  function flush() {
    timer = null;
    var obj = pending;
    pending = null;
    if (!obj || !ref) {
      var skipped = saveWaiters.splice(0);
      skipped.forEach(function (resolve) { resolve(lastWriteError || obj); });
      return;
    }
    var target = ref;
    var body = { state: compact(obj), updatedAt: new Date().toISOString() };
    writing = writing.then(function () { return target.set(body).then(function () { lastWriteError = null; }); }).catch(function (e) {
      if (e && e.code === 'invalid_argument') {
        ref = null;
        lastWriteError = { code: 'no_write', message: 'Bạn chỉ có quyền xem; tiến độ chỉ được lưu trên thiết bị này.' };
      }
      });
    writing.then(function () {
      var completed = saveWaiters.splice(0);
      completed.forEach(function (resolve) { resolve(lastWriteError || obj); });
    });
  }

  function save(obj) {
    obj = compact(obj);
    writeLocal(obj);
    if (!ref) return Promise.resolve(lastWriteError || obj);
    pending = obj;
    if (timer) clearTimeout(timer);
    return new Promise(function (resolve) {
      saveWaiters.push(resolve);
      timer = setTimeout(flush, 1500);
    });
  }

  window.addEventListener('pagehide', function () { if (timer) { clearTimeout(timer); flush(); } });

  window.Store = {
    load: load,
    save: save,
    // Bản chạy qua Wi-Fi cho iPad (OFFLINE_MODE): kho là bản sao cục bộ, không phải cloud.
    isCloud: function () { return !!ref && !window.OFFLINE_MODE; }
  };
}());
