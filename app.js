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
    var wishlistCountElements = document.querySelectorAll('#wishlistCount');
    if (!isLoggedIn()) {
        wishlistCountElements.forEach(function (el) {
            el.textContent = '0';
        });
        return;
    }
    var wishlist = getWishlist();
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
    if (!isLoggedIn()) {
        var isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
        showToast(isAr ? 'يجب تسجيل الدخول أولاً لحفظ المنتجات في المفضلة' : 'Please log in first to save items to your wishlist', 'error');
        sessionStorage.setItem('loginRedirect', window.location.href);
        setTimeout(function () {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        }, 1200);
        return false;
    }

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

        // 0B. WISHLIST NAVIGATION DELEGATION (LOGIN REQUIRED)
        var wishlistNavLink = event.target.closest('a[href="wishlist.html"], a[href="./wishlist.html"], [data-action="open-wishlist"]');
        if (wishlistNavLink) {
            if (!isLoggedIn()) {
                event.preventDefault();
                event.stopPropagation();
                var isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
                showToast(isAr ? 'يجب تسجيل الدخول أولاً لعرض قائمة الرغبات' : 'Please log in to view your wishlist', 'error');
                sessionStorage.setItem('loginRedirect', 'wishlist.html');
                setTimeout(function () {
                    window.location.href = 'login.html?redirect=wishlist.html';
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
        },
        socials: {
            facebook: 'https://facebook.com',
            tiktok: 'https://tiktok.com',
            instagram: 'https://instagram.com',
            whatsapp: '+201000000000'
        },
        gift: {
            enabled: true,
            minSpend: 500,
            name: { en: 'Mini Splash Khamrah', ar: 'ميني سبلاش خمرة' },
            originalPrice: 122.50,
            image: './images/slider 1.jpeg',
            timerMinutes: 30
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

        // 4. Social Media Links injection (All pages)
        const fbLinks = document.querySelectorAll('.cms-footer-social-facebook');
        fbLinks.forEach((el) => {
            const url = settings.socials?.facebook || 'https://facebook.com';
            el.href = url;
            el.target = '_blank';
            el.rel = 'noopener noreferrer';
        });

        const ttLinks = document.querySelectorAll('.cms-footer-social-tiktok');
        ttLinks.forEach((el) => {
            const url = settings.socials?.tiktok || 'https://tiktok.com';
            el.href = url;
            el.target = '_blank';
            el.rel = 'noopener noreferrer';
        });

        const igLinks = document.querySelectorAll('.cms-footer-social-instagram');
        igLinks.forEach((el) => {
            const url = settings.socials?.instagram || 'https://instagram.com';
            el.href = url;
            el.target = '_blank';
            el.rel = 'noopener noreferrer';
        });

        const waLinks = document.querySelectorAll('.cms-footer-social-whatsapp');
        waLinks.forEach((el) => {
            let rawWa = settings.socials?.whatsapp || '+201000000000';
            const cleanWa = rawWa.startsWith('http') ? rawWa : `https://wa.me/${rawWa.replace(/\D/g, '')}`;
            el.href = cleanWa;
            el.target = '_blank';
            el.rel = 'noopener noreferrer';
        });
    } catch (err) {
        console.warn('Error applying store settings CMS:', err);
    }
}

// Global Horizontal Scroll & Layout Guard (Phase 3 Core Safeguard)
function initHorizontalScrollGuard() {
    if (document.documentElement) {
        document.documentElement.classList.add('overflow-x-hidden', 'max-w-[100vw]');
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.maxWidth = '100vw';
    }
    if (document.body) {
        document.body.classList.add('overflow-x-hidden', 'max-w-[100vw]', 'w-full');
        document.body.style.overflowX = 'hidden';
        document.body.style.maxWidth = '100vw';
    }
}

// Auto-run on load and language change
document.addEventListener('DOMContentLoaded', () => {
    initHorizontalScrollGuard();
    applyStoreSettings();
    if (typeof initGiftWidget === 'function') initGiftWidget();
    if (typeof initAutoReviewSystem === 'function') initAutoReviewSystem();
    if (typeof initLiveChatSystem === 'function') initLiveChatSystem();
});

window.addEventListener('languageChanged', () => {
    applyStoreSettings();
    if (typeof updateGiftWidgetUI === 'function') updateGiftWidgetUI();
    if (typeof updateLiveChatUI === 'function') updateLiveChatUI();
});

window.addEventListener('storage', (e) => {
    if (e.key === 'luxe_settings' || e.key === 'luxe_settings_updated') {
        applyStoreSettings();
        if (typeof updateGiftWidgetUI === 'function') updateGiftWidgetUI();
    }
    if (e.key === 'luxe_cart') {
        if (typeof updateGiftWidgetUI === 'function') updateGiftWidgetUI();
    }
    if (e.key === 'luxe_orders' || e.key === 'luxe_orders_updated') {
        if (typeof initAutoReviewSystem === 'function') initAutoReviewSystem();
    }
    if (e.key === 'luxe_chats' || e.key === 'luxe_chats_updated') {
        if (typeof updateLiveChatUI === 'function') updateLiveChatUI();
    }
});

window.addEventListener('settings-updated', () => {
    applyStoreSettings();
    if (typeof updateGiftWidgetUI === 'function') updateGiftWidgetUI();
});

window.addEventListener('cart-updated', () => {
    if (typeof updateGiftWidgetUI === 'function') updateGiftWidgetUI();
});

window.addEventListener('orders-updated', () => {
    if (typeof initAutoReviewSystem === 'function') initAutoReviewSystem();
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

    // Gift Widget (Phase 4)
    initGiftWidget: initGiftWidget,
    toggleGiftWidget: toggleGiftWidget,
    updateGiftWidgetUI: updateGiftWidgetUI,
    claimFreeGift: claimFreeGift,

    // Utils
    formatPrice: formatPrice,
    formatDate: formatDate,
    generateStars: generateStars
};

// ============================================
// 11. FLOATING GIFT WIDGET SYSTEM (PHASE 4 - CRO REVENUE BOOSTER)
// ============================================
let _giftCountdownInterval = null;

function initGiftWidget() {
    // Avoid rendering on admin dashboard
    if (window.location.pathname.includes('admin-dashboard') || document.body.classList.contains('admin-dashboard')) {
        return;
    }

    let container = document.getElementById('floatingGiftWidgetContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'floatingGiftWidgetContainer';
        container.className = 'fixed bottom-6 left-6 z-40 select-none font-sans max-w-[calc(100vw-2rem)]';
        container.innerHTML = `
            <!-- Gift Popup Card Modal -->
            <div id="giftWidgetCard" class="hidden mb-3 w-[330px] sm:w-[360px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-3xl border border-pink-100 dark:border-slate-800 shadow-2xl p-5 transition-all duration-300 transform origin-bottom-left">
                <!-- Offer Countdown Banner (Cyan Pill matching screenshot) -->
                <div class="bg-[#e0f7fa] dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800/60 rounded-xl py-2 px-3 text-center mb-3.5">
                    <span id="giftWidgetCountdown" class="text-xs sm:text-sm font-semibold text-cyan-900 dark:text-cyan-200 tracking-wide font-sans">
                        Offer ends in: 29 : 53
                    </span>
                </div>

                <!-- Card Heading -->
                <h3 id="giftWidgetHeading" class="text-sm sm:text-base font-bold text-gray-900 dark:text-white mb-3 text-left rtl:text-right leading-snug">
                    Your free gift is waiting - Shop now!
                </h3>

                <!-- Progress Bar Container with Milestone Gift Badge -->
                <div class="mb-4">
                    <div class="flex items-center gap-2 mb-1.5">
                        <div class="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div id="giftWidgetProgressBar" class="h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all duration-500" style="width: 0%;"></div>
                        </div>
                        <!-- Milestone Circular Gift Icon -->
                        <div id="giftWidgetMilestoneBadge" class="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 text-gray-400 flex items-center justify-center shrink-0 transition-all">
                            <i id="giftWidgetMilestoneIcon" class="fas fa-gift text-xs"></i>
                        </div>
                    </div>
                    <div class="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                        <span id="giftWidgetProgressSpend">EGP 0 / 500</span>
                        <span id="giftWidgetProgressRemaining">Add EGP 500 to unlock</span>
                    </div>
                </div>

                <!-- Gift Item Preview Box -->
                <div class="border border-pink-100/80 dark:border-slate-800 rounded-2xl p-2.5 bg-pink-50/20 dark:bg-slate-800/40 flex items-center justify-between gap-3 mb-4">
                    <div class="flex items-center gap-3 min-w-0">
                        <div class="w-14 h-14 rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 shrink-0">
                            <img id="giftWidgetImg" src="./images/slider 1.jpeg" alt="Free Gift" class="w-full h-full object-cover">
                        </div>
                        <div class="min-w-0">
                            <h4 id="giftWidgetTitle" class="text-xs font-bold text-gray-900 dark:text-white truncate">Mini Splash Khamrah</h4>
                            <div class="flex items-baseline gap-2 mt-0.5">
                                <span class="text-rose-600 dark:text-rose-400 font-bold text-sm">LE 0.00</span>
                                <span id="giftWidgetOldPrice" class="line-through text-gray-400 text-xs">LE 122.50</span>
                            </div>
                        </div>
                    </div>
                    <!-- Navigation Arrows matching reference screenshot -->
                    <div class="flex items-center gap-1 shrink-0">
                        <button type="button" class="w-6 h-6 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 hover:text-pink-500 transition text-[9px]" title="Previous">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button type="button" class="w-6 h-6 rounded-lg border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-400 hover:text-pink-500 transition text-[9px]" title="Next">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <!-- Action Button Container -->
                <div id="giftWidgetActionContainer"></div>
            </div>

            <!-- Floating Trigger Button (Bottom Left Circle) -->
            <button id="giftWidgetTriggerBtn" type="button" onclick="window.toggleGiftWidget()" 
                class="w-14 h-14 bg-gray-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative border border-gray-700 focus:outline-none"
                aria-label="Toggle Free Gift Widget">
                <i id="giftWidgetTriggerIcon" class="fas fa-gift text-pink-400 text-xl"></i>
                <!-- Red Notification Badge 1 -->
                <span class="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">1</span>
            </button>
        `;
        document.body.appendChild(container);
    }

    // Restore state if previously opened in session
    const wasOpen = sessionStorage.getItem('gift_widget_open') === 'true';
    const card = document.getElementById('giftWidgetCard');
    const icon = document.getElementById('giftWidgetTriggerIcon');
    if (wasOpen && card && icon) {
        card.classList.remove('hidden');
        icon.className = 'fas fa-times text-white text-xl';
    }

    startGiftWidgetCountdown();
    updateGiftWidgetUI();
}

function toggleGiftWidget() {
    const card = document.getElementById('giftWidgetCard');
    const icon = document.getElementById('giftWidgetTriggerIcon');
    if (!card) return;

    const isHidden = card.classList.contains('hidden');
    if (isHidden) {
        card.classList.remove('hidden');
        if (icon) icon.className = 'fas fa-times text-white text-xl';
        sessionStorage.setItem('gift_widget_open', 'true');
        updateGiftWidgetUI();
    } else {
        card.classList.add('hidden');
        if (icon) icon.className = 'fas fa-gift text-pink-400 text-xl';
        sessionStorage.setItem('gift_widget_open', 'false');
    }
}

function startGiftWidgetCountdown() {
    if (_giftCountdownInterval) clearInterval(_giftCountdownInterval);

    // Initial countdown value (default 29 mins 53 secs = 1793 seconds as in reference screenshot)
    let secondsLeft = parseInt(sessionStorage.getItem('gift_widget_timer_sec'), 10);
    if (!secondsLeft || isNaN(secondsLeft) || secondsLeft <= 0) {
        secondsLeft = 1793;
        sessionStorage.setItem('gift_widget_timer_sec', secondsLeft);
    }

    const timerEl = document.getElementById('giftWidgetCountdown');
    const renderTimer = () => {
        if (!timerEl) return;
        const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
        const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
        const ss = String(secondsLeft % 60).padStart(2, '0');
        timerEl.textContent = isAr ? `ينتهي العرض خلال: ${mm} : ${ss}` : `Offer ends in: ${mm} : ${ss}`;
    };

    renderTimer();

    _giftCountdownInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft <= 0) {
            secondsLeft = 1800; // Reset loop
        }
        sessionStorage.setItem('gift_widget_timer_sec', secondsLeft);
        renderTimer();
    }, 1000);
}

