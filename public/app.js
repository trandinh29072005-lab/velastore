const API = '';

async function fetchProducts(q) {
  const url = q ? `/api/search?q=${encodeURIComponent(q)}` : '/api/products';
  const res = await fetch(url);
  return res.json();
}

function renderProducts(items) {
  const container = document.getElementById('products');
  container.innerHTML = '';
  items.forEach(p => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <div class="price">${p.price.toLocaleString()} đ</div>
      <button data-id="${p.id}">Thêm vào giỏ</button>
    `;
    el.querySelector('button').addEventListener('click', () => addToCart(p.id));
    container.appendChild(el);
  });
}

async function loadProducts() {
  const items = await fetchProducts();
  renderProducts(items);
}

async function addToCart(productId) {
  const email = localStorage.getItem('email');
  if (!email) { showLogin(); return; }
  const res = await fetch('/api/cart', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, productId, quantity: 1 })
  });
  const data = await res.json();
  renderCart(data.cart || []);
}

function renderCart(list) {
  const el = document.getElementById('cart-list');
  el.innerHTML = '';
  list.forEach(i => {
    const li = document.createElement('li');
    li.textContent = `#${i.productId} x${i.quantity}`;
    el.appendChild(li);
  });
}

function showLogin(){ document.getElementById('login-modal').style.display='flex'; }
function hideLogin(){ document.getElementById('login-modal').style.display='none'; }

async function doLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
  if (res.status === 200) {
    const data = await res.json();
    localStorage.setItem('email', data.email);
    localStorage.setItem('name', data.name || data.email);
    updateUser();
    hideLogin();
    alert('Đăng nhập thành công');
  } else {
    alert('Đăng nhập thất bại');
  }
}

function logout(){ localStorage.removeItem('email'); localStorage.removeItem('name'); updateUser(); }

function updateUser(){
  const name = localStorage.getItem('name') || 'Khách';
  const email = localStorage.getItem('email');
  document.getElementById('user-name').textContent = name;
  document.getElementById('login-btn').style.display = email ? 'none' : 'inline-block';
  document.getElementById('logout-btn').style.display = email ? 'inline-block' : 'none';
  if (email) fetch('/api/cart?email='+encodeURIComponent(email)).then(r=>r.json()).then(renderCart);
}

// events
window.addEventListener('load', () => {
  loadProducts();
  updateUser();
  document.getElementById('search-btn').addEventListener('click', async () => {
    const q = document.getElementById('search').value;
    const items = await fetchProducts(q);
    renderProducts(items);
  });

  document.getElementById('login-btn').addEventListener('click', showLogin);
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('do-login').addEventListener('click', doLogin);
});
