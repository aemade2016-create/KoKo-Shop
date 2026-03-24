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
    // Get orders from the new system (luxe_orders)
    var orders = JSON.parse(localStorage.getItem('luxe_orders')) || [];

    // Convert to admin format for display
    var adminOrders = orders.map(function (order) {
        return {
            id: parseInt(order.orderId.replace('ORD-', '')),
            orderId: order.orderId,
            customerName: order.customerInfo.name,
            customerEmail: order.customerInfo.email,
            items: order.items,
            total: order.pricing.total,
            status: capitalizeFirstLetter(order.status),
            date: order.createdAt,
            fullOrder: order // Keep full order data
        };
    });

    return adminOrders;
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Save orders
function saveOrders(orders) {
    // Convert back to luxe_orders format and save
    var luxeOrders = orders.map(function (order) {
        if (order.fullOrder) {
            // Update the full order with new status
            order.fullOrder.status = order.status.toLowerCase();
            return order.fullOrder;
        }
        return order;
    });
    localStorage.setItem('luxe_orders', JSON.stringify(luxeOrders));
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
    document.getElementById('totalRevenue').textContent = 'EGP ' + revenue.toFixed(2);

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
        html += '<p class="font-semibold">#' + order.orderId + '</p>';
        html += '<p class="text-sm text-gray-600 dark:text-gray-400">' + order.customerName + '</p>';
        html += '</div>';
        html += '<div class="text-right">';
        html += '<p class="font-bold text-primary-500">EGP ' + order.total.toFixed(2) + '</p>';
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
        html += '<td class="px-6 py-4 text-primary-500 font-bold">EGP ' + product.price.toFixed(2) + '</td>';
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
        html += '<td class="px-6 py-4 font-bold text-primary-500">EGP ' + order.total.toFixed(2) + '</td>';
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
    // Use the notification-enabled version
    updateOrderStatusWithNotification('ORD-' + orderId, newStatus);
}

function viewOrderDetails(orderId) {
    var orders = getOrders();
    var order = orders.find(function (o) { return o.id === orderId; });

    if (!order || !order.fullOrder) return;

    var fullOrder = order.fullOrder;
    var details = 'Order #' + fullOrder.orderId + '\n\n';
    details += 'Customer: ' + fullOrder.customerInfo.name + '\n';
    details += 'Email: ' + fullOrder.customerInfo.email + '\n';
    details += 'Phone: ' + fullOrder.customerInfo.phone + '\n\n';
    details += 'Shipping Address:\n';
    details += fullOrder.customerInfo.address.street + '\n';
    if (fullOrder.customerInfo.address.apartment) {
        details += fullOrder.customerInfo.address.apartment + '\n';
    }
    details += fullOrder.customerInfo.address.city + ', ' + fullOrder.customerInfo.address.state + ' ' + fullOrder.customerInfo.address.zip + '\n';
    details += fullOrder.customerInfo.address.country + '\n\n';
    details += 'Items:\n';
    fullOrder.items.forEach(function (item) {
        details += '- ' + item.name + ' x' + item.quantity + ' = EGP ' + (item.price * item.quantity).toFixed(2) + '\n';
    });
    details += '\nSubtotal: EGP ' + fullOrder.pricing.subtotal.toFixed(2);
    details += '\nShipping: ' + (fullOrder.pricing.shipping > 0 ? 'EGP ' + fullOrder.pricing.shipping.toFixed(2) : 'FREE');
    details += '\nTax: EGP ' + fullOrder.pricing.tax.toFixed(2);
    details += '\nTotal: EGP ' + fullOrder.pricing.total.toFixed(2);
    details += '\n\nPayment Method: ' + fullOrder.payment.method.toUpperCase();
    details += '\nStatus: ' + fullOrder.status;

    alert(details);
}

function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order?')) return;

    var orders = JSON.parse(localStorage.getItem('luxe_orders')) || [];
    var order = orders.find(function (o) { return o.orderId === 'ORD-' + orderId; });

    if (order) {
        orders = orders.filter(function (o) { return o.orderId !== 'ORD-' + orderId; });
        localStorage.setItem('luxe_orders', JSON.stringify(orders));
        loadOrders();
        showToast('Order deleted successfully');
    }
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
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
            .then(function (firebaseAuth) {
                return import('./firebase-config.js').then(function (config) {
                    return firebaseAuth.signOut(config.auth);
                });
            })
            .catch(function () { /* ignore if firebase not available */ })
            .finally(function () {
                localStorage.removeItem('luxe_currentUser');
                localStorage.removeItem('luxe_isAdmin');
                localStorage.removeItem('luxe_adminEmail');
                localStorage.removeItem('luxe_adminLoginTime');
                window.location.href = 'login.html';
            });
    }
}

