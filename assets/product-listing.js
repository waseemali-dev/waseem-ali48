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
    sizeTrigger: '[data-size-trigger]',
    sizeList: '[data-size-list]',
    sizeValue: '[data-size-value]',
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
    dom.sizeTrigger = dom.modal.querySelector(CONFIG.sizeTrigger);
    dom.sizeList = dom.modal.querySelector(CONFIG.sizeList);
    dom.sizeValue = dom.modal.querySelector(CONFIG.sizeValue);
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
    dom.sizeTrigger.addEventListener('click', toggleSizeDropdown);
    document.addEventListener('click', handleOutsideClick);
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

    const opts = dom.colors.querySelectorAll(CONFIG.colorOpt);
    const index = Array.from(opts).indexOf(e.target);
    const total = opts.length;

    state.color = e.target.dataset.color;

    // Update slider position
    if (total > 1) {
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

  function toggleSizeDropdown(e) {
    e.stopPropagation();
    const isOpen = dom.sizeList.hasAttribute('hidden');

    if (isOpen) {
      dom.sizeList.removeAttribute('hidden');
      dom.sizeTrigger.classList.add('is-open');
    } else {
      dom.sizeList.setAttribute('hidden', '');
      dom.sizeTrigger.classList.remove('is-open');
    }
  }

  function handleSizeOptionClick(e) {
    if (!e.target.matches('.prod-modal__dropdown-option')) return;

    const selectedSize = e.target.textContent.trim();
    state.size = selectedSize;

    // Update trigger text
    dom.sizeTrigger.querySelector('.prod-modal__dropdown-text').textContent = selectedSize;

    // Update visual feedback
    dom.sizeList.querySelectorAll('.prod-modal__dropdown-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    e.target.classList.add('selected');

    // Close dropdown
    dom.sizeList.setAttribute('hidden', '');
    dom.sizeTrigger.classList.remove('is-open');
  }

  function handleOutsideClick(e) {
    if (!dom.modal.classList.contains('is-open')) return;

    const wrapper = dom.sizeTrigger.closest('.prod-modal__dropdown-wrapper');
    if (!wrapper.contains(e.target) && dom.sizeList && !dom.sizeList.hasAttribute('hidden')) {
      dom.sizeList.setAttribute('hidden', '');
      dom.sizeTrigger.classList.remove('is-open');
    }
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
    dom.sizeTrigger.querySelector('.prod-modal__dropdown-text').textContent = 'Choose your size';
    dom.sizeList.setAttribute('hidden', '');
    dom.sizeTrigger.classList.remove('is-open');
    dom.sizeList.querySelectorAll('.prod-modal__dropdown-option').forEach(opt => {
      opt.classList.remove('selected');
    });
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

    // Reset slider
    dom.slider.style.setProperty('--slider-pos', '0%');
  }

  function renderSizes(sizes) {
    dom.sizeList.innerHTML = '';
    dom.sizeTrigger.querySelector('.prod-modal__dropdown-text').textContent = 'Choose your size';
    state.size = null;

    sizes.forEach(size => {
      const opt = document.createElement('button');
      opt.className = 'prod-modal__dropdown-option';
      opt.type = 'button';
      opt.textContent = size;
      opt.addEventListener('click', handleSizeOptionClick);
      dom.sizeList.appendChild(opt);
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

  function showSuccessMessage() {
    const msg = document.createElement('div');
    msg.className = 'prod-modal__success';
    msg.textContent = '✓ Product added to cart';
    document.body.appendChild(msg);

    setTimeout(() => {
      msg.style.animation = 'slideInUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1) reverse';
      setTimeout(() => msg.remove(), 300);
    }, 2000);
  }

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
        showSuccessMessage();
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