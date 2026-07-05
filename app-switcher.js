/**
 * app-switcher.js — shared Revival app switcher, served from assets.revival.tv.
 *
 * Single source of truth for the list of internal apps. Each site drops its
 * hardcoded switcher markup and instead adds:
 *
 *   <div class="app-switcher" data-app-switcher="vitals"></div>
 *   ...
 *   <script src="https://assets.revival.tv/app-switcher.js"></script>
 *
 * The `data-app-switcher` value is the app's `key` below (see APPS). Any
 * element with that attribute is auto-rendered on DOMContentLoaded — no
 * per-site wiring needed. To add, rename, or reorder an app everywhere at
 * once, edit the APPS array here and push; every site picks it up on next
 * load (subject to caching — see the deploy workflow's cache-control header).
 *
 * Markup/classes intentionally match the existing revival-ui.css rules
 * (.app-switcher, .app-switcher-btn, .app-logo, .app-name,
 * .switcher-chevron, .app-menu, .app-menu-item, .app-menu-icon) so no CSS
 * changes are needed alongside this file.
 */
(function () {
  'use strict';

  var LOGO_URL =
    'https://www.revival.tv/wp-content/uploads/2022/11/RevivalChristianFellowshipRedSquareLogo.png';

  // Keep alphabetical — this order is what renders in every switcher menu.
  var APPS = [
    { key: 'dashboard', name: 'Dashboard', url: 'https://dashboard.revival.tv' },
    { key: 'design',    name: 'Design',    url: 'https://design.revival.tv' },
    { key: 'signage',   name: 'Signage',   url: 'https://signage.revival.tv' },
    { key: 'steward',   name: 'Steward',   url: 'https://steward.revival.tv' },
    { key: 'vitals',    name: 'Vitals',    url: 'https://vitals.revival.tv' },
  ];

  function menuItemHtml(app) {
    return (
      '<a class="app-menu-item" href="' + app.url + '">' +
      '<img class="app-menu-icon" src="' + LOGO_URL + '" alt="">' +
      '<span>' + app.name + '</span>' +
      '</a>'
    );
  }

  /**
   * Render a switcher into `mount` (an element or element id).
   * opts.current — the key (from APPS) of the app currently being viewed;
   * its name is shown next to the logo in the collapsed button.
   */
  function renderAppSwitcher(opts) {
    opts = opts || {};
    var mount = typeof opts.mount === 'string' ? document.getElementById(opts.mount) : opts.mount;
    if (!mount) return;

    var current = APPS.filter(function (a) { return a.key === opts.current; })[0];
    var currentName = (current && current.name) || opts.currentLabel || '';

    mount.innerHTML =
      '<button class="app-switcher-btn" type="button" aria-haspopup="true" aria-expanded="false">' +
      '<img class="app-logo" src="' + LOGO_URL + '" alt="Revival Christian Fellowship">' +
      '<span class="app-name">' + currentName + '</span>' +
      '<span class="switcher-chevron" aria-hidden="true">▾</span>' +
      '</button>' +
      '<div class="app-menu" hidden>' +
      APPS.map(menuItemHtml).join('') +
      '</div>';

    var btn = mount.querySelector('.app-switcher-btn');
    var menu = mount.querySelector('.app-menu');

    function close() {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = !menu.hidden;
      if (open) {
        close();
      } else {
        menu.hidden = false;
        btn.setAttribute('aria-expanded', 'true');
      }
    });
    document.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });
  }

  window.RevivalUI = window.RevivalUI || {};
  window.RevivalUI.APPS = APPS;
  window.RevivalUI.renderAppSwitcher = renderAppSwitcher;

  document.addEventListener('DOMContentLoaded', function () {
    var mounts = document.querySelectorAll('[data-app-switcher]');
    for (var i = 0; i < mounts.length; i++) {
      renderAppSwitcher({ mount: mounts[i], current: mounts[i].getAttribute('data-app-switcher') });
    }
  });
})();
