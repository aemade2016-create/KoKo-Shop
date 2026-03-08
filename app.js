// ============================================
// LUXE BEAUTY - SHARED JAVASCRIPT
// ============================================

// ============================================
// 1. THEME MANAGEMENT (Dark Mode)
// ============================================
function initTheme() {
    var themeToggle = document.getElementById('themeToggle');
    var html = document.documentElement;
    var currentTheme = localStorage.getItem('luxe_theme') || 'light';

    // Apply saved theme
    html.classList.toggle('dark', currentTheme === 'dark');

    // Theme toggle event
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            html.classList.toggle('dark');
            var theme = html.classList.contains('dark') ? 'dark' : 'light';
            localStorage.setItem('luxe_theme', theme);
        });
    }
}

// ============================================
// 2. MOBILE MENU
// ============================================
function initMobileMenu() {
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// ============================================
// 3. CART SYSTEM
// ============================================
function getCart() {
    return JSON.parse(localStorage.getItem('luxe_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    var cart = getCart();
    var cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(function (el) {
        el.textContent = cart.length;
    });
}

function addToCart(productId, productData) {
    var cart = getCart();

    // Check if product already in cart
    var existingItem = cart.find(function (item) {
        return item.id === productId;
    });

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: productId,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }

    saveCart(cart);
    showToast(productData.name + ' added to cart!');
}

function removeFromCart(productId) {
    var cart = getCart();
    cart = cart.filter(function (item) {
        return item.id !== productId;
    });
    saveCart(cart);
    showToast('Item removed from cart');
}

function clearCart() {
    localStorage.removeItem('luxe_cart');
    updateCartCount();
}

// ============================================
// 4. WISHLIST SYSTEM
// ============================================
function getWishlist() {
    return JSON.parse(localStorage.getItem('luxe_wishlist')) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem('luxe_wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

function updateWishlistCount() {
    var wishlist = getWishlist();
    var wishlistCountElements = document.querySelectorAll('#wishlistCount');
    wishlistCountElements.forEach(function (el) {
        el.textContent = wishlist.length;
    });
}

function isInWishlist(productId) {
    var wishlist = getWishlist();
    return wishlist.some(function (item) {
        return item.id === productId;
    });
}

function toggleWishlist(productId, productData) {
    var wishlist = getWishlist();
    var index = wishlist.findIndex(function (item) {
        return item.id === productId;
    });

    if (index > -1) {
        // Remove from wishlist
        wishlist.splice(index, 1);
        showToast('Removed from wishlist');
    } else {
        // Add to wishlist
        wishlist.push({
            id: productId,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            addedAt: new Date().toISOString()
        });
        showToast('Added to wishlist!');
    }

    saveWishlist(wishlist);

    // Update heart icon if exists
    updateWishlistIcon(productId);
}

function updateWishlistIcon(productId) {
    var heartIcons = document.querySelectorAll('[data-wishlist-id="' + productId + '"]');
    var inWishlist = isInWishlist(productId);

    heartIcons.forEach(function (icon) {
        if (inWishlist) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            icon.classList.add('text-red-500');
        } else {
            icon.classList.remove('fas', 'text-red-500');
            icon.classList.add('far');
        }
    });
}

function updateAllWishlistIcons() {
    var wishlist = getWishlist();
    wishlist.forEach(function (item) {
        updateWishlistIcon(item.id);
    });
}

// ============================================
// 5. USER AUTHENTICATION (INTEGRATED WITH ADMIN)
// ============================================
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('luxe_currentUser'));
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function isAdmin() {
    var user = getCurrentUser();
    return user && user.isAdmin === true;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('luxe_currentUser');
        showToast('Logged out successfully');
        setTimeout(function () {
            window.location.href = 'index.html';
        }, 1000);
    }
}

function updateAccountLink() {
    var accountLink = document.getElementById('accountLink');
    if (accountLink) {
        if (isLoggedIn()) {
            accountLink.href = 'profile.html';
        } else {
            accountLink.href = 'login.html';
        }
    }

    // Show/hide admin panel icon
    updateAdminPanelIcon();
}

// ============================================
// 5B. ADMIN PANEL ICON (INTEGRATED SYSTEM)
// ============================================
function updateAdminPanelIcon() {
    var adminIcon = document.getElementById('adminPanelIcon');

    if (adminIcon) {
        if (isAdmin()) {
            adminIcon.classList.remove('hidden');
        } else {
            adminIcon.classList.add('hidden');
        }
    }
}

// ============================================
// 5C. CHECK ADMIN CREDENTIALS
// ============================================
function checkAdminCredentials(email) {
    // Admin email check
    return email === 'aemade2016@gmail.com';
}

// ============================================
// 6. TOAST NOTIFICATIONS
// ============================================
function showToast(message, type) {
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    // Change color based on type
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

// ============================================
// 7. ACTIVE PAGE HIGHLIGHTING
// ============================================
function highlightActivePage() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var navLinks = document.querySelectorAll('nav a[href]');

    navLinks.forEach(function (link) {
        var href = link.getAttribute('href');

        // Remove active classes
        link.classList.remove('text-primary-500', 'font-semibold');

        // Add active class if matches current page
        if (href === currentPage ||
            (currentPage === 'index.html' && href === 'index.html') ||
            (currentPage === 'products.html' && (href === 'products.html' || href.includes('products'))) ||
            (currentPage === 'about.html' && href === 'about.html') ||
            (currentPage === 'login.html' && href === 'login.html') ||
            (currentPage === 'profile.html' && href === 'profile.html')) {
            link.classList.add('text-primary-500', 'font-semibold');
        }
    });
}

// ============================================
// 8. CART & WISHLIST AUTHENTICATION
// ============================================
function initCartAuthentication() {
    // Get all cart buttons/links
    var cartButtons = document.querySelectorAll('[href="cart.html"], #cartBtn, .cart-link');

    cartButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            var currentUser = getCurrentUser();

            if (!currentUser) {
                // Not logged in - show message and redirect to login
                showToast('Please login to view your cart', 'error');

                // Save intended destination
                sessionStorage.setItem('redirect_after_login', 'cart.html');

                // Redirect to login after short delay
                setTimeout(function () {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                // Logged in - proceed to cart
                window.location.href = 'cart.html';
            }
        });
    });
}

