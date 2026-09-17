// Site Header - JavaScript Functionality
// Handles menu toggle, sticky behavior, and interactions

(function() {
  'use strict';

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    initHeader();
  }

  function initHeader() {
    const header = document.querySelector('[data-component="site-header"]');
    if (!header) return;

    const toggle = header.querySelector('[data-action="toggle-menu"]');
    const menu = header.querySelector('[data-component="mobile-menu"]');

    if (toggle && menu) {
      setupMenuToggle(toggle, menu, header);
    }

    // Setup sticky if enabled in section settings
    setupStickyHeader(header);
  }

  // Menu Toggle Functionality
  function setupMenuToggle(toggle, menu, header) {
    let isOpen = false;

    toggle.addEventListener('click', function() {
      isOpen = !isOpen;
      updateMenuState(toggle, menu, isOpen);
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!header.contains(event.target) && isOpen) {
        isOpen = false;
        updateMenuState(toggle, menu, isOpen);
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && isOpen) {
        isOpen = false;
        updateMenuState(toggle, menu, isOpen);
      }
    });
  }

  function updateMenuState(toggle, menu, isOpen) {
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    if (isOpen) {
      menu.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    } else {
      menu.classList.remove('menu-open');
      document.body.style.overflow = '';
    }
  }

  // Sticky Header Functionality
  function setupStickyHeader(header) {
    // Check if sticky is enabled via data attribute or section settings
    const isStickyEnabled = header.getAttribute('data-sticky-enabled') === 'true';
    if (!isStickyEnabled) return;

    let lastScrollTop = 0;
    let scrollTimeout;

    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 50) {
        if (!header.classList.contains('header-sticky')) {
          header.classList.add('header-sticky');
          document.body.classList.add('header-sticky-enabled');
        }
      } else {
        if (header.classList.contains('header-sticky')) {
          header.classList.remove('header-sticky');
          document.body.classList.remove('header-sticky-enabled');
        }
      }

      lastScrollTop = scrollTop;

      // Debounce scroll events for performance
      scrollTimeout = setTimeout(function() {
        // Cleanup if needed
      }, 250);
    }, { passive: true });
  }

})();