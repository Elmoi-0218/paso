<!-- ==================== JAVASCRIPT ==================== -->
        // ==================== DATA ====================
        const EMOJIS = ['📱','💻','🎧','⌨️','🖥️','🖨️','📷','🎮','👕','👗','👟','🧥','🏠','🛋️','💡','🔧','⚽','🏀','🎾','🏋️','📚','📖','🎵','🎨','🧸','⌚','📦','🎁','🧴','🍕'];

        let products = JSON.parse(localStorage.getItem('mt_products')) || [
            { id: 1, name: 'Laptop Gamer Pro', desc: 'Laptop de alto rendimiento con RTX 4060', price: 1299.99, stock: 15, category: 'Electrónica', emoji: '💻', sold: 3 },
            { id: 2, name: 'Auriculares Bluetooth', desc: 'Cancelación de ruido activa, 30h batería', price: 89.99, stock: 45, category: 'Electrónica', emoji: '🎧', sold: 12 },
            { id: 3, name: 'Camiseta Premium', desc: 'Algodón orgánico, corte moderno', price: 29.99, stock: 100, category: 'Ropa', emoji: '👕', sold: 25 },
            { id: 4, name: 'Balón de Fútbol', desc: 'Balón oficial tamaño 5', price: 35.99, stock: 30, category: 'Deportes', emoji: '⚽', sold: 8 },
            { id: 5, name: 'Sofá Moderno', desc: 'Sofá 3 plazas, tela premium', price: 599.99, stock: 5, category: 'Hogar', emoji: '🛋️', sold: 2 },
            { id: 6, name: 'Novela Bestseller', desc: 'El libro más vendido del año', price: 19.99, stock: 60, category: 'Libros', emoji: '📚', sold: 18 },
            { id: 7, name: 'Smartwatch Elite', desc: 'Monitor cardíaco, GPS integrado', price: 249.99, stock: 20, category: 'Electrónica', emoji: '⌚', sold: 7 },
            { id: 8, name: 'Zapatillas Running', desc: 'Amortiguación avanzada, ultraligeras', price: 79.99, stock: 0, category: 'Deportes', emoji: '👟', sold: 33 }
        ];

        let cart = JSON.parse(localStorage.getItem('mt_cart')) || [];
        let orders = JSON.parse(localStorage.getItem('mt_orders')) || [];
        let isAdmin = false;
        let selectedEmoji = '📦';
        let selectedPayment = 'tarjeta';

        // ==================== INIT ====================
        function init() {
            saveData();
            renderProducts();
            updateCartBadge();
            initEmojiPicker();
        }

        function saveData() {
            localStorage.setItem('mt_products', JSON.stringify(products));
            localStorage.setItem('mt_cart', JSON.stringify(cart));
            localStorage.setItem('mt_orders', JSON.stringify(orders));
        }

        // ==================== NAVIGATION ====================
        function navigate(section) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

            const target = document.getElementById('section-' + section);
            if (target) target.classList.add('active');

            const navLink = document.getElementById('nav-' + section);
            if (navLink) navLink.classList.add('active');

            if (section === 'cart') renderCart();
            if (section === 'payment') renderPaymentSummary();

            document.getElementById('navLinks').classList.remove('active');
            window.scrollTo(0, 0);
        }

        function toggleMenu() {
            document.getElementById('navLinks').classList.toggle('active');
        }

        // ==================== PRODUCTS ====================
        function renderProducts() {
            const grid = document.getElementById('productsGrid');
            const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
            const category = document.getElementById('categoryFilter')?.value || '';

            let filtered = products.filter(p => {
                const matchSearch = p.name.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search);
                const matchCategory = !category || p.category === category;
                return matchSearch && matchCategory;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1;">
                        <div class="icon">🔍</div>
                        <h3>No se encontraron productos</h3>
                        <p>Intenta con otra búsqueda o categoría</p>
                    </div>`;
                return;
            }

            grid.innerHTML = filtered.map(p => `
                <div class="product-card">
                    <div class="product-img">${p.emoji}</div>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <p class="description">${p.desc}</p>
                        <p class="stock ${p.stock <= 5 && p.stock > 0 ? 'low' : ''}">
                            ${p.stock === 0 ? '❌ Agotado' : `✅ Stock: ${p.stock} unidades`}
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="price">$${p.price.toFixed(2)}</span>
                            <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})" ${p.stock === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''}>
                                ${p.stock === 0 ? 'Agotado' : '🛒 Agregar'}
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function filterProducts() {
            renderProducts();
        }

        // ==================== CART ====================
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            if (!product || product.stock === 0) return;

            const existing = cart.find(item => item.id === productId);
            if (existing) {
                if (existing.qty >= product.stock) {
                    showToast('⚠️ No hay más stock disponible', 'warning');
                    return;
                }
                existing.qty++;
            } else {
                cart.push({ id: productId, qty: 1 });
            }

            saveData();
            updateCartBadge();
            showToast(`✅ ${product.name} agregado al carrito`);
        }

        function updateCartBadge() {
            const total = cart.reduce((sum, item) => sum + item.qty, 0);
            document.getElementById('cartBadge').textContent = total;
        }

        function renderCart() {
            const container = document.getElementById('cartContent');

            if (cart.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="icon">🛒</div>
                        <h3>Tu carrito está vacío</h3>
                        <p>Agrega productos para comenzar</p>
                        <button class="btn btn-primary" onclick="navigate('products')" style="margin-top: 1rem;">Ver Productos</button>
                    </div>`;
                return;
            }

            let subtotal = 0;
            const itemsHtml = cart.map(item => {
                const p = products.find(pr => pr.id === item.id);
                if (!p) return '';
                const total = p.price * item.qty;
                subtotal += total;
                return `
                    <div class="cart-item">
                        <div class="cart-item-img">${p.emoji}</div>
                        <div class="cart-item-info">
                            <h4>${p.name}</h4>
                            <p class="price">$${p.price.toFixed(2)} c/u</p>
                        </div>
                        <div class="qty-controls">
                            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
                            <span class="qty-value">${item.qty}</span>
                            <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
                        </div>
                        <div class="cart-item-total">$${total.toFixed(2)}</div>
                        <button class="cart-item-remove" onclick="removeFromCart(${p.id})">🗑️</button>
                    </div>`;
            }).join('');

            const shipping = subtotal >= 50 ? 0 : 5.99;
            const total = subtotal + shipping;

            container.innerHTML = `
                <div class="cart-container">
                    <div class="cart-items">${itemsHtml}</div>
                    <div class="cart-summary">
                        <h3>Resumen del Pedido</h3>
                        <div class="summary-row">
                            <span>Subtotal (${cart.reduce((s, i) => s + i.qty, 0)} items)</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Envío</span>
                            <span>${shipping === 0 ? '<span style="color: var(--success); font-weight:600;">GRATIS</span>' : '$' + shipping.toFixed(2)}</span>
                        </div>
                        ${shipping > 0 ? `<p style="font-size:0.75rem; color: var(--success); margin-bottom:0.5rem;">🚚 ¡Envío gratis en compras mayores a $50!</p>` : ''}
                        <div class="summary-row total">
                            <span>Total</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <button class="btn btn-success btn-full" onclick="navigate('payment')">💳 Ir a Pagar</button>
                        <button class="btn btn-secondary btn-full" onclick="navigate('products')" style="margin-top: 0.8rem;">Seguir Comprando</button>
                    </div>
                </div>`;
        }

        function changeQty(productId, delta) {
            const item = cart.find(i => i.id === productId);
            const product = products.find(p => p.id === productId);
            if (!item || !product) return;

            item.qty += delta;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.id !== productId);
            } else if (item.qty > product.stock) {
                item.qty = product.stock;
                showToast('⚠️ Stock máximo alcanzado', 'warning');
            }

            saveData();
            updateCartBadge();
            renderCart();
        }

        function removeFromCart(productId) {
            const product = products.find(p => p.id === productId);
            cart = cart.filter(i => i.id !== productId);
            saveData();
            updateCartBadge();
            renderCart();
            if (product) showToast(`🗑️ ${product.name} eliminado del carrito`);
        }

        // ==================== PAYMENT ====================
        function renderPaymentSummary() {
            let subtotal = 0;
            cart.forEach(item => {
                const p = products.find(pr => pr.id === item.id);
                if (p) subtotal += p.price * item.qty;
            });
            const shipping = subtotal >= 50 ? 0 : 5.99;
            const total = subtotal + shipping;

            document.getElementById('paySubtotal').textContent = '$' + subtotal.toFixed(2);
            document.getElementById('payShipping').textContent = shipping === 0 ? 'GRATIS' : '$' + shipping.toFixed(2);
            document.getElementById('payTotal').textContent = '$' + total.toFixed(2);
        }

        function selectPayment(el, method) {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            el.classList.add('selected');
            selectedPayment = method;

            const cardFields = document.getElementById('cardFields');
            cardFields.style.display = method === 'tarjeta' ? 'block' : 'none';
        }

        function formatCardNumber(input) {
            let value = input.value.replace(/\D/g, '');
            value = value.replace(/(.{4})/g, '$1 ').trim();
            input.value = value;
        }

        function formatExpiry(input) {
            let value = input.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            input.value = value;
        }

        function updateCardPreview() {
            const name = document.getElementById('cardName').value || 'TU NOMBRE';
            const number = document.getElementById('cardNumber').value || '•••• •••• •••• ••••';
            const expiry = document.getElementById('cardExpiry').value || 'MM/AA';

            document.getElementById('previewName').textContent = name.toUpperCase();
            document.getElementById('previewNumber').textContent = number;
            document.getElementById('previewExpiry').textContent = expiry;
        }

        function processPayment() {
            if (cart.length === 0) {
                showToast('❌ El carrito está vacío', 'error');
                return;
            }

            const name = document.getElementById('cardName').value.trim();
            const address = document.getElementById('shippingAddress').value.trim();
            const email = document.getElementById('paymentEmail').value.trim();

            if (!address) {
                showToast('❌ Ingresa la dirección de envío', 'error');
                return;
            }

            if (selectedPayment === 'tarjeta') {
                if (!name || !document.getElementById('cardNumber').value || !document.getElementById('cardExpiry').value) {
                    showToast('❌ Completa los datos de la tarjeta', 'error');
                    return;
                }
            }

            // Calculate totals
            let subtotal = 0;
            let orderItems = [];
            cart.forEach(item => {
                const p = products.find(pr => pr.id === item.id);
                if (p) {
                    subtotal += p.price * item.qty;
                    orderItems.push({
                        name: p.name,
                        qty: item.qty,
                        price: p.price,
                        total: p.price * item.qty
                    });
                    // Reduce stock
                    p.stock -= item.qty;
                    p.sold = (p.sold || 0) + item.qty;
                }
            });

            const shipping = subtotal >= 50 ? 0 : 5.99;
            const total = subtotal + shipping;

            // Create order
            const order = {
                id: 'ORD-' + Date.now().toString().slice(-6),
                customer: name || 'Cliente',
                email: email || 'N/A',
                address: address,
                phone: document.getElementById('phone').value || 'N/A',
                items: orderItems,
                subtotal: subtotal,
                shipping: shipping,
                total: total,
                paymentMethod: selectedPayment,
                status: 'Completado',
                date: new Date().toLocaleString('es-ES')
            };

            orders.push(order);
            cart = [];
            saveData();
            updateCartBadge();

            showToast('✅ ¡Compra realizada con éxito!');
            navigate('home');

            // Reset form
            document.getElementById('cardName').value = '';
            document.getElementById('cardNumber').value = '';
            document.getElementById('cardExpiry').value = '';
            document.getElementById('cardCvv').value = '';
            document.getElementById('shippingAddress').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('paymentEmail').value = '';
            updateCardPreview();
        }

        // ==================== LOGIN ====================
        function doLogin() {
            const user = document.getElementById('loginUser').value;
            const pass = document.getElementById('loginPass').value;

            if (user === 'admin' && pass === 'admin123') {
                isAdmin = true;
                document.getElementById('loginError').style.display = 'none';
                showToast('✅ Bienvenido, Admin');
                navigate('admin');
                renderAdminDashboard();
            } else {
                document.getElementById('loginError').style.display = 'block';
            }
        }

        function doLogout() {
            isAdmin = false;
            showToast('👋 Sesión cerrada');
            navigate('home');
            document.getElementById('loginUser').value = '';
            document.getElementById('loginPass').value = '';
        }

        // ==================== ADMIN ====================
        function showAdminSection(section) {
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));

            const target = document.getElementById('admin-' + section);
            if (target) target.classList.add('active');

            event.target.classList.add('active');

            if (section === 'dashboard') renderAdminDashboard();
            if (section === 'admin-products') renderAdminProducts();
            if (section === 'admin-orders') renderAdminOrders();
            if (section === 'admin-inventory') renderAdminInventory();
        }

        function renderAdminDashboard() {
            document.getElementById('statProducts').textContent = products.length;
            document.getElementById('statOrders').textContent = orders.length;

            const revenue = orders.reduce((sum, o) => sum + o.total, 0);
            document.getElementById('statRevenue').textContent = '$' + revenue.toFixed(2);

            const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
            document.getElementById('statStock').textContent = totalStock;

            const recent = orders.slice(-5).reverse();
            const tbody = document.getElementById('dashRecentOrders');
            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--gray);">No hay pedidos aún</td></tr>';
            } else {
                tbody.innerHTML = recent.map(o => `
                    <tr>
                        <td><strong>${o.id}</strong></td>
                        <td>${o.customer}</td>
                        <td><strong>$${o.total.toFixed(2)}</strong></td>
                        <td><span class="badge badge-success">${o.status}</span></td>
                        <td>${o.date}</td>
                    </tr>
                `).join('');
            }
        }

        function renderAdminProducts() {
            const tbody = document.getElementById('adminProductsTable');
            tbody.innerHTML = products.map(p => `
                <tr>
                    <td style="font-size: 1.5rem;">${p.emoji}</td>
                    <td><strong>${p.name}</strong><br><small style="color:var(--gray)">${p.desc}</small></td>
                    <td>${p.category}</td>
                    <td><strong>$${p.price.toFixed(2)}</strong></td>
                    <td>
                        <span class="badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}">
                            ${p.stock} unidades
                        </span>
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="editProduct(${p.id})">✏️ Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">🗑️</button>
                    </td>
                </tr>
            `).join('');
        }

        function renderAdminOrders() {
            const tbody = document.getElementById('adminOrdersTable');
            if (orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding: 2rem; color: var(--gray);">No hay pedidos</td></tr>';
                return;
            }
            tbody.innerHTML = orders.slice().reverse().map(o => `
                <tr>
                    <td><strong>${o.id}</strong></td>
                    <td>${o.customer}</td>
                    <td>${o.email}</td>
                    <td>${o.items.map(i => `${i.name} x${i.qty}`).join(', ')}</td>
                    <td><strong>$${o.total.toFixed(2)}</strong></td>
                    <td>${o.paymentMethod}</td>
                    <td><span class="badge badge-success">${o.status}</span></td>
                    <td>${o.date}</td>
                    <td>
                        <select onchange="updateOrderStatus('${o.id}', this.value)" style="padding: 5px; border-radius: 5px; border: 1px solid var(--lighter-gray); font-size: 0.8rem;">
                            <option value="Completado" ${o.status === 'Completado' ? 'selected' : ''}>✅ Completado</option>
                            <option value="Pendiente" ${o.status === 'Pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
                            <option value="Cancelado" ${o.status === 'Cancelado' ? 'selected' : ''}>❌ Cancelado</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }

        function renderAdminInventory() {
            const tbody = document.getElementById('adminInventoryTable');
            tbody.innerHTML = products.map(p => `
                <tr>
                    <td>${p.emoji} <strong>${p.name}</strong></td>
                    <td>${p.category}</td>
                    <td>
                        <span class="badge ${p.stock === 0 ? 'badge-danger' : p.stock <= 5 ? 'badge-warning' : 'badge-success'}">
                            ${p.stock}
                        </span>
                    </td>
                    <td>${p.sold || 0}</td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="openStockModal(${p.id})">📦 + Stock</button>
                    </td>
                </tr>
            `).join('');
        }

        function updateOrderStatus(orderId, status) {
            const order = orders.find(o => o.id === orderId);
            if (order) {
                order.status = status;
                saveData();
                showToast(`✅ Pedido ${orderId} actualizado a "${status}"`);
            }
        }

        // ==================== PRODUCT MODAL ====================
        function initEmojiPicker() {
            const picker = document.getElementById('emojiPicker');
            picker.innerHTML = EMOJIS.map(e => `
                <div class="emoji-option ${e === selectedEmoji ? 'selected' : ''}" onclick="selectEmoji('${e}', this)">${e}</div>
            `).join('');
        }

        function selectEmoji(emoji, el) {
            selectedEmoji = emoji;
            document.querySelectorAll('.emoji-option').forEach(e => e.classList.remove('selected'));
            el.classList.add('selected');
        }

        function openProductModal(productId = null) {
            document.getElementById('productModal').classList.add('active');

            if (productId) {
                const p = products.find(pr => pr.id === productId);
                document.getElementById('productModalTitle').textContent = '✏️ Editar Producto';
                document.getElementById('editProductId').value = productId;
                document.getElementById('prodName').value = p.name;
                document.getElementById('prodDesc').value = p.desc;
                document.getElementById('prodPrice').value = p.price;
                document.getElementById('prodStock').value = p.stock;
                document.getElementById('prodCategory').value = p.category;
                selectedEmoji = p.emoji;
            } else {
                document.getElementById('productModalTitle').textContent = '➕ Nuevo Producto';
                document.getElementById('editProductId').value = '';
                document.getElementById('prodName').value = '';
                document.getElementById('prodDesc').value = '';
                document.getElementById('prodPrice').value = '';
                document.getElementById('prodStock').value = '';
                document.getElementById('prodCategory').value = 'Electrónica';
                selectedEmoji = '📦';
            }

            initEmojiPicker();
        }

        function closeProductModal() {
            document.getElementById('productModal').classList.remove('active');
        }

        function editProduct(id) {
            openProductModal(id);
        }

        function saveProduct() {
            const name = document.getElementById('prodName').value.trim();
            const desc = document.getElementById('prodDesc').value.trim();
            const price = parseFloat(document.getElementById('prodPrice').value);
            const stock = parseInt(document.getElementById('prodStock').value);
            const category = document.getElementById('prodCategory').value;
            const editId = document.getElementById('editProductId').value;

            if (!name || isNaN(price) || isNaN(stock)) {
                showToast('❌ Completa todos los campos correctamente', 'error');
                return;
            }

            if (editId) {
                const p = products.find(pr => pr.id === parseInt(editId));
                p.name = name;
                p.desc = desc;
                p.price = price;
                p.stock = stock;
                p.category = category;
                p.emoji = selectedEmoji;
                showToast('✅ Producto actualizado correctamente');
            } else {
                const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                products.push({
                    id: newId,
                    name, desc, price, stock, category,
                    emoji: selectedEmoji,
                    sold: 0
                });
                showToast('✅ Producto creado correctamente');
            }

            saveData();
            renderProducts();
            renderAdminProducts();
            closeProductModal();
        }

        function deleteProduct(id) {
            const p = products.find(pr => pr.id === id);
            if (confirm(`¿Eliminar "${p.name}"?`)) {
                products = products.filter(pr => pr.id !== id);
                cart = cart.filter(item => item.id !== id);
                saveData();
                renderProducts();
                renderAdminProducts();
                updateCartBadge();
                showToast(`🗑️ ${p.name} eliminado`);
            }
        }

        // ==================== STOCK MODAL ====================
        function openStockModal(productId) {
            const p = products.find(pr => pr.id === productId);
            document.getElementById('stockProductId').value = productId;
            document.getElementById('stockProductName').textContent = `${p.emoji} ${p.name} — Stock actual: ${p.stock}`;
            document.getElementById('stockAmount').value = '';
            document.getElementById('stockModal').classList.add('active');
        }

        function closeStockModal() {
            document.getElementById('stockModal').classList.remove('active');
        }

        function addStock() {
            const productId = parseInt(document.getElementById('stockProductId').value);
            const amount = parseInt(document.getElementById('stockAmount').value);

            if (!amount || amount <= 0) {
                showToast('❌ Ingresa una cantidad válida', 'error');
                return;
            }

            const p = products.find(pr => pr.id === productId);
            p.stock += amount;
            saveData();
            renderAdminInventory();
            renderProducts();
            closeStockModal();
            showToast(`✅ Se agregaron ${amount} unidades a ${p.name}`);
        }

        // ==================== EXPORT TO XLS ====================
        function downloadXLS(data, filename) {
            const ws = XLSX.utils.json_to_sheet(data);

            // Auto-width columns
            const colWidths = Object.keys(data[0] || {}).map(key => {
                const maxLen = Math.max(
                    key.length,
                    ...data.map(row => String(row[key] || '').length)
                );
                return { wch: Math.min(maxLen + 2, 40) };
            });
            ws['!cols'] = colWidths;

            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Datos');
            XLSX.writeFile(wb, filename + '.xls');
            showToast(`📥 Archivo "${filename}.xls" descargado`);
        }

        function exportProductsXLS() {
            const data = products.map(p => ({
                'ID': p.id,
                'Nombre': p.name,
                'Descripción': p.desc,
                'Categoría': p.category,
                'Precio': p.price,
                'Stock': p.stock,
                'Vendidos': p.sold || 0
            }));
            downloadXLS(data, 'Productos_' + new Date().toISOString().slice(0, 10));
        }

        function exportOrdersXLS() {
            const data = orders.map(o => ({
                'ID Pedido': o.id,
                'Cliente': o.customer,
                'Email': o.email,
                'Teléfono': o.phone,
                'Dirección': o.address,
                'Productos': o.items.map(i => `${i.name} x${i.qty}`).join(' | '),
                'Subtotal': o.subtotal,
                'Envío': o.shipping,
                'Total': o.total,
                'Método de Pago': o.paymentMethod,
                'Estado': o.status,
                'Fecha': o.date
            }));
            downloadXLS(data, 'Pedidos_' + new Date().toISOString().slice(0, 10));
        }

        function exportInventoryXLS() {
            const data = products.map(p => ({
                'ID': p.id,
                'Producto': p.name,
                'Categoría': p.category,
                'Stock Actual': p.stock,
                'Unidades Vendidas': p.sold || 0,
                'Valor en Stock': (p.stock * p.price).toFixed(2),
                'Estado': p.stock === 0 ? 'Agotado' : p.stock <= 5 ? 'Stock Bajo' : 'Disponible'
            }));
            downloadXLS(data, 'Inventario_' + new Date().toISOString().slice(0, 10));
        }

        function exportSalesXLS() {
            const data = orders.map(o => ({
                'ID Pedido': o.id,
                'Cliente': o.customer,
                'Total Venta': o.total,
                'Método de Pago': o.paymentMethod,
                'Fecha': o.date,
                'Estado': o.status,
                'Cantidad Productos': o.items.reduce((s, i) => s + i.qty, 0)
            }));

            // Add summary row
            const totalSales = orders.reduce((s, o) => s + o.total, 0);
            data.push({
                'ID Pedido': '',
                'Cliente': '',
                'Total Venta': totalSales,
                'Método de Pago': '',
                'Fecha': '',
                'Estado': 'TOTAL GENERAL',
                'Cantidad Productos': orders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.qty, 0), 0)
            });

            downloadXLS(data, 'Ventas_' + new Date().toISOString().slice(0, 10));
        }

        // ==================== TOAST ====================
        function showToast(message, type = 'success') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.innerHTML = `<span>${message}</span>`;
            container.appendChild(toast);

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // ==================== START ====================
        init();