function initWishlistAuthentication() {
    // Get all wishlist buttons/links
    var wishlistButtons = document.querySelectorAll('[href="wishlist.html"], .wishlist-link');

    wishlistButtons.forEach(function (button) {
        button.addEventListener('click', function (e) {
            e.preventDefault();

            var currentUser = getCurrentUser();

            if (!currentUser) {
                // Not logged in - show message and redirect to login
                showToast('Please login to view your wishlist', 'error');

                // Save intended destination
                sessionStorage.setItem('redirect_after_login', 'wishlist.html');

                // Redirect to login after short delay
                setTimeout(function () {
                    window.location.href = 'login.html';
                }, 1500);
            } else {
                // Logged in - proceed to wishlist
                window.location.href = 'wishlist.html';
            }
        });
    });
}

// ============================================
// 9. INITIALIZATION
// ============================================

// Apply theme immediately (before DOMContentLoaded)
(function () {
    var currentTheme = localStorage.getItem('luxe_theme') || 'light';
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
    }
})();

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all systems
    initTheme();
    initMobileMenu();
    updateCartCount();
    updateWishlistCount();
    updateAccountLink();
    highlightActivePage();
    updateAllWishlistIcons();

    // Initialize cart and wishlist authentication
    initCartAuthentication();
    initWishlistAuthentication();

    console.log('Luxe Beauty App Initialized ✨');
});

// ============================================
// 10. UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
    return '$' + parseFloat(price).toFixed(2);
}$' + parseFloat(price).toFixed(2);
}

function formatDate(dateString) {
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function generateStars(rating) {
    var stars = '';
    for (var i = 0; i < 5; i++) {
        stars += '<i class="fas fa-star ' + (i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600') + '"></i>';
    }
    return stars;
}

// ============================================
// 11. EXPORT FOR GLOBAL USE
// ============================================
window.LuxeBeauty = {
    // Cart
    getCart: getCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    updateCartCount: updateCartCount,

    // Wishlist
    getWishlist: getWishlist,
    toggleWishlist: toggleWishlist,
    isInWishlist: isInWishlist,
    updateWishlistCount: updateWishlistCount,

    // Auth
    getCurrentUser: getCurrentUser,
    isLoggedIn: isLoggedIn,
    logout: logout,

    // UI
    showToast: showToast,

    // Utils
    formatPrice: formatPrice,
    formatDate: formatDate,
    generateStars: generateStars
};