// ============================================
// INITIALIZE DASHBOARD
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    loadDashboardStats();
});


// ============================================
// NOTIFICATION SYSTEM
// ============================================

function loadAdminNotifications() {
    var notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    var container = document.getElementById('notificationsList');

    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-500">No notifications</div>';
        return;
    }

    var html = '';
    notifications.forEach(function (notification, index) {
        var bgClass = notification.isRead ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900/20';
        var iconClass = getNotificationIcon(notification.type);
        var iconColor = getNotificationColor(notification.type);

        html += '<div class="' + bgClass + ' rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition" onclick="markNotificationAsRead(' + index + ')">';
        html += '<div class="flex items-start space-x-3">';
        html += '<div class="w-10 h-10 rounded-full ' + iconColor + ' flex items-center justify-center flex-shrink-0">';
        html += '<i class="' + iconClass + '"></i>';
        html += '</div>';
        html += '<div class="flex-1">';
        html += '<p class="font-semibold mb-1">' + notification.message + '</p>';
        html += '<p class="text-sm text-gray-500">' + formatNotificationTime(notification.timestamp) + '</p>';
        if (notification.orderTotal) {
            html += '<p class="text-sm text-primary-500 font-semibold mt-1">Order Total: EGP ' + notification.orderTotal.toFixed(2) + '</p>';
        }
        html += '</div>';
        if (!notification.isRead) {
            html += '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>';
        }
        html += '</div>';
        html += '</div>';
    });

    container.innerHTML = html;
    updateNotificationBadge();
}

function getNotificationIcon(type) {
    var icons = {
        'order_cancelled': 'fas fa-times-circle',
        'order_placed': 'fas fa-shopping-bag',
        'order_updated': 'fas fa-sync-alt',
        'new_user': 'fas fa-user-plus'
    };
    return icons[type] || 'fas fa-bell';
}

function getNotificationColor(type) {
    var colors = {
        'order_cancelled': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        'order_placed': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        'order_updated': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'new_user': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
}

function formatNotificationTime(timestamp) {
    var date = new Date(timestamp);
    var now = new Date();
    var diff = now - date;
    var minutes = Math.floor(diff / 60000);
    var hours = Math.floor(diff / 3600000);
    var days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return minutes + ' minutes ago';
    if (hours < 24) return hours + ' hours ago';
    if (days < 7) return days + ' days ago';
    return date.toLocaleDateString();
}

function markNotificationAsRead(index) {
    var notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    if (notifications[index]) {
        notifications[index].isRead = true;
        localStorage.setItem('luxe_adminNotifications', JSON.stringify(notifications));
        loadAdminNotifications();
    }
}

function markAllNotificationsAsRead() {
    var notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    notifications.forEach(function (n) { n.isRead = true; });
    localStorage.setItem('luxe_adminNotifications', JSON.stringify(notifications));
    loadAdminNotifications();
    showToast('All notifications marked as read');
}

function clearAllNotifications() {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    localStorage.setItem('luxe_adminNotifications', JSON.stringify([]));
    loadAdminNotifications();
    showToast('All notifications cleared');
}

function updateNotificationBadge() {
    var notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    var unreadCount = notifications.filter(function (n) { return !n.isRead; }).length;

    var badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        if (unreadCount > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Update order status with notification
function updateOrderStatusWithNotification(orderId, newStatus) {
    var orders = JSON.parse(localStorage.getItem('luxe_orders')) || [];
    var order = orders.find(function (o) { return o.orderId === orderId; });

    if (order) {
        var oldStatus = order.status;
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: 'Status updated by admin',
            updatedBy: 'admin'
        });

        localStorage.setItem('luxe_orders', JSON.stringify(orders));

        // Create notification for customer
        createCustomerNotificationFromAdmin(order.customerInfo.email, {
            type: 'order_updated',
            orderId: orderId,
            newStatus: newStatus,
            timestamp: new Date().toISOString(),
            message: 'Your order #' + orderId.split('-')[1] + ' status has been updated to ' + newStatus,
            isRead: false
        });

        showToast('Order status updated to ' + newStatus + '. Customer has been notified.');
        loadOrders();
    }
}

function createCustomerNotificationFromAdmin(customerEmail, notification) {
    var key = 'luxe_customerNotifications_' + customerEmail;
    var notifications = JSON.parse(localStorage.getItem(key)) || [];
    notifications.unshift(notification);
    localStorage.setItem(key, JSON.stringify(notifications));
}

// Initialize notifications on page load
if (document.getElementById('notificationsList')) {
    loadAdminNotifications();
    // Refresh notifications every 30 seconds
    setInterval(function () {
        updateNotificationBadge();
    }, 30000);
}
