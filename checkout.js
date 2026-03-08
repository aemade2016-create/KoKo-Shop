// ============================================
// CHECKOUT SYSTEM - LUXE BEAUTY
// ============================================

var selectedPaymentMethod = null;

// ============================================
// INITIALIZE CHECKOUT
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    loadOrderSummary();
    setupEventListeners();
});

// ============================================
// LOAD ORDER SUMMARY
// ============================================

function loadOrderSummary() {
    var cart = getCart();
    var orderItemsContainer = document.getElementById('orderItems');

    if (cart.length === 0) {
        orderItemsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Your cart is empty</p>';
        window.location.href = 'cart.html';
        return;
    }

    // Render cart items
    var html = '';
    cart.forEach(function (item) {
        html += '<div class="flex items-center space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700">';
        html += '<img src="' + item.image + '" alt="' + item.name + '" class="w-16 h-16 object-cover rounded-lg">';
        html += '<div class="flex-1">';
        html += '<h4 class="font-semibold text-sm">' + item.name + '</h4>';
        html += '<p class="text-xs text-gray-500">Qty: ' + (item.quantity || 1) + '</p>';
        html += '</div>';
        html += '<span class="font-bold text-primary-500">$' + (item.price * (item.quantity || 1)).toFixed(2) + '</span>';
        html += '</div>';
    });

    orderItemsContainer.innerHTML = html;

    // Calculate totals
    calculateTotals();
}

