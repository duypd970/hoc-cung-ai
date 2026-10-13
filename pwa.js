(function () {
  'use strict';
  var style = document.createElement('style');
  style.textContent = '.hca-pwa-banner{position:fixed;z-index:9999;left:12px;right:12px;' +
    'bottom:calc(76px + env(safe-area-inset-bottom));padding:12px 14px;' +
    'background:var(--surface,#111827);color:var(--text,#fff);' +
    'border:1px solid var(--border,#374151);border-radius:12px;' +
    'box-shadow:0 4px 18px rgba(0,0,0,.28);font:14px/1.45 system-ui,sans-serif}' +
    '.hca-pwa-top{top:env(safe-area-inset-top);bottom:auto;left:0;right:0;' +
    'border-radius:0;text-align:center}.hca-pwa-button{margin-left:8px;padding:6px 10px;' +
    'font:inherit;color:inherit;background:transparent;border:1px solid currentColor;' +
    'border-radius:8px}.hca-pwa-close{float:right;background:none;border:0;' +
    'color:inherit;font:inherit;font-size:20px}.hca-pwa-hidden{display:none}' +
    '@media(min-width:769px){.hca-pwa-banner{bottom:12px}}';
  document.head.appendChild(style);
  var controller = null;
  if ('serviceWorker' in navigator && (location.protocol === 'https:' ||
      location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
    controller = navigator.serviceWorker;
  }
  window.HCA_PWA = {
    clearData: function () {
      var deleted = window.caches ? caches.delete('hca-data-v1') : Promise.resolve(false);
      return Promise.resolve(deleted).then(function () {
        if (controller && controller.controller) {
          controller.controller.postMessage({ type: 'clear-data' });
        }
      });
    }
  };
  function banner(text, install) {
    var box = document.createElement('div');
    box.className = 'hca-pwa-banner';
    box.setAttribute('role', 'status');
    box.appendChild(document.createTextNode(text));
    if (install) {
      var button = document.createElement('button');
      button.className = 'hca-pwa-button';
      button.textContent = 'Cài đặt';
      button.addEventListener('click', function () {
        install.prompt();
        install = null;
        box.remove();
      });
      box.appendChild(button);
    }
    var close = document.createElement('button');
    close.className = 'hca-pwa-close';
    close.textContent = '✕';
    close.setAttribute('aria-label', 'Đóng');
    close.addEventListener('click', function () {
      try { localStorage.setItem('hca-a2hs-off', '1'); } catch (err) {}
      box.remove();
    });
    box.appendChild(close);
    document.body.appendChild(box);
    return box;
  }
  var offline = null;
  function showOffline() {
    if (!offline) {
      offline = banner('Đang ngoại tuyến — chỉ xem được những bài đã mở trước đó.');
      offline.className += ' hca-pwa-top';
    }
  }
  window.addEventListener('offline', showOffline);
  window.addEventListener('online', function () {
    if (offline) offline.remove();
    offline = null;
  });
  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (event) {
    event.preventDefault();
    deferred = event;
    setTimeout(function () {
      if (deferred && !isStandalone()) banner('Cài Học Cùng AI lên thiết bị của bạn:', deferred);
    }, 4000);
  });
  function isStandalone() {
    return navigator.standalone === true ||
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
  }
  function isAppleMobile() {
    return /iPhone|iPad|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }
  function shouldSuggest() {
    if (isStandalone() || !isAppleMobile() || location.hash === '#/login') return false;
    try { if (localStorage.getItem('hca-a2hs-off')) return false; } catch (err) {}
    return true;
  }
  setTimeout(function () {
    if (shouldSuggest() && !deferred) {
      banner('📲 Cài Học Cùng AI lên màn hình chính: bấm nút Chia sẻ ⬆︎ rồi chọn «Thêm vào MH chính».');
    }
  }, 4000);
}());
