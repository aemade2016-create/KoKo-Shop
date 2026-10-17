// ============================================
// ADMIN DASHBOARD - KOKO SHOP (MODERN ES6+)
// ============================================

// Authentication Verification
const checkAuth = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('luxe_currentUser') || 'null');

    if (!currentUser || (!currentUser.isAdmin && currentUser.email !== 'aemade2016@gmail.com')) {
        if (!sessionStorage.getItem('redirecting_from_admin')) {
            sessionStorage.setItem('redirecting_from_admin', 'true');
            alert('Access Denied! Admin privileges required.');
            window.location.href = 'login.html';
        }
        return false;
    }
    sessionStorage.removeItem('redirecting_from_admin');
    return true;
};

if (checkAuth()) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('luxe_currentUser') || 'null');
    const emailDisplay = document.getElementById('adminEmailDisplay');
    if (emailDisplay && currentUser?.email) {
        emailDisplay.textContent = currentUser.email;
    }
}

// ============================================
// DATA NORMALIZATION & STORAGE HELPERS
// ============================================

const parseNumeric = (value) => {
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
};

const calculateDiscountDetails = (originalPrice, salePrice) => {
    const original = parseNumeric(originalPrice);
    let sale = parseNumeric(salePrice);

    if (original <= 0) {
        return { originalPrice: 0, salePrice: 0, savings: 0, discountPercent: 0 };
    }

    if (sale <= 0 || sale > original) {
        sale = original;
    }

    const savings = Math.max(original - sale, 0);
    const discountPercent = Math.round((savings / original) * 100);

    return {
        originalPrice: original,
        salePrice: sale,
        savings,
        discountPercent
    };
};

const normalizeProduct = (product) => {
    if (!product) return null;

    const details = calculateDiscountDetails(
        product.originalPrice || product.price || 0,
        product.salePrice || product.price || product.originalPrice || 0
    );

    return {
        ...product,
        originalPrice: details.originalPrice,
        salePrice: details.salePrice,
        price: details.salePrice || product.price || 0,
        savings: details.savings,
        discountPercent: details.discountPercent,
        image: product.image || './images/slider 1.jpeg',
        barcode: product.barcode || ''
    };
};

// Retrieve Collections from LocalStorage
const getProducts = () => {
    try {
        const products = JSON.parse(localStorage.getItem('luxe_products')) || [];
        return products.map(normalizeProduct).filter(Boolean);
    } catch (e) {
        console.error('Error fetching products:', e);
        return [];
    }
};

const saveProducts = (products) => {
    try {
        const normalized = (products || []).map(normalizeProduct).filter(Boolean);
        localStorage.setItem('luxe_products', JSON.stringify(normalized));
        syncCategoriesFromProducts();
    } catch (e) {
        console.error('Error saving products:', e);
    }
};

const getCategories = () => {
    try {
        const stored = JSON.parse(localStorage.getItem('luxe_categories')) || [];
        if (Array.isArray(stored) && stored.length > 0) {
            return stored.map((cat, idx) => ({
                id: cat.id || idx + 1,
                name: typeof cat === 'string' ? cat : cat.name,
                image: cat.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
            }));
        }
    } catch (error) {
        console.warn('Unable to read categories from storage:', error);
    }

    const fallback = ['Serum', 'Moisturizer', 'Cleanser', 'Sunscreen', 'Mask', 'Toner'];
    const defaultCategories = fallback.map((name, index) => ({
        id: index + 1,
        name,
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
    }));
    saveCategories(defaultCategories);
    return defaultCategories;
};

const saveCategories = (categories) => {
    localStorage.setItem('luxe_categories', JSON.stringify(categories || []));
};

const syncCategoriesFromProducts = () => {
    const products = getProducts();
    const categories = getCategories();
    const names = categories.map((c) => c.name);

    products.forEach((p) => {
        if (p.category && !names.includes(p.category)) {
            names.push(p.category);
        }
    });

    const merged = names.map((name, idx) => {
        const existing = categories.find((c) => c.name === name);
        return {
            id: existing ? existing.id : idx + 1,
            name,
            image: existing ? existing.image : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
        };
    });

    saveCategories(merged);
};

