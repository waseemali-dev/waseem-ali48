(function () {
'use strict';

var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function init() {
  var sections = document.querySelectorAll('[data-component="prod-list"]');
  sections.forEach(setupSection);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function setupSection(section) {
  var overlay = section.querySelector('[data-quick-add-overlay]');
  if (!overlay) return;

  var elements = {
    overlay: overlay,
    popup: overlay.querySelector('[data-quick-add-popup]'),
    image: overlay.querySelector('[data-modal-img]'),
    title: overlay.querySelector('[data-modal-name]'),
    price: overlay.querySelector('[data-modal-price]'),
    description: overlay.querySelector('[data-modal-desc]'),
    colorWrap: overlay.querySelector('[data-color-wrap]'),
    colorLabel: overlay.querySelector('[data-color-label]'),
    colorOptions: overlay.querySelector('[data-color-options]'),
    colorIndicator: overlay.querySelector('[data-color-indicator]'),
    sizeWrap: overlay.querySelector('[data-size-wrap]'),
    sizeLabel: overlay.querySelector('[data-size-label]'),
    dropdown: overlay.querySelector('[data-size-dropdown]'),
    dropdownToggle: overlay.querySelector('[data-dropdown-toggle]'),
    dropdownValue: overlay.querySelector('[data-dropdown-value]'),
    dropdownList: overlay.querySelector('[data-dropdown-list]'),
    status: overlay.querySelector('[data-modal-status]'),
    addToCartButton: overlay.querySelector('[data-action="add-to-cart"]')
  };

  var state = {
    product: null,
    optionNames: [],
    selectedOptions: {},
    activeTrigger: null,
    isSubmitting: false,
    colorIndex: -1,
    sizeIndex: -1
  };

  var descriptionLimit = parseInt(section.getAttribute('data-description-limit'), 10) || 120;

  /* ----------------------------------------
      COLOR HELPER
      ---------------------------------------- */

  function getColorValue(colorName) {
    var colorMap = {
      'white': '#ffffff',
      'black': '#000000',
      'red': '#e63946',
      'blue': '#457b9d',
      'navy': '#001f3f',
      'green': '#2ecc71',
      'gray': '#888888',
      'grey': '#888888',
      'beige': '#f5f5dc',
      'tan': '#d2b48c',
      'brown': '#8b4513',
      'gold': '#ffd700',
      'silver': '#c0c0c0',
      'pink': '#ffb6c1',
      'purple': '#800080',
      'orange': '#ff8c00',
      'yellow': '#ffff00',
      'cream': '#fffdd0',
      'charcoal': '#36454f',
      'khaki': '#f0e68c'
    };
    var normalized = (colorName || '').toLowerCase().trim();
    return colorMap[normalized] || '#cccccc';
  }

  /* ----------------------------------------
      OPEN / CLOSE
      ---------------------------------------- */

  function openQuickAdd(card, triggerEl) {
    var jsonTag = card.querySelector('[data-product-json]');
    if (!jsonTag) return;

    var product;
    try {
      product = JSON.parse(jsonTag.textContent);
    } catch (err) {
      return;
    }

    state.product = product;
    state.optionNames = product.optionNames || [];
    state.selectedOptions = {};
    state.activeTrigger = triggerEl;
    state.isSubmitting = false;

    renderPopup(product, descriptionLimit);
    preselectDefaultOptions(product);
    refreshVariantUI();

    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
      updateColorIndicator(true);
    });

    document.addEventListener('keydown', handleKeydown);
  }

  function closeQuickAdd() {
    overlay.classList.remove('is-open');
    closeDropdown();

    var finish = function () {
      overlay.hidden = true;
      if (state.activeTrigger) {
        state.activeTrigger.focus();
      }
    };

    if (prefersReducedMotion) {
      finish();
    } else {
      elements.popup.addEventListener('transitionend', finish, { once: true });
    }

    document.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      closeQuickAdd();
    }
  }

  /* ----------------------------------------
      RENDER STATIC PRODUCT INFO
      ---------------------------------------- */

  function renderPopup(product, limit) {
    elements.image.src = product.image || '';
    elements.image.alt = product.title || '';
    elements.title.textContent = product.title || '';
    elements.description.textContent = truncateText(product.description || '', limit);
    setStatus('', null);
    elements.addToCartButton.disabled = false;

    var colorIndex = findOptionIndex(product.optionNames, 'color');
    var sizeIndex = findOptionIndex(product.optionNames, 'size');

    renderColorOptions(product, colorIndex);
    renderSizeOptions(product, sizeIndex);

    state.colorIndex = colorIndex;
    state.sizeIndex = sizeIndex;
  }

  function findOptionIndex(optionNames, keyword) {
    if (!optionNames) return -1;
    for (var i = 0; i < optionNames.length; i++) {
      if (optionNames[i] && optionNames[i].toLowerCase().indexOf(keyword) !== -1) {
        return i;
      }
    }
    return -1;
  }

  function uniqueValuesForIndex(product, index) {
    if (index === -1) return [];
    var seen = {};
    var values = [];
    product.variants.forEach(function (variant) {
      var value = variant.options[index];
      if (value && !seen[value]) {
        seen[value] = true;
        values.push(value);
      }
    });
    return values;
  }

  function renderColorOptions(product, colorIndex) {
    var indicator = elements.colorIndicator;
    elements.colorOptions.innerHTML = '';
    elements.colorOptions.appendChild(indicator);

    if (colorIndex === -1) {
      elements.colorWrap.hidden = true;
      return;
    }

    elements.colorWrap.hidden = false;
    if (product.optionNames[colorIndex]) {
      elements.colorLabel.textContent = product.optionNames[colorIndex];
    }

    uniqueValuesForIndex(product, colorIndex).forEach(function (value) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'prod-modal__color-opt';
      button.textContent = value;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('data-value', value);
      button.style.setProperty('--swatch-color', getColorValue(value));

      button.addEventListener('click', function () {
        selectOption(colorIndex, value);
      });

      elements.colorOptions.appendChild(button);
    });
  }

  function renderSizeOptions(product, sizeIndex) {
    elements.dropdownList.innerHTML = '';

    if (sizeIndex === -1) {
      elements.sizeWrap.hidden = true;
      return;
    }

    elements.sizeWrap.hidden = false;
    if (product.optionNames[sizeIndex]) {
      elements.sizeLabel.textContent = product.optionNames[sizeIndex];
    }
    elements.dropdownValue.textContent = 'Choose your size';

    uniqueValuesForIndex(product, sizeIndex).forEach(function (value) {
      var li = document.createElement('li');
      li.setAttribute('role', 'presentation');

      var option = document.createElement('button');
      option.type = 'button';
      option.className = 'prod-modal__dropdown-option';
      option.textContent = value;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', 'false');
      option.setAttribute('data-value', value);

      option.addEventListener('click', function () {
        selectOption(sizeIndex, value);
        closeDropdown();
      });

      li.appendChild(option);
      elements.dropdownList.appendChild(li);
    });
  }

  function preselectDefaultOptions(product) {
    var firstAvailable = product.variants.filter(function (v) {
      return v.available;
    })[0];

    if (!firstAvailable) return;

    firstAvailable.options.forEach(function (value, index) {
      state.selectedOptions[index] = value;
    });

    syncSelectionUI();
  }

  function syncSelectionUI() {
    var selectedColor = state.selectedOptions[state.colorIndex];
    elements.colorOptions.querySelectorAll('button').forEach(function (btn) {
      var isSelected = btn.getAttribute('data-value') === selectedColor;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });

    var selectedSize = state.selectedOptions[state.sizeIndex];
    elements.dropdownList.querySelectorAll('button').forEach(function (btn) {
      var isSelected = btn.getAttribute('data-value') === selectedSize;
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    });
    if (selectedSize) {
      elements.dropdownValue.textContent = selectedSize;
    }
  }

  /* ----------------------------------------
      SELECTION + VARIANT RESOLUTION
      ---------------------------------------- */

  function selectOption(index, value) {
    state.selectedOptions[index] = value;
    syncSelectionUI();
    refreshVariantUI();
  }

  function findMatchingVariant() {
    var product = state.product;
    if (!product) return null;

    var found = null;
    product.variants.some(function (variant) {
      var isMatch = variant.options.every(function (value, index) {
        var selected = state.selectedOptions[index];
        return selected === undefined || selected === value;
      });
      if (isMatch) {
        found = variant;
      }
      return isMatch;
    });
    return found;
  }

  function refreshVariantUI() {
    var product = state.product;
    if (!product) return;

    applyAvailability(elements.colorOptions.querySelectorAll('button'), state.colorIndex);
    applyAvailability(elements.dropdownList.querySelectorAll('button'), state.sizeIndex);

    var match = findMatchingVariant();
    updateColorIndicator();

    if (match) {
      elements.price.textContent = match.price;
      if (match.available) {
        elements.addToCartButton.disabled = false;
      } else {
        elements.addToCartButton.disabled = true;
      }
    } else {
      elements.addToCartButton.disabled = true;
    }
  }

  function applyAvailability(buttons, ownIndex) {
    if (ownIndex === -1) return;

    buttons.forEach(function (button) {
      var value = button.getAttribute('data-value');
      var hypothetical = Object.assign({}, state.selectedOptions);
      hypothetical[ownIndex] = value;

      var exists = state.product.variants.some(function (variant) {
        return variant.available && variant.options.every(function (v, i) {
          var sel = hypothetical[i];
          return sel === undefined || sel === v;
        });
      });

      button.disabled = !exists;
    });
  }

  function updateColorIndicator(instant) {
    var selectedColor = state.selectedOptions[state.colorIndex];
    var selectedButton = elements.colorOptions.querySelector(
      '.prod-modal__color-opt[aria-pressed="true"]'
    );

    if (!selectedButton || !selectedColor) {
      elements.colorIndicator.style.width = '0';
      return;
    }

    var apply = function () {
      var buttonWidth = selectedButton.getBoundingClientRect().width;
var offset = selectedButton.offsetLeft;

elements.colorIndicator.style.width = buttonWidth + 'px';
elements.colorIndicator.style.transform =
'translateX(' + offset + 'px)';
    };

    if (instant || prefersReducedMotion) {
      elements.colorIndicator.classList.add('is-instant');
      apply();
      requestAnimationFrame(function () {
        elements.colorIndicator.classList.remove('is-instant');
      });
    } else {
      apply();
    }
  }

  /* ----------------------------------------
      DROPDOWN
      ---------------------------------------- */

  function openDropdown() {
    elements.dropdownList.hidden = false;
    requestAnimationFrame(function () {
      elements.dropdownList.classList.add('is-open');
    });
    elements.dropdownToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown() {
    elements.dropdownList.classList.remove('is-open');
    elements.dropdownToggle.setAttribute('aria-expanded', 'false');

    var finish = function () {
      elements.dropdownList.hidden = true;
    };
    if (prefersReducedMotion) {
      finish();
    } else {
      elements.dropdownList.addEventListener('transitionend', finish, { once: true });
    }
  }

  function isDropdownOpen() {
    return !elements.dropdownList.hidden;
  }

  /* ----------------------------------------
      TEXT HELPERS
      ---------------------------------------- */

  function truncateText(text, limit) {
    if (!text || text.length <= limit) return text;
    var trimmed = text.slice(0, limit);
    var lastSpace = trimmed.lastIndexOf(' ');
    if (lastSpace > 0) {
      trimmed = trimmed.slice(0, lastSpace);
    }
    return trimmed.replace(/[\s,.;:-]+$/, '') + '…';
  }

  function setStatus(message, stateName) {
    elements.status.textContent = message;
    if (stateName) {
      elements.status.setAttribute('data-state', stateName);
    } else {
      elements.status.removeAttribute('data-state');
    }
  }

  /* ----------------------------------------
      ADD TO CART
      ---------------------------------------- */

  function handleAddToCart() {
    if (state.isSubmitting) return;

    var variant = findMatchingVariant();
    if (!variant || !variant.available) {
      setStatus('This combination is unavailable.', 'error');
      return;
    }

    var items = [{ id: variant.id, quantity: 1 }];

    state.isSubmitting = true;
    elements.addToCartButton.disabled = true;
    setStatus('', null);

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: items })
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (data) {
            throw new Error(data.description || 'Could not add to cart.');
          });
        }
        return response.json();
      })
      .then(function () {
        setStatus('Added to cart.', 'success');
        window.setTimeout(function () {
          closeQuickAdd();
          state.isSubmitting = false;
        }, 1500);
      })
      .catch(function (err) {
        setStatus(err.message || 'Something went wrong. Please try again.', 'error');
        elements.addToCartButton.disabled = false;
        state.isSubmitting = false;
      });
  }

  /* ----------------------------------------
      EVENT WIRING
      ---------------------------------------- */

  section.querySelectorAll('[data-action="open-quick-add"]').forEach(function (button) {
    button.addEventListener('click', function () {
      var card = button.closest('.prod-list__card');
      if (card) openQuickAdd(card, button);
    });
  });

  overlay.querySelector('[data-action="close-quick-add"]').addEventListener('click', closeQuickAdd);

  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) closeQuickAdd();
  });

  elements.dropdownToggle.addEventListener('click', function () {
    if (isDropdownOpen()) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  document.addEventListener('click', function (event) {
    if (!isDropdownOpen()) return;
    if (!elements.dropdown.contains(event.target)) {
      closeDropdown();
    }
  });

  elements.addToCartButton.addEventListener('click', handleAddToCart);

  window.addEventListener('resize', function () {
    if (!overlay.hidden) {
      updateColorIndicator(true);
    }
  });

  document.addEventListener('shopify:section:unload', function (event) {
    if (event.detail && event.detail.sectionId === section.dataset.sectionId) {
      document.removeEventListener('keydown', handleKeydown);
    }
  });
}
})();