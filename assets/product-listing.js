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
  };

  /* ========================================
     DOM CACHE
     ======================================== */

  const dom = {};

  function cacheDOM() {
    dom.section = document.querySelector(CONFIG.section);
    if (!dom.section) return false;

    dom.modal = document.querySelector(CONFIG.modal);
    dom.overlay = dom.modal.querySelector(CONFIG.overlay);
    dom.closeBtn = dom.modal.querySelector(CONFIG.closeBtn);
    dom.colors = dom.modal.querySelector(CONFIG.colors);
    dom.size = dom.modal.querySelector(CONFIG.size);
    dom.addBtn = dom.modal.querySelector(CONFIG.addBtn);
    dom.img = dom.modal.querySelector(CONFIG.modalImg);
    dom.name = dom.modal.querySelector(CONFIG.modalName);
    dom.price = dom.modal.querySelector(CONFIG.modalPrice);
    dom.desc = dom.modal.querySelector(CONFIG.modalDesc);
    dom.slider = dom.modal.querySelector(CONFIG.slider);
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

    dom.closeBtn.addEventListener('click', closeModal);
    dom.overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', handleKeydown);

    dom.colors.addEventListener('click', handleColorSelect);
    dom.size.addEventListener('change', handleSizeChange);
    dom.addBtn.addEventListener('click', handleAddToCart);
  }

  /* ========================================
     HANDLERS
     ======================================== */

  function handleHotspotClick(e) {
    const card = e.target.closest(CONFIG.card);
    if (!card) return;

    const productId = card.dataset.productId;

    loadProduct(productId);
    openModal();
  }

  function handleColorSelect(e) {
    if (!e.target.matches(CONFIG.colorOpt)) return;

    state.color = e.target.dataset.color;

    // Visual feedback
    const opts = dom.colors.querySelectorAll(CONFIG.colorOpt);
    opts.forEach(opt => opt.classList.remove('active'));
    e.target.classList.add('active');

    // Update slider
    updateColorIndicator();
  }

  function updateColorIndicator(instant) {
    if (!dom.slider || !dom.colors) return;

    const selectedBtn = dom.colors.querySelector(CONFIG.colorOpt + '.active');

    if (!selectedBtn) {
      dom.slider.style.width = '0';
      return;
    }

    const apply = function() {
      dom.slider.style.width = selectedBtn.offsetWidth + 'px';
      dom.slider.style.transform = 'translateX(' + selectedBtn.offsetLeft + 'px)';
    };

    if (instant) {
      dom.slider.classList.add('is-instant');
      apply();
      // Force reflow
      void dom.slider.offsetWidth;
      dom.slider.classList.remove('is-instant');
    } else {
      apply();
    }
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

    if (!state.size || !state.color) {
      alert('Please select size and color');
      return;
    }

    const variantId = findVariant(state.current, state.size, state.color);
    if (!variantId) {
      alert('Variant not available');
      return;
    }

    addToCart(variantId, () => {
      closeModal();
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
    dom.size.value = '';
    dom.colors.querySelectorAll(CONFIG.colorOpt).forEach(opt => {
      opt.classList.remove('active');
    });
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

    dom.img.src = p.image;
    dom.img.alt = p.name;
    dom.name.textContent = p.name;
    dom.price.textContent = p.price;
    dom.desc.textContent = p.desc;

    renderColors(p.colors);
    renderSizes(p.sizes);
  }

  function renderColors(colors) {
    dom.colors.innerHTML = '';

    colors.forEach((color, idx) => {
      const btn = document.createElement('button');
      btn.className = 'prod-modal__color-opt';
      btn.type = 'button';
      btn.dataset.colorOpt = '';
      btn.dataset.color = color.value;
      btn.textContent = color.name;
      btn.setAttribute('aria-label', `Select ${color.name}`);

      // Auto-select first
      if (idx === 0) {
        btn.classList.add('active');
        state.color = color.value;
      }

      dom.colors.appendChild(btn);
    });

    // Position slider for first color (instant, no animation)
    updateColorIndicator(true);
  }

  function renderSizes(sizes) {
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

  function findVariant(product, size, color) {
    const variant = product.variants.find(
      v => v.size === size && v.color === color
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
    if (!cacheDOM()) return;
    bindEvents();
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