// Async Firestore Banners / Storage Fallback
const getBanners = async () => {
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { collection, getDocs, query, orderBy } = firestoreModule;
        const { db } = configModule;

        const snapshot = await getDocs(query(collection(db, 'banners'), orderBy('createdAt', 'desc')));
        if (!snapshot.empty) {
            return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
        }
    } catch (error) {
        console.warn('Banner Firestore fetch notice (using storage):', error);
    }

    return JSON.parse(localStorage.getItem('luxe_banners')) || [
        {
            id: 'fallback-banner-1',
            badge: 'Botanical Clinical \'26',
            title: 'Reveal Your Skin\'s',
            subtitle: 'Natural Radiance',
            description: 'Formulated with cold-pressed antioxidants and skin-identical ceramides.',
            buttonText: 'Shop Clean Collection',
            imageUrl: './images/slider 1.jpeg',
            targetUrl: 'products.html'
        }
    ];
};

const saveBanners = async (banners) => {
    localStorage.setItem('luxe_banners', JSON.stringify(banners));
};

// Async Firestore Reviews / Storage Fallback
const getReviews = async () => {
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { collection, getDocs, query, orderBy } = firestoreModule;
        const { db } = configModule;

        const snapshot = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
        if (!snapshot.empty) {
            return snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
        }
    } catch (error) {
        console.warn('Reviews Firestore fetch notice (using storage):', error);
    }

    return JSON.parse(localStorage.getItem('luxe_reviews')) || [];
};

const saveReviews = async (reviews) => {
    localStorage.setItem('luxe_reviews', JSON.stringify(reviews));
};

// Orders & Users
const getOrders = () => JSON.parse(localStorage.getItem('luxe_orders')) || [];
const saveOrders = (orders) => localStorage.setItem('luxe_orders', JSON.stringify(orders));

const getUsers = () => JSON.parse(localStorage.getItem('luxe_users')) || [];
const saveUsers = (users) => localStorage.setItem('luxe_users', JSON.stringify(users));

// ============================================
// NAVIGATION & TABS
// ============================================

const showTab = (tabName) => {
    document.querySelectorAll('.tab-content').forEach((tab) => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });

    document.querySelectorAll('.sidebar-link').forEach((link) => {
        link.className = 'sidebar-link w-full text-left px-4 py-2.5 rounded-2xl transition flex items-center text-xs text-gray-600 dark:text-gray-300 hover:bg-pink-50/50 hover:text-pink-600';
    });

    const activeTab = document.getElementById(`${tabName}Tab`);
    const activeNav = document.getElementById(`nav-${tabName}`);

    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.display = 'block';
    }

    if (activeNav) {
        activeNav.className = 'sidebar-link active w-full text-left px-4 py-2.5 rounded-2xl transition flex items-center text-xs';
    }

    // Refresh Tab Data
    switch (tabName) {
        case 'overview':
            loadDashboardOverview();
            break;
        case 'products':
            loadProductsTable();
            break;
        case 'categories':
            loadCategoriesTable();
            break;
        case 'banners':
            loadBannersTable();
            break;
        case 'reviews':
            loadReviewsTable();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'notifications':
            loadAdminNotifications();
            break;
        case 'users':
            loadUsersTable();
            break;
    }
};

// ============================================
// MODULAR HTML BUILDERS (CLEAN TABLES & CARDS)
// ============================================