async function updateGiftWidgetUI() {
    const container = document.getElementById('floatingGiftWidgetContainer');
    if (!container) return;

    let settings = {};
    try {
        settings = await getStoreSettings();
    } catch (e) {
        settings = {};
    }

    const gift = settings.gift || {
        enabled: true,
        minSpend: 500,
        name: { en: 'Mini Splash Khamrah', ar: 'ميني سبلاش خمرة' },
        originalPrice: 122.50,
        image: './images/slider 1.jpeg',
        timerMinutes: 30
    };

    // If disabled by Admin, hide widget completely
    if (gift.enabled === false) {
        container.style.display = 'none';
        return;
    } else {
        container.style.display = 'block';
    }

    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    const giftTitle = (typeof gift.name === 'object') ? ((isAr ? gift.name.ar : gift.name.en) || gift.name.en || gift.name.ar || 'Mini Splash Khamrah') : String(gift.name || 'Mini Splash Khamrah');
    const minSpend = Number(gift.minSpend) || 500;
    const origPrice = Number(gift.originalPrice) || 122.50;
    const giftImage = gift.image || './images/slider 1.jpeg';

    // Update Image & Title & Price in widget
    const titleEl = document.getElementById('giftWidgetTitle');
    const imgEl = document.getElementById('giftWidgetImg');
    const oldPriceEl = document.getElementById('giftWidgetOldPrice');
    if (titleEl) titleEl.textContent = giftTitle;
    if (imgEl) imgEl.src = giftImage;
    if (oldPriceEl) oldPriceEl.textContent = isAr ? `${origPrice.toFixed(2)} ج.م` : `LE ${origPrice.toFixed(2)}`;

    // Compute cart total excluding gifts
    const cart = getCart();
    const cartTotal = cart
        .filter((item) => !item.isGift)
        .reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1)), 0);

    const isUnlocked = cartTotal >= minSpend;
    const pct = Math.min(Math.round((cartTotal / minSpend) * 100), 100);

    // Update Progress Bar
    const barEl = document.getElementById('giftWidgetProgressBar');
    const milestoneBadge = document.getElementById('giftWidgetMilestoneBadge');
    const milestoneIcon = document.getElementById('giftWidgetMilestoneIcon');
    const spendEl = document.getElementById('giftWidgetProgressSpend');
    const remainingEl = document.getElementById('giftWidgetProgressRemaining');
    const headingEl = document.getElementById('giftWidgetHeading');
    const actionContainer = document.getElementById('giftWidgetActionContainer');

    if (barEl) {
        barEl.style.width = pct + '%';
        if (isUnlocked) {
            barEl.className = 'h-full bg-emerald-500 rounded-full transition-all duration-500';
        } else {
            barEl.className = 'h-full bg-teal-600 dark:bg-teal-400 rounded-full transition-all duration-500';
        }
    }

    if (spendEl) {
        spendEl.textContent = isAr ? `${cartTotal.toFixed(2)} / ${minSpend} ج.م` : `EGP ${cartTotal.toFixed(2)} / ${minSpend}`;
    }

    const hasGiftInCart = cart.some((i) => i.isGift || i.id === 'free-gift-promo');

    if (isUnlocked) {
        if (milestoneBadge) {
            milestoneBadge.className = 'w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center shrink-0 shadow-sm animate-pulse';
        }
        if (milestoneIcon) milestoneIcon.className = 'fas fa-check text-xs';
        if (headingEl) {
            headingEl.textContent = isAr ? '🎉 مبروك! هديتك المجانية جاهزة للاستلام!' : '🎉 Congratulations! Your free gift is unlocked!';
        }
        if (remainingEl) {
            remainingEl.textContent = isAr ? 'تم تحقيق الحد الأدنى للهدية!' : 'Gift requirement unlocked!';
            remainingEl.className = 'text-emerald-600 dark:text-emerald-400 font-bold';
        }

        if (actionContainer) {
            if (hasGiftInCart) {
                actionContainer.innerHTML = `
                    <a href="cart.html" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-4 rounded-full text-xs font-bold transition shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2">
                        <i class="fas fa-check-circle"></i>
                        <span>${isAr ? '✓ الهدية مضافة في سلة التسوق - عرض السلة' : '✓ Gift in Shopping Bag - View Bag'}</span>
                    </a>
                `;
            } else {
                actionContainer.innerHTML = `
                    <button type="button" onclick="window.claimFreeGift()" class="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white py-2.5 px-4 rounded-full text-xs font-bold transition shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 animate-bounce">
                        <i class="fas fa-gift"></i>
                        <span>${isAr ? '🎁 أضف الهدية المجانية إلى السلة الآن' : '🎁 Claim Your Free Gift Now'}</span>
                    </button>
                `;
            }
        }
    } else {
        const remaining = minSpend - cartTotal;
        if (milestoneBadge) {
            milestoneBadge.className = 'w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 border-2 border-gray-300 dark:border-slate-600 text-gray-400 flex items-center justify-center shrink-0';
        }
        if (milestoneIcon) milestoneIcon.className = 'fas fa-gift text-xs';
        if (headingEl) {
            headingEl.textContent = isAr ? 'هديتك المجانية في انتظارك - تسوقي الآن!' : 'Your free gift is waiting - Shop now!';
        }
        if (remainingEl) {
            remainingEl.textContent = isAr ? `أضف ${remaining.toFixed(2)} ج.م للفتح` : `Add EGP ${remaining.toFixed(2)} to unlock`;
            remainingEl.className = 'text-pink-600 dark:text-pink-400 font-bold';
        }

        if (actionContainer) {
            actionContainer.innerHTML = `
                <a href="products.html" class="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:bg-pink-600 text-white py-2.5 px-4 rounded-full text-xs font-bold transition shadow-md shadow-pink-500/25 flex items-center justify-center gap-2">
                    <span>${isAr ? 'تسوق الآن للحصول على الهدية' : 'Shop Now to Unlock'}</span>
                    <i class="fas fa-arrow-right text-[10px] rtl:rotate-180"></i>
                </a>
            `;
        }
    }
}

