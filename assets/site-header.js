// Site Header - Toggle & Sticky Header Functionality
// Mobile-first responsive header with smooth transitions

(function() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.site-header__toggle');
  const menu = document.querySelector('.site-header__menu');
  
  if (!header) return;

  // Setup Menu Toggle (hamburger animation & menu visibility)
  function setupMenuToggle() {
    if (!toggle) return;

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !isExpanded);
      
      if (menu) {
        if (isExpanded) {
          menu.classList.remove('menu-open');
        } else {
          menu.classList.add('menu-open');
        }
      }
    });

    // Close menu when clicking outside
    if (menu) {
      document.addEventListener('click', function(e) {
        const isClickInside = header.contains(e.target);
        if (!isClickInside && menu.classList.contains('menu-open')) {
          toggle.setAttribute('aria-expanded', 'false');
          menu.classList.remove('menu-open');
        }
      });
    }

    // Close menu on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && menu && menu.classList.contains('menu-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('menu-open');
      }
    });

    // Keyboard support
    toggle.addEventListener('keypress', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle.click();
      }
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

  // Ensure DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setupMenuToggle();
      setupStickyHeader();
    });
  } else {
    setupMenuToggle();
    setupStickyHeader();
  }
})();