function calculateTotals() {
    var cart = getCart();
    var subtotal = 0;

    cart.forEach(function (item) {
        subtotal += item.price * (item.quantity || 1);
    });

    var shipping = subtotal > 50 ? 0 : 5.99;
    var tax = subtotal * 0.1; // 10% tax
    var total = subtotal + shipping + tax;

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('shipping').textContent = shipping > 0 ? '$' + shipping.toFixed(2) : 'FREE';
    document.getElementById('tax').textContent = '$' + tax.toFixed(2);
    document.getElementById('total').textContent = '$' + total.toFixed(2);
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Create account checkbox
    document.getElementById('createAccount').addEventListener('change', function () {
        var passwordField = document.getElementById('passwordField');
        if (this.checked) {
            passwordField.classList.remove('hidden');
            document.getElementById('password').required = true;
        } else {
            passwordField.classList.add('hidden');
            document.getElementById('password').required = false;
        }
    });

    // Card number formatting
    document.getElementById('cardNumber').addEventListener('input', function (e) {
        var value = e.target.value.replace(/\s/g, '');
        var formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });

    // Expiry date formatting
    document.getElementById('cardExpiry').addEventListener('input', function (e) {
        var value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });

    // CVV - numbers only
    document.getElementById('cardCVV').addEventListener('input', function (e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Form submission
    document.getElementById('checkoutForm').addEventListener('submit', function (e) {
        e.preventDefault();
        processCheckout();
    });
}

// ============================================
// PASSWORD VISIBILITY TOGGLE
// ============================================

function togglePasswordVisibility() {
    var passwordInput = document.getElementById('password');
    var passwordIcon = document.getElementById('passwordIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}

// ============================================
// PAYMENT METHOD SELECTION
// ============================================

function selectPayment(method) {
    selectedPaymentMethod = method;

    // Remove selected class from all options
    document.querySelectorAll('.payment-option').forEach(function (option) {
        option.classList.remove('selected');
    });

    // Add selected class to clicked option
    event.currentTarget.classList.add('selected');

    // Check the radio button
    document.querySelector('input[name="payment"][value="' + method + '"]').checked = true;

    // Hide all payment details
    document.getElementById('cardDetails').classList.add('hidden');
    document.getElementById('walletDetails').classList.add('hidden');
    document.getElementById('codDetails').classList.add('hidden');

    // Show relevant payment details
    if (method === 'card') {
        document.getElementById('cardDetails').classList.remove('hidden');
        // Make card fields required
        document.getElementById('cardNumber').required = true;
        document.getElementById('cardName').required = true;
        document.getElementById('cardExpiry').required = true;
        document.getElementById('cardCVV').required = true;
    } else {
        // Remove required from card fields
        document.getElementById('cardNumber').required = false;
        document.getElementById('cardName').required = false;
        document.getElementById('cardExpiry').required = false;
        document.getElementById('cardCVV').required = false;
    }

    if (method === 'wallet') {
        document.getElementById('walletDetails').classList.remove('hidden');
    }

    if (method === 'cod') {
        document.getElementById('codDetails').classList.remove('hidden');
    }
}

// ============================================
// PROCESS CHECKOUT
// ============================================

function processCheckout() {
    // Validate payment method selected
    if (!selectedPaymentMethod) {
        showToast('Please select a payment method', 'error');
        return;
    }

    // Get form data
    var formData = {
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        fullName: document.getElementById('fullName').value,
        address: {
            street: document.getElementById('street').value,
            apartment: document.getElementById('apartment').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value,
            country: document.getElementById('country').value
        }
    };

    // Validate card details if card payment selected
    if (selectedPaymentMethod === 'card') {
        var cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
        var cardExpiry = document.getElementById('cardExpiry').value;
        var cardCVV = document.getElementById('cardCVV').value;

        if (cardNumber.length < 13 || cardNumber.length > 19) {
            showToast('Invalid card number', 'error');
            return;
        }

        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            showToast('Invalid expiry date (MM/YY)', 'error');
            return;
        }

        if (cardCVV.length < 3 || cardCVV.length > 4) {
            showToast('Invalid CVV', 'error');
            return;
        }
    }

    // Create account if checkbox is checked
    if (document.getElementById('createAccount').checked) {
        var password = document.getElementById('password').value;

        if (password.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        createUserAccount(formData.fullName, formData.email, password);
    }

    // Create order
    var order = createOrder(formData);

    // Save order
    saveOrder(order);

    // Clear cart
    localStorage.removeItem('luxe_cart');

    // Redirect to success page
    window.location.href = 'order-success.html?orderId=' + order.orderId;
}

// ============================================
// CREATE ORDER
// ============================================

function createOrder(formData) {
    var cart = getCart();
    var subtotal = 0;

    cart.forEach(function (item) {
        subtotal += item.price * (item.quantity || 1);
    });

    var shipping = subtotal > 50 ? 0 : 5.99;
    var tax = subtotal * 0.1;
    var total = subtotal + shipping + tax;

    var currentUser = getCurrentUser();
    var userId = currentUser ? currentUser.email : formData.email;

    var order = {
        orderId: 'ORD-' + Date.now(),
        userId: userId,
        customerInfo: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
        },
        items: cart.map(function (item) {
            return {
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                image: item.image
            };
        }),
        payment: {
            method: selectedPaymentMethod,
            status: selectedPaymentMethod === 'cod' ? 'pending' : 'completed',
            transactionId: 'TXN-' + Date.now()
        },
        pricing: {
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            total: total
        },
        status: 'pending',
        statusHistory: [
            {
                status: 'pending',
                timestamp: new Date().toISOString(),
                note: 'Order placed'
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    return order;
}

// ============================================
// SAVE ORDER
// ============================================

function saveOrder(order) {
    // Save to user's orders
    var orders = JSON.parse(localStorage.getItem('luxe_orders')) || [];
    orders.push(order);
    localStorage.setItem('luxe_orders', JSON.stringify(orders));

    // Save to admin orders
    var adminOrders = JSON.parse(localStorage.getItem('luxe_admin_orders')) || [];
    adminOrders.push({
        id: parseInt(order.orderId.replace('ORD-', '')),
        customerName: order.customerInfo.name,
        customerEmail: order.customerInfo.email,
        items: order.items,
        total: order.pricing.total,
        status: order.status,
        date: order.createdAt
    });
    localStorage.setItem('luxe_admin_orders', JSON.stringify(adminOrders));

    // Update user's order history if logged in
    var currentUser = getCurrentUser();
    if (currentUser) {
        var users = JSON.parse(localStorage.getItem('luxe_users')) || [];
        var userIndex = users.findIndex(function (u) { return u.email === currentUser.email; });

        if (userIndex > -1) {
            if (!users[userIndex].orders) {
                users[userIndex].orders = [];
            }
            users[userIndex].orders.push(order.orderId);

            if (!users[userIndex].totalSpent) {
                users[userIndex].totalSpent = 0;
            }
            users[userIndex].totalSpent += order.pricing.total;

            localStorage.setItem('luxe_users', JSON.stringify(users));

            // Update current user
            currentUser.orders = users[userIndex].orders;
            currentUser.totalSpent = users[userIndex].totalSpent;
            localStorage.setItem('luxe_currentUser', JSON.stringify(currentUser));
        }
    }
}

// ============================================
// CREATE USER ACCOUNT
// ============================================

function createUserAccount(name, email, password) {
    var users = JSON.parse(localStorage.getItem('luxe_users')) || [];

    // Check if user already exists
    var existingUser = users.find(function (u) { return u.email === email; });
    if (existingUser) {
        return; // User already exists
    }

    var newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password, // In production, hash this!
        createdAt: new Date().toISOString(),
        orders: [],
        totalSpent: 0
    };

    users.push(newUser);
    localStorage.setItem('luxe_users', JSON.stringify(users));

    // Set as current user
    localStorage.setItem('luxe_currentUser', JSON.stringify(newUser));
}

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, type) {
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;

    if (type === 'error') {
        toast.classList.remove('bg-green-500');
        toast.classList.add('bg-red-500');
    } else {
        toast.classList.remove('bg-red-500');
        toast.classList.add('bg-green-500');
    }

    toast.style.transform = 'translateY(0)';

    setTimeout(function () {
        toast.style.transform = 'translateY(8rem)';
    }, 3000);
}
