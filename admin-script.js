// ============================================
// ADMIN DASHBOARD - LUXE BEAUTY (INTEGRATED SYSTEM)
// ============================================

// Check authentication (INTEGRATED WITH MAIN SYSTEM - FIXED)
function checkAuth() {
    var currentUser = JSON.parse(localStorage.getItem('luxe_currentUser'));

    // Check if user is logged in and is admin
    if (!currentUser || !currentUser.isAdmin || currentUser.email !== 'aemade2016@gmail.com') {
        // Prevent redirect loop
        if (!sessionStorage.getItem('redirecting_from_admin')) {
            sessionStorage.setItem('redirecting_from_admin', 'true');
            alert('Access Denied! Admin privileges required.');
            window.location.href = 'login.html';
        }
        return false;
    }
    // Clear redirect flag
    sessionStorage.removeItem('redirecting_from_admin');
    return true;
}

// Initialize (FIXED - Don't throw error, just redirect)
if (!checkAuth()) {
    // Redirect handled in checkAuth()
} else {
    // Display admin email
    var currentUser = JSON.parse(localStorage.getItem('luxe_currentUser'));
    if (currentUser && currentUser.email) {
        var emailDisplay = document.getElementById('adminEmailDisplay');
        if (emailDisplay) {
            emailDisplay.textContent = currentUser.email;
        }
    }
}

// ============================================
// DATA MANAGEMENT
// ============================================

// Get all products
function getProducts() {
    return JSON.parse(localStorage.getItem('luxe_products')) || [];
}

// Save products
function saveProducts(products) {
    localStorage.setItem('luxe_products', JSON.stringify(products));
}

// Get all orders
function getOrders() {
    return JSON.parse(localStorage.getItem('luxe_admin_orders')) || [];
}

// Save orders
function saveOrders(orders) {
    localStorage.setItem('luxe_admin_orders', JSON.stringify(orders));
}

// Get all users
function getUsers() {
    return JSON.parse(localStorage.getItem('luxe_users')) || [];
}

// Get settings
function getSettings() {
    return JSON.parse(localStorage.getItem('luxe_admin_settings')) || {
        maintenanceMode: false,
        siteBanner: ''
    };
}

// Save settings
function saveSettings(settings) {
    localStorage.setItem('luxe_admin_settings', JSON.stringify(settings));
}

// ============================================
// NAVIGATION & TABS
// ============================================

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(function (tab) {
        tab.classList.remove('active');
    });

    // Remove active class from all sidebar links
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
        link.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Add active class to clicked link
    event.target.closest('.sidebar-link').classList.add('active');

    // Load data for the tab
    switch (tabName) {
        case 'overview':
            loadDashboardStats();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
        case 'settings':
            loadSettings();
            break;
    }

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('translate-x-0');
    document.getElementById('sidebar').classList.add('-translate-x-full');
}

// Sidebar toggle for mobile
document.getElementById('sidebarToggle').addEventListener('click', function () {
    var sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('-translate-x-full');
    sidebar.classList.toggle('translate-x-0');
});

// ============================================
// DASHBOARD OVERVIEW
// ============================================

function loadDashboardStats() {
    var products = getProducts();
    var orders = getOrders();
    var users = getUsers();

    // Calculate stats
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalUsers').textContent = users.length;

    // Calculate revenue
    var revenue = orders.reduce(function (sum, order) {
        return sum + (order.total || 0);
    }, 0);
    document.getElementById('totalRevenue').textContent = '$' + revenue.toFixed(2);

    // Load recent orders
    loadRecentOrders();
}

function loadRecentOrders() {
    var orders = getOrders();
    var recentOrders = orders.slice(-5).reverse();
    var container = document.getElementById('recentOrdersList');

    if (recentOrders.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No orders yet</p>';
        return;
    }

    var html = '';
    recentOrders.forEach(function (order) {
        html += '<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">';
        html += '<div>';
        html += '<p class="font-semibold">#' + order.id + '</p>';
        html += '<p class="text-sm text-gray-600 dark:text-gray-400">' + order.customerName + '</p>';
        html += '</div>';
        html += '<div class="text-right">';
        html += '<p class="font-bold text-primary-500">$' + order.total.toFixed(2) + '</p>';
        html += '<span class="text-xs px-2 py-1 rounded-full ' + getStatusClass(order.status) + '">' + order.status + '</span>';
        html += '</div>';
        html += '</div>';
    });

    container.innerHTML = html;
}

