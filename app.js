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
// 2. MOBILE MENU (Robust Event Delegation)
// ============================================
function initMobileMenu() {
    if (window._mobileMenuInitialized) return;
    window._mobileMenuInitialized = true;

    document.addEventListener('click', function (e) {
        var toggleBtn = e.target.closest('#mobileMenuBtn, [data-action="toggle-mobile-menu"]');
        var mobileMenu = document.getElementById('mobileMenu');

        if (toggleBtn) {
            e.preventDefault();
            e.stopPropagation();
            if (mobileMenu) {
                var isHidden = mobileMenu.classList.contains('hidden');
                var icon = toggleBtn.querySelector('i');
                if (isHidden) {
                    mobileMenu.classList.remove('hidden');
                    if (icon) {
                        icon.classList.remove('fa-bars');
                        icon.classList.add('fa-xmark');
                    }
                } else {
                    mobileMenu.classList.add('hidden');
                    if (icon) {
                        icon.classList.remove('fa-xmark');
                        icon.classList.add('fa-bars');
                    }
                }
            }
            return;
        }

        // Close menu if user clicks outside of mobileMenu or clicks any nav link inside it
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            var clickedInsideMenu = mobileMenu.contains(e.target);
            var clickedNavLink = e.target.closest('#mobileMenu a');
            if (!clickedInsideMenu || clickedNavLink) {
                mobileMenu.classList.add('hidden');
                var btn = document.getElementById('mobileMenuBtn');
                var icon = btn ? btn.querySelector('i') : null;
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        }
    });
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
    try {
        return JSON.parse(localStorage.getItem('luxe_cart')) || [];
    } catch (e) {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
    updateCartCount();
    try {
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { cart: cart } }));
    } catch (e) {}
}

function updateCartCount() {
    var cartCountElements = document.querySelectorAll('#cartCount');
    if (!isLoggedIn()) {
        cartCountElements.forEach(function (el) {
            el.textContent = '0';
        });
        return;
    }
    var cart = getCart();
    var totalUnits = cart.reduce(function (sum, item) {
        return sum + (parseInt(item.quantity, 10) || 1);
    }, 0);
    cartCountElements.forEach(function (el) {
        el.textContent = totalUnits;
    });
}

function requireLogin(redirectBack) {
    if (!isLoggedIn()) {
        var isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
        showToast(isAr ? 'يرجى تسجيل الدخول أولاً للمتابعة' : 'Please log in to continue', 'error');
        var target = redirectBack || window.location.href;
        sessionStorage.setItem('loginRedirect', target);
        setTimeout(function () {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(target);
        }, 1200);
        return false;
    }
    return true;
}

