// main.js - fetch products from server API and render
async function fetchProducts(){
  try{
    const res = await fetch('/api/products');
    if(!res.ok) throw new Error('Failed to load');
    return await res.json();
  }catch(e){
    console.error(e);
    return [];
  }
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c)); }

async function renderProducts(){
  const list = await fetchProducts();
  const container = document.getElementById('products');
  container.innerHTML = '';
  if(!list || list.length===0){
    container.innerHTML = '<p style="color:var(--muted)">No products listed yet.</p>';
    return;
  }
  list.forEach(p => {
    const el = document.createElement('article');
    el.className = 'product-card';
    el.innerHTML = `
      <div>
        <div class="product-name">${escapeHtml(p.name)}</div>
      </div>
      <div class="product-price">${escapeHtml(p.price)}</div>
    `;
    container.appendChild(el);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  await renderProducts();
  const load = document.getElementById('loading'); if(load) load.remove();
});
