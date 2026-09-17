/* ============================================
   PRODUCT LISTING - JAVASCRIPT
   Vanilla JS, IIFE, Production Ready
   ============================================ */

(function() {
  'use strict';

  /* ========================================
     CONFIG
     ======================================== */

  const CONFIG = {
    section: '[data-comp="prod-list"]',
    card: '[data-prod-card]',
    hotspot: '[data-hotspot]',
    modal: '[data-modal="prod"]',
    overlay: '[data-modal-overlay]',
    closeBtn: '[data-modal-close]',
    colors: '[data-colors]',
    colorOpt: '[data-color-opt]',
    size: '[data-size]',
    addBtn: '[data-add-cart]',
    modalImg: '[data-modal-img]',
    modalName: '[data-modal-name]',
    modalPrice: '[data-modal-price]',
    modalDesc: '[data-modal-desc]',
    slider: '[data-modal] .prod-modal__slider',
  };

  /* ========================================
     STATE
     ======================================== */

  const state = {
    isOpen: false,
    current: null,
    color: null,
    size: null,
    bundle: null,
  };

  /* ========================================
     DOM CACHE
     ======================================== */

  const dom = {};

  function cacheDOM() {
    dom.section = document.querySelector(CONFIG.section);
    if (!dom.section) {
      console.error('[ProductListing] Section not found:', CONFIG.section);
      return false;
    }

    dom.modal = document.querySelector(CONFIG.modal);
    if (!dom.modal) {
      console.error('[ProductListing] Modal not found:', CONFIG.modal);
      return false;
    }

    dom.overlay = dom.modal.querySelector(CONFIG.overlay);
    if (!dom.overlay) console.warn('[ProductListing] Overlay not found');

    dom.closeBtn = dom.modal.querySelector(CONFIG.closeBtn);
    if (!dom.closeBtn) console.warn('[ProductListing] Close button not found');

    dom.colors = dom.modal.querySelector(CONFIG.colors);
    if (!dom.colors) console.warn('[ProductListing] Colors container not found');

    dom.size = dom.modal.querySelector(CONFIG.size);
    if (!dom.size) console.warn('[ProductListing] Size select not found');

    dom.addBtn = dom.modal.querySelector(CONFIG.addBtn);
    if (!dom.addBtn) console.warn('[ProductListing] Add to cart button not found');

    dom.img = dom.modal.querySelector(CONFIG.modalImg);
    if (!dom.img) console.warn('[ProductListing] Modal image not found');

    dom.name = dom.modal.querySelector(CONFIG.modalName);
    if (!dom.name) console.warn('[ProductListing] Modal name not found');

    dom.price = dom.modal.querySelector(CONFIG.modalPrice);
    if (!dom.price) console.warn('[ProductListing] Modal price not found');

    dom.desc = dom.modal.querySelector(CONFIG.modalDesc);
    if (!dom.desc) console.warn('[ProductListing] Modal description not found');

    dom.slider = dom.modal.querySelector(CONFIG.slider);
    if (!dom.slider) console.warn('[ProductListing] Slider not found');

    dom.body = document.body;

    return true;
  }

  /* ========================================
     INIT EVENTS
     ======================================== */

  function bindEvents() {
    const hotspots = dom.section.querySelectorAll(CONFIG.hotspot);
    hotspots.forEach(hotspot => {
      hotspot.addEventListener('click', handleHotspotClick);
    });

    if (dom.closeBtn) dom.closeBtn.addEventListener('click', closeModal);
    if (dom.overlay) dom.overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', handleKeydown);

    if (dom.colors) dom.colors.addEventListener('click', handleColorSelect);
    if (dom.size) dom.size.addEventListener('change', handleSizeChange);
    if (dom.addBtn) dom.addBtn.addEventListener('click', handleAddToCart);
  }

  /* ========================================
     HANDLERS
     ======================================== */

  function handleHotspotClick(e) {
    const card = e.target.closest(CONFIG.card);
    if (!card) return;

    const productId = card.dataset.productId;
    const bundleId = card.dataset.bundleId || null;

    loadProduct(productId);
    state.bundle = bundleId;
    openModal();
  }

  function handleColorSelect(e) {
    if (!e.target.matches(CONFIG.colorOpt)) return;

    const opts = dom.colors.querySelectorAll(CONFIG.colorOpt);
    const index = Array.from(opts).indexOf(e.target);
    const total = opts.length;

    state.color = e.target.dataset.color;

    // Update slider position
    if (total > 1 && dom.slider) {
      const pos = (index / (total - 1)) * 100;
      dom.slider.style.setProperty('--slider-pos', pos + '%');
    }

    // Visual feedback
    opts.forEach(opt => opt.classList.remove('active'));
    e.target.classList.add('active');
  }

  function handleSizeChange(e) {
    state.size = e.target.value;
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && state.isOpen) {
      closeModal();
    }
  }

  function handleAddToCart(e) {
    e.preventDefault();

    if (!state.color || !state.size) {
      alert('Please select color and size');
      return;
    }

    const variantId = findVariant(state.current, state.color, state.size);
    if (!variantId) {
      alert('Variant not available');
      return;
    }

    // Add primary product
    addToCart(variantId, () => {
      // Add bundle if exists
      if (state.bundle) {
        addToCart(state.bundle, () => {
          closeModal();
        });
      } else {
        closeModal();
      }
    });
  }

  /* ========================================
     MODAL CONTROLS
     ======================================== */

  function openModal() {
    state.isOpen = true;
    dom.modal.classList.add('is-open');
    dom.body.style.overflow = 'hidden';
  }

  function closeModal() {
    state.isOpen = false;
    dom.modal.classList.remove('is-open');
    dom.body.style.overflow = '';
    resetModal();
  }

  function resetModal() {
    state.color = null;
    state.size = null;
    if (dom.size) dom.size.value = '';
    if (dom.colors) {
      dom.colors.querySelectorAll(CONFIG.colorOpt).forEach(opt => {
        opt.classList.remove('active');
      });
    }
  }

  /* ========================================
     PRODUCT LOADING
     ======================================== */

  function loadProduct(productId) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (!card) return;

    state.current = {
      id: productId,
      name: card.dataset.productName,
      price: card.dataset.productPrice,
      image: card.dataset.productImage,
      desc: card.dataset.productDesc,
      colors: JSON.parse(card.dataset.productColors),
      sizes: JSON.parse(card.dataset.productSizes),
      variants: JSON.parse(card.dataset.productVariants),
    };

    renderModal();
  }

  function renderModal() {
    const p = state.current;

    if (dom.img) {
      dom.img.src = p.image;
      dom.img.alt = p.name;
    }
    if (dom.name) dom.name.textContent = p.name;
    if (dom.price) dom.price.textContent = p.price;
    if (dom.desc) dom.desc.textContent = p.desc;

    renderColors(p.colors);
    renderSizes(p.sizes);
  }

  function renderColors(colors) {
    if (!dom.colors) return;
    dom.colors.innerHTML = '';

    colors.forEach((color, idx) => {
      const btn = document.createElement('button');
      btn.className = 'prod-modal__color-opt';
      btn.type = 'button';
      btn.dataset.colorOpt = '';
      btn.dataset.color = color.name;
      btn.textContent = color.name;
      btn.setAttribute('aria-label', `Select ${color.name}`);

      // Auto-select first
      if (idx === 0) {
        btn.classList.add('active');
        state.color = color.name;
      }

      dom.colors.appendChild(btn);
    });

    // Reset slider
    if (dom.slider) dom.slider.style.setProperty('--slider-pos', '0%');
  }

  function renderSizes(sizes) {
    if (!dom.size) return;
    dom.size.innerHTML = '<option value="">Choose your size</option>';

    sizes.forEach(size => {
      const opt = document.createElement('option');
      opt.value = size;
      opt.textContent = size;
      dom.size.appendChild(opt);
    });
  }

  /* ========================================
     VARIANT MATCHING
     ======================================== */

  function findVariant(product, color, size) {
    const variant = product.variants.find(
      v => v.color === color && v.size === size
    );
    return variant ? variant.id : null;
  }

  /* ========================================
     CART API
     ======================================== */

  function addToCart(variantId, callback) {
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ id: variantId, quantity: 1 }],
      }),
    })
      .then(res => res.json())
      .then(() => {
        if (callback) callback();
      })
      .catch(err => {
        console.error('Cart error:', err);
        alert('Failed to add to cart');
      });
  }

  /* ========================================
     INITIALIZATION
     ======================================== */

  function init() {
    if (!cacheDOM()) {
      console.error('[ProductListing] Failed to cache DOM elements');
      return;
    }
    bindEvents();
    console.log('[ProductListing] Initialized successfully');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ========================================
     CLEANUP (Section Unload)
     ======================================== */

  document.addEventListener('shopify:section:unload', function() {
    if (state.isOpen) {
      closeModal();
    }
  });
})();