async function claimFreeGift() {
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    let settings = {};
    try {
        settings = await getStoreSettings();
    } catch (e) {
        settings = {};
    }

    const gift = settings.gift || {
        enabled: true,
        minSpend: 500,
        name: { en: 'Mini Splash Khamrah', ar: 'ميني سبلاش خمرة' },
        originalPrice: 122.50,
        image: './images/slider 1.jpeg'
    };

    const minSpend = Number(gift.minSpend) || 500;
    let cart = getCart();
    const cartTotal = cart
        .filter((item) => !item.isGift)
        .reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1)), 0);

    if (cartTotal < minSpend) {
        const diff = minSpend - cartTotal;
        showToast(isAr ? `يرجى إضافة منتجات بقيمة ${diff.toFixed(2)} ج.م أخرى أولاً` : `Please add EGP ${diff.toFixed(2)} more to qualify for the gift`, 'error');
        return;
    }

    const alreadyInCart = cart.some((i) => i.isGift || i.id === 'free-gift-promo');
    if (alreadyInCart) {
        showToast(isAr ? 'الهدية مضافة بالفعل في حقيبة التسوق!' : 'Gift is already in your shopping bag!', 'success');
        return;
    }

    const giftTitle = (typeof gift.name === 'object') ? ((isAr ? gift.name.ar : gift.name.en) || gift.name.en || gift.name.ar || 'Mini Splash Khamrah') : String(gift.name || 'Mini Splash Khamrah');

    const giftItem = {
        id: 'free-gift-promo',
        name: giftTitle,
        price: 0,
        originalPrice: Number(gift.originalPrice) || 122.50,
        image: gift.image || './images/slider 1.jpeg',
        quantity: 1,
        category: 'Free Gift',
        isGift: true
    };

    cart.push(giftItem);
    saveCart(cart);
    updateGiftWidgetUI();

    showToast(isAr ? '🎉 مبروك! تمت إضافة هديتك المجانية إلى السلة بقيمة 0.00 ج.م!' : '🎉 Congratulations! Your free gift was added to your bag!');
}

