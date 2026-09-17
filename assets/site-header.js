// Site Header - Toggle & Sticky Header Functionality
// Mobile-first responsive header with smooth transitions

(function() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.site-header__toggle');

  if (!header) return;

  // Setup Menu Toggle (hamburger animation)
  function setupMenuToggle() {
    if (!toggle) return;

    toggle.addEventListener('click', function() {
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
    });
  }

  // Setup Sticky Header
  function setupStickyHeader() {
    const sectionId = header.getAttribute('data-section-id');
    const settings = window.Shopify && window.Shopify.theme && window.Shopify.theme.settings;

    if (!settings) return;

    const isStickyEnabled = settings['sticky_enable-' + sectionId];
    const hasShadow = settings['sticky_shadow-' + sectionId] !== false;

    if (!isStickyEnabled) return;

    window.addEventListener('scroll', () => {
      const isScrolled = window.scrollY > 0;

      if (isScrolled) {
        header.classList.add('header-sticky');
        if (hasShadow) {
          header.classList.add('with-shadow');
        }
      } else {
        header.classList.remove('header-sticky');
        header.classList.remove('with-shadow');
      }
    });

    if (isStickyEnabled) {
      document.body.classList.add('header-sticky-enabled');
    }
  }

  // Initialize
  setupMenuToggle();
  setupStickyHeader();
})();
