// admin.js - editor that uses server-side API to persist changes
let PRODUCTS = [];
let AUTH_OK = false;

function escapeHtml(s){ return String(s||'').replace(/[&<>"]+/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c)); }

async function api(path, opts){
  const res = await fetch('/api/products', opts);
  return res;
}

async function load(){
  const res = await api();
  if(!res.ok){ PRODUCTS = []; return; }
  PRODUCTS = await res.json();
  renderList();
}

function renderList(){
  const container = document.getElementById('productList');
  container.innerHTML = '';
  if(!PRODUCTS.length) container.innerHTML = '<p class="small">No products yet.</p>';
  PRODUCTS.forEach(p => {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.innerHTML = `
      <div>
        <div style="font-weight:700">${escapeHtml(p.name)}</div>
        <div class="small">${escapeHtml(p.price)}</div>
      </div>
      <div style="display:flex;gap:.4rem">
        <button data-id="${p.id}" class="btn-edit small">Edit</button>
        <button data-id="${p.id}" class="btn-delete small danger">Delete</button>
      </div>
    `;
    container.appendChild(item);
  });
  attachHandlers();
}

function uid(){ return Date.now() + Math.floor(Math.random()*999); }

function attachHandlers(){
  document.querySelectorAll('.btn-delete').forEach(b=>{
    b.onclick = () => {
      const id = Number(b.dataset.id);
      PRODUCTS = PRODUCTS.filter(x=>x.id!==id);
      renderList();
    };
  });
  document.querySelectorAll('.btn-edit').forEach(b=>{
    b.onclick = () => {
      const id = Number(b.dataset.id);
      const p = PRODUCTS.find(x=>x.id===id);
      if(!p) return;
      const newName = prompt('Product name', p.name);
      if(newName===null) return;
      const newPrice = prompt('Price', p.price);
      if(newPrice===null) return;
      p.name = newName.trim(); p.price = newPrice.trim(); renderList();
    };
  });
}

// login flow checks password with server
document.getElementById('btnLogin').addEventListener('click', async ()=>{
  const pwd = document.getElementById('pwd').value || '';
  if(!pwd) return alert('Enter password');
  try{
    const res = await api('', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'check', password: pwd }) });
    const j = await res.json();
    if(res.ok && j.ok){
      AUTH_OK = true;
      document.getElementById('login').style.display='none';
      document.getElementById('editor').style.display='block';
      await load();
    } else {
      alert('Incorrect password');
    }
  }catch(e){ alert('Server error'); }
});

// add new product locally
document.getElementById('btnAdd').addEventListener('click', ()=>{
  const name = document.getElementById('newName').value.trim();
  const price = document.getElementById('newPrice').value.trim();
  if(!name || !price) return alert('Provide name and price');
  PRODUCTS.push({ id: uid(), name, price });
  document.getElementById('newName').value=''; document.getElementById('newPrice').value='';
  renderList();
});

// save (publish) -> send to server
document.getElementById('btnSave').addEventListener('click', async ()=>{
  if(!AUTH_OK) return alert('You must login first');
  const pwd = document.getElementById('pwd').value || '';
  try{
    const res = await api('', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ action:'save', password: pwd, products: PRODUCTS }) });
    const j = await res.json();
    if(res.ok && j.ok){ alert('Published successfully'); }
    else alert('Publish failed: ' + (j.message||'unknown'));
  }catch(e){ alert('Server error'); }
});

document.getElementById('btnRefresh').addEventListener('click', load);

document.getElementById('btnClear').addEventListener('click', ()=>{
  if(!confirm('Clear all products?')) return; PRODUCTS = []; renderList();
});