// Expose on window for direct HTML onclick access
window.initGiftWidget = initGiftWidget;
window.toggleGiftWidget = toggleGiftWidget;
window.updateGiftWidgetUI = updateGiftWidgetUI;
window.claimFreeGift = claimFreeGift;

// ============================================
// 12. AUTO-REVIEW SYSTEM (PHASE 5 - POST-DELIVERY CRO FEEDBACK)
// ============================================
let _pendingReviewOrder = null;
let _selectedReviewRating = 5;

async function initAutoReviewSystem() {
    // Avoid running on admin dashboard
    if (window.location.pathname.includes('admin-dashboard') || document.body.classList.contains('admin-dashboard')) {
        return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.email) return;

    const userEmail = String(currentUser.email).toLowerCase();

    // 1. Search in local orders first
    let localOrders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
    let candidate = localOrders.find((o) => 
        (String(o.userId || '').toLowerCase() === userEmail || String(o.customerInfo?.email || '').toLowerCase() === userEmail) &&
        (o.status === 'delivered' || o.status === 'completed') &&
        !o.isRated
    );

    // 2. Also search in Firestore orders if not found locally
    if (!candidate) {
        try {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            const configModule = await import('./firebase-config.js');
            const { collection, getDocs, query, where } = firestoreModule;
            const { db } = configModule;

            const q = query(
                collection(db, 'orders'),
                where('status', '==', 'delivered')
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const fsOrders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
                candidate = fsOrders.find((o) => 
                    (String(o.userId || '').toLowerCase() === userEmail || String(o.customerInfo?.email || '').toLowerCase() === userEmail) &&
                    !o.isRated
                );
            }
        } catch (e) {
            console.warn('Auto review Firestore check notice:', e);
        }
    }

    if (!candidate) return;

    // Check if dismissed in this session
    if (sessionStorage.getItem('dismissed_review_' + candidate.orderId)) return;

    _pendingReviewOrder = candidate;
    _selectedReviewRating = 5;
    renderAutoReviewModal(candidate);
}