let _lastCartAction = { id: null, time: 0 };
function addToCart(productId, productData) {
    if (!isLoggedIn()) {
        var isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
        showToast(isAr ? 'يجب تسجيل الدخول أولاً لإضافة منتجات إلى السلة' : 'Please log in first to add items to your cart', 'error');
        sessionStorage.setItem('loginRedirect', window.location.href);
        setTimeout(function () {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        }, 1200);
        return false;
    }

    if (!productId && (!productData || !productData.id)) return;

    var targetId = String(productId || (productData && productData.id));
    var now = Date.now();
    if (_lastCartAction.id === targetId && (now - _lastCartAction.time) < 400) {
        return; // debounce duplicate triggers
    }
    _lastCartAction = { id: targetId, time: now };

    // Resolve product details if missing
    if (!productData || !productData.name) {
        try {
            var prods = (window.products && Array.isArray(window.products) && window.products.length) ? window.products :
                        (window.appProducts && Array.isArray(window.appProducts) && window.appProducts.length) ? window.appProducts :
                        (JSON.parse(localStorage.getItem('luxe_products') || 'null') || (window.defaultLuxeProducts || []));
            var found = prods.find(function (p) { return String(p.id) === targetId; });
            if (found) {
                productData = {
                    name: found.name,
                    price: Number(found.salePrice || found.price || 0),
                    image: found.image || './images/slider 1.jpeg'
                };
            }
        } catch (e) {
            console.warn('Error resolving product data for cart:', e);
        }
    }

    var cart = getCart();

    // Check if product already in cart
    var existingItem = cart.find(function (item) {
        return String(item.id) === targetId;
    });

    if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity, 10) || 1) + 1;
    } else {
        cart.push({
            id: targetId,
            name: productData ? productData.name : 'Botanical Ritual',
            price: productData ? Number(productData.price || 0) : 0,
            image: productData ? (productData.image || './images/slider 1.jpeg') : './images/slider 1.jpeg',
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }

    saveCart(cart);
    var isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    var prodName = (productData && productData.name) ? productData.name : (isAr ? 'المنتج' : 'Product');
    showToast(isAr ? `تمت إضافة "${prodName}" إلى حقيبة التسوق ✨` : `"${prodName}" added to cart!`);
}

function removeFromCart(productId) {
    var targetId = String(productId);
    var cart = getCart();
    cart = cart.filter(function (item) {
        return String(item.id) !== targetId;
    });
    saveCart(cart);
    var isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    showToast(isAr ? 'تم حذف المنتج من حقيبة التسوق' : 'Item removed from cart');
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
    var targetId = String(productId);
    var wishlist = getWishlist();
    return wishlist.some(function (item) {
        return String(item.id) === targetId;
    });
}

let _lastWishlistAction = { id: null, time: 0 };
function toggleWishlist(productId, productData) {
    if (!productId && (!productData || !productData.id)) return;

    var targetId = String(productId || (productData && productData.id));
    var now = Date.now();
    if (_lastWishlistAction.id === targetId && (now - _lastWishlistAction.time) < 400) {
        return; // debounce duplicate calls
    }
    _lastWishlistAction = { id: targetId, time: now };

    // Resolve product details if missing
    if (!productData || !productData.name) {
        try {
            var prods = (window.products && Array.isArray(window.products) && window.products.length) ? window.products :
                        (window.appProducts && Array.isArray(window.appProducts) && window.appProducts.length) ? window.appProducts :
                        (JSON.parse(localStorage.getItem('luxe_products') || 'null') || (window.defaultLuxeProducts || []));
            var found = prods.find(function (p) { return String(p.id) === targetId; });
            if (found) {
                productData = {
                    name: found.name,
                    price: Number(found.salePrice || found.price || 0),
                    image: found.image || './images/slider 1.jpeg'
                };
            }
        } catch (e) {
            console.warn('Error resolving product data for wishlist:', e);
        }
    }

    var wishlist = getWishlist();
    var index = wishlist.findIndex(function (item) {
        return String(item.id) === targetId;
    });

    var isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    if (index > -1) {
        // Remove from wishlist
        wishlist.splice(index, 1);
        showToast(isAr ? 'تم الحذف من قائمة الرغبات' : 'Removed from wishlist');
    } else {
        // Add to wishlist
        wishlist.push({
            id: targetId,
            name: productData ? productData.name : 'Botanical Ritual',
            price: productData ? Number(productData.price || 0) : 0,
            image: productData ? (productData.image || './images/slider 1.jpeg') : './images/slider 1.jpeg',
            addedAt: new Date().toISOString()
        });
        showToast(isAr ? 'تمت الإضافة إلى قائمة الرغبات ✨' : 'Added to wishlist!');
    }

    saveWishlist(wishlist);

    // Update heart icon if exists
    updateWishlistIcon(targetId);
}

function updateWishlistIcon(productId) {
    var targetId = String(productId);
    var heartIcons = document.querySelectorAll('[data-wishlist-id="' + targetId + '"]');
    var inWishlist = isInWishlist(targetId);

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
// 4B. GLOBAL EVENT DELEGATION (Dynamic HTML Support)
// ============================================
function initGlobalCartAndWishlistDelegation() {
    if (window._cartWishlistDelegationInitialized) return;
    window._cartWishlistDelegationInitialized = true;

    document.addEventListener('click', function (event) {
        // 0. CART NAVIGATION DELEGATION (LOGIN REQUIRED)
        var cartNavLink = event.target.closest('a[href="cart.html"], a[href="./cart.html"], [data-action="open-cart"]');
        if (cartNavLink) {
            if (!isLoggedIn()) {
                event.preventDefault();
                event.stopPropagation();
                var isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
                showToast(isAr ? 'يجب تسجيل الدخول أولاً لعرض سلة المشتريات' : 'Please log in to view your shopping cart', 'error');
                sessionStorage.setItem('loginRedirect', 'cart.html');
                setTimeout(function () {
                    window.location.href = 'login.html?redirect=cart.html';
                }, 1200);
                return;
            }
        }

        // 1. ADD TO CART DELEGATION
        var cartBtn = event.target.closest('[data-action="add-to-cart"], .add-to-cart-btn, [data-cart-id], button.btn-add-to-cart');
        if (cartBtn) {
            var rawId = cartBtn.dataset.productId || cartBtn.dataset.cartId || cartBtn.dataset.id;
            var productId = rawId;
            if (!productId) {
                var card = cartBtn.closest('[data-product-id], .product-card');
                if (card) productId = card.dataset.productId || card.dataset.id;
            }

            if (productId) {
                var targetId = String(productId);
                var prods = (window.products && Array.isArray(window.products) && window.products.length) ? window.products :
                            (window.appProducts && Array.isArray(window.appProducts) && window.appProducts.length) ? window.appProducts :
                            (JSON.parse(localStorage.getItem('luxe_products') || 'null') || (window.defaultLuxeProducts || []));
                var product = prods.find(function (p) { return String(p.id) === targetId; });

                if (product) {
                    addToCart(targetId, {
                        name: product.name,
                        price: Number(product.salePrice || product.price || 0),
                        image: product.image
                    });
                } else {
                    var card = cartBtn.closest('.product-card') || cartBtn.parentElement;
                    var name = card ? (card.querySelector('h3, .product-title')?.textContent?.trim() || 'Botanical Ritual') : 'Botanical Ritual';
                    var priceText = card ? (card.querySelector('.text-pink-600, .product-price')?.textContent || '0') : '0';
                    var price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
                    var img = card ? (card.querySelector('img')?.getAttribute('src') || './images/slider 1.jpeg') : './images/slider 1.jpeg';
                    addToCart(targetId, { name: name, price: price, image: img });
                }
            }
            return;
        }

        // 2. WISHLIST DELEGATION
        var wishlistBtn = event.target.closest('[data-action="toggle-wishlist"], .wishlist-btn, [data-wishlist-id], button.btn-wishlist');
        if (wishlistBtn) {
            var rawId = wishlistBtn.dataset.productId || wishlistBtn.dataset.wishlistId || wishlistBtn.dataset.id;
            var wishlistId = rawId;
            if (!wishlistId) {
                var icon = wishlistBtn.querySelector('[data-wishlist-id]');
                if (icon) wishlistId = icon.dataset.wishlistId;
                if (!wishlistId) {
                    var card = wishlistBtn.closest('[data-product-id], .product-card');
                    if (card) wishlistId = card.dataset.productId || card.dataset.id;
                }
            }

            if (wishlistId) {
                var targetId = String(wishlistId);
                var prods = (window.products && Array.isArray(window.products) && window.products.length) ? window.products :
                            (window.appProducts && Array.isArray(window.appProducts) && window.appProducts.length) ? window.appProducts :
                            (JSON.parse(localStorage.getItem('luxe_products') || 'null') || (window.defaultLuxeProducts || []));
                var product = prods.find(function (p) { return String(p.id) === targetId; });

                if (product) {
                    toggleWishlist(targetId, {
                        name: product.name,
                        price: Number(product.salePrice || product.price || 0),
                        image: product.image
                    });
                } else {
                    var card = wishlistBtn.closest('.product-card') || wishlistBtn.parentElement;
                    var name = card ? (card.querySelector('h3, .product-title')?.textContent?.trim() || 'Botanical Ritual') : 'Botanical Ritual';
                    var priceText = card ? (card.querySelector('.text-pink-600, .product-price')?.textContent || '0') : '0';
                    var price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
                    var img = card ? (card.querySelector('img')?.getAttribute('src') || './images/slider 1.jpeg') : './images/slider 1.jpeg';
                    toggleWishlist(targetId, { name: name, price: price, image: img });
                }
            }
            return;
        }
    });
}

async function getCategories() {
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { collection, getDocs, query, orderBy } = firestoreModule;
        const { db } = configModule;

        const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('createdAt', 'asc')));
        if (!snapshot.empty) {
            const categories = snapshot.docs.map((docItem) => {
                const data = docItem.data();
                return {
                    id: docItem.id,
                    ...data,
                    name: typeof data.name === 'object'
                        ? data.name
                        : { en: data.name || '', ar: data.nameAr || window.i18n?.translateText?.(data.name) || data.name || '' },
                    image: data.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
                };
            });
            localStorage.setItem('luxe_categories', JSON.stringify(categories));
            return categories;
        }
    } catch (error) {
        console.warn('Using local categories cache because Firestore is unavailable:', error);
    }

    try {
        const stored = JSON.parse(localStorage.getItem('luxe_categories')) || [];
        if (stored.length) {
            return stored.map((cat) => ({
                ...cat,
                name: typeof cat.name === 'object'
                    ? cat.name
                    : { en: cat.name || cat, ar: window.i18n?.translateText?.(cat.name || cat) || cat.name || cat }
            }));
        }
    } catch (e) {}

    const defaultCategories = [
        { id: 'cat-1', name: { en: 'Serum', ar: 'سيروم' }, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop' },
        { id: 'cat-2', name: { en: 'Moisturizer', ar: 'مرطب' }, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop' },
        { id: 'cat-3', name: { en: 'Cleanser', ar: 'غسول' }, image: 'https://images.unsplash.com/photo-1556228722-d0b71946892f?w=800&h=600&fit=crop' },
        { id: 'cat-4', name: { en: 'Sunscreen', ar: 'واقي شمس' }, image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&h=600&fit=crop' },
        { id: 'cat-5', name: { en: 'Mask', ar: 'قناع' }, image: 'https://images.unsplash.com/photo-1567928804479-f4175374fce9?w=800&h=600&fit=crop' },
        { id: 'cat-6', name: { en: 'Toner', ar: 'تونر' }, image: 'https://images.unsplash.com/photo-1608248597359-54d6a6a246d8?w=800&h=600&fit=crop' }
    ];

    localStorage.setItem('luxe_categories', JSON.stringify(defaultCategories));
    return defaultCategories;
}

async function getBanners() {
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { collection, getDocs, query, orderBy } = firestoreModule;
        const { db } = configModule;

        const snapshot = await getDocs(query(collection(db, 'banners'), orderBy('createdAt', 'desc')));
        if (!snapshot.empty) {
            const banners = snapshot.docs.map((docItem) => {
                const data = docItem.data();
                return {
                    id: docItem.id,
                    ...data,
                    badge: typeof data.badge === 'object' ? data.badge : { en: data.badge || 'Featured Ritual', ar: data.badgeAr || 'طقس مميز' },
                    title: typeof data.title === 'object' ? data.title : { en: data.title || '', ar: data.titleAr || data.title || '' },
                    subtitle: typeof data.subtitle === 'object' ? data.subtitle : { en: data.subtitle || '', ar: data.subtitleAr || data.subtitle || '' },
                    description: typeof data.description === 'object' ? data.description : { en: data.description || '', ar: data.descriptionAr || data.description || '' },
                    buttonText: typeof data.buttonText === 'object' ? data.buttonText : { en: data.buttonText || 'Shop Now', ar: data.buttonTextAr || 'تسوق الآن' },
                    imageUrl: data.imageUrl || data.image || './images/slider 1.jpeg',
                    targetUrl: data.targetUrl || 'products.html'
                };
            });

            localStorage.setItem('luxe_banners', JSON.stringify(banners));
            return banners;
        }
    } catch (error) {
        console.warn('Using fallback banner data because Firestore is unavailable.', error);
    }

    try {
        const fallbackBanners = JSON.parse(localStorage.getItem('luxe_banners') || '[]');
        if (fallbackBanners.length) {
            return fallbackBanners.map((b) => ({
                ...b,
                badge: typeof b.badge === 'object' ? b.badge : { en: b.badge || 'Featured Ritual', ar: 'طقس مميز' },
                title: typeof b.title === 'object' ? b.title : { en: b.title || '', ar: window.i18n?.translateText?.(b.title) || b.title || '' },
                subtitle: typeof b.subtitle === 'object' ? b.subtitle : { en: b.subtitle || '', ar: window.i18n?.translateText?.(b.subtitle) || b.subtitle || '' },
                description: typeof b.description === 'object' ? b.description : { en: b.description || '', ar: window.i18n?.translateText?.(b.description) || b.description || '' },
                buttonText: typeof b.buttonText === 'object' ? b.buttonText : { en: b.buttonText || 'Shop Now', ar: 'تسوق الآن' },
                imageUrl: b.imageUrl || b.image || './images/slider 1.jpeg',
                targetUrl: b.targetUrl || 'products.html'
            }));
        }
    } catch (e) {}

    const defaultBanners = [
        {
            id: 'fallback-banner-1',
            badge: { en: "Botanical Clinical '26", ar: "إطلاق نباتي سريري 2026" },
            title: { en: "Reveal Your Skin's", ar: "أعيدي لبشرتكِ" },
            subtitle: { en: "Natural Radiance", ar: "إشراقتها الطبيعية" },
            description: { en: "Formulated with cold-pressed antioxidants and skin-identical ceramides.", ar: "مستخلصات نباتية مضغوطة على البارد لبشرة صحية ومشرقة." },
            buttonText: { en: "Shop Clean Collection", ar: "تسوق التشكيلة النظيفة" },
            imageUrl: './images/slider 1.jpeg',
            targetUrl: 'products.html'
        },
        {
            id: 'fallback-banner-2',
            badge: { en: "Limited Offer", ar: "عرض لفترة محدودة" },
            title: { en: "Up to 40% Off", ar: "خصم يصل إلى 40%" },
            subtitle: { en: "Spring Collection", ar: "تشكيلة الربيع" },
            description: { en: "Refresh your beauty routine with our exclusive spring collection.", ar: "جددي روتين جمالك مع تشكيلة الربيع الحصرية." },
            buttonText: { en: "Shop Sale", ar: "تسوق العروض" },
            imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop',
            targetUrl: 'products.html'
        }
    ];

    localStorage.setItem('luxe_banners', JSON.stringify(defaultBanners));
    return defaultBanners;
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
// STORE SETTINGS & LIVE CMS ENGINE
// ============================================
async function getStoreSettings() {
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, getDoc } = firestoreModule;
        const { db } = configModule;

        const docSnap = await getDoc(doc(db, 'settings', 'general'));
        if (docSnap.exists()) {
            const data = docSnap.data();
            localStorage.setItem('luxe_settings', JSON.stringify(data));
            return data;
        }
    } catch (e) {
        console.warn('Live settings fetch notice (using cache):', e);
    }

    try {
        const stored = JSON.parse(localStorage.getItem('luxe_settings'));
        if (stored) return stored;
    } catch (e) {}

    return {
        storeName: 'Koko Shop',
        supportEmail: 'concierge@kokoshop.com',
        supportPhone: '+20 100 000 0000',
        freeShippingThreshold: 500,
        homepage: {
            philosophyBadge: { en: 'The Clean Philosophy', ar: 'فلسفة النقاء والجمال' },
            philosophyTitle: { en: 'Nourish Your Skin With Pure Botanical Actives', ar: 'غذّي بشرتكِ بخلاصات نباتية نقية وفعالة' },
            philosophyDesc: { en: 'We believe transformative skincare should never compromise purity. Every formula is crafted with scientifically proven botanicals, cold-pressed antioxidants, and skin-identical bio-lipids.', ar: 'نؤمن بأن العناية الفائقة بالبشرة لا تساوم على النقاء أبداً. كل تركيبة مصممة بعناية فائقة من مستخلصات نباتية مثبتة ومضادات أكسدة مضغوطة على البارد.' },
            featuredTitle: { en: 'Featured Creations', ar: 'إبداعاتنا المختارة' }
        },
        aboutPage: {
            heroTitle: { en: 'Where Botanical Wisdom Meets Clinical Formulation', ar: 'حيث تلتقي حكمة الطبيعة بالعلوم السريرية الحديثة' },
            heroDesc: { en: 'Founded on the belief that healthy skin radiance is cultivated through bio-compatible nourishment rather than harsh interventions.', ar: 'تأسسنا على يقين بأن إشراقة البشرة الصحية تنبع من التغذية الحيوية المتوافقة مع خلاياها بعيداً عن المكونات القاسية.' },
            storyDesc: { en: 'Koko Shop was conceived out of a passion to bridge the gap between clinical potency and gentle botanical harmony. Our laboratory isolates potent plant actives, cold-pressed seed oils, and skin-identical ceramides.', ar: 'انطلقت كوكو شوب من شغف حقيقي للجمع بين الفاعلية السريرية والتناغم النباتي اللطيف. يعمل مختبرنا على استخلاص أنقى الزيوت والسيراميدات لتقوية حاجز البشرة وحمايته.' }
        },
        footer: {
            about: { en: 'Clean botanical clinical formulations crafted for discerning skincare rituals. Certified non-comedogenic and cruelty-free.', ar: 'تركيبات نباتية علاجية ونقية مصممة لطقوس العناية الفاخرة بالبشرة. معتمدة طبياً وخالية من القسوة.' },
            copyright: { en: '© 2026 Koko Shop. All botanical clinical formulations preserved.', ar: '© 2026 كوكو شوب. جميع التركيبات النباتية والسريرية محفوظة ومحمية.' }
        }
    };
}