function getStatusClass(status) {
    switch (status) {
        case 'Pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'Shipped':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Delivered':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
}

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

var currentProductId = null;
var currentImageBase64 = null;

function loadProducts() {
    var products = getProducts();
    var tbody = document.getElementById('productsTableBody');

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No products found</td></tr>';
        return;
    }

    var html = '';
    products.forEach(function (product) {
        html += '<tr>';
        html += '<td class="px-6 py-4">';
        html += '<img src="' + product.image + '" alt="' + product.name + '" class="w-16 h-16 object-cover rounded-lg">';
        html += '</td>';
        html += '<td class="px-6 py-4 font-semibold">' + product.name + '</td>';
        html += '<td class="px-6 py-4 text-primary-500 font-bold">$' + product.price.toFixed(2) + '</td>';
        html += '<td class="px-6 py-4">' + product.category + '</td>';
        html += '<td class="px-6 py-4">' + (product.stock || 0) + '</td>';
        html += '<td class="px-6 py-4">';
        html += '<button onclick="editProduct(' + product.id + ')" class="text-blue-500 hover:text-blue-600 mr-3">';
        html += '<i class="fas fa-edit"></i>';
        html += '</button>';
        html += '<button onclick="deleteProduct(' + product.id + ')" class="text-red-500 hover:text-red-600">';
        html += '<i class="fas fa-trash"></i>';
        html += '</button>';
        html += '</td>';
        html += '</tr>';
    });

    tbody.innerHTML = html;
}

function showAddProductModal() {
    currentProductId = null;
    currentImageBase64 = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModal').classList.add('flex');
}

function editProduct(productId) {
    var products = getProducts();
    var product = products.find(function (p) { return p.id === productId; });

    if (!product) return;

    currentProductId = productId;
    currentImageBase64 = product.image;

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('productDescription').value = product.description;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productSkinType').value = product.skinType || 'All';
    document.getElementById('productRating').value = product.rating || 5;
    document.getElementById('productStock').value = product.stock || 100;

    // Show image preview
    if (product.image) {
        document.getElementById('previewImg').src = product.image;
        document.getElementById('imagePreview').classList.remove('hidden');
    }

    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModal').classList.add('flex');
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    var products = getProducts();
    products = products.filter(function (p) { return p.id !== productId; });
    saveProducts(products);
    loadProducts();
    showToast('Product deleted successfully');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.getElementById('productModal').classList.remove('flex');
    currentProductId = null;
    currentImageBase64 = null;
}

// Image preview
function previewImage(event) {
    var file = event.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
        currentImageBase64 = e.target.result;
        document.getElementById('previewImg').src = currentImageBase64;
        document.getElementById('imagePreview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Product form submission
document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var products = getProducts();
    var productData = {
        id: currentProductId || Date.now(),
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategory').value,
        skinType: document.getElementById('productSkinType').value,
        rating: parseInt(document.getElementById('productRating').value),
        stock: parseInt(document.getElementById('productStock').value),
        image: currentImageBase64 || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
        reviews: Math.floor(Math.random() * 500 + 100)
    };

    if (currentProductId) {
        // Update existing product
        var index = products.findIndex(function (p) { return p.id === currentProductId; });
        if (index > -1) {
            products[index] = productData;
        }
        showToast('Product updated successfully');
    } else {
        // Add new product
        products.push(productData);
        showToast('Product added successfully');
    }

    saveProducts(products);
    loadProducts();
    closeProductModal();
});

// ============================================
// ORDERS MANAGEMENT
// ============================================

function loadOrders() {
    var orders = getOrders();
    var tbody = document.getElementById('ordersTableBody');

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No orders found</td></tr>';
        return;
    }

    var html = '';
    orders.forEach(function (order) {
        html += '<tr>';
        html += '<td class="px-6 py-4 font-mono text-sm">#' + order.id + '</td>';
        html += '<td class="px-6 py-4">' + order.customerName + '<br><span class="text-xs text-gray-500">' + order.customerEmail + '</span></td>';
        html += '<td class="px-6 py-4">' + order.items.length + ' items</td>';
        html += '<td class="px-6 py-4 font-bold text-primary-500">$' + order.total.toFixed(2) + '</td>';
        html += '<td class="px-6 py-4">';
        html += '<select onchange="updateOrderStatus(' + order.id + ', this.value)" class="px-3 py-1 rounded-full text-sm ' + getStatusClass(order.status) + '">';
        html += '<option value="Pending" ' + (order.status === 'Pending' ? 'selected' : '') + '>Pending</option>';
        html += '<option value="Shipped" ' + (order.status === 'Shipped' ? 'selected' : '') + '>Shipped</option>';
        html += '<option value="Delivered" ' + (order.status === 'Delivered' ? 'selected' : '') + '>Delivered</option>';
        html += '</select>';
        html += '</td>';
        html += '<td class="px-6 py-4">';
        html += '<button onclick="viewOrderDetails(' + order.id + ')" class="text-blue-500 hover:text-blue-600 mr-3">';
        html += '<i class="fas fa-eye"></i>';
        html += '</button>';
        html += '<button onclick="deleteOrder(' + order.id + ')" class="text-red-500 hover:text-red-600">';
        html += '<i class="fas fa-trash"></i>';
        html += '</button>';
        html += '</td>';
        html += '</tr>';
    });

    tbody.innerHTML = html;
}