function renderAutoReviewModal(order) {
    let modal = document.getElementById('autoReviewModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'autoReviewModal';
        modal.className = 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300';
        document.body.appendChild(modal);
    }

    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    const items = order.items || [];
    const itemsPreviewHtml = items.slice(0, 3).map((item) => `
        <div class="flex items-center gap-2.5 p-2 bg-pink-50/50 dark:bg-slate-800/60 rounded-2xl border border-pink-100/60 dark:border-slate-700">
            <img src="${item.image || './images/slider 1.jpeg'}" alt="${item.name}" class="w-10 h-10 rounded-xl object-cover border border-pink-100 dark:border-slate-700 shrink-0">
            <div class="min-w-0 flex-1 text-left rtl:text-right">
                <p class="text-xs font-bold text-gray-900 dark:text-white truncate">${item.name}</p>
                <p class="text-[10px] text-gray-400 font-mono">${isAr ? 'الكمية: ' : 'Qty: '}${item.quantity || 1}</p>
            </div>
        </div>
    `).join('');

    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-pink-100 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-7 relative overflow-hidden transform animate-fade-in text-left rtl:text-right">
            <!-- Ambient Glow -->
            <div class="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-2xl pointer-events-none"></div>

            <div class="text-center mb-5">
                <div class="w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-300 text-white rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg shadow-amber-400/25">
                    <i class="fas fa-star animate-pulse"></i>
                </div>
                <h3 class="text-lg sm:text-xl font-display font-bold text-gray-900 dark:text-white mb-1">
                    ${isAr ? 'تهانينا على استلام طلبيتك! 🌟' : 'Congratulations on receiving your order! 🌟'}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                    ${isAr ? `طلبك رقم <span class="font-mono font-bold text-pink-600">${order.orderId}</span> تم تسليمه بنجاح. رأيك يساعدنا على التطوير المستمر!` : `Your order <span class="font-mono font-bold text-pink-600">${order.orderId}</span> was delivered. Please share your rating!`}
                </p>
            </div>

            <!-- Delivered Items Preview -->
            <div class="space-y-2 mb-4 max-h-32 overflow-y-auto">
                ${itemsPreviewHtml}
            </div>

            <!-- Interactive Star Rating -->
            <div class="text-center mb-4 bg-pink-50/30 dark:bg-slate-800/40 p-4 rounded-2xl border border-pink-100/50 dark:border-slate-700/60">
                <p class="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ${isAr ? 'ما هو تقييمك للمنتجات وسرعة التوصيل؟' : 'How was the product quality and delivery?'}
                </p>
                <div id="reviewStarsContainer" class="flex justify-center items-center gap-2 text-2xl text-yellow-400 mb-2">
                    <i class="fas fa-star cursor-pointer hover:scale-125 transition" data-star="1" onclick="window.setReviewRating(1)"></i>
                    <i class="fas fa-star cursor-pointer hover:scale-125 transition" data-star="2" onclick="window.setReviewRating(2)"></i>
                    <i class="fas fa-star cursor-pointer hover:scale-125 transition" data-star="3" onclick="window.setReviewRating(3)"></i>
                    <i class="fas fa-star cursor-pointer hover:scale-125 transition" data-star="4" onclick="window.setReviewRating(4)"></i>
                    <i class="fas fa-star cursor-pointer hover:scale-125 transition" data-star="5" onclick="window.setReviewRating(5)"></i>
                </div>
                <p id="reviewRatingLabel" class="text-xs font-bold text-pink-600 dark:text-pink-400">
                    ${isAr ? 'ممتاز ورائع جداً! 🌟🌟🌟🌟🌟' : 'Excellent & Luxurious! 🌟🌟🌟🌟🌟'}
                </p>
            </div>

            <!-- Comment Feedback Input -->
            <div class="mb-5">
                <label for="autoReviewComment" class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    ${isAr ? 'تعليقك وتقييمك للمنتج (اختياري):' : 'Your feedback comment (optional):'}
                </label>
                <textarea id="autoReviewComment" rows="3" placeholder="${isAr ? 'أخبرنا برأيك في جودة التركيبة، التغليف، وتجربة الاستخدام...' : 'Share your experience with product formulation and packaging...'}"
                    class="w-full px-3.5 py-2.5 rounded-2xl border border-pink-100 dark:border-slate-700 bg-pink-50/20 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-400 outline-none resize-none font-sans"></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2.5">
                <button type="button" onclick="window.submitAutoReview()"
                    class="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white py-3 px-5 rounded-full font-bold text-xs transition shadow-lg shadow-pink-500/25 flex items-center justify-center gap-1.5">
                    <i class="fas fa-check-circle"></i>
                    <span>${isAr ? 'إرسال التقييم واعتماد الطلب' : 'Submit Review'}</span>
                </button>
                <button type="button" onclick="window.dismissAutoReviewModal()"
                    class="px-4 py-3 rounded-full text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
                    ${isAr ? 'لاحقاً' : 'Later'}
                </button>
            </div>
        </div>
    `;
    modal.classList.remove('hidden');
    updateReviewStarsUI(5);
}

function setReviewRating(rating) {
    _selectedReviewRating = rating;
    updateReviewStarsUI(rating);
}

function updateReviewStarsUI(rating) {
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    const stars = document.querySelectorAll('#reviewStarsContainer i');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.className = 'fas fa-star cursor-pointer hover:scale-125 transition text-yellow-400';
        } else {
            star.className = 'far fa-star cursor-pointer hover:scale-125 transition text-gray-300 dark:text-gray-600';
        }
    });

    const label = document.getElementById('reviewRatingLabel');
    if (!label) return;
    const labelsAr = [
        'يحتاج إلى تحسين 😞',
        'مقبول 😐',
        'جيد 🙂',
        'جيد جداً! 💖',
        'ممتاز ورائع جداً! 🌟🌟🌟🌟🌟'
    ];
    const labelsEn = [
        'Needs Improvement 😞',
        'Fair 😐',
        'Good 🙂',
        'Very Good! 💖',
        'Excellent & Luxurious! 🌟🌟🌟🌟🌟'
    ];
    label.textContent = (isAr ? labelsAr : labelsEn)[rating - 1] || '';
}

function dismissAutoReviewModal() {
    const modal = document.getElementById('autoReviewModal');
    if (modal) modal.classList.add('hidden');
    if (_pendingReviewOrder) {
        sessionStorage.setItem('dismissed_review_' + _pendingReviewOrder.orderId, 'true');
    }
}

async function submitAutoReview() {
    if (!_pendingReviewOrder) return;
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    const commentEl = document.getElementById('autoReviewComment');
    const comment = commentEl ? commentEl.value.trim() : '';
    const currentUser = getCurrentUser() || {};

    const reviewId = 'rev_' + Date.now();
    const reviewData = {
        id: reviewId,
        orderId: _pendingReviewOrder.orderId,
        userId: currentUser.email || _pendingReviewOrder.userId || '',
        userName: currentUser.name || _pendingReviewOrder.customerInfo?.name || 'Client',
        author: currentUser.name || _pendingReviewOrder.customerInfo?.name || 'Client',
        rating: _selectedReviewRating,
        comment: comment || (isAr ? 'منتجات ممتازة وتجربة تسوق رائعة جداً!' : 'Excellent formulation and smooth delivery!'),
        quote: comment || (isAr ? 'منتجات ممتازة وتجربة تسوق رائعة جداً!' : 'Excellent formulation and smooth delivery!'),
        productName: _pendingReviewOrder.items?.map((i) => i.name).join(', ') || 'Koko Shop Formulation',
        productId: _pendingReviewOrder.items?.[0]?.productId || '',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'approved',
        verifiedPurchase: true
    };

    // 1. Save to local reviews
    let reviews = JSON.parse(localStorage.getItem('luxe_reviews') || '[]');
    reviews.unshift(reviewData);
    localStorage.setItem('luxe_reviews', JSON.stringify(reviews));

    // 2. Mark local order as rated
    let localOrders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
    const ordIdx = localOrders.findIndex((o) => o.orderId === _pendingReviewOrder.orderId);
    if (ordIdx > -1) {
        localOrders[ordIdx].isRated = true;
        localOrders[ordIdx].rating = _selectedReviewRating;
        localOrders[ordIdx].reviewText = reviewData.comment;
        localOrders[ordIdx].ratedAt = new Date().toISOString();
        localStorage.setItem('luxe_orders', JSON.stringify(localOrders));
    }

    // 3. Sync to Firestore collection 'reviews' and update 'orders'
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc } = firestoreModule;
        const { db } = configModule;

        await setDoc(doc(db, 'reviews', reviewId), reviewData, { merge: true });
        await setDoc(doc(db, 'orders', _pendingReviewOrder.orderId), {
            isRated: true,
            rating: _selectedReviewRating,
            reviewText: reviewData.comment,
            ratedAt: new Date().toISOString()
        }, { merge: true });
    } catch (err) {
        console.warn('Auto review Firestore submit notice:', err);
    }

    sessionStorage.setItem('dismissed_review_' + _pendingReviewOrder.orderId, 'true');

    const modal = document.getElementById('autoReviewModal');
    if (modal) modal.classList.add('hidden');

    showToast(isAr ? '🎉 شكراً جزيلاً لتقييمك الرائع! تم حفظ التقييم بنجاح.' : '🎉 Thank you for your review! Saved successfully.');
    window.dispatchEvent(new CustomEvent('reviews-updated'));
}

// ============================================
// 13. LIVE CHAT SYSTEM (PHASE 5 - MATCHING REFERENCE IMAGE 2)
// ============================================
let _chatId = null;
let _chatUnsubscribe = null;
let _chatMessagesCache = [];
let _isChatExpanded = false;

function getChatGuestId() {
    let guestId = localStorage.getItem('koko_chat_guest_id');
    if (!guestId) {
        guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('koko_chat_guest_id', guestId);
    }
    return guestId;
}

function getActiveChatId() {
    const user = getCurrentUser();
    if (user && user.email) {
        return 'chat_' + String(user.email).replace(/[^a-zA-Z0-9]/g, '_');
    }
    return 'chat_' + getChatGuestId();
}

function initLiveChatSystem() {
    // Avoid rendering in admin dashboard
    if (window.location.pathname.includes('admin-dashboard') || document.body.classList.contains('admin-dashboard')) {
        return;
    }

    _chatId = getActiveChatId();

    let container = document.getElementById('floatingLiveChatContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'floatingLiveChatContainer';
        container.className = 'fixed bottom-6 right-6 z-40 select-none font-sans max-w-[calc(100vw-2rem)]';
        container.innerHTML = `
            <!-- Live Chat Modal Card (Matches Reference Screenshot 2) -->
            <div id="liveChatModalCard" class="hidden mb-3 w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 rounded-3xl border border-pink-100 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right">
                
                <!-- Top Bar Header -->
                <div class="p-3.5 border-b border-pink-50 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                    <!-- Purple Brand Pill matching reference image -->
                    <div class="bg-[#5c4cf4] text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-indigo-500/20">
                        <span>متابعة باستخدام shop</span>
                    </div>

                    <!-- Right Controls (Expand & Minimize) -->
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="window.toggleChatExpand()" 
                            class="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-slate-700 text-gray-500 hover:text-pink-600 transition flex items-center justify-center text-[10px]" 
                            title="Expand / Resize">
                            <i class="fas fa-up-right-and-down-left-from-center"></i>
                        </button>
                        <button type="button" onclick="window.toggleLiveChat()" 
                            class="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 text-gray-500 hover:text-rose-600 transition flex items-center justify-center text-[10px]" 
                            title="Close / Minimize">
                            <i class="fas fa-minus"></i>
                        </button>
                    </div>
                </div>

                <!-- Chat Body Area -->
                <div id="liveChatBody" class="flex-1 overflow-y-auto p-4 flex flex-col bg-gradient-to-b from-white via-pink-50/10 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
                    
                    <!-- Welcome Hero State (Overlapping Floating Cards & Text from Image 2) -->
                    <div id="liveChatWelcomeView" class="flex flex-col my-auto space-y-4">
                        
                        <!-- 3D Overlapping Product Showcase Cards -->
                        <div class="relative h-28 flex items-center justify-center mb-1">
                            <!-- Card 2: Argan Conditioner (Behind / Angled) -->
                            <div class="absolute right-8 top-1 bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-2 shadow-lg w-28 text-center transform rotate-6 hover:rotate-0 transition duration-300">
                                <div class="w-12 h-14 mx-auto overflow-hidden rounded-lg mb-1 bg-pink-50 dark:bg-slate-700">
                                    <img src="./images/slider 2.jpeg" alt="Argan Conditioner" class="w-full h-full object-cover">
                                </div>
                                <p class="text-[9px] font-bold text-gray-800 dark:text-gray-200 truncate">Argan Conditioner</p>
                            </div>
                            <!-- Card 1: Oud Body Splash (Front / Aligned) -->
                            <div class="absolute left-8 top-0 bg-white dark:bg-slate-800 border border-pink-100 dark:border-slate-700 rounded-2xl p-2 shadow-xl w-28 text-center transform -rotate-3 hover:rotate-0 transition duration-300 z-10">
                                <div class="w-12 h-14 mx-auto overflow-hidden rounded-lg mb-1 bg-pink-50 dark:bg-slate-700">
                                    <img src="./images/slider 1.jpeg" alt="Oud Body Splash" class="w-full h-full object-cover">
                                </div>
                                <p class="text-[9px] font-bold text-gray-800 dark:text-gray-200 truncate">Oud Body Splash</p>
                            </div>
                        </div>

                        <!-- Welcome Text in Arabic matching Screenshot 2 -->
                        <div class="text-right" dir="rtl">
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1.5 font-display">
                                مرحبًا!
                            </h3>
                            <p class="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-sans">
                                يمكنك طرح أسئلة حول التسوق، أو المقاسات/الأبعاد، أو الشحن، أو المرتجعات، أو حالة الطلب.
                            </p>
                        </div>

                        <!-- Privacy notice from screenshot 2 -->
                        <p class="text-[10px] text-gray-400 text-right leading-tight" dir="rtl">
                            من أجل تقديم الخدمات وتحسينها. رسائلك مرئية لـ Koko Shop.
                        </p>

                        <!-- Quick suggestion pills -->
                        <div class="flex items-center gap-1.5 flex-wrap justify-end" dir="rtl">
                            <button type="button" onclick="window.sendQuickMessage('تتبع طلبي')" 
                                class="bg-gray-50 dark:bg-slate-800 hover:bg-pink-100 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold transition shadow-xs">
                                تتبع طلبي
                            </button>
                            <button type="button" onclick="window.sendQuickMessage('الشحن والتوصيل')" 
                                class="bg-gray-50 dark:bg-slate-800 hover:bg-pink-100 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold transition shadow-xs">
                                الشحن والتوصيل
                            </button>
                            <button type="button" onclick="window.sendQuickMessage('استشارة المنتجات')" 
                                class="bg-gray-50 dark:bg-slate-800 hover:bg-pink-100 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 px-3 py-1.5 rounded-full text-xs font-semibold transition shadow-xs">
                                استشارة المنتجات
                            </button>
                        </div>
                    </div>

                    <!-- Conversation Messages List (Rendered dynamically) -->
                    <div id="liveChatMessagesList" class="hidden flex-col space-y-3 pt-2"></div>
                </div>

                <!-- Bottom Input Bar (Matches Pill Border in Image 2) -->
                <div class="p-3 bg-white dark:bg-slate-900 border-t border-pink-50 dark:border-slate-800 shrink-0">
                    <form id="liveChatForm" onsubmit="window.sendCustomerChatMessage(event)" class="relative flex items-center">
                        <div class="w-full flex items-center bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-pink-400 focus-within:border-pink-400 transition">
                            <!-- Paperclip icon button on left (or right based on RTL) -->
                            <button type="button" onclick="window.simulateChatAttachment()" 
                                class="text-gray-400 hover:text-pink-500 w-7 h-7 flex items-center justify-center transition shrink-0" 
                                title="Attach photo or order slip">
                                <i class="fas fa-paperclip text-sm"></i>
                            </button>

                            <!-- Text Input -->
                            <input type="text" id="liveChatInput" placeholder="...اسأل عن أي شيء" dir="rtl"
                                class="flex-1 bg-transparent px-2 text-xs text-gray-900 dark:text-white outline-none font-sans">

                            <!-- Send Button -->
                            <button type="submit" 
                                class="w-8 h-8 rounded-full bg-pink-500 hover:bg-pink-600 text-white flex items-center justify-center transition shadow-sm shrink-0" 
                                title="Send Message">
                                <i class="fas fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Floating Trigger Button (Bottom Right Circle) -->
            <button id="liveChatTriggerBtn" type="button" onclick="window.toggleLiveChat()" 
                class="w-14 h-14 bg-gradient-to-tr from-slate-900 to-indigo-950 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative border border-slate-700 focus:outline-none"
                aria-label="Toggle Live Chat">
                <i id="liveChatTriggerIcon" class="fas fa-comment-dots text-pink-400 text-xl"></i>
                <!-- Red Notification Badge -->
                <span id="liveChatUnreadBadge" class="hidden absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">1</span>
            </button>
        `;
        document.body.appendChild(container);
    }

    // Connect to Firestore real-time listener for current chat
    listenToCurrentChat();
}

function toggleLiveChat() {
    const card = document.getElementById('liveChatModalCard');
    const icon = document.getElementById('liveChatTriggerIcon');
    const badge = document.getElementById('liveChatUnreadBadge');
    if (!card) return;

    const isHidden = card.classList.contains('hidden');
    if (isHidden) {
        card.classList.remove('hidden');
        if (icon) icon.className = 'fas fa-times text-white text-xl';
        if (badge) badge.classList.add('hidden');
        const input = document.getElementById('liveChatInput');
        if (input) setTimeout(() => input.focus(), 150);
        markChatReadByCustomer();
    } else {
        card.classList.add('hidden');
        if (icon) icon.className = 'fas fa-comment-dots text-pink-400 text-xl';
    }
}

function toggleChatExpand() {
    const card = document.getElementById('liveChatModalCard');
    if (!card) return;
    _isChatExpanded = !_isChatExpanded;
    if (_isChatExpanded) {
        card.classList.remove('w-[340px]', 'sm:w-[380px]', 'h-[520px]');
        card.classList.add('w-[350px]', 'sm:w-[480px]', 'h-[620px]');
    } else {
        card.classList.remove('w-[350px]', 'sm:w-[480px]', 'h-[620px]');
        card.classList.add('w-[340px]', 'sm:w-[380px]', 'h-[520px]');
    }
}

function simulateChatAttachment() {
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    showToast(isAr ? 'تم إرفاق لقطة الشاشة مع رسالتك' : 'Attachment added to message');
}

async function listenToCurrentChat() {
    _chatId = getActiveChatId();
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, onSnapshot } = firestoreModule;
        const { db } = configModule;

        if (_chatUnsubscribe) _chatUnsubscribe();

        _chatUnsubscribe = onSnapshot(doc(db, 'chats', _chatId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                _chatMessagesCache = data.messages || [];
                renderLiveChatMessages(_chatMessagesCache);

                // If unread by customer and modal closed, show notification badge
                const modal = document.getElementById('liveChatModalCard');
                const badge = document.getElementById('liveChatUnreadBadge');
                if (data.unreadByCustomer && modal && modal.classList.contains('hidden') && badge) {
                    badge.classList.remove('hidden');
                }
            }
        }, (err) => {
            console.warn('Live chat Firestore listener notice:', err);
        });
    } catch (err) {
        console.warn('Live chat Firestore connect fallback:', err);
    }
}

function renderLiveChatMessages(messages) {
    const welcomeView = document.getElementById('liveChatWelcomeView');
    const messagesList = document.getElementById('liveChatMessagesList');
    const body = document.getElementById('liveChatBody');
    if (!messagesList) return;

    if (!messages || messages.length === 0) {
        if (welcomeView) welcomeView.classList.remove('hidden');
        messagesList.classList.add('hidden');
        return;
    }

    if (welcomeView) welcomeView.classList.add('hidden');
    messagesList.classList.remove('hidden');

    messagesList.innerHTML = messages.map((msg) => {
        const isCustomer = msg.sender === 'customer';
        const time = msg.timestamp ? formatChatTime(msg.timestamp) : '';
        const senderLabel = isCustomer ? 'أنت' : (msg.senderName || 'Koko Concierge');

        if (isCustomer) {
            return `
                <div class="flex flex-col items-start" dir="rtl">
                    <div class="text-[9px] text-gray-400 mb-1 flex items-center gap-1 font-mono">
                        <span class="font-bold text-pink-600">${senderLabel}</span>
                        <span>${time}</span>
                    </div>
                    <div class="max-w-[85%] bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-xs shadow-md text-xs leading-relaxed font-sans">
                        ${escapeChatHtml(msg.text)}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-end" dir="rtl">
                    <div class="text-[9px] text-gray-400 mb-1 flex items-center gap-1.5 font-mono">
                        <span>${time}</span>
                        <span class="font-bold text-gray-700 dark:text-gray-300">${senderLabel}</span>
                    </div>
                    <div class="max-w-[85%] bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-sm border border-pink-100 dark:border-slate-700 text-xs leading-relaxed font-sans">
                        ${escapeChatHtml(msg.text)}
                    </div>
                </div>
            `;
        }
    }).join('');

    if (body) body.scrollTop = body.scrollHeight;
}

async function sendCustomerChatMessage(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('liveChatInput');
    if (!input || !input.value.trim()) return;

    const text = input.value.trim();
    input.value = '';

    await dispatchChatMessage(text);
}

async function sendQuickMessage(text) {
    await dispatchChatMessage(text);
}

async function dispatchChatMessage(text) {
    const user = getCurrentUser() || {};
    _chatId = getActiveChatId();

    const newMsg = {
        id: 'msg_' + Date.now(),
        sender: 'customer',
        senderName: user.name || 'عميل المتجر',
        text: text,
        timestamp: new Date().toISOString()
    };

    _chatMessagesCache.push(newMsg);
    renderLiveChatMessages(_chatMessagesCache);

    // Save locally
    let localChats = JSON.parse(localStorage.getItem('luxe_chats') || '[]');
    let chatIndex = localChats.findIndex((c) => c.id === _chatId);
    let chatObj = chatIndex > -1 ? localChats[chatIndex] : {
        id: _chatId,
        customerEmail: user.email || '',
        customerName: user.name || 'عميل المتجر',
        messages: []
    };
    chatObj.messages = chatObj.messages || [];
    chatObj.messages.push(newMsg);
    chatObj.lastMessage = text;
    chatObj.lastSender = 'customer';
    chatObj.unreadByAdmin = true;
    chatObj.unreadByCustomer = false;
    chatObj.status = 'open';
    chatObj.updatedAt = new Date().toISOString();

    if (chatIndex > -1) {
        localChats[chatIndex] = chatObj;
    } else {
        localChats.unshift(chatObj);
    }
    localStorage.setItem('luxe_chats', JSON.stringify(localChats));
    localStorage.setItem('luxe_chats_updated', Date.now());

    // Sync to Firestore
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, arrayUnion } = firestoreModule;
        const { db } = configModule;

        await setDoc(doc(db, 'chats', _chatId), {
            id: _chatId,
            customerEmail: user.email || '',
            customerName: user.name || 'عميل المتجر',
            lastMessage: text,
            lastSender: 'customer',
            unreadByAdmin: true,
            unreadByCustomer: false,
            status: 'open',
            updatedAt: new Date().toISOString(),
            messages: arrayUnion(newMsg)
        }, { merge: true });
    } catch (err) {
        console.warn('Live chat customer send Firestore fallback:', err);
    }

    // Automated smart assistant response for quick pills
    triggerSmartAssistantReply(text);
}

function triggerSmartAssistantReply(customerText) {
    const textLower = customerText.toLowerCase().trim();
    let autoReply = '';

    if (textLower.includes('تتبع طلبي') || textLower.includes('track')) {
        const user = getCurrentUser();
        const localOrders = JSON.parse(localStorage.getItem('luxe_orders') || '[]');
        const userOrders = localOrders.filter((o) => user && (o.userId === user.email || o.customerInfo?.email === user.email));

        if (userOrders.length > 0) {
            const latest = userOrders[userOrders.length - 1];
            const statusMap = {
                pending: 'قيد المراجعة والتجهيز 📦',
                processing: 'جاري تحضير التركيبة المعملية ✨',
                delivered: 'تم التوصيل بنجاح 🎉',
                cancelled: 'ملغي ❌'
            };
            const statusAr = statusMap[latest.status] || latest.status;
            autoReply = `أهلاً بك! آخر طلب مسجل لك برقم #${latest.orderId} بقيمة ${Number(latest.pricing?.total || 0).toFixed(2)} ج.م، وحالته الحالية: (${statusAr}).`;
        } else {
            autoReply = 'أهلاً بك في كوكو شوب! لتتبع شحنتك فوراً، يرجى تزويدنا برقم الطلب (مثال: ORD-...) وسيقوم فريق الدعم بالتحقق منه لحظياً.';
        }
    } else if (textLower.includes('الشحن') || textLower.includes('توصيل') || textLower.includes('shipping')) {
        autoReply = 'الشحن والتوصيل يستغرق من 2 إلى 4 أيام عمل لكافة المحافظات المصرية. والتوصيل مجاني تماماً للطلبات التي تتجاوز 500 ج.م 🚚✨';
    } else if (textLower.includes('استشارة') || textLower.includes('منتجات') || textLower.includes('product')) {
        autoReply = 'فريقنا الطبي والجمالي جاهز لمساعدتك في اختيار التركيبة الأنسب لنوع بشرتك واحتياجاتك! تفضل بسؤالك وسنجيبك فوراً.';
    }

    if (autoReply) {
        setTimeout(async () => {
            const botMsg = {
                id: 'msg_bot_' + Date.now(),
                sender: 'admin',
                senderName: 'Koko Bot / المساعد الذكي',
                text: autoReply,
                timestamp: new Date().toISOString()
            };

            _chatMessagesCache.push(botMsg);
            renderLiveChatMessages(_chatMessagesCache);

            // Sync to Firestore & local
            try {
                const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
                const configModule = await import('./firebase-config.js');
                const { doc, setDoc, arrayUnion } = firestoreModule;
                const { db } = configModule;

                await setDoc(doc(db, 'chats', _chatId), {
                    lastMessage: autoReply,
                    lastSender: 'admin',
                    unreadByCustomer: false,
                    updatedAt: new Date().toISOString(),
                    messages: arrayUnion(botMsg)
                }, { merge: true });
            } catch (e) {}
        }, 800);
    }
}