// Recent Order Row Builder
const createRecentOrderRow = (order) => {
    const { orderId = 'ORD-00', customerInfo = {}, pricing = {}, status = 'pending', createdAt } = order;
    const dateStr = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent';
    const total = Number(pricing.total || 0).toFixed(2);

    const statusBadge = status === 'completed' || status === 'delivered'
        ? '<span class="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Delivered</span>'
        : '<span class="bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Pending</span>';

    return `
        <div class="bg-pink-50/20 dark:bg-slate-700/30 p-3.5 rounded-2xl border border-pink-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                    <i class="fas fa-bag-shopping text-xs"></i>
                </div>
                <div>
                    <h4 class="font-semibold text-gray-900 dark:text-white">${customerInfo.name || 'Client'}</h4>
                    <span class="text-gray-400 font-mono text-[11px]">${orderId} • ${dateStr}</span>
                </div>
            </div>
            <div class="flex items-center space-x-3">
                <span class="font-bold text-pink-600">EGP ${total}</span>
                ${statusBadge}
            </div>
        </div>
    `;
};

// Product Table Row Builder
const createProductTableRow = (product) => {
    const { id, name = '', image = './images/slider 1.jpeg', price = 0, originalPrice = 0, category = 'Skincare', stock = 0, hasDiscount = false, discountPercent = 0 } = product;

    return `
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="px-5 py-3">
                <img src="${image}" alt="${name}" class="w-11 h-11 rounded-xl object-cover border border-pink-100 dark:border-slate-700">
            </td>
            <td class="px-5 py-3">
                <h4 class="font-semibold text-gray-900 dark:text-white line-clamp-1">${name}</h4>
                ${hasDiscount ? `<span class="text-[10px] text-pink-600 font-bold">-${discountPercent}% Discount</span>` : ''}
            </td>
            <td class="px-5 py-3">
                <span class="font-bold text-pink-600">EGP ${Number(price).toFixed(2)}</span>
                ${hasDiscount && originalPrice > price ? `<span class="text-[10px] text-gray-400 line-through block">EGP ${Number(originalPrice).toFixed(2)}</span>` : ''}
            </td>
            <td class="hidden md:table-cell px-5 py-3 text-gray-500 font-medium">${category}</td>
            <td class="hidden md:table-cell px-5 py-3">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                    ${stock} in stock
                </span>
            </td>
            <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end space-x-2">
                    <button onclick="editProduct(${id})" class="w-7 h-7 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center transition" title="Edit Formula">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteProduct(${id})" class="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition" title="Delete Formula">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
};

// Category Table Row Builder
const createCategoryTableRow = (category) => {
    const { id, name = '', image = '' } = category;
    return `
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="px-5 py-3">
                <img src="${image}" alt="${name}" class="w-10 h-10 rounded-xl object-cover border border-pink-100 dark:border-slate-700">
            </td>
            <td class="px-5 py-3 font-semibold text-gray-900 dark:text-white">${name}</td>
            <td class="px-5 py-3 text-right">
                <button onclick="deleteCategory(${id})" class="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center ml-auto transition">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </td>
        </tr>
    `;
};

// Banner Table Row Builder
const createBannerTableRow = (banner) => {
    const { id, title = '', subtitle = '', imageUrl = '', targetUrl = 'products.html' } = banner;
    return `
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="px-5 py-3">
                <img src="${imageUrl}" alt="${title}" class="w-12 h-10 rounded-xl object-cover border border-pink-100 dark:border-slate-700">
            </td>
            <td class="px-5 py-3">
                <div class="font-semibold text-gray-900 dark:text-white">${title}</div>
                <div class="text-[11px] text-pink-500 font-display italic">${subtitle}</div>
            </td>
            <td class="px-5 py-3 text-gray-400 font-mono text-[11px] truncate max-w-xs">${targetUrl}</td>
            <td class="px-5 py-3 text-right">
                <button onclick="deleteBanner('${id}')" class="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center ml-auto transition">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </td>
        </tr>
    `;
};

// Review Table Row Builder
const createReviewTableRow = (review) => {
    const { id, customerName = 'Customer', rating = 5, text = '', profileImage = '' } = review;
    return `
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="px-5 py-3 flex items-center space-x-2.5">
                <img src="${profileImage}" alt="${customerName}" class="w-8 h-8 rounded-full object-cover">
                <span class="font-semibold text-gray-900 dark:text-white">${customerName}</span>
            </td>
            <td class="px-5 py-3 text-amber-400 text-xs">★ ${rating}.0</td>
            <td class="px-5 py-3 text-gray-500 max-w-xs truncate italic">"${text}"</td>
            <td class="px-5 py-3 text-right">
                <button onclick="deleteReview('${id}')" class="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center ml-auto transition">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </td>
        </tr>
    `;
};

// Order Table Row Builder
const createOrderTableRow = (order) => {
    const { orderId = 'ORD-00', createdAt, customerInfo = {}, pricing = {}, status = 'pending' } = order;
    const dateStr = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
    const total = Number(pricing.total || 0).toFixed(2);

    let statusClass = 'bg-amber-50 text-amber-600';
    if (status === 'delivered' || status === 'completed') statusClass = 'bg-emerald-50 text-emerald-600';
    if (status === 'cancelled') statusClass = 'bg-rose-50 text-rose-600';

    return `
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="px-5 py-3 font-mono font-bold text-gray-900 dark:text-white">${orderId}</td>
            <td class="px-5 py-3 text-gray-400">${dateStr}</td>
            <td class="px-5 py-3">
                <div class="font-semibold text-gray-900 dark:text-white">${customerInfo.name || 'Client'}</div>
                <div class="text-[11px] text-gray-400 font-mono">${customerInfo.email || ''}</div>
            </td>
            <td class="px-5 py-3 font-bold text-pink-600">EGP ${total}</td>
            <td class="px-5 py-3">
                <select onchange="updateOrderStatus('${orderId}', this.value)" class="text-[11px] font-bold rounded-full px-2.5 py-1 ${statusClass} border-none outline-none cursor-pointer">
                    <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="delivered" ${status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td class="px-5 py-3 text-right">
                <button onclick="viewOrderDetails('${orderId}')" class="w-7 h-7 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center ml-auto transition" title="View Order">
                    <i class="fas fa-eye text-xs"></i>
                </button>
            </td>
        </tr>
    `;
};

// User Table Row Builder
const createUserTableRow = (user) => {
    const { id, name = 'Client', email = '', orders = [], isBlocked = false } = user;
    return `
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="px-5 py-3 font-semibold text-gray-900 dark:text-white">${name}</td>
            <td class="px-5 py-3 text-gray-400 font-mono">${email}</td>
            <td class="px-5 py-3 font-bold text-pink-600">${orders.length} orders</td>
            <td class="px-5 py-3">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${isBlocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}">
                    ${isBlocked ? 'Blocked' : 'Active'}
                </span>
            </td>
            <td class="px-5 py-3 text-right">
                <button onclick="toggleUserBlock('${email}')" class="text-xs px-3 py-1 rounded-full font-semibold transition ${isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}">
                    ${isBlocked ? 'Unblock' : 'Block'}
                </button>
            </td>
        </tr>
    `;
};

// ============================================
// DATA LOADERS & RENDER FUNCTIONS
// ============================================

const loadDashboardOverview = () => {
    try {
        const products = getProducts();
        const orders = getOrders();
        const users = getUsers();

        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.pricing?.total) || 0), 0);

        const prodEl = document.getElementById('totalProducts');
        const ordEl = document.getElementById('totalOrders');
        const userEl = document.getElementById('totalUsers');
        const revEl = document.getElementById('totalRevenue');

        if (prodEl) prodEl.textContent = products.length;
        if (ordEl) ordEl.textContent = orders.length;
        if (userEl) userEl.textContent = users.length;
        if (revEl) revEl.textContent = `EGP ${totalRevenue.toFixed(0)}`;

        const recentList = document.getElementById('recentOrdersList');
        if (recentList) {
            if (!orders.length) {
                recentList.innerHTML = '<p class="text-gray-400 text-center py-6 text-xs">No orders recorded yet.</p>';
            } else {
                recentList.innerHTML = orders.slice(0, 5).map(createRecentOrderRow).join('');
            }
        }
    } catch (e) {
        console.error('Error loading dashboard overview:', e);
    }
};

const loadProductsTable = () => {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    const products = getProducts();
    if (!products.length) {
        tableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400">No products found</td></tr>';
        return;
    }

    tableBody.innerHTML = products.map(createProductTableRow).join('');
};

const loadCategoriesTable = () => {
    const tableBody = document.getElementById('categoriesTableBody');
    if (!tableBody) return;

    const categories = getCategories();
    if (!categories.length) {
        tableBody.innerHTML = '<tr><td colspan="3" class="px-6 py-8 text-center text-gray-400">No categories found</td></tr>';
        return;
    }

    tableBody.innerHTML = categories.map(createCategoryTableRow).join('');

    // Also populate productCategory select in product modal
    const catSelect = document.getElementById('productCategory');
    if (catSelect) {
        catSelect.innerHTML = categories.map((c) => `<option value="${c.name}">${c.name}</option>`).join('');
    }
};

const loadBannersTable = async () => {
    const tableBody = document.getElementById('bannersTableBody');
    if (!tableBody) return;

    const banners = await getBanners();
    if (!banners.length) {
        tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400">No banners found</td></tr>';
        return;
    }

    tableBody.innerHTML = banners.map(createBannerTableRow).join('');
};

const loadReviewsTable = async () => {
    const tableBody = document.getElementById('reviewsTableBody');
    if (!tableBody) return;

    const reviews = await getReviews();
    if (!reviews.length) {
        tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400">No reviews found</td></tr>';
        return;
    }

    tableBody.innerHTML = reviews.map(createReviewTableRow).join('');
};

const loadOrdersTable = () => {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    const orders = getOrders();
    if (!orders.length) {
        tableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-400">No orders found</td></tr>';
        return;
    }

    tableBody.innerHTML = orders.map(createOrderTableRow).join('');
};

const loadUsersTable = () => {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    const users = getUsers();
    if (!users.length) {
        tableBody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-400">No users found</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map(createUserTableRow).join('');
};

// ============================================
// CRUD ACTIONS & EVENT HANDLERS
// ============================================

// Product Actions
const showAddProductModal = () => {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    if (!modal) return;

    if (title) title.textContent = 'Add New Product Formula';
    if (form) form.reset();

    document.getElementById('productId').value = '';
    loadCategoriesTable();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
};

const closeProductModal = () => {
    const modal = document.getElementById('productModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
};

const editProduct = (productId) => {
    const products = getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    showAddProductModal();

    const title = document.getElementById('productModalTitle');
    if (title) title.textContent = 'Edit Product Formula';

    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productBarcode').value = product.barcode || '';
    document.getElementById('productOriginalPrice').value = product.originalPrice || product.price || 0;
    document.getElementById('productSalePrice').value = product.salePrice || product.price || 0;
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productRating').value = product.rating || 5;
    document.getElementById('productStock').value = product.stock || 50;
    document.getElementById('productCategory').value = product.category || 'Serum';

    updateDiscountLabels();
};

const deleteProduct = (productId) => {
    if (confirm('Delete this product formula?')) {
        let products = getProducts();
        products = products.filter((p) => p.id !== productId);
        saveProducts(products);
        showToast('Product deleted');
        loadProductsTable();
        loadDashboardOverview();
    }
};

const updateDiscountLabels = () => {
    const orig = parseFloat(document.getElementById('productOriginalPrice')?.value || 0);
    const sale = parseFloat(document.getElementById('productSalePrice')?.value || 0);
    const details = calculateDiscountDetails(orig, sale);

    const discEl = document.getElementById('productDiscountLabel');
    const saveEl = document.getElementById('productSavingsLabel');

    if (discEl) discEl.textContent = `${details.discountPercent}% OFF`;
    if (saveEl) saveEl.textContent = `EGP ${details.savings.toFixed(2)}`;
};

// Category Actions
const resetCategoryForm = () => {
    const form = document.getElementById('categoryForm');
    if (form) form.reset();
    document.getElementById('categoryId').value = '';
    const title = document.getElementById('categoryFormTitle');
    if (title) title.textContent = 'Add New Category';
};

const deleteCategory = (catId) => {
    if (confirm('Delete this category?')) {
        let categories = getCategories();
        categories = categories.filter((c) => c.id !== catId);
        saveCategories(categories);
        showToast('Category deleted');
        loadCategoriesTable();
    }
};

// Banner Actions
const resetBannerForm = () => {
    const form = document.getElementById('bannerForm');
    if (form) form.reset();
    document.getElementById('bannerId').value = '';
    const title = document.getElementById('bannerFormTitle');
    if (title) title.textContent = 'Add New Banner';
};

const deleteBanner = async (bannerId) => {
    if (confirm('Delete this campaign banner?')) {
        let banners = await getBanners();
        banners = banners.filter((b) => String(b.id) !== String(bannerId));
        await saveBanners(banners);
        showToast('Banner deleted');
        loadBannersTable();
    }
};

// Review Actions
const resetReviewForm = () => {
    const form = document.getElementById('reviewForm');
    if (form) form.reset();
    document.getElementById('reviewId').value = '';
    const title = document.getElementById('reviewFormTitle');
    if (title) title.textContent = 'Add New Review';
};

const deleteReview = async (reviewId) => {
    if (confirm('Delete this customer testimonial?')) {
        let reviews = await getReviews();
        reviews = reviews.filter((r) => String(r.id) !== String(reviewId));
        await saveReviews(reviews);
        showToast('Review removed');
        loadReviewsTable();
    }
};

// Order Actions
const updateOrderStatus = (orderId, newStatus) => {
    const orders = getOrders();
    const order = orders.find((o) => o.orderId === orderId);

    if (order) {
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: `Status updated by Admin to ${newStatus}`
        });

        saveOrders(orders);
        showToast(`Order status updated to ${newStatus}`);
    }
};

const viewOrderDetails = (orderId) => {
    const orders = getOrders();
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;

    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    if (!modal || !content) return;

    const { customerInfo = {}, pricing = {}, items = [], status = 'pending', payment = {} } = order;

    content.innerHTML = `
        <div class="space-y-4">
            <div class="flex justify-between items-center bg-pink-50/50 dark:bg-slate-700/40 p-4 rounded-2xl">
                <div>
                    <h3 class="font-bold text-gray-900 dark:text-white font-mono text-sm">${orderId}</h3>
                    <p class="text-gray-400 text-xs">Customer: ${customerInfo.name || 'Client'} (${customerInfo.email || ''})</p>
                </div>
                <span class="text-sm font-bold text-pink-600">EGP ${Number(pricing.total || 0).toFixed(2)}</span>
            </div>

            <div>
                <h4 class="font-bold uppercase tracking-wider text-gray-400 mb-2">Formulations Ordered:</h4>
                <div class="divide-y divide-pink-50 dark:divide-slate-700">
                    ${items.map((item) => `
                        <div class="py-2.5 flex items-center justify-between">
                            <div class="flex items-center space-x-2.5">
                                <img src="${item.image}" alt="${item.name}" class="w-8 h-8 rounded-lg object-cover">
                                <span>${item.name} (x${item.quantity || 1})</span>
                            </div>
                            <span class="font-semibold text-pink-600">EGP ${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="bg-gray-50 dark:bg-slate-700/30 p-3.5 rounded-2xl">
                <p><strong>Shipping Address:</strong> ${customerInfo.address?.street || ''}, ${customerInfo.address?.city || ''}, ${customerInfo.address?.country || ''}</p>
                <p><strong>Phone:</strong> ${customerInfo.phone || 'N/A'}</p>
                <p><strong>Payment:</strong> ${(payment.method || 'cod').toUpperCase()} (${payment.status || 'pending'})</p>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
};

const closeOrderDetailsModal = () => {
    const modal = document.getElementById('orderDetailsModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
};

// User Actions
const showAddUserForm = () => {
    const card = document.getElementById('addUserFormCard');
    if (card) card.classList.remove('hidden');
};

const hideAddUserForm = () => {
    const card = document.getElementById('addUserFormCard');
    if (card) card.classList.add('hidden');
};

const toggleUserBlock = (email) => {
    const users = getUsers();
    const user = users.find((u) => u.email?.toLowerCase() === email?.toLowerCase());
    if (user) {
        user.isBlocked = !user.isBlocked;
        saveUsers(users);
        showToast(user.isBlocked ? 'Customer blocked' : 'Customer unblocked');
        loadUsersTable();
    }
};

// Notification Helpers
const loadAdminNotifications = () => {
    const notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    const container = document.getElementById('notificationsList');
    if (!container) return;

    if (!notifications.length) {
        container.innerHTML = '<div class="text-center py-8 text-gray-400 text-xs">No notifications recorded</div>';
        return;
    }

    container.innerHTML = notifications.map((n) => `
        <div class="p-3.5 rounded-2xl bg-pink-50/30 dark:bg-slate-700/30 border border-pink-100 dark:border-slate-700 text-xs flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <i class="fas fa-bell text-pink-500"></i>
                <div>
                    <h5 class="font-semibold text-gray-900 dark:text-white">${n.message}</h5>
                    <span class="text-[10px] text-gray-400">${new Date(n.timestamp).toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    `).join('');
};

const markAllNotificationsAsRead = () => {
    const notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    notifications.forEach((n) => { n.isRead = true; });
    localStorage.setItem('luxe_adminNotifications', JSON.stringify(notifications));
    loadAdminNotifications();
    showToast('All notifications marked as read');
};

const clearAllNotifications = () => {
    if (confirm('Clear all system alerts?')) {
        localStorage.setItem('luxe_adminNotifications', JSON.stringify([]));
        loadAdminNotifications();
        showToast('All alerts cleared');
    }
};

// Sign Out
const logout = async () => {
    if (confirm('Sign out from Admin Studio?')) {
        try {
            const firebaseAuth = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
            const config = await import('./firebase-config.js');
            await firebaseAuth.signOut(config.auth);
        } catch (e) {
            // ignore if offline
        }
        localStorage.removeItem('currentUser');
        localStorage.removeItem('luxe_currentUser');
        window.location.href = 'login.html';
    }
};

// Toast Notifications
const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    if (type === 'error') {
        toast.className = 'fixed bottom-8 right-8 bg-rose-500 text-white px-5 py-3 rounded-2xl shadow-xl transform translate-y-0 transition-transform duration-300 z-50 flex items-center space-x-3 text-xs';
        if (toastIcon) toastIcon.className = 'fas fa-circle-exclamation text-base text-white';
    } else {
        toast.className = 'fixed bottom-8 right-8 bg-white dark:bg-slate-800 border border-pink-200 dark:border-slate-700 text-gray-800 dark:text-white px-5 py-3 rounded-2xl shadow-xl transform translate-y-0 transition-transform duration-300 z-50 flex items-center space-x-3 text-xs';
        if (toastIcon) toastIcon.className = 'fas fa-check-circle text-pink-500 text-base';
    }

    setTimeout(() => {
        toast.style.transform = 'translateY(8rem)';
    }, 3200);
};

// ============================================
// INITIALIZATION & FORM SUBMISSIONS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardOverview();
    loadCategoriesTable();

    // Discount calculator inputs
    const origInput = document.getElementById('productOriginalPrice');
    const saleInput = document.getElementById('productSalePrice');
    if (origInput && saleInput) {
        origInput.addEventListener('input', updateDiscountLabels);
        saleInput.addEventListener('input', updateDiscountLabels);
    }

    // Product Form
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const productId = document.getElementById('productId').value;
            const originalPrice = parseFloat(document.getElementById('productOriginalPrice').value) || 0;
            const salePrice = parseFloat(document.getElementById('productSalePrice').value) || originalPrice;

            const newProduct = {
                id: productId ? parseInt(productId, 10) : Date.now(),
                name: document.getElementById('productName').value.trim(),
                barcode: document.getElementById('productBarcode').value.trim(),
                category: document.getElementById('productCategory').value,
                originalPrice,
                salePrice,
                price: salePrice,
                image: document.getElementById('productImage').value.trim(),
                description: document.getElementById('productDescription').value.trim(),
                rating: parseInt(document.getElementById('productRating').value, 10) || 5,
                stock: parseInt(document.getElementById('productStock').value, 10) || 50
            };

            let products = getProducts();
            if (productId) {
                const idx = products.findIndex((p) => p.id === parseInt(productId, 10));
                if (idx > -1) products[idx] = newProduct;
            } else {
                products.push(newProduct);
            }

            saveProducts(products);
            closeProductModal();
            showToast('Product saved successfully');
            loadProductsTable();
            loadDashboardOverview();
        });
    }

    // Category Form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('categoryName').value.trim();
            const image = document.getElementById('categoryImage').value.trim();

            const categories = getCategories();
            categories.push({ id: Date.now(), name, image });
            saveCategories(categories);

            resetCategoryForm();
            showToast('Category saved');
            loadCategoriesTable();
        });
    }

    // Banner Form
    const bannerForm = document.getElementById('bannerForm');
    if (bannerForm) {
        bannerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newBanner = {
                id: document.getElementById('bannerId').value || `banner-${Date.now()}`,
                badge: document.getElementById('bannerBadge').value.trim() || 'Featured Ritual',
                title: document.getElementById('bannerTitle').value.trim(),
                subtitle: document.getElementById('bannerSubtitle').value.trim(),
                description: document.getElementById('bannerDescription').value.trim(),
                buttonText: document.getElementById('bannerButtonText').value.trim(),
                imageUrl: document.getElementById('bannerImageUrl').value.trim(),
                targetUrl: document.getElementById('bannerTargetUrl').value.trim() || 'products.html'
            };

            const banners = await getBanners();
            banners.push(newBanner);
            await saveBanners(banners);

            resetBannerForm();
            showToast('Banner saved');
            loadBannersTable();
        });
    }

    // Review Form
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const newReview = {
                id: document.getElementById('reviewId').value || `review-${Date.now()}`,
                customerName: document.getElementById('reviewCustomerName').value.trim(),
                profileImage: document.getElementById('reviewProfileImage').value.trim(),
                rating: parseInt(document.getElementById('reviewRating').value, 10) || 5,
                text: document.getElementById('reviewText').value.trim()
            };

            const reviews = await getReviews();
            reviews.push(newReview);
            await saveReviews(reviews);

            resetReviewForm();
            showToast('Review saved');
            loadReviewsTable();
        });
    }

    // Add User Form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const newUser = {
                id: Date.now(),
                name: document.getElementById('newUserName').value.trim(),
                email: document.getElementById('newUserEmail').value.trim(),
                phone: document.getElementById('newUserPhone').value.trim(),
                address: document.getElementById('newUserAddress').value.trim(),
                orders: [],
                isBlocked: false,
                createdAt: new Date().toISOString()
            };

            const users = getUsers();
            users.push(newUser);
            saveUsers(users);

            hideAddUserForm();
            addUserForm.reset();
            showToast('Customer added successfully');
            loadUsersTable();
            loadDashboardOverview();
        });
    }

    // Store Settings Form
    const storeSettingsForm = document.getElementById('storeSettingsForm');
    if (storeSettingsForm) {
        storeSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Store settings saved successfully');
        });
    }

    // Sidebar Mobile Toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
});
