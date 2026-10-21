/**
 * auth.js — Quản lý Đăng nhập & Tài khoản cho "Học Cùng AI"
 * Chuẩn JS ES2017 thuần, chạy trong IIFE, không dòng nào quá 200 ký tự.
 */
(function () {
  'use strict';

  var currentUser = null;
  var isPasswordRecovery = false;

  /* ---------- Tiện ích DOM & Định dạng ---------- */

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (k === 'class' || k === 'className') {
          el.className = v;
        } else if (k === 'style' && typeof v === 'object') {
          for (var sk in v) {
            if (Object.prototype.hasOwnProperty.call(v, sk)) {
              el.style[sk] = v[sk];
            }
          }
        } else if (k.indexOf('on') === 0 && typeof v === 'function') {
          el.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (typeof v === 'boolean') {
          if (v) el.setAttribute(k, '');
          else el.removeAttribute(k);
        } else if (v !== null && v !== undefined) {
          el.setAttribute(k, String(v));
        }
      }
    }
    if (children !== null && children !== undefined) {
      var arr = Array.isArray(children) ? children : [children];
      for (var i = 0; i < arr.length; i++) {
        var c = arr[i];
        if (c === null || c === undefined) continue;
        if (typeof c === 'string' || typeof c === 'number') {
          el.appendChild(document.createTextNode(String(c)));
        } else if (c.nodeType) {
          el.appendChild(c);
        }
      }
    }
    return el;
  }

  function createSvg(w, hVal, paths, fill) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(hVal));
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + hVal);
    svg.setAttribute('aria-hidden', 'true');
    if (fill) svg.setAttribute('fill', fill);
    for (var i = 0; i < paths.length; i++) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', paths[i].d);
      if (paths[i].fill) p.setAttribute('fill', paths[i].fill);
      svg.appendChild(p);
    }
    return svg;
  }

  function googleIcon() {
    return createSvg(18, 18, [
      {
        fill: '#4285F4',
        d: 'M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14' +
           ' 0 0 1-1.8 2.71v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.61z'
      },
      {
        fill: '#34A853',
        d: 'M9 18c2.43 0 4.47-.8 5.96-2.19l-2.92-2.26c-.8.54-1.83.86' +
           '-3.04.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33C2.44 15.98' +
           ' 5.48 18 9 18z'
      },
      {
        fill: '#FBBC05',
        d: 'M3.96 10.7a5.41 5.41 0 0 1 0-3.4V4.97H.96a9.01 9.01 0 0' +
           ' 0 0 8.06l3-2.33z'
      },
      {
        fill: '#EA4335',
        d: 'M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.88 11.43' +
           ' 0 9 0 5.48 0 2.44 2.02.96 4.97l3 2.33c.71-2.13 2.7-3.72' +
           ' 5.04-3.72z'
      }
    ], null);
  }

  function facebookIcon() {
    return createSvg(18, 18, [
      {
        fill: '#ffffff',
        d: 'M18 9.06A9 9 0 1 0 7.59 17.95v-6.29H5.31V9.06h2.28V7.07c0' +
           '-2.26 1.34-3.5 3.4-3.5 1 0 2.04.18 2.04.18v2.24h-1.15c' +
           '-1.12 0-1.47.7-1.47 1.41v1.66h2.52l-.4 2.6h-2.12v6.29A9' +
           ' 9 0 0 0 18 9.06z'
      }
    ], null);
  }

  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) {
      t = h('div', { id: 'toast', class: 'toast', role: 'status', 'aria-live': 'polite' });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      t.classList.remove('show');
    }, 2800);
  }

  function nameHue(name) {
    var s = name || 'User';
    var hash = 0;
    for (var i = 0; i < s.length; i++) {
      hash = (hash * 31 + s.charCodeAt(i)) % 360;
    }
    return hash;
  }

  function renderAvatarInitial(el, name) {
    var hue = nameHue(name);
    var hue2 = (hue + 45) % 360;
    el.style.background = 'linear-gradient(135deg, hsl(' + hue +
      ', 70%, 55%), hsl(' + hue2 + ', 75%, 45%))';
    el.style.color = '#ffffff';
    var clean = (name || '').trim();
    el.textContent = clean ? clean.charAt(0).toUpperCase() : 'U';
  }

  function formatTime(iso) {
    if (!iso) return '';
    try {
      var d = new Date(iso);
      var hVal = d.getHours();
      var mVal = d.getMinutes();
      var dVal = d.getDate();
      var moVal = d.getMonth() + 1;
      var yVal = d.getFullYear();
      var hh = hVal < 10 ? '0' + hVal : String(hVal);
      var mm = mVal < 10 ? '0' + mVal : String(mVal);
      var dd = dVal < 10 ? '0' + dVal : String(dVal);
      var mo = moVal < 10 ? '0' + moVal : String(moVal);
      return hh + ':' + mm + ' ' + dd + '/' + mo + '/' + yVal;
    } catch (e) {
      return String(iso);
    }
  }

  function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function mapAuthError(err) {
    var code = (err && err.code) || '';
    if (code === 'bad_credentials') {
      return 'Email hoặc mật khẩu không đúng.';
    }
    if (code === 'email_not_confirmed') {
      return 'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.';
    }
    if (code === 'email_taken') {
      return 'Email này đã được sử dụng. Vui lòng chọn email khác.';
    }
    if (code === 'weak_password') {
      return 'Mật khẩu quá yếu (cần tối thiểu 6 hoặc 8 ký tự).';
    }
    if (code === 'rate_limited') {
      return 'Thao tác quá nhanh. Vui lòng thử lại sau giây lát.';
    }
    if (code === 'bad_key') {
      return 'Khoá Claude không dùng được (sai hoặc đã bị thu hồi).';
    }
    if (code === 'login_required') {
      return 'Cần đăng nhập để thực hiện thao tác này.';
    }
    if (err && err.message) return err.message;
    var b = window.HCA_BACKEND;
    if (b && b.lastAuthError) {
      if (typeof b.lastAuthError === 'string') return b.lastAuthError;
      if (b.lastAuthError.message) return b.lastAuthError.message;
    }
    return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }

  /* ---------- Nút Header (Header Actions) ---------- */

  function updateHeaderButton() {
    var actions = document.querySelector('.header-actions');
    if (!actions) return;
    var themeToggle = document.getElementById('theme-toggle');
    var oldBtn = actions.querySelector('.hca-header-item');

    var btn;
    if (!currentUser) {
      btn = h('a', {
        class: 'hca-login-btn hca-header-item btn btn-small',
        href: '#/login'
      }, 'Đăng nhập');
    } else {
      var displayName = currentUser.name || currentUser.email || 'Tài khoản';
      btn = h('a', {
        class: 'hca-avatar hca-header-item',
        href: '#/account',
        title: displayName,
        'aria-label': displayName
      });
      if (currentUser.avatarUrl) {
        var img = h('img', {
          src: currentUser.avatarUrl,
          alt: displayName
        });
        img.addEventListener('error', function () {
          btn.textContent = '';
          renderAvatarInitial(btn, displayName);
        });
        btn.appendChild(img);
      } else {
        renderAvatarInitial(btn, displayName);
      }
    }

    if (oldBtn) {
      actions.replaceChild(btn, oldBtn);
    } else if (themeToggle && themeToggle.parentNode === actions) {
      actions.insertBefore(btn, themeToggle);
    } else {
      actions.appendChild(btn);
    }
  }

  // Bản web chưa bật AI thì ẩn mọi phần về Claude (Kết nối Claude, hạn mức).
  var AI_ON = !!(window.HCA_CONFIG && window.HCA_CONFIG.ai);

  /* ---------- Giao diện Đăng nhập (#/login) ---------- */

  // Bản cài trên màn hình chính (pwa.js) lưu tạm dữ liệu đã xem để học khi mất mạng: xoá khi đăng xuất / xoá tài khoản.
  function clearOfflineData() {
    try {
      if (window.HCA_PWA && typeof window.HCA_PWA.clearData === 'function') {
        return Promise.resolve(window.HCA_PWA.clearData()).then(null, function () { return undefined; });
      }
    } catch (e) { /* bỏ qua */ }
    return Promise.resolve();
  }

  // Đăng nhập/đăng xuất xong phải TẢI LẠI trang để app nạp lại quyền & dữ liệu (đổi hash thôi thì không tải lại).
  function reloadTo(hash) {
    try { history.replaceState(null, '', location.pathname + location.search + hash); } catch (e) { location.hash = hash; }
    location.reload();
  }

  // Phiên được đọc bất đồng bộ: nếu chưa biết đã đăng nhập hay chưa thì hiện "Đang tải…" rồi vẽ lại.
  function waitSession(mount, title, again) {
    if (sessionKnown) return false;
    var p = mount(title);
    p.appendChild(h('p', { class: 'muted' }, 'Đang tải…'));
    var hash = location.hash;
    sessionReady.then(function () { if (location.hash === hash) again(mount); });
    return true;
  }

  function viewLogin(mount) {
    if (waitSession(mount, 'Đăng nhập', viewLogin)) return;
    if (currentUser) {
      location.hash = '#/account';
      return;
    }

    var p = mount('Đăng nhập');
    p.classList.add('hca-page-auth');

    var card = h('div', { class: 'hca-card hca-auth-card' });

    var header = h('div', { class: 'hca-auth-header' }, [
      h('h2', { class: 'hca-auth-title' }, 'Chào mừng bạn'),
      h('p', { class: 'hca-auth-sub' },
        AI_ON ? 'Đăng nhập để đồng bộ tiến độ học và sử dụng trợ lý Claude.'
          : 'Đăng nhập để lưu và đồng bộ tiến độ học trên mọi thiết bị.')
    ]);
    card.appendChild(header);

    // Thông báo lỗi / trạng thái
    var alertBox = h('div', {
      class: 'hca-alert',
      role: 'alert',
      'aria-live': 'polite',
      style: { display: 'none' }
    });
    function showAlert(text, type) {
      alertBox.textContent = text;
      alertBox.className = 'hca-alert hca-alert-' + (type || 'error');
      alertBox.style.display = 'block';
    }
    function hideAlert() {
      alertBox.textContent = '';
      alertBox.style.display = 'none';
    }
    card.appendChild(alertBox);

    // Nút đăng nhập xã hội
    var googleBtn = h('button', {
      type: 'button',
      class: 'hca-btn-social hca-btn-google'
    }, [googleIcon(), h('span', null, 'Tiếp tục với Google')]);

    var facebookBtn = h('button', {
      type: 'button',
      class: 'hca-btn-social hca-btn-facebook'
    }, [facebookIcon(), h('span', null, 'Tiếp tục với Facebook')]);

    function handleSocial(provider, btnEl) {
      hideAlert();
      var b = window.HCA_BACKEND;
      if (!b || !b.auth || typeof b.auth.signInWith !== 'function') {
        showAlert('Dịch vụ đăng nhập chưa sẵn sàng.');
        return;
      }
      googleBtn.disabled = true;
      facebookBtn.disabled = true;
      btnEl.classList.add('hca-loading');
      b.auth.signInWith(provider).catch(function (err) {
        googleBtn.disabled = false;
        facebookBtn.disabled = false;
        btnEl.classList.remove('hca-loading');
        showAlert(mapAuthError(err));
      });
    }

    googleBtn.addEventListener('click', function () {
      handleSocial('google', googleBtn);
    });
    facebookBtn.addEventListener('click', function () {
      handleSocial('facebook', facebookBtn);
    });

    // Chỉ hiện nút của nhà cung cấp đã bật trong Supabase (HCA_CONFIG.providers do build ghi).
    var enabled = (window.HCA_CONFIG && window.HCA_CONFIG.providers) || ['google', 'facebook'];
    var socialBtns = [];
    if (enabled.indexOf('google') >= 0) socialBtns.push(googleBtn);
    if (enabled.indexOf('facebook') >= 0) socialBtns.push(facebookBtn);
    if (socialBtns.length) {
      card.appendChild(h('div', { class: 'hca-social-group' }, socialBtns));
      // Vạch "hoặc"
      card.appendChild(h('div', { class: 'hca-divider' }, [
        h('span', null, 'hoặc đăng nhập bằng email')
      ]));
    }

    // Chế độ: 'signin' | 'signup' | 'forgot'
    var mode = 'signin';

    // Tabs Đăng nhập / Tạo tài khoản
    var tabsWrap = h('div', { class: 'hca-tabs', role: 'tablist' });
    var tabSignIn = h('button', {
      type: 'button',
      class: 'hca-tab-btn active',
      role: 'tab',
      'aria-selected': 'true'
    }, 'Đăng nhập');
    var tabSignUp = h('button', {
      type: 'button',
      class: 'hca-tab-btn',
      role: 'tab',
      'aria-selected': 'false'
    }, 'Tạo tài khoản');
    tabsWrap.appendChild(tabSignIn);
    tabsWrap.appendChild(tabSignUp);
    card.appendChild(tabsWrap);

    // Form nhập liệu
    var form = h('form', { class: 'hca-form', novalidate: true });

    // Tên hiển thị (chỉ hiện khi Đăng ký)
    var nameGroup = h('div', {
      class: 'hca-form-group',
      style: { display: 'none' }
    });
    var nameLabel = h('label', {
      for: 'hca-input-name',
      class: 'hca-label'
    }, 'Tên hiển thị');
    var nameInput = h('input', {
      id: 'hca-input-name',
      type: 'text',
      class: 'hca-input',
      placeholder: 'Nguyễn Văn A',
      autocomplete: 'name'
    });
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    form.appendChild(nameGroup);

    // Email
    var emailGroup = h('div', { class: 'hca-form-group' });
    var emailLabel = h('label', {
      for: 'hca-input-email',
      class: 'hca-label'
    }, 'Địa chỉ Email');
    var emailInput = h('input', {
      id: 'hca-input-email',
      type: 'email',
      class: 'hca-input',
      placeholder: 'ban@example.com',
      required: true,
      autocomplete: 'email'
    });
    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    form.appendChild(emailGroup);

    // Mật khẩu
    var passGroup = h('div', { class: 'hca-form-group' });
    var passLabelRow = h('div', { class: 'hca-label-row' });
    var passLabel = h('label', {
      for: 'hca-input-pass',
      class: 'hca-label'
    }, 'Mật khẩu');
    passLabelRow.appendChild(passLabel);

    var forgotLink = h('button', {
      type: 'button',
      class: 'hca-text-btn hca-forgot-btn'
    }, 'Quên mật khẩu?');
    passLabelRow.appendChild(forgotLink);

    var passWrap = h('div', { class: 'hca-input-wrap' });
    var passInput = h('input', {
      id: 'hca-input-pass',
      type: 'password',
      class: 'hca-input',
      placeholder: '••••••••',
      required: true,
      autocomplete: 'current-password'
    });
    var passToggle = h('button', {
      type: 'button',
      class: 'hca-toggle-pass',
      'aria-label': 'Hiện mật khẩu'
    }, 'Hiện');
    passToggle.addEventListener('click', function () {
      var isPw = passInput.type === 'password';
      passInput.type = isPw ? 'text' : 'password';
      passToggle.textContent = isPw ? 'Ẩn' : 'Hiện';
      passToggle.setAttribute('aria-label', isPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
    });
    passWrap.appendChild(passInput);
    passWrap.appendChild(passToggle);
    passGroup.appendChild(passLabelRow);
    passGroup.appendChild(passWrap);
    form.appendChild(passGroup);

    // Nút submit chính
    var submitBtn = h('button', {
      type: 'submit',
      class: 'btn btn-primary hca-submit-btn'
    }, 'Đăng nhập');
    form.appendChild(submitBtn);

    // Nút quay lại khi ở chế độ Quên mật khẩu
    var backToSignInBtn = h('button', {
      type: 'button',
      class: 'btn btn-ghost hca-back-btn',
      style: { display: 'none', width: '100%', marginTop: '8px' }
    }, 'Quay lại Đăng nhập');
    backToSignInBtn.addEventListener('click', function () {
      setMode('signin');
    });
    form.appendChild(backToSignInBtn);

    card.appendChild(form);

    function setMode(newMode) {
      mode = newMode;
      hideAlert();
      if (mode === 'signin') {
        tabsWrap.style.display = 'flex';
        tabSignIn.classList.add('active');
        tabSignIn.setAttribute('aria-selected', 'true');
        tabSignUp.classList.remove('active');
        tabSignUp.setAttribute('aria-selected', 'false');
        nameGroup.style.display = 'none';
        passGroup.style.display = 'block';
        forgotLink.style.display = 'inline-block';
        backToSignInBtn.style.display = 'none';
        socialWrap.style.display = 'flex';
        divider.style.display = 'flex';
        submitBtn.textContent = 'Đăng nhập';
        passInput.setAttribute('autocomplete', 'current-password');
      } else if (mode === 'signup') {
        tabsWrap.style.display = 'flex';
        tabSignUp.classList.add('active');
        tabSignUp.setAttribute('aria-selected', 'true');
        tabSignIn.classList.remove('active');
        tabSignIn.setAttribute('aria-selected', 'false');
        nameGroup.style.display = 'block';
        passGroup.style.display = 'block';
        forgotLink.style.display = 'none';
        backToSignInBtn.style.display = 'none';
        socialWrap.style.display = 'flex';
        divider.style.display = 'flex';
        submitBtn.textContent = 'Tạo tài khoản';
        passInput.setAttribute('autocomplete', 'new-password');
      } else if (mode === 'forgot') {
        tabsWrap.style.display = 'none';
        socialWrap.style.display = 'none';
        divider.style.display = 'none';
        nameGroup.style.display = 'none';
        passGroup.style.display = 'none';
        backToSignInBtn.style.display = 'block';
        submitBtn.textContent = 'Gửi liên kết đặt lại mật khẩu';
        showAlert('Nhập email của bạn để nhận liên kết đặt lại mật khẩu.', 'info');
      }
    }

    tabSignIn.addEventListener('click', function () { setMode('signin'); });
    tabSignUp.addEventListener('click', function () { setMode('signup'); });
    forgotLink.addEventListener('click', function () { setMode('forgot'); });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      hideAlert();

      var emailVal = (emailInput.value || '').trim();
      var passVal = passInput.value || '';
      var nameVal = (nameInput.value || '').trim();

      if (!emailVal) {
        showAlert('Vui lòng nhập địa chỉ email.');
        emailInput.focus();
        return;
      }

      var b = window.HCA_BACKEND;
      if (!b || !b.auth) {
        showAlert('Hệ thống xác thực chưa sẵn sàng.');
        return;
      }

      submitBtn.disabled = true;

      if (mode === 'forgot') {
        submitBtn.textContent = 'Đang gửi thư…';
        b.auth.resetPassword(emailVal).then(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Gửi liên kết đặt lại mật khẩu';
          showAlert('Đã gửi thư, mở email để đặt lại.', 'success');
        }).catch(function (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Gửi liên kết đặt lại mật khẩu';
          showAlert(mapAuthError(err));
        });
        return;
      }

      if (!passVal) {
        submitBtn.disabled = false;
        showAlert('Vui lòng nhập mật khẩu.');
        passInput.focus();
        return;
      }

      if (mode === 'signin') {
        submitBtn.textContent = 'Đang đăng nhập…';
        b.auth.signIn(emailVal, passVal).then(function (session) {
          currentUser = session && session.user ? session.user : null;
          updateHeaderButton();
          showToast('Đăng nhập thành công!');
          reloadTo('#/');
        }).catch(function (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Đăng nhập';
          showAlert(mapAuthError(err));
        });
      } else if (mode === 'signup') {
        submitBtn.textContent = 'Đang tạo tài khoản…';
        b.auth.signUp(emailVal, passVal, nameVal).then(function (res) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Tạo tài khoản';
          if (res && res.needsConfirm) {
            showAlert('Kiểm tra email để kích hoạt.', 'success');
          } else {
            showToast('Đăng ký thành công!');
            reloadTo('#/');
          }
        }).catch(function (err) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Tạo tài khoản';
          showAlert(mapAuthError(err));
        });
      }
    });

    // Điều khoản & Chính sách
    var legalNotice = h('p', { class: 'hca-auth-legal' }, [
      h('span', null, 'Khi tiếp tục, bạn đồng ý với '),
      h('a', { href: 'terms.html', target: '_blank' }, 'Điều khoản'),
      h('span', null, ' và '),
      h('a', { href: 'privacy.html', target: '_blank' }, 'Chính sách quyền riêng tư'),
      h('span', null, '.')
    ]);
    card.appendChild(legalNotice);

    // Ghi chú về Claude
    var claudeNote = h('div', { class: 'hca-auth-claude-note' }, [
      h('p', null,
        "Chưa có 'Đăng nhập bằng Claude' (Anthropic chưa mở cho ứng dụng bên ngoài)" +
        " — sau khi đăng nhập, vào Tài khoản → Kết nối Claude.")
    ]);
    if (AI_ON) card.appendChild(claudeNote);

    p.appendChild(card);
  }

  /* ---------- Giao diện Tài khoản (#/account) ---------- */

  function viewAccount(mount) {
    if (waitSession(mount, 'Tài khoản', viewAccount)) return;
    if (!currentUser) {
      location.hash = '#/login';
      return;
    }

    var p = mount('Tài khoản');
    p.classList.add('hca-page-account');

    var grid = h('div', { class: 'hca-account-grid' });

    /* 1. THẺ HỒ SƠ */
    var profileCard = h('div', { class: 'hca-card hca-card-profile' });
    profileCard.appendChild(h('h2', { class: 'hca-card-title' }, 'Hồ sơ cá nhân'));

    var profileHeader = h('div', { class: 'hca-profile-header' });
    var avatarBig = h('div', { class: 'hca-avatar hca-avatar-big' });
    var dispName = currentUser.name || currentUser.email || 'Học viên';
    if (currentUser.avatarUrl) {
      var pImg = h('img', { src: currentUser.avatarUrl, alt: dispName });
      pImg.addEventListener('error', function () {
        avatarBig.textContent = '';
        renderAvatarInitial(avatarBig, dispName);
      });
      avatarBig.appendChild(pImg);
    } else {
      renderAvatarInitial(avatarBig, dispName);
    }
    profileHeader.appendChild(avatarBig);

    var profileInfo = h('div', { class: 'hca-profile-info' });
    var nameForm = h('form', { class: 'hca-name-form' });
    var nameLabel = h('label', {
      for: 'hca-edit-name',
      class: 'hca-label'
    }, 'Tên hiển thị');
    var nameInput = h('input', {
      id: 'hca-edit-name',
      type: 'text',
      class: 'hca-input',
      value: currentUser.name || ''
    });
    var nameSaveBtn = h('button', {
      type: 'submit',
      class: 'btn btn-primary btn-small'
    }, 'Lưu tên');

    nameForm.appendChild(nameLabel);
    var nameRow = h('div', { class: 'hca-input-btn-row' }, [nameInput, nameSaveBtn]);
    nameForm.appendChild(nameRow);

    nameForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var b = window.HCA_BACKEND;
      if (!b || !b.auth) return;
      var newName = (nameInput.value || '').trim();
      nameSaveBtn.disabled = true;
      nameSaveBtn.textContent = 'Đang lưu…';
      b.auth.updateProfile({ name: newName }).then(function () {
        nameSaveBtn.disabled = false;
        nameSaveBtn.textContent = 'Lưu tên';
        currentUser.name = newName;
        updateHeaderButton();
        if (!currentUser.avatarUrl) {
          renderAvatarInitial(avatarBig, newName || currentUser.email);
        }
        showToast('Đã cập nhật tên hiển thị!');
      }).catch(function (err) {
        nameSaveBtn.disabled = false;
        nameSaveBtn.textContent = 'Lưu tên';
        showToast(mapAuthError(err));
      });
    });

    profileInfo.appendChild(nameForm);

    // Email & Phương thức đăng nhập
    var emailBox = h('div', { class: 'hca-meta-row' }, [
      h('span', { class: 'hca-meta-label' }, 'Email:'),
      h('span', { class: 'hca-meta-val' }, currentUser.email || 'Chưa có email')
    ]);
    profileInfo.appendChild(emailBox);

    var provs = currentUser.providers || [];
    var provLabels = provs.map(function (pr) {
      if (pr === 'google') return 'Google';
      if (pr === 'facebook') return 'Facebook';
      if (pr === 'email') return 'Email';
      return pr;
    });
    var provText = provLabels.length > 0 ? provLabels.join(', ') : 'Email';

    var provBox = h('div', { class: 'hca-meta-row' }, [
      h('span', { class: 'hca-meta-label' }, 'Đăng nhập bằng:'),
      h('span', { class: 'hca-meta-val' }, provText)
    ]);
    profileInfo.appendChild(provBox);

    profileHeader.appendChild(profileInfo);
    profileCard.appendChild(profileHeader);
    grid.appendChild(profileCard);

    /* 2. THẺ KẾT NỐI CLAUDE */
    var claudeCard = h('div', { class: 'hca-card hca-card-claude' });
    claudeCard.appendChild(h('h2', { class: 'hca-card-title' }, 'Kết nối Claude'));

    var claudeBody = h('div', { class: 'hca-claude-body' });
    claudeCard.appendChild(claudeBody);
    if (AI_ON) grid.appendChild(claudeCard);

    function loadKeyStatus() {
      claudeBody.textContent = '';
      claudeBody.appendChild(h('p', { class: 'hca-loading-text' },
        'Đang kiểm tra kết nối Claude…'));

      var b = window.HCA_BACKEND;
      if (!b || typeof b.api !== 'function') {
        claudeBody.textContent = 'Không kết nối được dịch vụ máy chủ.';
        return;
      }

      b.api('/api/key').then(function (res) {
        renderClaudeSection(res);
      }).catch(function (err) {
        claudeBody.textContent = '';
        var errBox = h('div', { class: 'hca-alert hca-alert-error' },
          'Lỗi tải khoá Claude: ' + mapAuthError(err));
        var retryBtn = h('button', {
          type: 'button',
          class: 'btn btn-ghost btn-small'
        }, 'Thử lại');
        retryBtn.addEventListener('click', loadKeyStatus);
        claudeBody.appendChild(errBox);
        claudeBody.appendChild(retryBtn);
      });
    }

    function renderClaudeSection(data) {
      claudeBody.textContent = '';

      if (data && data.connected) {
        // ĐÃ KẾT NỐI
        var badge = h('div', { class: 'hca-badge hca-badge-green' }, [
          h('span', { class: 'hca-badge-dot' }),
          h('span', null, 'Đã kết nối · khoá …' + (data.last4 || '••••') +
            ' · kiểm tra lúc ' + formatTime(data.verifiedAt))
        ]);
        claudeBody.appendChild(badge);

        var modelInfo = h('p', { class: 'hca-model-info' }, [
          h('strong', null, 'Model đang dùng: '),
          h('span', null,
            (data.model && data.model.default ? data.model.default : 'claude-opus-5-5') +
            ' (chính), ' +
            (data.model && data.model.small ? data.model.small : 'claude-haiku-5-5') +
            ' (nhanh)')
        ]);
        claudeBody.appendChild(modelInfo);

        var disBtn = h('button', {
          type: 'button',
          class: 'btn btn-ghost btn-small hca-disconnect-btn'
        }, 'Gỡ kết nối khoá Claude');

        disBtn.addEventListener('click', function () {
          if (!window.confirm('Bạn có chắc muốn gỡ kết nối khoá Claude? ' +
            'Hệ thống sẽ chuyển về hạn mức miễn phí hàng ngày.')) {
            return;
          }
          disBtn.disabled = true;
          disBtn.textContent = 'Đang gỡ…';
          var b = window.HCA_BACKEND;
          b.api('/api/key', null, { method: 'DELETE' }).then(function (res) {
            showToast('Đã gỡ kết nối khoá Claude.');
            renderClaudeSection(res);
          }).catch(function (err) {
            disBtn.disabled = false;
            disBtn.textContent = 'Gỡ kết nối khoá Claude';
            showToast(mapAuthError(err));
          });
        });

        claudeBody.appendChild(disBtn);
      } else {
        // CHƯA KẾT NỐI
        var usage = (data && data.usage) || { requests: 0, outputTokens: 0 };
        var limits = (data && data.limits) || { requests: 25, outputTokens: 60000 };

        var usageText = usage.requests + '/' + limits.requests + ' lượt · ' +
          formatNumber(usage.outputTokens) + '/' +
          formatNumber(limits.outputTokens) + ' token';

        var pctReq = limits.requests ?
          Math.min(100, Math.round((usage.requests / limits.requests) * 100)) : 0;
        var pctTok = limits.outputTokens ?
          Math.min(100, Math.round((usage.outputTokens / limits.outputTokens) * 100)) : 0;
        var pct = Math.max(pctReq, pctTok);

        var usageBox = h('div', { class: 'hca-usage-box' }, [
          h('div', { class: 'hca-usage-label-row' }, [
            h('span', { class: 'hca-usage-title' }, 'Mức dùng miễn phí hôm nay:'),
            h('span', { class: 'hca-usage-val' }, usageText)
          ]),
          h('div', { class: 'hca-progress-bar' }, [
            h('div', { class: 'hca-progress-fill', style: { width: pct + '%' } })
          ])
        ]);
        claudeBody.appendChild(usageBox);

        var explain = h('div', { class: 'hca-claude-explain' }, [
          h('p', null,
            'Bạn đang dùng hạn mức Claude miễn phí của app. Muốn dùng thoải mái không ' +
            'giới hạn, hãy tạo khoá API tại Anthropic Console:'),
          h('p', null, [
            h('a', {
              href: 'https://console.anthropic.com/settings/keys',
              target: '_blank',
              rel: 'noopener noreferrer',
              class: 'hca-link-ext'
            }, 'console.anthropic.com/settings/keys ↗')
          ]),
          h('ul', { class: 'hca-bullet-list' }, [
            h('li', null, 'Khoá được mã hoá an toàn trên máy chủ, không hiển thị lại.'),
            h('li', null, 'Chi phí tính trực tiếp vào tài khoản Anthropic của bạn.'),
            h('li', null,
              h('strong', null,
                'Lưu ý: Gói Claude Pro/Max trên claude.ai KHÔNG dùng thay khoá API được.'))
          ])
        ]);
        claudeBody.appendChild(explain);

        var keyForm = h('form', { class: 'hca-key-form' });
        var keyLabel = h('label', {
          for: 'hca-input-key',
          class: 'hca-label'
        }, 'Khoá Claude API (sk-ant-…)');

        var keyWrap = h('div', { class: 'hca-input-wrap' });
        var keyInput = h('input', {
          id: 'hca-input-key',
          type: 'password',
          class: 'hca-input',
          placeholder: 'sk-ant-api03-…',
          required: true,
          autocomplete: 'off',
          spellcheck: false
        });
        var keyToggle = h('button', {
          type: 'button',
          class: 'hca-toggle-pass',
          'aria-label': 'Hiện khoá'
        }, 'Hiện');
        keyToggle.addEventListener('click', function () {
          var isPw = keyInput.type === 'password';
          keyInput.type = isPw ? 'text' : 'password';
          keyToggle.textContent = isPw ? 'Ẩn' : 'Hiện';
          keyToggle.setAttribute('aria-label', isPw ? 'Ẩn khoá' : 'Hiện khoá');
        });
        keyWrap.appendChild(keyInput);
        keyWrap.appendChild(keyToggle);

        var connectBtn = h('button', {
          type: 'submit',
          class: 'btn btn-primary hca-connect-btn'
        }, 'Kết nối');

        var keyAlert = h('div', {
          class: 'hca-alert hca-alert-error',
          style: { display: 'none', marginTop: '10px' }
        });

        keyForm.appendChild(keyLabel);
        keyForm.appendChild(keyWrap);
        keyForm.appendChild(connectBtn);
        keyForm.appendChild(keyAlert);

        keyForm.addEventListener('submit', function (ev) {
          ev.preventDefault();
          keyAlert.style.display = 'none';
          var rawKey = (keyInput.value || '').trim();
          if (!rawKey) {
            keyAlert.textContent = 'Vui lòng nhập khoá API Claude.';
            keyAlert.style.display = 'block';
            return;
          }
          if (rawKey.indexOf('sk-ant-') !== 0) {
            keyAlert.textContent = 'Khoá Claude phải bắt đầu bằng sk-ant-';
            keyAlert.style.display = 'block';
            return;
          }

          connectBtn.disabled = true;
          connectBtn.textContent = 'Đang kiểm tra khoá…';
          var b = window.HCA_BACKEND;
          b.api('/api/key', { apiKey: rawKey }, { method: 'POST' }).then(function (newRes) {
            showToast('Kết nối Claude thành công!');
            renderClaudeSection(newRes);
          }).catch(function (err) {
            connectBtn.disabled = false;
            connectBtn.textContent = 'Kết nối';
            keyAlert.textContent = mapAuthError(err);
            keyAlert.style.display = 'block';
          });
        });

        claudeBody.appendChild(keyForm);
      }
    }

    if (AI_ON) loadKeyStatus();

    /* 3. THẺ BẢO MẬT */
    var secCard = h('div', { class: 'hca-card hca-card-security' });
    secCard.appendChild(h('h2', { class: 'hca-card-title' }, 'Bảo mật'));

    var hasEmailProv = provs.indexOf('email') !== -1;
    if (hasEmailProv || isPasswordRecovery) {
      var pwTitle = h('h3', { class: 'hca-card-subtitle' },
        isPasswordRecovery ? 'Đặt mật khẩu mới (từ liên kết khôi phục)' : 'Đổi mật khẩu');
      secCard.appendChild(pwTitle);

      var pwForm = h('form', { class: 'hca-pw-form' });
      var pwAlert = h('div', {
        class: 'hca-alert',
        style: { display: isPasswordRecovery ? 'block' : 'none' }
      });
      if (isPasswordRecovery) {
        pwAlert.className = 'hca-alert hca-alert-info';
        pwAlert.textContent = 'Bạn đang trong phiên đặt lại mật khẩu. Hãy nhập mật khẩu mới.';
      }
      pwForm.appendChild(pwAlert);

      var p1Group = h('div', { class: 'hca-form-group' });
      var p1Label = h('label', {
        for: 'hca-pw-new',
        class: 'hca-label'
      }, 'Mật khẩu mới (tối thiểu 8 ký tự)');
      var p1Wrap = h('div', { class: 'hca-input-wrap' });
      var p1Input = h('input', {
        id: 'hca-pw-new',
        type: 'password',
        class: 'hca-input',
        required: true,
        autocomplete: 'new-password'
      });
      var p1Toggle = h('button', {
        type: 'button',
        class: 'hca-toggle-pass',
        'aria-label': 'Hiện mật khẩu'
      }, 'Hiện');
      p1Toggle.addEventListener('click', function () {
        var isP = p1Input.type === 'password';
        p1Input.type = isP ? 'text' : 'password';
        p1Toggle.textContent = isP ? 'Ẩn' : 'Hiện';
        p1Toggle.setAttribute('aria-label', isP ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
      });
      p1Wrap.appendChild(p1Input);
      p1Wrap.appendChild(p1Toggle);
      p1Group.appendChild(p1Label);
      p1Group.appendChild(p1Wrap);
      pwForm.appendChild(p1Group);

      var p2Group = h('div', { class: 'hca-form-group' });
      var p2Label = h('label', {
        for: 'hca-pw-confirm',
        class: 'hca-label'
      }, 'Nhập lại mật khẩu mới');
      var p2Wrap = h('div', { class: 'hca-input-wrap' });
      var p2Input = h('input', {
        id: 'hca-pw-confirm',
        type: 'password',
        class: 'hca-input',
        required: true,
        autocomplete: 'new-password'
      });
      var p2Toggle = h('button', {
        type: 'button',
        class: 'hca-toggle-pass',
        'aria-label': 'Hiện mật khẩu'
      }, 'Hiện');
      p2Toggle.addEventListener('click', function () {
        var isP = p2Input.type === 'password';
        p2Input.type = isP ? 'text' : 'password';
        p2Toggle.textContent = isP ? 'Ẩn' : 'Hiện';
        p2Toggle.setAttribute('aria-label', isP ? 'Ẩn mật khẩu' : 'Hiện mật khẩu');
      });
      p2Wrap.appendChild(p2Input);
      p2Wrap.appendChild(p2Toggle);
      p2Group.appendChild(p2Label);
      p2Group.appendChild(p2Wrap);
      pwForm.appendChild(p2Group);

      var pwBtn = h('button', {
        type: 'submit',
        class: 'btn btn-primary btn-small'
      }, 'Cập nhật mật khẩu');
      pwForm.appendChild(pwBtn);

      pwForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        pwAlert.style.display = 'none';

        var v1 = p1Input.value || '';
        var v2 = p2Input.value || '';
        if (v1.length < 8) {
          pwAlert.className = 'hca-alert hca-alert-error';
          pwAlert.textContent = 'Mật khẩu mới phải có tối thiểu 8 ký tự.';
          pwAlert.style.display = 'block';
          p1Input.focus();
          return;
        }
        if (v1 !== v2) {
          pwAlert.className = 'hca-alert hca-alert-error';
          pwAlert.textContent = 'Hai mật khẩu không khớp nhau.';
          pwAlert.style.display = 'block';
          p2Input.focus();
          return;
        }

        pwBtn.disabled = true;
        pwBtn.textContent = 'Đang đổi mật khẩu…';
        var b = window.HCA_BACKEND;
        b.auth.updatePassword(v1).then(function () {
          pwBtn.disabled = false;
          pwBtn.textContent = 'Cập nhật mật khẩu';
          p1Input.value = '';
          p2Input.value = '';
          isPasswordRecovery = false;
          showToast('Đã đổi mật khẩu thành công!');
        }).catch(function (err) {
          pwBtn.disabled = false;
          pwBtn.textContent = 'Cập nhật mật khẩu';
          pwAlert.className = 'hca-alert hca-alert-error';
          pwAlert.textContent = mapAuthError(err);
          pwAlert.style.display = 'block';
        });
      });

      secCard.appendChild(pwForm);
    } else {
      secCard.appendChild(h('p', { class: 'hca-note-text' },
        'Tài khoản đăng nhập qua mạng xã hội (Google/Facebook) không sử dụng mật khẩu.'));
    }

    var logoutBtn = h('button', {
      type: 'button',
      class: 'btn btn-ghost hca-logout-btn'
    }, 'Đăng xuất');

    logoutBtn.addEventListener('click', function () {
      logoutBtn.disabled = true;
      logoutBtn.textContent = 'Đang đăng xuất…';
      var b = window.HCA_BACKEND;
      if (b && b.auth && typeof b.auth.signOut === 'function') {
        b.auth.signOut().then(clearOfflineData).then(function () {
          currentUser = null;
          updateHeaderButton();
          reloadTo('#/');
        }).catch(function () {
          reloadTo('#/');
        });
      } else {
        reloadTo('#/');
      }
    });

    secCard.appendChild(h('div', { class: 'hca-logout-row' }, [logoutBtn]));
    grid.appendChild(secCard);

    /* 4. VÙNG NGUY HIỂM: XOÁ TÀI KHOẢN */
    var dangerCard = h('div', { class: 'hca-card hca-card-danger' });
    dangerCard.appendChild(h('h2', { class: 'hca-card-title hca-text-danger' },
      'Vùng nguy hiểm'));
    dangerCard.appendChild(h('p', { class: 'hca-danger-desc' },
      'Xoá tài khoản sẽ xoá vĩnh viễn tiến độ học, dữ liệu cá nhân và mọi thông tin tài khoản' +
      '. Các khoá học công khai bạn đã đóng góp sẽ được giữ lại nhưng ẩn danh hoá.'));

    var deleteBtn = h('button', {
      type: 'button',
      class: 'btn btn-danger hca-btn-delete'
    }, 'Xoá tài khoản');

    var confirmBox = h('div', {
      class: 'hca-delete-confirm-box',
      style: { display: 'none' }
    });

    var confirmMsg = h('p', { class: 'hca-confirm-label' }, [
      h('span', null, 'Hành động này không thể hoàn tác. Vui lòng gõ '),
      h('strong', null, 'XOÁ'),
      h('span', null, ' vào ô bên dưới để xác nhận:')
    ]);

    var confirmInput = h('input', {
      type: 'text',
      class: 'hca-input hca-confirm-input',
      placeholder: 'Gõ XOÁ để xác nhận',
      autocomplete: 'off'
    });

    var confirmActionBtn = h('button', {
      type: 'button',
      class: 'btn btn-danger',
      disabled: true
    }, 'Xác nhận xoá vĩnh viễn');

    var cancelDeleteBtn = h('button', {
      type: 'button',
      class: 'btn btn-ghost btn-small'
    }, 'Huỷ');

    confirmInput.addEventListener('input', function () {
      var val = (confirmInput.value || '').trim().toUpperCase();
      confirmActionBtn.disabled = !(val === 'XOÁ' || val === 'XÓA');
    });

    deleteBtn.addEventListener('click', function () {
      deleteBtn.style.display = 'none';
      confirmBox.style.display = 'block';
      confirmInput.value = '';
      confirmActionBtn.disabled = true;
      confirmInput.focus();
    });

    cancelDeleteBtn.addEventListener('click', function () {
      confirmBox.style.display = 'none';
      deleteBtn.style.display = 'inline-flex';
    });

    confirmActionBtn.addEventListener('click', function () {
      confirmActionBtn.disabled = true;
      confirmActionBtn.textContent = 'Đang xoá tài khoản…';
      var b = window.HCA_BACKEND;
      if (!b || typeof b.api !== 'function') {
        showToast('Không thể kết nối đến máy chủ.');
        return;
      }
      var del = typeof b.deleteAccount === 'function' ? b.deleteAccount()
        : b.api('/api/account', null, { method: 'DELETE' }).then(function () {
          return (b.auth && b.auth.signOut) ? b.auth.signOut() : Promise.resolve();
        });
      del.then(clearOfflineData).then(function () {
        currentUser = null;
        updateHeaderButton();
        showToast('Đã xoá tài khoản thành công.');
        reloadTo('#/');
      }).catch(function (err) {
        confirmActionBtn.disabled = false;
        confirmActionBtn.textContent = 'Xác nhận xoá vĩnh viễn';
        showToast(mapAuthError(err));
      });
    });

    var confirmBtnRow = h('div', { class: 'hca-btn-row' }, [
      confirmActionBtn,
      cancelDeleteBtn
    ]);

    confirmBox.appendChild(confirmMsg);
    confirmBox.appendChild(confirmInput);
    confirmBox.appendChild(confirmBtnRow);

    dangerCard.appendChild(deleteBtn);
    dangerCard.appendChild(confirmBox);
    grid.appendChild(dangerCard);

    p.appendChild(grid);
  }

  var sessionKnown = false, resolveSession;
  var sessionReady = new Promise(function (r) { resolveSession = r; });

  /* ---------- Đăng ký HCA_ROUTES & HCA_AUTH ---------- */

  window.HCA_ROUTES = window.HCA_ROUTES || {};
  window.HCA_ROUTES.login = viewLogin;
  window.HCA_ROUTES.account = viewAccount;

  window.HCA_AUTH = {
    promptLogin: function () {
      location.hash = '#/login';
      showToast('Hãy đăng nhập để tiếp tục.');
    },
    user: function () {
      return currentUser;
    }
  };

  /* ---------- Khởi tạo Phiên & Lắng nghe auth.onChange ---------- */

  function initAuth() {
    var b = window.HCA_BACKEND;
    if (b && b.auth && typeof b.auth.session === 'function') {
      b.auth.session().then(function (session) {
        currentUser = session && session.user ? session.user : null;
        updateHeaderButton();
      }).catch(function () {}).then(function () { sessionKnown = true; resolveSession(); });

      if (typeof b.auth.onChange === 'function') {
        b.auth.onChange(function (event, session) {
          currentUser = session && session.user ? session.user : null;
          updateHeaderButton();
          if (event === 'PASSWORD_RECOVERY') {
            isPasswordRecovery = true;
            location.hash = '#/account';
          } else if (event === 'SIGNED_OUT') {
            if (location.hash === '#/account') {
              reloadTo('#/');
            }
          }
        });
      }
    } else {
      setTimeout(initAuth, 80);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateHeaderButton();
      initAuth();
    });
  } else {
    updateHeaderButton();
    initAuth();
  }
})();