async function markChatReadByCustomer() {
    _chatId = getActiveChatId();
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, updateDoc } = firestoreModule;
        const { db } = configModule;
        await updateDoc(doc(db, 'chats', _chatId), {
            unreadByCustomer: false
        });
    } catch (e) {}
}

function updateLiveChatUI() {
    listenToCurrentChat();
}

function formatChatTime(isoString) {
    try {
        const d = new Date(isoString);
        return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
}

function escapeChatHtml(unsafe) {
    return String(unsafe || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Global window exposure
window.initAutoReviewSystem = initAutoReviewSystem;
window.setReviewRating = setReviewRating;
window.dismissAutoReviewModal = dismissAutoReviewModal;
window.submitAutoReview = submitAutoReview;

window.initLiveChatSystem = initLiveChatSystem;
window.toggleLiveChat = toggleLiveChat;
window.toggleChatExpand = toggleChatExpand;
window.simulateChatAttachment = simulateChatAttachment;
window.sendCustomerChatMessage = sendCustomerChatMessage;
window.sendQuickMessage = sendQuickMessage;
window.updateLiveChatUI = updateLiveChatUI;

// Update window.LuxeBeauty
if (window.LuxeBeauty) {
    window.LuxeBeauty.initAutoReviewSystem = initAutoReviewSystem;
    window.LuxeBeauty.submitAutoReview = submitAutoReview;
    window.LuxeBeauty.initLiveChatSystem = initLiveChatSystem;
    window.LuxeBeauty.toggleLiveChat = toggleLiveChat;
}