async function applyStoreSettings() {
    try {
        const settings = await getStoreSettings();
        if (!settings) return;

        const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
        const resolveText = (field, fallback = '') => {
            if (!field) return fallback;
            if (typeof field === 'object') {
                return (isAr ? field.ar : field.en) || field.en || field.ar || fallback;
            }
            return String(field);
        };

        // 1. Homepage CMS injection (index.html)
        const philBadge = document.getElementById('cmsPhilosophyBadge');
        if (philBadge && settings.homepage?.philosophyBadge) {
            philBadge.textContent = resolveText(settings.homepage.philosophyBadge, philBadge.textContent);
        }

        const philTitle = document.getElementById('cmsPhilosophyTitle');
        if (philTitle && settings.homepage?.philosophyTitle) {
            philTitle.innerHTML = isAr
                ? resolveText(settings.homepage.philosophyTitle)
                : `${resolveText(settings.homepage.philosophyTitle)} <br><span class="font-display italic font-normal text-pink-500">Pure Botanical Actives</span>`;
        }

        const philDesc = document.getElementById('cmsPhilosophyDesc');
        if (philDesc && settings.homepage?.philosophyDesc) {
            philDesc.textContent = resolveText(settings.homepage.philosophyDesc, philDesc.textContent);
        }

        const featTitle = document.getElementById('cmsFeaturedTitle');
        if (featTitle && settings.homepage?.featuredTitle) {
            featTitle.innerHTML = isAr
                ? resolveText(settings.homepage.featuredTitle)
                : `Featured <span class="font-display italic font-normal text-pink-500">Creations</span>`;
        }

        // 2. About Page CMS injection (about.html)
        const abHeroTitle = document.getElementById('cmsAboutHeroTitle');
        if (abHeroTitle && settings.aboutPage?.heroTitle) {
            abHeroTitle.innerHTML = isAr
                ? resolveText(settings.aboutPage.heroTitle)
                : `Where Botanical Wisdom Meets <br class="hidden sm:inline"><span class="font-display italic font-normal text-pink-500">Clinical Formulation</span>`;
        }

        const abHeroDesc = document.getElementById('cmsAboutHeroDesc');
        if (abHeroDesc && settings.aboutPage?.heroDesc) {
            abHeroDesc.textContent = resolveText(settings.aboutPage.heroDesc, abHeroDesc.textContent);
        }

        const abStoryDesc = document.getElementById('cmsAboutStoryDesc');
        if (abStoryDesc && settings.aboutPage?.storyDesc) {
            abStoryDesc.textContent = resolveText(settings.aboutPage.storyDesc, abStoryDesc.textContent);
        }

        // 3. Footer CMS injection (All pages)
        const footerAbout = document.querySelectorAll('.cms-footer-about, #cmsFooterAbout');
        footerAbout.forEach((el) => {
            if (settings.footer?.about) {
                el.textContent = resolveText(settings.footer.about, el.textContent);
            }
        });

        const footerCopyright = document.querySelectorAll('.cms-footer-copyright, #cmsFooterCopyright');
        footerCopyright.forEach((el) => {
            if (settings.footer?.copyright) {
                el.textContent = resolveText(settings.footer.copyright, el.textContent);
            }
        });

        const footerEmail = document.querySelectorAll('.cms-footer-email, #cmsFooterEmail');
        footerEmail.forEach((el) => {
            if (settings.supportEmail) {
                el.textContent = settings.supportEmail;
                if (el.tagName === 'A') el.href = `mailto:${settings.supportEmail}`;
            }
        });
    } catch (err) {
        console.warn('Error applying store settings CMS:', err);
    }
}

