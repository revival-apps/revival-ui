/**
 * combo.js — any <select data-combo> becomes a type-to-search field.
 *
 * Aaron, 2026-08-21: "All drop-down menus should be search fields this makes it
 * easier for a user." Shared here (assets.revival.tv/combo.js) rather than written
 * per-app, the same rule as revival-ui.css: one behavior, every app, no deploys.
 * Steward's supplier pickers predicted this file by name — "worth consolidating into
 * a shared public/combo.js".
 *
 * PROGRESSIVE ENHANCEMENT, strictly. The native <select> stays in the form and stays
 * the thing that submits; this script hides it and drives it. No JS, or JS that
 * fails: the native dropdown still works. Picking an option writes select.value and
 * dispatches a real 'change' event, so any page logic listening to the select (a
 * location toggling a free-text field, a form that saves on change) keeps working
 * unchanged.
 *
 * `required` is moved off the enhanced select: a display:none control that fails
 * native validation is an unfocusable error the person never sees. Every form in the
 * estate validates on the server and re-renders with its values preserved — that is
 * the path a missing pick takes.
 *
 * Wiring: <select data-combo> anywhere, then this file with `defer`. Selects added
 * to the DOM later can be enhanced by calling window.revivalCombo(selectEl).
 */
(function () {
  'use strict';

  function enhance(select) {
    if (select.dataset.comboWired) return;
    select.dataset.comboWired = 'true';

    var wrap = document.createElement('div');
    wrap.className = 'combo-wrap';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);

    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'combo-input';
    input.autocomplete = 'off';
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-expanded', 'false');
    // The select's first empty-valued option usually reads as its prompt
    // ("Assign…", "Not tied to one place") — reuse it as the placeholder.
    var prompt = Array.prototype.find.call(select.options, function (o) {
      return o.value === '';
    });
    input.placeholder = prompt ? prompt.textContent.trim() : 'Type to search…';

    var menu = document.createElement('div');
    menu.className = 'combo-menu';

    wrap.appendChild(input);
    wrap.appendChild(menu);
    select.style.display = 'none';
    if (select.required) {
      select.required = false; // see the header comment
      select.dataset.comboRequired = 'true';
    }

    var options = Array.prototype.filter
      .call(select.options, function (o) {
        return o.value !== '';
      })
      .map(function (o) {
        return { value: o.value, label: o.textContent.trim() };
      });

    var matches = [];
    var active = -1;

    function syncFromSelect() {
      var current = select.options[select.selectedIndex];
      input.value = current && current.value !== '' ? current.textContent.trim() : '';
    }

    function close() {
      menu.style.display = 'none';
      input.setAttribute('aria-expanded', 'false');
      active = -1;
    }

    function render(list) {
      matches = list;
      active = -1;
      menu.innerHTML = list.length
        ? list
            .map(function (o, i) {
              return (
                '<div class="combo-opt" data-idx="' + i + '">' + escapeHtml(o.label) + '</div>'
              );
            })
            .join('')
        : '<div class="combo-empty">No matches</div>';
      menu.style.display = 'block';
      input.setAttribute('aria-expanded', 'true');
    }

    function escapeHtml(t) {
      var d = document.createElement('div');
      d.textContent = t == null ? '' : t;
      return d.innerHTML;
    }

    function highlight(i) {
      var els = menu.querySelectorAll('.combo-opt');
      els.forEach(function (el) {
        el.classList.remove('active');
      });
      if (i >= 0 && els[i]) {
        els[i].classList.add('active');
        els[i].scrollIntoView({ block: 'nearest' });
      }
      active = i;
    }

    function pick(o) {
      select.value = o.value;
      input.value = o.label;
      close();
      // A REAL change event — the page logic hanging off this select must not know
      // or care that a combo now drives it.
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function filter() {
      var q = input.value.trim().toLowerCase();
      render(
        q
          ? options.filter(function (o) {
              return o.label.toLowerCase().indexOf(q) !== -1;
            })
          : options
      );
    }

    input.addEventListener('focus', function () {
      // Open with everything: a combo that only answers typed queries hides the list
      // from the person who came to browse it.
      input.select();
      filter();
    });
    input.addEventListener('input', function () {
      // Typing invalidates the previous pick until a new one is made.
      if (select.value !== '') {
        select.value = '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      filter();
    });
    input.addEventListener('blur', function () {
      setTimeout(function () {
        // Left without picking: fall back to what the select actually holds.
        syncFromSelect();
        close();
      }, 150);
    });
    input.addEventListener('keydown', function (e) {
      if (menu.style.display === 'none') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          filter();
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlight(Math.min(active + 1, matches.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlight(Math.max(active - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var i = active >= 0 ? active : matches.length === 1 ? 0 : -1;
        if (i >= 0 && matches[i]) pick(matches[i]);
      } else if (e.key === 'Escape') {
        close();
      }
    });
    menu.addEventListener('mousedown', function (e) {
      var opt = e.target.closest('.combo-opt');
      if (!opt) return;
      e.preventDefault();
      var i = parseInt(opt.getAttribute('data-idx'), 10);
      if (matches[i]) pick(matches[i]);
    });

    syncFromSelect();
  }

  function wireAll() {
    document.querySelectorAll('select[data-combo]').forEach(enhance);
  }

  window.revivalCombo = enhance;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireAll);
  } else {
    wireAll();
  }
})();
