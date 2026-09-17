/* ============================================
   PRODUCT LISTING - JAVASCRIPT
   Vanilla JS, IIFE, Production Ready
   Matches product-gallery reference implementation
   ============================================ */

(function() {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    colorIndicator: '[data-color-indicator]',
    sizeDropdown: '[data-size-dropdown]',
    sizeTrigger: '[data-size-trigger]',
    sizeList: '[data-size-list]',
    sizeValue: '[data-size-value]',
    addBtn: '[data-add-cart]',
    modalImg: '[data-modal-img]',
    modalName: '[data-modal-name]',
    modalPrice: '[data-modal-price]',
    modalDesc: '[data-modal-desc]',
  };

  /* ========================================
     STATE
     ======================================== */

  const state = {
    isOpen: false,
    current: null,
    selectedOptions: {},
    activeTrigger: null,
    isSubmitting: false,
  };

  /* ========================================
     DOM CACHE
     ======================================== */

  const dom = {};

  function cacheDOM() {
    dom.section = document.querySelector(CONFIG.section);
    if (!dom.section) {
      console.error('Product list section not found:', CONFIG.section);
      return false;
    }

    dom.modal = document.querySelector(CONFIG.modal);
    if (!dom.modal) {
      console.error('Modal not found:', CONFIG.modal);
      return false;
    }

    dom.overlay = dom.modal.querySelector(CONFIG.overlay);
    dom.closeBtn = dom.modal.querySelector(CONFIG.closeBtn);
    dom.colors = dom.modal.querySelector(CONFIG.colors);
    dom.colorIndicator = dom.modal.querySelector(CONFIG.colorIndicator);
    dom.sizeDropdown = dom.modal.querySelector(CONFIG.sizeDropdown);
    dom.sizeTrigger = dom.modal.querySelector(CONFIG.sizeTrigger);
    dom.sizeList = dom.modal.querySelector(CONFIG.sizeList);
    dom.sizeValue = dom.modal.querySelector(CONFIG.sizeValue);
    dom.addBtn = dom.modal.querySelector(CONFIG.addBtn);
    dom.img = dom.modal.querySelector(CONFIG.modalImg);
    dom.name = dom.modal.querySelector(CONFIG.modalName);
    dom.price = dom.modal.querySelector(CONFIG.modalPrice);
    dom.desc = dom.modal.querySelector(CONFIG.modalDesc);
    dom.body = document.body;

    return true;
  }

  /* ========================================
     INIT EVENTS
     ======================================== */

  function bindEvents() {
    const hotspots = dom.section.querySelectorAll(CONFIG.hotspot);
    if (hotspots.length === 0) {
      console.warn('No hotspots found');
    }

    hotspots.forEach(hotspot => {
      hotspot.addEventListener('click', handleHotspotClick);
    });

    dom.closeBtn.addEventListener('click', closeModal);
    dom.overlay.addEventListener('click', closeModal);
    document.addEventListener('keydown', handleKeydown);

    dom.colors.addEventListener('click', handleColorSelect);
    dom.sizeTrigger.addEventListener('click', toggleDropdown);
    document.addEventListener('click', handleOutsideClick);
    dom.addBtn.addEventListener('click', handleAddToCart);

    window.addEventListener('resize', function() {
      if (state.isOpen) {
        updateColorIndicator(true);
      }
    });
  }

  /* ========================================
     HANDLERS
     ======================================== */

  function handleHotspotClick(e) {
    e.preventDefault();
    e.stopPropagation();

    const card = e.target.closest(CONFIG.card);
    if (!card) {
      console.error('Card not found from hotspot click');
      return;
    }

    const productId = card.getAttribute('data-product-id');
    if (!productId) {
      console.error('Product ID not found on card');
      return;
    }

    loadProduct(productId);
    openModal();
  }

  function handleColorSelect(e) {
    if (!e.target.matches(CONFIG.colorOpt)) return;

    const value = e.target.dataset.color;
    const colorIndex = 1;
    selectOption(colorIndex, value);
  }

  function selectOption(index, value) {
    state.selectedOptions[index] = value;
    syncSelectionUI();
    refreshVariantUI();

    if (index === 1) {
      updateColorIndicator();
    }
  }

  function syncSelectionUI() {
    const selectedColor = state.selectedOptions[1];
    dom.colors.querySelectorAll(CONFIG.colorOpt).forEach(btn => {
      const isSelected = btn.getAttribute('data-color') === selectedColor;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    const selectedSize = state.selectedOptions[0];
    dom.sizeList.querySelectorAll('.prod-modal__dropdown-option').forEach(btn => {
      const isSelected = btn.getAttribute('data-value') === selectedSize;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
    if (selectedSize) {
      dom.sizeValue.textContent = selectedSize;
    }
  }

  function toggleDropdown() {
    if (isDropdownOpen()) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function openDropdown() {
    dom.sizeList.hidden = false;
    requestAnimationFrame(() => {
      dom.sizeList.classList.add('is-open');
    });
    dom.sizeTrigger.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    dom.sizeList.classList.remove('is-open');
    dom.sizeTrigger.setAttribute('aria-expanded', 'false');

    const finish = () => {
      dom.sizeList.hidden = true;
    };
    if (prefersReducedMotion) {
      finish();
    } else {
      dom.sizeList.addEventListener('transitionend', finish, { once: true });
    }
  }

  function isDropdownOpen() {
    return !dom.sizeList.hidden;
  }

  function handleOutsideClick(e) {
    if (!state.isOpen) return;
    if (!dom.sizeDropdown.contains(e.target) && isDropdownOpen()) {
      closeDropdown();
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && state.isOpen) {
      closeModal();
    }
  }

 function handleAddToCart(e) {
  e.preventDefault();

  if (state.isSubmitting) return;

  const selectedSize = state.selectedOptions[0];
  const selectedColor = state.selectedOptions[1];

  // Ensure both options are selected
  if (!selectedSize || !selectedColor) {
    alert('Please select both size and color');
    return;
  }

  let variant = findMatchingVariant();

  if (!variant) {
    alert('Selected combination not available');
    return;
  }

  state.isSubmitting = true;
  dom.addBtn.disabled = true;
  dom.addBtn.textContent = 'Adding...';

  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: [{ id: variant.id, quantity: 1 }] })
  })
    .then(res => res.json())
    .then(() => {
      showSuccessMessage();
      closeModal();
      state.isSubmitting = false;
      dom.addBtn.disabled = false;
      dom.addBtn.textContent = 'ADD TO CART →';
    })
    .catch(err => {
      console.error('Cart error:', err);
      alert('Failed to add to cart');
      state.isSubmitting = false;
      dom.addBtn.disabled = false;
      dom.addBtn.textContent = 'ADD TO CART →';
    });
}

  /* ========================================
     MODAL CONTROLS
     ======================================== */

  function openModal() {
    state.isOpen = true;
    dom.modal.classList.add('is-open');
    dom.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeydown);
  }

  function closeModal() {
    state.isOpen = false;
    dom.modal.classList.remove('is-open');
    dom.body.style.overflow = '';
    closeDropdown();
    resetModal();
    document.removeEventListener('keydown', handleKeydown);
  }

  function resetModal() {
    state.selectedOptions = {};
    dom.sizeValue.textContent = 'Choose your size';
    dom.sizeList.innerHTML = '';
    dom.colorIndicator.style.width = '0';
  }

  /* ========================================
     PRODUCT LOADING
     ======================================== */

  function loadProduct(productId) {
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (!card) {
      console.error('Card not found for product:', productId);
      return;
    }

    try {
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
      preselectDefaultOptions();
    } catch (err) {
      console.error('Error loading product:', err);
    }
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
    const indicator = dom.colorIndicator;
    dom.colors.innerHTML = '';
    dom.colors.appendChild(indicator);

    colors.forEach((color, idx) => {
      const btn = document.createElement('button');
      btn.className = 'prod-modal__color-opt';
      btn.type = 'button';
      btn.dataset.colorOpt = '';
      btn.dataset.color = color.value;
      btn.textContent = color.name;
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', `Select ${color.name}`);

      if (window.CSS && window.CSS.supports && window.CSS.supports('color', color.value)) {
        btn.style.setProperty('--swatch-color', color.value);
      }

      dom.colors.appendChild(btn);
    });

    dom.colorIndicator.style.width = '0';
  }

  function renderSizes(sizes) {
    dom.sizeList.innerHTML = '';

    sizes.forEach(size => {
      const li = document.createElement('li');
      li.setAttribute('role', 'presentation');

      const opt = document.createElement('button');
      opt.className = 'prod-modal__dropdown-option';
      opt.type = 'button';
      opt.textContent = size;
      opt.setAttribute('role', 'option');
      opt.setAttribute('aria-selected', 'false');
      opt.setAttribute('data-value', size);

      opt.addEventListener('click', () => {
        selectOption(0, size);
        closeDropdown();
      });

      li.appendChild(opt);
      dom.sizeList.appendChild(li);
    });
  }

  function preselectDefaultOptions() {
    if (state.current && state.current.variants && state.current.variants.length > 0) {
      const firstVariant = state.current.variants[0];
      if (firstVariant && firstVariant.options && Array.isArray(firstVariant.options)) {
        firstVariant.options.forEach((value, index) => {
          state.selectedOptions[index] = value;
        });
      }
    }

    syncSelectionUI();
    refreshVariantUI();
    updateColorIndicator(true);
  }

  /* ========================================
     COLOR INDICATOR UPDATE
     ======================================== */

  function updateColorIndicator(instant) {
    const selectedColor = state.selectedOptions[1];
    const selectedButton = dom.colors.querySelector(
      '.prod-modal__color-opt[aria-pressed="true"]'
    );

    if (!selectedButton || !selectedColor) {
      dom.colorIndicator.style.width = '0';
      return;
    }

    const apply = () => {
      dom.colorIndicator.style.width = selectedButton.offsetWidth + 'px';
      dom.colorIndicator.style.transform = 'translateX(' + selectedButton.offsetLeft + 'px)';
    };

    if (instant || prefersReducedMotion) {
      dom.colorIndicator.style.transition = 'none';
      apply();
      void dom.colorIndicator.offsetWidth;
      dom.colorIndicator.style.transition = '';
    } else {
      apply();
    }
  }

  /* ========================================
     VARIANT MATCHING
     ======================================== */

  function findMatchingVariant() {
    if (!state.current || !state.current.variants) return null;

    const selectedSize = state.selectedOptions[0];
    const selectedColor = state.selectedOptions[1];

    if (!selectedSize || !selectedColor) return null;

    return state.current.variants.find(v => {
      if (!v || !v.options || !Array.isArray(v.options)) return false;
      return v.options[0] === selectedSize && v.options[1] === selectedColor;
    });
  }

  function refreshVariantUI() {
    const variant = findMatchingVariant();

    if (variant) {
      dom.price.textContent = variant.price;
    }
  }

  /* ========================================
     SUCCESS MESSAGE
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

  /* ========================================
     INITIALIZATION
     ======================================== */

  function init() {
    if (!cacheDOM()) {
      console.error('Failed to cache DOM elements');
      return;
    }
    bindEvents();
    console.log('Product Listing initialized successfully');
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