// Auto-run on load and language change
document.addEventListener('DOMContentLoaded', () => {
    applyStoreSettings();
});

window.addEventListener('languageChanged', () => {
    applyStoreSettings();
});

// ============================================
// 5. USER AUTHENTICATION (INTEGRATED WITH ADMIN)
// ============================================
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('luxe_currentUser') || 'null');
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function isAdmin() {
    var user = getCurrentUser();
    return user && (user.isAdmin === true || user.email === 'aemade2016@gmail.com');
}

function logout() {
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    const confirmMsg = isAr ? 'هل أنتِ متأكدة من رغبتكِ في تسجيل الخروج؟' : 'Are you sure you want to logout?';
    if (confirm(confirmMsg)) {
        // Sign out from Firebase first, then clear localStorage
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
            .then(function (firebaseAuth) {
                return import('./firebase-config.js').then(function (config) {
                    return firebaseAuth.signOut(config.auth);
                });
            })
            .catch(function () { /* ignore if firebase not available */ })
            .finally(function () {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('luxe_currentUser');
                sessionStorage.clear();
                showToast(isAr ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
                setTimeout(function () {
                    window.location.href = 'index.html';
                }, 800);
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
window.showToast = function (message, type) {
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

function highlightActivePage() {
    var rawPage = window.location.pathname.split('/').pop() || 'index.html';
    var currentPage = rawPage.split('?')[0].split('#')[0] || 'index.html';
    var currentSearch = window.location.search || '';
    var navLinks = document.querySelectorAll('header nav a[href], #mobileMenu a[href]');

    navLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (!href) return;

        var isMobile = !!link.closest('#mobileMenu');
        var linkPage = href.split('?')[0].split('#')[0];
        var linkSearch = href.includes('?') ? '?' + href.split('?')[1].split('#')[0] : '';

        var isActive = false;
        if (linkSearch) {
            isActive = (linkPage === currentPage && linkSearch === currentSearch);
        } else {
            isActive = (linkPage === currentPage && !currentSearch);
        }

        if (isActive) {
            if (isMobile) {
                link.classList.remove('text-gray-700', 'dark:text-gray-200');
                link.classList.add('text-pink-500', 'font-semibold');
            } else {
                link.classList.remove('hover:text-pink-500');
                link.classList.add('text-pink-500', 'font-semibold', 'border-b-2', 'border-pink-500', 'pb-0.5');
            }
        } else {
            if (isMobile) {
                link.classList.remove('text-pink-500', 'font-semibold');
                link.classList.add('text-gray-700', 'dark:text-gray-200');
            } else {
                link.classList.remove('text-pink-500', 'font-semibold', 'border-b-2', 'border-pink-500', 'pb-0.5');
                link.classList.add('hover:text-pink-500');
            }
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
    initGlobalCartAndWishlistDelegation();
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
    if (typeof window.formatLocalizedPrice === 'function') {
        return window.formatLocalizedPrice(price);
    }
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    return isAr ? `${parseFloat(price).toFixed(2)} ج.م` : `EGP ${parseFloat(price).toFixed(2)}`;
}

// ============================================
// 10. BEST SELLERS CART HANDLER
// ============================================
function addToCartBestSeller(productId) {
    var targetId = String(productId);
    var products = JSON.parse(localStorage.getItem('luxe_products')) || (window.defaultLuxeProducts || []);
    var product = products.find(function (p) { return String(p.id) === targetId; });

    if (product) {
        addToCart(targetId, {
            name: product.name,
            price: Number(product.salePrice || product.price || 0),
            image: product.image
        });
    } else {
        addToCart(targetId);
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

window.generateStars = function (rating) {
    var stars = '';
    for (var i = 0; i < 5; i++) {
        stars += '<i class="fas fa-star ' + (i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600') + '"></i>';
    }
    return stars;
};

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
    initMobileMenu: initMobileMenu,
    initGlobalCartAndWishlistDelegation: initGlobalCartAndWishlistDelegation,

    // Dynamic content
    getCategories: getCategories,
    getBanners: getBanners,
    getReviews: getReviews,
    getStoreSettings: getStoreSettings,
    applyStoreSettings: applyStoreSettings,

    // Utils
    formatPrice: formatPrice,
    formatDate: formatDate,
    generateStars: generateStars
};
