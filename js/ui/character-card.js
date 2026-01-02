(function () {
  const root = document.querySelector('[data-card-gallery]');
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll('[data-card-tab]'));
  const panels = Array.from(root.querySelectorAll('[data-card-panel]'));

  const setActive = (id) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.cardTab === id;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach((panel) => {
      const active = panel.dataset.cardPanel === id;
      panel.classList.toggle('is-hidden', !active);
      if (active) {
        panel.setAttribute('tabindex', '0');
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
        panel.removeAttribute('tabindex');
      }
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setActive(tab.dataset.cardTab));
  });

  if (tabs[0]) setActive(tabs[0].dataset.cardTab);
})();
