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

function initPasswordToggles() {
    var passwordInputs = document.querySelectorAll('input[type="password"]');

    passwordInputs.forEach(function (input) {
        if (!input || input.dataset.passwordToggleBound === 'true') return;

        var parent = input.parentElement;
        if (!parent) return;

        var existingToggle = parent.querySelector('.password-toggle-btn, [onclick*="togglePasswordVisibility"]');
        if (existingToggle) return;

        var wrapper = parent;
        if (!wrapper.classList.contains('relative')) {
            var relativeWrapper = document.createElement('div');
            relativeWrapper.className = 'relative';
            parent.insertBefore(relativeWrapper, input);
            relativeWrapper.appendChild(input);
            wrapper = relativeWrapper;
        }

        var toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'password-toggle-btn absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary-500 transition';
        toggleButton.setAttribute('aria-label', 'Show password');
        toggleButton.innerHTML = '<i class="fas fa-eye"></i>';

        toggleButton.addEventListener('click', function (event) {
            event.preventDefault();
            var icon = toggleButton.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                toggleButton.setAttribute('aria-label', 'Hide password');
                if (icon) {
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                }
            } else {
                input.type = 'password';
                toggleButton.setAttribute('aria-label', 'Show password');
                if (icon) {
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            }
        });

        wrapper.appendChild(toggleButton);
        input.dataset.passwordToggleBound = 'true';
    });
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

function requireLogin(redirectBack) {
    if (!isLoggedIn()) {
        if (redirectBack) {
            sessionStorage.setItem('loginRedirect', redirectBack);
        }
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function addToCart(productId, productData) {
    if (!requireLogin(window.location.href)) return;

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

async function getBanners() {
    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { collection, getDocs, query, orderBy } = firestoreModule;
        var { db } = configModule;

        var snapshot = await getDocs(query(collection(db, 'banners'), orderBy('createdAt', 'desc')));
        var banners = snapshot.docs.map(function (docItem) {
            return { id: docItem.id, ...docItem.data() };
        });

        localStorage.setItem('luxe_banners', JSON.stringify(banners));
        return banners;
    } catch (error) {
        console.warn('Using fallback banner data because Firestore is unavailable.', error);
        var fallbackBanners = JSON.parse(localStorage.getItem('luxe_banners') || '[]');
        if (fallbackBanners.length) {
            return fallbackBanners;
        }

        return [
            {
                id: 'fallback-banner-1',
                imageUrl: './images/slider 1.jpeg',
                targetUrl: 'products.html',
                title: 'ATTRACTIVE Fragrance Collection',
                subtitle: 'Essence of Elegance',
                badge: 'New Arrivals 2026',
                description: 'Because your scent is your invisible signature, we present the new ATTRACTIVE collection.',
                buttonText: 'Shop Now',
                gradient: 'from-primary-500 to-pink-600'
            },
            {
                id: 'fallback-banner-2',
                imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop',
                targetUrl: 'products.html',
                title: 'Up to 40% Off',
                subtitle: 'Spring Collection',
                badge: 'Limited Offer',
                description: 'Refresh your beauty routine with our exclusive spring collection.',
                buttonText: 'Shop Sale',
                gradient: 'from-pink-500 to-purple-600'
            }
        ];
    }
}

async function getReviews() {
    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { collection, getDocs, query, orderBy } = firestoreModule;
        var { db } = configModule;

        var snapshot = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
        var reviews = snapshot.docs.map(function (docItem) {
            return { id: docItem.id, ...docItem.data() };
        });

        localStorage.setItem('luxe_reviews', JSON.stringify(reviews));
        return reviews;
    } catch (error) {
        console.warn('Using fallback review data because Firestore is unavailable.', error);
        var fallbackReviews = JSON.parse(localStorage.getItem('luxe_reviews') || '[]');
        if (fallbackReviews.length) {
            return fallbackReviews;
        }

        return [
            {
                id: 'fallback-review-1',
                customerName: 'Sarah Johnson',
                profileImage: 'https://i.pravatar.cc/100?img=1',
                rating: 5,
                text: 'The Vitamin C serum transformed my skin! I noticed a visible reduction in dark spots.'
            },
            {
                id: 'fallback-review-2',
                customerName: 'Emily Chen',
                profileImage: 'https://i.pravatar.cc/100?img=5',
                rating: 5,
                text: 'Best skincare shopping experience! Fast shipping and authentic products.'
            },
            {
                id: 'fallback-review-3',
                customerName: 'Maria Garcia',
                profileImage: 'https://i.pravatar.cc/100?img=9',
                rating: 5,
                text: 'I am obsessed with their moisturizer! My dry skin has never felt so hydrated.'
            }
        ];
    }
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
        // Sign out from Firebase first, then clear localStorage
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
            .then(function (firebaseAuth) {
                return import('./firebase-config.js').then(function (config) {
                    return firebaseAuth.signOut(config.auth);
                });
            })
            .catch(function () { /* ignore if firebase not available */ })
            .finally(function () {
                localStorage.removeItem('luxe_currentUser');
                showToast('Logged out successfully');
                setTimeout(function () {
                    window.location.href = 'index.html';
                }, 1000);
            });
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
// 8. INITIALIZATION
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
    initPasswordToggles();
    updateCartCount();
    updateWishlistCount();
    updateAccountLink();
    highlightActivePage();
    updateAllWishlistIcons();

    console.log('Luxe Beauty App Initialized ✨');
});

// ============================================
// 9. UTILITY FUNCTIONS
// ============================================
function formatPrice(price) {
    return 'EGP ' + parseFloat(price).toFixed(2);
}

// ============================================
// 10. BEST SELLERS CART HANDLER
// ============================================
function addToCartBestSeller(productId) {
    // Get products from localStorage
    var products = JSON.parse(localStorage.getItem('luxe_products')) || [];
    var product = products.find(function (p) { return p.id === productId; });

    if (product) {
        addToCart(productId, {
            name: product.name,
            price: product.price,
            image: product.image
        });
    } else {
        showToast('Product not found', 'error');
    }
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
// 10. EXPORT FOR GLOBAL USE
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
    updateAccountLink: updateAccountLink,
    updateAdminPanelIcon: updateAdminPanelIcon,

    // UI
    showToast: showToast,
    updateAllWishlistIcons: updateAllWishlistIcons,

    // Dynamic content
    getBanners: getBanners,
    getReviews: getReviews,

    // Utils
    formatPrice: formatPrice,
    formatDate: formatDate,
    generateStars: generateStars
};
