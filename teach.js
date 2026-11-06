/**
 * teach.js — "Gia sư của tôi" (/teach)
 * Tính năng riêng, song song với hệ thống khoá học AI hiện có. Lấy cảm hứng từ
 * Claude Skill "teach" (mattpocock/skills): bắt đầu bằng MỤC TIÊU học (vì sao,
 * trình độ, thế nào là thành công, cách học ưa thích) thay vì chỉ một chủ đề,
 * rồi giữ một sổ tay thuật ngữ (cheat sheet) và nhật ký học tập sống cùng
 * người học qua nhiều buổi — thay vì sinh một khoá học rồi quên MỤC TIÊU ban đầu.
 *
 * Lưu trữ: data/users/<uid>/teach/<missionId> qua window.claude.use('db')
 * (cùng cơ chế mà store.js dùng để lưu tiến độ — xem cloud-shim.js).
 * Sinh nội dung bài học: tái dùng window.Courses.create (cùng pipeline AI mà
 * "Khám phá" đang dùng), nên khi AI đã bật, bài học sinh ra là thật, không phải demo.
 *
 * Chuẩn JS ES2017 thuần, IIFE, không dùng innerHTML với dữ liệu người dùng.
 */
(function () {
  'use strict';

  /* ---------- DOM nhỏ gọn (giống auth.js) ---------- */
  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (k === 'class' || k === 'className') el.className = v;
        else if (k === 'style' && typeof v === 'object') { for (var sk in v) if (Object.prototype.hasOwnProperty.call(v, sk)) el.style[sk] = v[sk]; }
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (typeof v === 'boolean') { if (v) el.setAttribute(k, ''); else el.removeAttribute(k); }
        else if (v !== null && v !== undefined) el.setAttribute(k, String(v));
      }
    }
    if (children !== null && children !== undefined) {
      var arr = Array.isArray(children) ? children : [children];
      for (var i = 0; i < arr.length; i++) {
        var c = arr[i];
        if (c === null || c === undefined) continue;
        if (typeof c === 'string' || typeof c === 'number') el.appendChild(document.createTextNode(String(c)));
        else if (c.nodeType) el.appendChild(c);
      }
    }
    return el;
  }
  function btn(label, cls, onClick) { return h('button', { type: 'button', class: 'btn ' + (cls || 'btn-ghost'), onclick: onClick }, label); }
  function link(href, cls, label) { return h('a', { href: href, class: cls || '' }, label); }
  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2500);
  }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); } catch (e) { return ''; }
  }
  // Khớp với app.js: bản web không bật AI khi có config.js (window.HCA_CONFIG) nhưng .ai không true.
  // Không dùng window.HCA_ROUTES — file này tự đăng ký HCA_ROUTES.teach trên cả web lẫn claude.ai.
  function webNoAI() { return !!window.HCA_CONFIG && !window.HCA_CONFIG.ai; }
  function newId() { return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---------- Kết nối lưu trữ (giống store.js) ---------- */
  function capUser() {
    if (!window.claude || typeof window.claude.use !== 'function') return Promise.resolve(null);
    return window.claude.use('user').catch(function () { return null; });
  }
  function capDb() {
    if (!window.claude || typeof window.claude.use !== 'function') return Promise.resolve(null);
    return window.claude.use('db').catch(function () { return null; });
  }
  function missionsCol() {
    return Promise.all([capDb(), capUser()]).then(function (r) {
      var db = r[0], user = r[1];
      if (!db || !user) return null;
      return user.id().then(function (id) { return id ? { col: db.collection('data/users/' + id + '/teach'), uid: id } : null; });
    });
  }

  /* ---------- CRUD mission ---------- */
  function listMissions() {
    return missionsCol().then(function (m) {
      if (!m) return [];
      return m.col.orderBy('updatedAt', 'desc').get().then(function (snap) {
        return (snap.docs || []).map(function (d) { return d.data(); }).filter(Boolean);
      });
    });
  }
  function getMission(id) {
    return missionsCol().then(function (m) {
      if (!m) return null;
      return m.col.doc(id).get().then(function (snap) { return snap.exists ? snap.data() : null; });
    });
  }
  function saveMission(mission) {
    return missionsCol().then(function (m) {
      if (!m) throw { code: 'login_required', message: 'Hãy đăng nhập để lưu mục tiêu học.' };
      mission.updatedAt = new Date().toISOString();
      return m.col.doc(mission.id).set(mission).then(function () { return mission; });
    });
  }

  /* ---------- Trang: danh sách mục tiêu học ---------- */
  function viewTeachList(mount) {
    var p = mount('Gia sư của tôi', 'Đặt một mục tiêu học rõ ràng — Claude giữ sổ thuật ngữ và nhật ký học cùng bạn qua nhiều buổi.');
    var host = h('div', { class: 'grid' });
    p.appendChild(host);
    host.appendChild(h('div', { class: 'card', style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      link('#/teach/new', 'btn btn-primary', '+ Mục tiêu học mới')));
    var loading = h('div', { class: 'muted' }, 'Đang nạp…');
    p.appendChild(loading);
    listMissions().then(function (list) {
      loading.remove();
      if (!list.length) { p.appendChild(h('p', { class: 'muted' }, 'Chưa có mục tiêu học nào. Bắt đầu một mục tiêu mới ở trên.')); return; }
      list.forEach(function (ms) {
        host.appendChild(h('a', { class: 'card course-card', href: '#/teach/' + encodeURIComponent(ms.id) }, [
          h('div', { class: 'card-title' }, ms.topic),
          h('div', { class: 'card-meta' }, ms.level + (ms.courseId ? ' · có bài học' : ' · chưa có bài học')),
          h('div', { class: 'card-body' }, ms.why || ''),
          h('div', { class: 'muted' }, 'Sổ thuật ngữ: ' + ((ms.glossary || []).length) + ' · Nhật ký: ' + ((ms.log || []).length))
        ]));
      });
    }, function (e) {
      loading.remove();
      if (e && e.code === 'login_required') p.appendChild(h('div', { class: 'callout callout-tip' }, [h('span', null, 'Đăng nhập để lưu và đồng bộ mục tiêu học. '), link('#/login', '', 'Đăng nhập')]));
      else p.appendChild(h('div', { class: 'callout callout-warn' }, 'Không nạp được danh sách. Hãy thử tải lại trang.'));
    });
  }

  /* ---------- Trang: tạo mục tiêu học mới (MISSION) ---------- */
  function field(labelText, inputEl) {
    return h('label', { class: 'form-group' }, [h('span', { class: 'form-label' }, labelText), inputEl]);
  }
  function viewTeachNew(mount) {
    var p = mount('Mục tiêu học mới', 'Nói rõ vì sao bạn học và thế nào là thành công — Claude sẽ dạy đúng trọng tâm thay vì chung chung.');
    var topic = h('input', { type: 'text', maxlength: '120', placeholder: 'Chủ đề, vd: Tiếng Nhật N5, Docker, Xác suất thống kê' });
    var why = h('textarea', { rows: '2', maxlength: '400', placeholder: 'Vì sao bạn muốn học điều này? (vd: chuẩn bị phỏng vấn, thi cuối kỳ, tò mò)' });
    var level = h('input', { type: 'text', maxlength: '120', placeholder: 'Trình độ hiện tại, vd: chưa biết gì / đã học qua nhưng hay quên' });
    var success = h('textarea', { rows: '2', maxlength: '300', placeholder: 'Thế nào là thành công? (vd: tự giải được đề thi mẫu)' });
    var style = h('input', { type: 'text', maxlength: '160', placeholder: 'Cách học bạn thích (tuỳ chọn): ví dụ cụ thể, làm bài tập ngay, giải thích từ gốc...' });
    var form = h('div', { class: 'card create-course teach-form' }, [
      field('Chủ đề', topic), field('Vì sao bạn muốn học?', why), field('Trình độ hiện tại', level),
      field('Thế nào là thành công?', success), field('Cách học ưa thích (tuỳ chọn)', style)
    ]);
    p.appendChild(form);
    var actHost = h('div');
    var saveBtn = btn('Lưu mục tiêu', 'btn-primary', function () {
      var t = topic.value.trim();
      if (t.length < 2) { toast('Hãy nhập chủ đề bạn muốn học.'); return; }
      saveBtn.disabled = true;
      var mission = {
        id: newId(), topic: t, why: why.value.trim(), level: level.value.trim() || 'Chưa rõ',
        success: success.value.trim(), style: style.value.trim(),
        createdAt: new Date().toISOString(), courseId: null, glossary: [], log: []
      };
      saveMission(mission).then(function () {
        toast('Đã lưu mục tiêu «' + t + '»'); location.hash = '#/teach/' + encodeURIComponent(mission.id);
      }, function (e) {
        saveBtn.disabled = false;
        if (e && e.code === 'login_required') { toast('Hãy đăng nhập để lưu mục tiêu học.'); location.hash = '#/login'; }
        else toast('Không lưu được. Hãy thử lại.');
      });
    });
    actHost.appendChild(saveBtn);
    actHost.appendChild(link('#/teach', 'btn btn-ghost', 'Huỷ'));
    p.appendChild(h('div', { class: 'card-actions' }, actHost));
  }

  /* ---------- Trang: chi tiết 1 mục tiêu học ---------- */
  function listBlock(title, items, renderItem, addForm) {
    var wrap = h('div', { class: 'card teach-form' });
    wrap.appendChild(h('h3', { class: 'card-title' }, title));
    if (!items.length) wrap.appendChild(h('p', { class: 'muted' }, 'Chưa có mục nào.'));
    else { var ul = h('ul'); items.slice().reverse().forEach(function (it) { ul.appendChild(renderItem(it)); }); wrap.appendChild(ul); }
    wrap.appendChild(addForm);
    return wrap;
  }
  function viewTeachDetail(mount, id) {
    var p = mount('Mục tiêu học');
    var loading = h('div', { class: 'muted' }, 'Đang nạp…');
    p.appendChild(loading);
    getMission(id).then(function (ms) {
      loading.remove();
      if (!ms) { p.appendChild(h('p', { class: 'muted' }, 'Không tìm thấy mục tiêu này.')); p.appendChild(link('#/teach', 'btn btn-ghost', 'Về danh sách')); return; }
      document.title = ms.topic + ' • Gia sư của tôi';
      p.insertBefore(h('h1', { class: 'page-title' }, ms.topic), p.firstChild);
      p.insertBefore(h('div', { class: 'breadcrumb' }, link('#/teach', '', '← Tất cả mục tiêu')), p.firstChild);

      var missionCard = h('div', { class: 'card' }, [
        h('div', null, [h('b', null, 'Vì sao: '), ms.why || '—']),
        h('div', null, [h('b', null, 'Trình độ: '), ms.level || '—']),
        h('div', null, [h('b', null, 'Thành công là: '), ms.success || '—']),
        ms.style ? h('div', null, [h('b', null, 'Cách học ưa thích: '), ms.style]) : null
      ]);
      p.appendChild(missionCard);

      /* --- Bài học (tái dùng pipeline AI của Courses.create) --- */
      var lessonHost = h('div', { class: 'card' });
      p.appendChild(lessonHost);
      function paintLesson() {
        lessonHost.textContent = '';
        lessonHost.appendChild(h('h3', { class: 'card-title' }, 'Bài học'));
        if (ms.courseId) {
          lessonHost.appendChild(h('div', { class: 'card-actions' }, link('#/c/' + encodeURIComponent(ms.courseId), 'btn btn-primary', 'Tiếp tục học →')));
          return;
        }
        if (webNoAI()) {
          lessonHost.appendChild(h('div', { class: 'ai-note' }, 'Bản web này chưa bật AI nên chưa tự soạn bài học được — mở app trên claude.ai để Claude soạn, hoặc gõ "' + ms.topic + '" ở ô tìm kiếm trong mục Khám phá để xem đã có khoá nào khớp chưa.'));
          lessonHost.appendChild(h('div', { class: 'card-actions' }, link('#/', 'btn btn-ghost', 'Về Khám phá')));
          return;
        }
        var genBtn = btn('Soạn bài học cho mục tiêu này', 'btn-primary', function () {
          genBtn.disabled = true;
          var host = h('div', { class: 'muted' }, 'Claude đang soạn đề cương… (khoảng 30-60 giây)');
          lessonHost.appendChild(host);
          var C = window.Courses;
          if (!C || typeof C.create !== 'function') { host.textContent = 'Chưa sẵn sàng, hãy thử lại.'; genBtn.disabled = false; return; }
          C.create({ topic: ms.topic, level: ms.level, goal: ms.why + (ms.success ? '. Thành công là: ' + ms.success : ''), chapters: 4 })
            .then(function (course) {
              ms.courseId = course.id;
              return saveMission(ms);
            }).then(function () { paintLesson(); }, function (e) {
              host.remove(); genBtn.disabled = false;
              toast((e && e.message) || 'Không soạn được bài học, hãy thử lại.');
            });
        });
        lessonHost.appendChild(genBtn);
      }
      paintLesson();

      /* --- Sổ thuật ngữ (glossary cheat sheet) --- */
      var termIn = h('input', { type: 'text', maxlength: '80', placeholder: 'Thuật ngữ' });
      var noteIn = h('input', { type: 'text', maxlength: '240', placeholder: 'Giải thích ngắn gọn' });
      var addTermBtn = btn('Thêm vào sổ', 'btn-ghost', function () {
        var term = termIn.value.trim(), note = noteIn.value.trim();
        if (!term) { toast('Nhập thuật ngữ trước đã.'); return; }
        ms.glossary = ms.glossary || [];
        ms.glossary.push({ term: term, note: note, at: new Date().toISOString() });
        saveMission(ms).then(function () { termIn.value = ''; noteIn.value = ''; refreshGlossary(); }, function () { toast('Không lưu được.'); });
      });
      var glossaryHost;
      function refreshGlossary() {
        var block = listBlock('Sổ thuật ngữ (cheat sheet)', ms.glossary || [], function (it) {
          return h('li', null, [h('b', null, it.term), ': ' + it.note]);
        }, h('div', { class: 'seg-row' }, [termIn, noteIn, addTermBtn]));
        if (glossaryHost) glossaryHost.replaceWith(block); else p.appendChild(block);
        glossaryHost = block;
      }
      refreshGlossary();

      /* --- Nhật ký học tập (learning record) --- */
      var logIn = h('textarea', { rows: '2', maxlength: '300', placeholder: 'Hôm nay bạn học được gì / vướng ở đâu?' });
      var addLogBtn = btn('Ghi vào nhật ký', 'btn-ghost', function () {
        var text = logIn.value.trim();
        if (!text) return;
        ms.log = ms.log || [];
        ms.log.push({ text: text, at: new Date().toISOString() });
        saveMission(ms).then(function () { logIn.value = ''; refreshLog(); }, function () { toast('Không lưu được.'); });
      });
      var logHost;
      function refreshLog() {
        var block = listBlock('Nhật ký học tập', ms.log || [], function (it) {
          return h('li', null, [h('span', { class: 'muted' }, fmtDate(it.at) + ' — '), it.text]);
        }, h('div', { class: 'seg-row' }, [logIn, addLogBtn]));
        if (logHost) logHost.replaceWith(block); else p.appendChild(block);
        logHost = block;
      }
      refreshLog();
    }, function () {
      loading.remove();
      p.appendChild(h('p', { class: 'muted' }, 'Không nạp được. Hãy thử tải lại trang.'));
    });
  }

  /* ---------- Route ---------- */
  // Lưu ý: app.js (route()) đã giải mã từng phần bằng dec()=decodeURIComponent trước khi
  // truyền `parts` vào đây, nên không decode lại lần nữa.
  function viewTeach(mount, parts) {
    var id = parts && parts[1];
    if (id === 'new') viewTeachNew(mount);
    else if (id) viewTeachDetail(mount, id);
    else viewTeachList(mount);
  }

  window.HCA_ROUTES = window.HCA_ROUTES || {};
  window.HCA_ROUTES.teach = viewTeach;
}());