function updateOrderStatus(orderId, newStatus) {
    var orders = getOrders();
    var order = orders.find(function (o) { return o.id === orderId; });

    if (order) {
        order.status = newStatus;
        saveOrders(orders);
        showToast('Order status updated to ' + newStatus);
    }
}

function viewOrderDetails(orderId) {
    var orders = getOrders();
    var order = orders.find(function (o) { return o.id === orderId; });

    if (!order) return;

    var details = 'Order #' + order.id + '\n\n';
    details += 'Customer: ' + order.customerName + '\n';
    details += 'Email: ' + order.customerEmail + '\n\n';
    details += 'Items:\n';
    order.items.forEach(function (item) {
        details += '- ' + item.name + ' x' + item.quantity + ' = $' + (item.price * item.quantity).toFixed(2) + '\n';
    });
    details += '\nTotal: $' + order.total.toFixed(2);
    details += '\nStatus: ' + order.status;

    alert(details);
}

function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    var orders = getOrders();
    orders = orders.filter(function (o) { return o.id !== orderId; });
    saveOrders(orders);
    loadOrders();
    showToast('Order deleted successfully');
}

// ============================================
// USERS MANAGEMENT
// ============================================

function loadUsers() {
    var users = getUsers();
    var tbody = document.getElementById('usersTableBody');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No users found</td></tr>';
        return;
    }

    var html = '';
    users.forEach(function (user) {
        html += '<tr>';
        html += '<td class="px-6 py-4 font-semibold">' + user.name + '</td>';
        html += '<td class="px-6 py-4">' + user.email + '</td>';
        html += '<td class="px-6 py-4">' + formatDate(user.createdAt) + '</td>';
        html += '<td class="px-6 py-4">' + (user.orders ? user.orders.length : 0) + '</td>';
        html += '<td class="px-6 py-4">';
        html += '<button onclick="viewUserDetails(\'' + user.email + '\')" class="text-blue-500 hover:text-blue-600 mr-3">';
        html += '<i class="fas fa-eye"></i>';
        html += '</button>';
        html += '</td>';
        html += '</tr>';
    });

    tbody.innerHTML = html;
}

function viewUserDetails(email) {
    var users = getUsers();
    var user = users.find(function (u) { return u.email === email; });

    if (!user) return;

    var details = 'User Details\n\n';
    details += 'Name: ' + user.name + '\n';
    details += 'Email: ' + user.email + '\n';
    details += 'Joined: ' + formatDate(user.createdAt) + '\n';
    details += 'Total Orders: ' + (user.orders ? user.orders.length : 0);

    alert(details);
}

// ============================================
// SETTINGS
// ============================================

function loadSettings() {
    var settings = getSettings();
    document.getElementById('maintenanceToggle').checked = settings.maintenanceMode;
    document.getElementById('siteBanner').value = settings.siteBanner || '';
}

document.getElementById('maintenanceToggle').addEventListener('change', function () {
    var settings = getSettings();
    settings.maintenanceMode = this.checked;
    saveSettings(settings);
    showToast('Maintenance mode ' + (this.checked ? 'enabled' : 'disabled'));
});

function saveBanner() {
    var settings = getSettings();
    settings.siteBanner = document.getElementById('siteBanner').value;
    saveSettings(settings);
    showToast('Banner saved successfully');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(message) {
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.style.transform = 'translateY(0)';

    setTimeout(function () {
        toast.style.transform = 'translateY(8rem)';
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('luxe_isAdmin');
        localStorage.removeItem('luxe_adminEmail');
        localStorage.removeItem('luxe_adminLoginTime');
        window.location.href = 'admin-login.html';
    }
}

// ============================================
// INITIALIZE DASHBOARD
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    loadDashboardStats();
});
