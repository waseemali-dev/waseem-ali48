function handleAddToCart(e) {
  e.preventDefault();

  if (state.isSubmitting) return;

  let variant = findMatchingVariant();
  
  // Fallback to first variant if no exact match
  if (!variant && state.current && state.current.variants && state.current.variants.length > 0) {
    variant = state.current.variants[0];
  }

  if (!variant) {
    alert('No variant available');
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