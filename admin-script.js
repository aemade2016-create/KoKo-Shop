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
        hasDiscount: details.savings > 0 && details.discountPercent > 0,
        image: product.image || './images/slider 1.jpeg',
        barcode: product.barcode || ''
    };
};

// Retrieve Collections from LocalStorage
const getProducts = () => {
    try {
        let products = JSON.parse(localStorage.getItem('luxe_products')) || [];
        if (!products.length && window.defaultLuxeProducts && window.defaultLuxeProducts.length) {
            products = window.defaultLuxeProducts;
            try {
                localStorage.setItem('luxe_products', JSON.stringify(products));
            } catch (err) {}
        }
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

const getCategories = async () => {
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { collection, getDocs, query, orderBy } = firestoreModule;
        const { db } = configModule;

        const snapshot = await getDocs(query(collection(db, 'categories'), orderBy('createdAt', 'desc')));
        if (!snapshot.empty) {
            const categories = snapshot.docs.map((docItem) => {
                const data = docItem.data();
                const name = typeof data.name === 'object'
                    ? data.name
                    : { en: data.name || '', ar: data.nameAr || window.i18n?.translateText?.(data.name) || data.name || '' };
                return {
                    id: docItem.id,
                    ...data,
                    name
                };
            });
            localStorage.setItem('luxe_categories', JSON.stringify(categories));
            return categories;
        }
    } catch (error) {
        console.warn('Categories Firestore fetch notice (using cache):', error);
    }

    try {
        const stored = JSON.parse(localStorage.getItem('luxe_categories')) || [];
        if (Array.isArray(stored) && stored.length > 0) {
            return stored.map((cat, idx) => ({
                id: cat.id || `cat-${idx + 1}`,
                name: typeof cat.name === 'object'
                    ? cat.name
                    : { en: cat.name || cat, ar: window.i18n?.translateText?.(cat.name || cat) || cat.name || cat },
                image: cat.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
            }));
        }
    } catch (error) {
        console.warn('Unable to read categories from storage:', error);
    }

    const defaultCategories = [
        { name: { en: 'Serum', ar: 'سيروم' }, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop' },
        { name: { en: 'Moisturizer', ar: 'مرطب' }, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&h=600&fit=crop' },
        { name: { en: 'Cleanser', ar: 'غسول' }, image: 'https://images.unsplash.com/photo-1556228722-d0b71946892f?w=800&h=600&fit=crop' },
        { name: { en: 'Sunscreen', ar: 'واقي شمس' }, image: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&h=600&fit=crop' },
        { name: { en: 'Mask', ar: 'قناع' }, image: 'https://images.unsplash.com/photo-1567928804479-f4175374fce9?w=800&h=600&fit=crop' },
        { name: { en: 'Toner', ar: 'تونر' }, image: 'https://images.unsplash.com/photo-1608248597359-54d6a6a246d8?w=800&h=600&fit=crop' }
    ].map((cat, index) => ({ id: `default-cat-${index + 1}`, ...cat }));

    saveCategories(defaultCategories);
    return defaultCategories;
};

const saveCategories = (categories) => {
    localStorage.setItem('luxe_categories', JSON.stringify(categories || []));
};

const saveCategory = async (categoryData) => {
    const catId = String(categoryData.id || `cat_${Date.now()}`);
    let categories = await getCategories();
    const existingCategory = categories.find((c) => String(c.id) === catId);

    const oldNameEn = existingCategory ? (typeof existingCategory.name === 'object' ? existingCategory.name.en : existingCategory.name) : null;
    const oldNameAr = existingCategory ? (typeof existingCategory.name === 'object' ? existingCategory.name.ar : null) : null;

    const normalizedData = {
        ...categoryData,
        id: catId,
        name: typeof categoryData.name === 'object'
            ? categoryData.name
            : { en: categoryData.name || '', ar: categoryData.name || '' },
        image: categoryData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
    };

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, serverTimestamp } = firestoreModule;
        const { db } = configModule;

        await setDoc(doc(db, 'categories', catId), {
            ...normalizedData,
            updatedAt: serverTimestamp(),
            createdAt: normalizedData.createdAt || serverTimestamp()
        }, { merge: true });

        // CASCADE UPDATE: If category name changed, update all products belonging to this category
        if (oldNameEn && normalizedData.name.en && oldNameEn !== normalizedData.name.en) {
            const products = getProducts();
            let updatedCount = 0;
            for (const prod of products) {
                const prodCat = typeof prod.category === 'object' ? prod.category.en : prod.category;
                if (prodCat === oldNameEn || prodCat === oldNameAr) {
                    prod.category = normalizedData.name.en;
                    updatedCount++;
                    try {
                        await setDoc(doc(db, 'products', String(prod.id)), { category: normalizedData.name.en }, { merge: true });
                    } catch (err) {}
                }
            }
            if (updatedCount > 0) {
                saveProducts(products);
                loadProductsTable();
                console.log(`Cascade updated ${updatedCount} products to category: ${normalizedData.name.en}`);
            }
        }
    } catch (err) {
        console.warn('Firestore category sync fallback:', err);
    }

    const existingIndex = categories.findIndex((c) => String(c.id) === catId);
    if (existingIndex > -1) {
        categories[existingIndex] = { ...categories[existingIndex], ...normalizedData };
    } else {
        categories.unshift(normalizedData);
    }
    saveCategories(categories);
};

const syncCategoriesFromProducts = async () => {
    const products = getProducts();
    const categories = await getCategories();
    const names = categories.map((c) => (typeof c.name === 'object' ? c.name.en : c.name));

    products.forEach((p) => {
        if (p.category && !names.includes(p.category)) {
            names.push(p.category);
        }
    });

    const merged = names.map((name, idx) => {
        const existing = categories.find((c) => (typeof c.name === 'object' ? c.name.en === name : c.name === name));
        return {
            id: existing ? existing.id : `cat-${idx + 1}`,
            name: existing ? existing.name : { en: name, ar: window.i18n?.translateText?.(name) || name },
            image: existing ? existing.image : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
        };
    });

    saveCategories(merged);
};

// Async Firestore Banners / Storage Fallback with Dual-Language Object Support
const getBanners = async () => {
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
                    badge: typeof data.badge === 'object' ? data.badge : { en: data.badge || "Featured Ritual", ar: data.badgeAr || "طقس مميز" },
                    title: typeof data.title === 'object' ? data.title : { en: data.title || "", ar: data.titleAr || data.title || "" },
                    subtitle: typeof data.subtitle === 'object' ? data.subtitle : { en: data.subtitle || "", ar: data.subtitleAr || data.subtitle || "" },
                    description: typeof data.description === 'object' ? data.description : { en: data.description || "", ar: data.descriptionAr || data.description || "" },
                    buttonText: typeof data.buttonText === 'object' ? data.buttonText : { en: data.buttonText || "Shop Now", ar: data.buttonTextAr || "تسوق الآن" }
                };
            });
            localStorage.setItem('luxe_banners', JSON.stringify(banners));
            return banners;
        }
    } catch (error) {
        console.warn('Banner Firestore fetch notice (using storage):', error);
    }

    try {
        const stored = JSON.parse(localStorage.getItem('luxe_banners')) || [];
        if (stored.length) {
            return stored.map((b) => ({
                ...b,
                badge: typeof b.badge === 'object' ? b.badge : { en: b.badge || "Featured Ritual", ar: "طقس مميز" },
                title: typeof b.title === 'object' ? b.title : { en: b.title || "", ar: window.i18n?.translateText?.(b.title) || b.title || "" },
                subtitle: typeof b.subtitle === 'object' ? b.subtitle : { en: b.subtitle || "", ar: window.i18n?.translateText?.(b.subtitle) || b.subtitle || "" },
                description: typeof b.description === 'object' ? b.description : { en: b.description || "", ar: window.i18n?.translateText?.(b.description) || b.description || "" },
                buttonText: typeof b.buttonText === 'object' ? b.buttonText : { en: b.buttonText || "Shop Now", ar: "تسوق الآن" }
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
        }
    ];

    saveBanners(defaultBanners);
    return defaultBanners;
};

const saveBanners = (banners) => {
    localStorage.setItem('luxe_banners', JSON.stringify(banners));
};

const saveBanner = async (bannerData) => {
    const bannerId = String(bannerData.id || `banner_${Date.now()}`);
    const normalizedData = {
        ...bannerData,
        id: bannerId
    };

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, serverTimestamp } = firestoreModule;
        const { db } = configModule;

        await setDoc(doc(db, 'banners', bannerId), {
            ...normalizedData,
            updatedAt: serverTimestamp(),
            createdAt: normalizedData.createdAt || serverTimestamp()
        }, { merge: true });
    } catch (err) {
        console.warn('Firestore banner sync fallback:', err);
    }

    let banners = await getBanners();
    const existingIndex = banners.findIndex((b) => String(b.id) === bannerId);
    if (existingIndex > -1) {
        banners[existingIndex] = { ...banners[existingIndex], ...normalizedData };
    } else {
        banners.unshift(normalizedData);
    }
    saveBanners(banners);
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

const getUsers = async () => {
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { collection, getDocs } = firestoreModule;
        const { db } = configModule;

        const snapshot = await getDocs(collection(db, 'users'));
        if (!snapshot.empty) {
            const users = snapshot.docs.map((docItem) => {
                const data = docItem.data();
                return {
                    id: docItem.id,
                    ...data,
                    role: data.role || (data.isAdmin ? 'admin' : 'customer'),
                    isAdmin: data.role === 'admin' || !!data.isAdmin,
                    isBlocked: !!data.isBlocked,
                    permissions: data.permissions || {
                        products: data.role === 'admin',
                        orders: data.role === 'admin' || data.role === 'moderator',
                        banners: data.role === 'admin',
                        settings: data.role === 'admin'
                    },
                    orders: data.orders || []
                };
            });
            localStorage.setItem('luxe_users', JSON.stringify(users));
            return users;
        }
    } catch (e) {
        console.warn('Firestore users fetch note (using storage fallback):', e);
    }

    const stored = JSON.parse(localStorage.getItem('luxe_users')) || [];
    if (stored.length) return stored;

    const demoUsers = [
        {
            id: 'user_1',
            name: 'Sarah Mansour',
            email: 'sarah.m@example.com',
            phone: '01012345678',
            role: 'customer',
            isAdmin: false,
            isBlocked: false,
            permissions: { products: false, orders: false, banners: false, settings: false },
            orders: [{ orderId: 'ORD-101' }, { orderId: 'ORD-108' }]
        },
        {
            id: 'user_admin',
            name: 'Ahmed Emad (Super Admin)',
            email: 'aemade2016@gmail.com',
            phone: '01000000000',
            role: 'admin',
            isAdmin: true,
            isBlocked: false,
            permissions: { products: true, orders: true, banners: true, settings: true },
            orders: []
        }
    ];
    saveUsers(demoUsers);
    return demoUsers;
};

const saveUsers = (users) => localStorage.setItem('luxe_users', JSON.stringify(users));

// ============================================
// STORE SETTINGS & CMS DATA ACCESS LAYER
// ============================================
const getDefaultStoreSettings = () => ({
    storeName: 'Koko Shop',
    supportEmail: 'concierge@kokoshop.com',
    supportPhone: '+20 100 000 0000',
    freeShippingThreshold: 500,
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
    },
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
});

const getStoreSettings = async () => {
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
        console.warn('Firestore settings fetch note (using storage fallback):', e);
    }

    try {
        const stored = JSON.parse(localStorage.getItem('luxe_settings'));
        if (stored) return stored;
    } catch (e) {}

    const defaults = getDefaultStoreSettings();
    localStorage.setItem('luxe_settings', JSON.stringify(defaults));
    return defaults;
};

const saveStoreSettings = async (settingsData) => {
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, serverTimestamp } = firestoreModule;
        const { db } = configModule;

        await setDoc(doc(db, 'settings', 'general'), {
            ...settingsData,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn('Firestore settings save notice:', e);
    }

    localStorage.setItem('luxe_settings', JSON.stringify(settingsData));
    try {
        localStorage.setItem('luxe_settings_updated', Date.now());
        window.dispatchEvent(new CustomEvent('settings-updated', { detail: { settings: settingsData } }));
    } catch (e) {}
};

// ============================================
// RESPONSIVE SIDEBAR MOBILE CONTROLS
// ============================================
const closeMobileSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const toggleIcon = sidebarToggle ? sidebarToggle.querySelector('i') : null;

    if (sidebar && !sidebar.classList.contains('-translate-x-full')) {
        sidebar.classList.add('-translate-x-full');
    }
    if (backdrop) {
        backdrop.classList.add('hidden');
    }
    if (toggleIcon) {
        toggleIcon.className = 'fas fa-bars text-sm';
    }
};

const openMobileSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const toggleIcon = sidebarToggle ? sidebarToggle.querySelector('i') : null;

    if (sidebar) {
        sidebar.classList.remove('-translate-x-full');
    }
    if (backdrop) {
        backdrop.classList.remove('hidden');
    }
    if (toggleIcon) {
        toggleIcon.className = 'fas fa-xmark text-sm';
    }
};

const toggleMobileSidebar = () => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const isClosed = sidebar.classList.contains('-translate-x-full');
    if (isClosed) {
        openMobileSidebar();
    } else {
        closeMobileSidebar();
    }
};

window.closeMobileSidebar = closeMobileSidebar;
window.openMobileSidebar = openMobileSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;

// ============================================
// NAVIGATION & TABS
// ============================================

const showTab = (tabName) => {
    // Automatically close sidebar on mobile when navigating so selected tab is immediately visible
    closeMobileSidebar();

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
        case 'inbox':
            loadInboxTab();
            break;
        case 'settings':
            loadStoreSettingsForm();
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
const createProductTableRow = (product, index = 0) => {
    const { id, name = '', image = './images/slider 1.jpeg', price = 0, originalPrice = 0, salePrice = 0, category = 'Skincare', stock = 0, hasDiscount = false, discountPercent = 0, savings = 0 } = product;

    const currentPrice = Number(salePrice || price || 0);
    const origPrice = Number(originalPrice || currentPrice);
    const calculatedSavings = savings || Math.max(origPrice - currentPrice, 0);
    const isDiscounted = hasDiscount || (calculatedSavings > 0);
    const savingsFormatted = calculatedSavings % 1 === 0 ? calculatedSavings.toFixed(0) : calculatedSavings.toFixed(2);
    const detailsId = `product-details-${index}-${String(id).replace(/[^a-zA-Z0-9]/g, '_')}`;
    const isAr = window.i18n?.currentLang === 'ar';

    return `
        <!-- Main Product Row -->
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="w-10 px-2 py-3 text-center">
                <button type="button" onclick="toggleTableRowDetails('${detailsId}', this)"
                    class="w-7 h-7 rounded-full bg-pink-50 hover:bg-pink-500 text-pink-600 hover:text-white dark:bg-slate-700 dark:text-pink-400 dark:hover:bg-pink-500 dark:hover:text-white flex items-center justify-center transition shadow-xs text-[10px] mx-auto"
                    title="${isAr ? 'عرض البيانات والإجراءات المخفية' : 'Show hidden details'}">
                    <i class="fas fa-plus transition-transform duration-200"></i>
                </button>
            </td>
            <td class="px-4 py-3">
                <img src="${image}" alt="${name}" class="w-11 h-11 rounded-xl object-cover border border-pink-100 dark:border-slate-700">
            </td>
            <td class="px-4 py-3">
                <h4 class="font-semibold text-gray-900 dark:text-white line-clamp-1">${name}</h4>
                ${isDiscounted ? `
                    <div class="flex items-center gap-1.5 mt-1">
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                            <i class="fas fa-tag text-[8px]"></i>
                            <span>وفرت ${savingsFormatted} ج.م</span>
                        </span>
                        <span class="text-[10px] text-pink-500 font-semibold">(-${discountPercent}%)</span>
                    </div>
                ` : ''}
            </td>
            <td class="px-4 py-3">
                <div class="flex flex-col">
                    <span class="font-bold text-pink-600">EGP ${currentPrice.toFixed(2)}</span>
                    ${isDiscounted && origPrice > currentPrice ? `<span class="text-[10px] text-gray-400 line-through">EGP ${origPrice.toFixed(2)}</span>` : ''}
                </div>
            </td>
            <td class="hidden md:table-cell px-4 py-3 text-gray-500 font-medium">${category}</td>
            <td class="hidden md:table-cell px-4 py-3">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                    ${stock} in stock
                </span>
            </td>
            <td class="hidden md:table-cell px-4 py-3 text-right">
                <div class="flex items-center justify-end space-x-2">
                    <button onclick="editProduct('${id}')" class="w-7 h-7 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center transition" title="Edit Formula">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteProduct('${id}')" class="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition" title="Delete Formula">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>

        <!-- Product Collapsible Details (Hidden Things) -->
        <tr id="${detailsId}" class="hidden bg-pink-50/20 dark:bg-slate-800/60 border-y border-pink-100/70 dark:border-slate-700/60">
            <td colspan="7" class="p-3 sm:p-4">
                <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-pink-100 dark:border-slate-700 shadow-sm space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b border-pink-50 dark:border-slate-800 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        <span class="flex items-center gap-1.5"><i class="fas fa-circle-info text-pink-500"></i>${isAr ? 'بيانات وإجراءات المنتج المخفية' : 'Hidden Product Details'}</span>
                        <span class="text-pink-600 font-mono">${name}</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div class="bg-pink-50/30 dark:bg-slate-800/40 p-2.5 rounded-xl border border-pink-50 dark:border-slate-700">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">${isAr ? 'القسم:' : 'Category:'}</label>
                            <span class="font-bold text-gray-800 dark:text-gray-200">${category}</span>
                        </div>
                        <div class="bg-pink-50/30 dark:bg-slate-800/40 p-2.5 rounded-xl border border-pink-50 dark:border-slate-700">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">${isAr ? 'المخزون المتوفر:' : 'Stock:'}</label>
                            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                                ${stock} ${isAr ? 'قطعة' : 'in stock'}
                            </span>
                        </div>
                        <div class="bg-pink-50/30 dark:bg-slate-800/40 p-2.5 rounded-xl border border-pink-50 dark:border-slate-700 col-span-2 sm:col-span-1">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">${isAr ? 'السعر الصافي:' : 'Net Price:'}</label>
                            <span class="font-bold text-pink-600">EGP ${currentPrice.toFixed(2)}</span>
                            ${isDiscounted && origPrice > currentPrice ? `<span class="text-[10px] text-gray-400 line-through ml-2">EGP ${origPrice.toFixed(2)}</span>` : ''}
                        </div>
                    </div>
                    <div class="pt-2 flex items-center justify-end gap-2 border-t border-pink-50 dark:border-slate-800">
                        <button onclick="editProduct('${id}')" class="text-xs px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 font-semibold transition flex items-center gap-1.5">
                            <i class="fas fa-edit text-xs"></i><span>${isAr ? 'تعديل المنتج' : 'Edit'}</span>
                        </button>
                        <button onclick="deleteProduct('${id}')" class="text-xs px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold transition flex items-center gap-1.5">
                            <i class="fas fa-trash text-xs"></i><span>${isAr ? 'حذف المنتج' : 'Delete'}</span>
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `;
};

// Category Table Row Builder
const createCategoryTableRow = (category) => {
    const { id, name = '', image = '' } = category;
    const nameEn = typeof name === 'object' ? (name.en || '') : name;
    const nameAr = typeof name === 'object' ? (name.ar || '') : (window.i18n?.translateText?.(name) || name);
    return `
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="px-5 py-3">
                <img src="${image}" alt="${nameEn}" class="w-10 h-10 rounded-xl object-cover border border-pink-100 dark:border-slate-700">
            </td>
            <td class="px-5 py-3 font-semibold text-gray-900 dark:text-white">${nameEn}</td>
            <td class="px-5 py-3 font-semibold text-pink-600 dark:text-pink-400 font-sans" dir="rtl">${nameAr}</td>
            <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end space-x-2">
                    <button onclick="editCategory('${id}')" class="w-7 h-7 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center transition" title="Edit Category">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteCategory('${id}')" class="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition" title="Delete Category">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
};

// Banner Table Row Builder
const createBannerTableRow = (banner) => {
    const { id, title = '', subtitle = '', imageUrl = '', targetUrl = 'products.html' } = banner;
    const titleEn = typeof title === 'object' ? (title.en || '') : title;
    const titleAr = typeof title === 'object' ? (title.ar || '') : (window.i18n?.translateText?.(title) || '');
    const subtitleEn = typeof subtitle === 'object' ? (subtitle.en || '') : subtitle;
    const subtitleAr = typeof subtitle === 'object' ? (subtitle.ar || '') : (window.i18n?.translateText?.(subtitle) || '');

    return `
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="px-5 py-3">
                <img src="${imageUrl}" alt="${titleEn}" class="w-12 h-10 rounded-xl object-cover border border-pink-100 dark:border-slate-700">
            </td>
            <td class="px-5 py-3">
                <div class="font-semibold text-gray-900 dark:text-white">
                    ${titleEn} ${titleAr ? `<span class="text-xs text-gray-400">/</span> <span class="text-xs text-pink-600 font-sans font-medium" dir="rtl">${titleAr}</span>` : ''}
                </div>
                <div class="text-[11px] text-pink-500 font-display italic">
                    ${subtitleEn} ${subtitleAr ? `<span class="text-[10px] text-gray-400 font-sans not-italic">(${subtitleAr})</span>` : ''}
                </div>
            </td>
            <td class="px-5 py-3 text-gray-400 font-mono text-[11px] truncate max-w-xs">${targetUrl}</td>
            <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end space-x-2">
                    <button onclick="editBanner('${id}')" class="w-7 h-7 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center transition" title="Edit Banner">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteBanner('${id}')" class="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition" title="Delete Banner">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
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
const createOrderTableRow = (order, index = 0) => {
    const { orderId = 'ORD-00', createdAt, customerInfo = {}, pricing = {}, status = 'pending' } = order;
    const dateStr = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
    const total = Number(pricing.total || 0).toFixed(2);
    const detailsId = `order-details-row-${index}-${orderId.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const isAr = window.i18n?.currentLang === 'ar';

    let statusClass = 'bg-amber-50 text-amber-600';
    if (status === 'delivered' || status === 'completed') statusClass = 'bg-emerald-50 text-emerald-600';
    if (status === 'cancelled') statusClass = 'bg-rose-50 text-rose-600';

    return `
        <!-- Main Order Row -->
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="w-10 px-2 py-3 text-center">
                <button type="button" onclick="toggleTableRowDetails('${detailsId}', this)" 
                    class="w-7 h-7 rounded-full bg-pink-50 hover:bg-pink-500 text-pink-600 hover:text-white dark:bg-slate-700 dark:text-pink-400 dark:hover:bg-pink-500 dark:hover:text-white flex items-center justify-center transition shadow-xs text-[10px] mx-auto" 
                    title="${isAr ? 'عرض البيانات المخفية للطلب' : 'Show hidden order details'}">
                    <i class="fas fa-plus transition-transform duration-200"></i>
                </button>
            </td>
            <td class="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">${orderId}</td>
            <td class="px-4 py-3 text-gray-400 text-xs">${dateStr}</td>
            <td class="hidden md:table-cell px-4 py-3">
                <div class="font-semibold text-gray-900 dark:text-white">${customerInfo.name || 'Client'}</div>
                <div class="text-[11px] text-gray-400 font-mono">${customerInfo.email || ''}</div>
            </td>
            <td class="hidden md:table-cell px-4 py-3 font-bold text-pink-600">EGP ${total}</td>
            <td class="hidden md:table-cell px-4 py-3">
                <select onchange="updateOrderStatus('${orderId}', this.value)" class="text-[11px] font-bold rounded-full px-2.5 py-1 ${statusClass} border-none outline-none cursor-pointer">
                    <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="delivered" ${status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td class="hidden md:table-cell px-4 py-3 text-right">
                <button onclick="viewOrderDetails('${orderId}')" class="w-7 h-7 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center ml-auto transition" title="View Order">
                    <i class="fas fa-eye text-xs"></i>
                </button>
            </td>
        </tr>

        <!-- Order Collapsible Details (Hidden Things) -->
        <tr id="${detailsId}" class="hidden bg-pink-50/20 dark:bg-slate-800/60 border-y border-pink-100/70 dark:border-slate-700/60">
            <td colspan="7" class="p-3 sm:p-4">
                <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-pink-100 dark:border-slate-700 shadow-sm space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b border-pink-50 dark:border-slate-800 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        <span class="flex items-center gap-1.5"><i class="fas fa-circle-info text-pink-500"></i>${isAr ? 'بيانات الطلب المخفية على الموبايل' : 'Hidden Order Details'}</span>
                        <span class="text-pink-600 font-mono font-bold">${orderId}</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div class="bg-pink-50/30 dark:bg-slate-800/40 p-2.5 rounded-xl border border-pink-50 dark:border-slate-700">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">${isAr ? 'العميل:' : 'Customer:'}</label>
                            <div class="font-bold text-gray-900 dark:text-white">${customerInfo.name || 'Client'}</div>
                            <div class="text-[10px] text-gray-400 font-mono truncate">${customerInfo.email || ''}</div>
                        </div>

                        <div class="bg-pink-50/30 dark:bg-slate-800/40 p-2.5 rounded-xl border border-pink-50 dark:border-slate-700">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">${isAr ? 'إجمالي الفاتورة:' : 'Total Amount:'}</label>
                            <div class="font-bold text-pink-600 text-sm">EGP ${total}</div>
                        </div>

                        <div class="bg-pink-50/30 dark:bg-slate-800/40 p-2.5 rounded-xl border border-pink-50 dark:border-slate-700">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">${isAr ? 'تحديث حالة الشحن:' : 'Order Status:'}</label>
                            <select onchange="updateOrderStatus('${orderId}', this.value)" class="w-full text-xs font-bold rounded-lg px-2.5 py-1.5 ${statusClass} border border-pink-100 dark:border-slate-700 outline-none cursor-pointer">
                                <option value="pending" ${status === 'pending' ? 'selected' : ''}>Pending (قيد الانتظار)</option>
                                <option value="processing" ${status === 'processing' ? 'selected' : ''}>Processing (جاري التجهيز)</option>
                                <option value="delivered" ${status === 'delivered' ? 'selected' : ''}>Delivered (تم التوصيل)</option>
                                <option value="cancelled" ${status === 'cancelled' ? 'selected' : ''}>Cancelled (ملغي)</option>
                            </select>
                        </div>
                    </div>

                    <div class="pt-2 flex items-center justify-end gap-2 border-t border-pink-50 dark:border-slate-800">
                        <button onclick="viewOrderDetails('${orderId}')" class="text-xs px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 font-semibold transition flex items-center gap-1.5">
                            <i class="fas fa-file-invoice text-xs"></i><span>${isAr ? 'عرض الفاتورة والمنتجات' : 'View Full Invoice'}</span>
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `;
};

// User Table Row Builder
const createUserTableRow = (user, index = 0) => {
    const {
        id,
        name = 'Client',
        email = '',
        phone = '',
        role = 'customer',
        permissions = {},
        orders = [],
        isBlocked = false
    } = user;

    const isAr = window.i18n?.currentLang === 'ar';
    const ordersCount = Array.isArray(orders) ? orders.length : 0;
    const userIdentifier = String(id || email);
    const detailsId = `user-details-${index}-${userIdentifier.replace(/[^a-zA-Z0-9]/g, '_')}`;

    let roleBadgeClass = 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300';
    if (role === 'admin') roleBadgeClass = 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300 font-bold';
    if (role === 'moderator') roleBadgeClass = 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300';

    return `
        <!-- Main Customer Row -->
        <tr class="hover:bg-pink-50/30 dark:hover:bg-slate-700/30 transition">
            <td class="w-10 px-2 py-3 text-center">
                <!-- Small Icon to reveal hidden things (الأيقونة الصغيرة لإظهار العناصر المخفية) -->
                <button type="button" onclick="toggleTableRowDetails('${detailsId}', this)" 
                    class="w-7 h-7 rounded-full bg-pink-50 hover:bg-pink-500 text-pink-600 hover:text-white dark:bg-slate-700 dark:text-pink-400 dark:hover:bg-pink-500 dark:hover:text-white flex items-center justify-center transition shadow-xs text-[10px] mx-auto" 
                    title="${isAr ? 'عرض البيانات والإجراءات المخفية' : 'Show hidden details'}">
                    <i class="fas fa-plus transition-transform duration-200"></i>
                </button>
            </td>
            <td class="px-4 py-3">
                <div class="flex items-center space-x-2.5">
                    <div class="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400 font-bold flex items-center justify-center text-xs shrink-0">
                        ${name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div class="font-semibold text-gray-900 dark:text-white">${name}</div>
                        ${phone ? `<div class="text-[10px] text-gray-400">${phone}</div>` : ''}
                    </div>
                </div>
            </td>
            <td class="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono text-[11px]">${email}</td>
            <td class="hidden md:table-cell px-4 py-3">
                <select onchange="updateUserRole('${userIdentifier}', this.value)"
                    class="text-[11px] font-semibold rounded-full px-2.5 py-1 ${roleBadgeClass} border-none outline-none cursor-pointer">
                    <option value="customer" ${role === 'customer' ? 'selected' : ''}>${isAr ? 'عميل (Customer)' : 'Customer'}</option>
                    <option value="moderator" ${role === 'moderator' ? 'selected' : ''}>${isAr ? 'مشرف (Moderator)' : 'Moderator'}</option>
                    <option value="admin" ${role === 'admin' ? 'selected' : ''}>${isAr ? 'مدير (Admin)' : 'Admin'}</option>
                </select>
            </td>
            <td class="hidden md:table-cell px-4 py-3 font-bold text-pink-600">${ordersCount} ${isAr ? 'طلبات' : 'orders'}</td>
            <td class="hidden md:table-cell px-4 py-3">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${isBlocked ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'}">
                    ${isBlocked ? (isAr ? 'محظور' : 'Blocked') : (isAr ? 'نشط' : 'Active')}
                </span>
            </td>
            <td class="hidden md:table-cell px-4 py-3 text-right">
                <div class="flex items-center justify-end space-x-1.5">
                    <button onclick="openPermissionsModal('${userIdentifier}')"
                        class="w-7 h-7 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 flex items-center justify-center transition"
                        title="${isAr ? 'تعديل الصلاحيات' : 'Custom Permissions'}">
                        <i class="fas fa-shield-halved text-xs"></i>
                    </button>
                    <button onclick="toggleUserBlock('${userIdentifier}')"
                        class="text-[11px] px-2.5 py-1 rounded-full font-semibold transition ${isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}"
                        title="${isBlocked ? 'Unblock' : 'Block User'}">
                        <i class="fas ${isBlocked ? 'fa-unlock' : 'fa-ban'} mr-1"></i>${isBlocked ? (isAr ? 'إلغاء' : 'Unblock') : (isAr ? 'حظر' : 'Block')}
                    </button>
                    <button onclick="deleteUser('${userIdentifier}')"
                        class="w-7 h-7 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition"
                        title="${isAr ? 'حذف العميل' : 'Delete Customer'}">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>

        <!-- Collapsible Responsive Details Drawer for Hidden Things (تظهر عند النقر على الأيقونة الصغيرة) -->
        <tr id="${detailsId}" class="hidden bg-pink-50/20 dark:bg-slate-800/60 border-y border-pink-100/70 dark:border-slate-700/60">
            <td colspan="7" class="p-3 sm:p-4">
                <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-pink-100 dark:border-slate-700 shadow-sm space-y-3">
                    <div class="flex items-center justify-between pb-2 border-b border-pink-50 dark:border-slate-800 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                        <span class="flex items-center gap-1.5"><i class="fas fa-circle-info text-pink-500"></i>${isAr ? 'البيانات والإجراءات المخفية على الموبايل' : 'Hidden Details & Actions'}</span>
                        <span class="text-pink-600 font-mono">${email}</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <!-- Role -->
                        <div class="bg-pink-50/30 dark:bg-slate-800/40 p-2.5 rounded-xl border border-pink-50 dark:border-slate-700">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">${isAr ? 'الدور والصلاحية:' : 'Role:'}</label>
                            <select onchange="updateUserRole('${userIdentifier}', this.value)"
                                class="w-full text-xs font-semibold rounded-lg px-2.5 py-1.5 ${roleBadgeClass} border border-pink-100 dark:border-slate-700 outline-none cursor-pointer">
                                <option value="customer" ${role === 'customer' ? 'selected' : ''}>${isAr ? 'عميل (Customer)' : 'Customer'}</option>
                                <option value="moderator" ${role === 'moderator' ? 'selected' : ''}>${isAr ? 'مشرف (Moderator)' : 'Moderator'}</option>
                                <option value="admin" ${role === 'admin' ? 'selected' : ''}>${isAr ? 'مدير (Admin)' : 'Admin'}</option>
                            </select>
                        </div>

                        <!-- Orders Count -->
                        <div class="bg-pink-50/30 dark:bg-slate-800/40 p-2.5 rounded-xl border border-pink-50 dark:border-slate-700">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">${isAr ? 'إجمالي الطلبات:' : 'Total Orders:'}</label>
                            <div class="font-bold text-pink-600 text-sm flex items-center gap-1.5">
                                <i class="fas fa-bag-shopping text-xs"></i>
                                <span>${ordersCount} ${isAr ? 'طلبات مسجلة' : 'orders placed'}</span>
                            </div>
                        </div>

                        <!-- Status -->
                        <div class="bg-pink-50/30 dark:bg-slate-800/40 p-2.5 rounded-xl border border-pink-50 dark:border-slate-700">
                            <label class="block text-[10px] font-bold text-gray-400 uppercase mb-1">${isAr ? 'حالة الحساب:' : 'Account Status:'}</label>
                            <span class="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${isBlocked ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'}">
                                ${isBlocked ? (isAr ? 'محظور من الطلب' : 'Blocked') : (isAr ? 'حساب نشط' : 'Active')}
                            </span>
                        </div>
                    </div>

                    <!-- Actions Bar in details drawer -->
                    <div class="pt-2 flex items-center justify-end gap-2 flex-wrap border-t border-pink-50 dark:border-slate-800">
                        <button onclick="openPermissionsModal('${userIdentifier}')"
                            class="text-xs px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-pink-600 font-semibold transition flex items-center gap-1.5">
                            <i class="fas fa-shield-halved text-xs"></i>
                            <span>${isAr ? 'تعديل الصلاحيات' : 'Custom Permissions'}</span>
                        </button>
                        <button onclick="toggleUserBlock('${userIdentifier}')"
                            class="text-xs px-3.5 py-1.5 rounded-xl font-semibold transition flex items-center gap-1.5 ${isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}">
                            <i class="fas ${isBlocked ? 'fa-unlock' : 'fa-ban'}"></i>
                            <span>${isBlocked ? (isAr ? 'إلغاء الحظر' : 'Unblock') : (isAr ? 'حظر الحساب' : 'Block User')}</span>
                        </button>
                        <button onclick="deleteUser('${userIdentifier}')"
                            class="text-xs px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-600 font-semibold transition flex items-center gap-1.5">
                            <i class="fas fa-trash text-xs"></i>
                            <span>${isAr ? 'حذف العميل' : 'Delete'}</span>
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    `;
};

// ============================================
// DATA LOADERS & RENDER FUNCTIONS
// ============================================

const loadDashboardOverview = async () => {
    try {
        const products = getProducts();
        const orders = getOrders();
        const users = await getUsers();

        const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.pricing?.total) || 0), 0);

        const prodEl = document.getElementById('totalProducts');
        const ordEl = document.getElementById('totalOrders');
        const userEl = document.getElementById('totalUsers');
        const revEl = document.getElementById('totalRevenue');

        if (prodEl) prodEl.textContent = products.length;
        if (ordEl) ordEl.textContent = orders.length;
        if (userEl) userEl.textContent = Array.isArray(users) ? users.length : 0;
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
        tableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">No products found</td></tr>';
        return;
    }

    tableBody.innerHTML = products.map((p, idx) => createProductTableRow(p, idx)).join('');
};

const loadCategoriesTable = async () => {
    const tableBody = document.getElementById('categoriesTableBody');
    if (!tableBody) return;

    const categories = await getCategories();
    if (!categories.length) {
        tableBody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-400">No categories found</td></tr>';
        return;
    }

    tableBody.innerHTML = categories.map(createCategoryTableRow).join('');

    // Also populate productCategory select in product modal
    const catSelect = document.getElementById('productCategory');
    if (catSelect) {
        const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
        catSelect.innerHTML = categories.map((c) => {
            const nameEn = typeof c.name === 'object' ? (c.name.en || '') : c.name;
            const nameAr = typeof c.name === 'object' ? (c.name.ar || '') : (window.i18n?.translateText?.(c.name) || c.name);
            const label = isAr ? `${nameAr} (${nameEn})` : `${nameEn} (${nameAr})`;
            return `<option value="${nameEn}">${label}</option>`;
        }).join('');
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

const loadOrdersTable = async () => {
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    let orders = getOrders();
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { collection, getDocs, query, orderBy } = firestoreModule;
        const { db } = configModule;

        const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        if (!snap.empty) {
            const fsOrders = snap.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
            const mergedMap = new Map();
            orders.forEach((o) => mergedMap.set(o.orderId || o.id, o));
            fsOrders.forEach((o) => {
                const key = o.orderId || o.id;
                mergedMap.set(key, { ...mergedMap.get(key), ...o });
            });
            orders = Array.from(mergedMap.values()).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            saveOrders(orders);
        }
    } catch (err) {
        console.warn('Firestore orders fetch fallback:', err);
    }

    if (!orders.length) {
        tableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">No orders found</td></tr>';
        return;
    }

    tableBody.innerHTML = orders.map((o, idx) => createOrderTableRow(o, idx)).join('');
};

const loadUsersTable = async () => {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;

    const users = await getUsers();
    if (!users.length) {
        tableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-400">No customers registered yet</td></tr>';
        return;
    }

    tableBody.innerHTML = users.map((u, idx) => createUserTableRow(u, idx)).join('');
};

// ============================================
// RESPONSIVE TABLE ROW EXPANDER (SHOW/HIDE HIDDEN THINGS)
// ============================================
const toggleTableRowDetails = (detailsRowId, triggerBtn) => {
    const detailsRow = document.getElementById(detailsRowId);
    if (!detailsRow) return;

    const isHidden = detailsRow.classList.contains('hidden');
    const icon = triggerBtn ? triggerBtn.querySelector('i') : null;

    if (isHidden) {
        detailsRow.classList.remove('hidden');
        if (icon) {
            icon.className = 'fas fa-minus text-[10px] transition-transform duration-200';
        }
        if (triggerBtn) {
            triggerBtn.classList.add('bg-pink-500', 'text-white');
            triggerBtn.classList.remove('bg-pink-50', 'text-pink-600', 'dark:bg-slate-700', 'dark:text-pink-400');
        }
    } else {
        detailsRow.classList.add('hidden');
        if (icon) {
            icon.className = 'fas fa-plus text-[10px] transition-transform duration-200';
        }
        if (triggerBtn) {
            triggerBtn.classList.remove('bg-pink-500', 'text-white');
            triggerBtn.classList.add('bg-pink-50', 'text-pink-600', 'dark:bg-slate-700', 'dark:text-pink-400');
        }
    }
};

const toggleAllTableDetails = (tableType) => {
    let selector = '';
    if (tableType === 'users') selector = '#usersTableBody tr[id^="user-details-"]';
    if (tableType === 'orders') selector = '#ordersTableBody tr[id^="order-details-row-"]';
    if (tableType === 'products') selector = '#productsTableBody tr[id^="product-details-"]';

    const detailRows = document.querySelectorAll(selector);
    if (!detailRows.length) return;

    const hasAnyHidden = Array.from(detailRows).some((r) => r.classList.contains('hidden'));

    detailRows.forEach((row) => {
        const id = row.id;
        const triggerBtn = document.querySelector(`button[onclick*="'${id}'"]`);
        const icon = triggerBtn ? triggerBtn.querySelector('i') : null;

        if (hasAnyHidden) {
            row.classList.remove('hidden');
            if (icon) icon.className = 'fas fa-minus text-[10px]';
            if (triggerBtn) {
                triggerBtn.classList.add('bg-pink-500', 'text-white');
                triggerBtn.classList.remove('bg-pink-50', 'text-pink-600', 'dark:bg-slate-700', 'dark:text-pink-400');
            }
        } else {
            row.classList.add('hidden');
            if (icon) icon.className = 'fas fa-plus text-[10px]';
            if (triggerBtn) {
                triggerBtn.classList.remove('bg-pink-500', 'text-white');
                triggerBtn.classList.add('bg-pink-50', 'text-pink-600', 'dark:bg-slate-700', 'dark:text-pink-400');
            }
        }
    });
};

window.toggleTableRowDetails = toggleTableRowDetails;
window.toggleAllTableDetails = toggleAllTableDetails;

// ============================================
// CRUD ACTIONS & EVENT HANDLERS
// ============================================

// Product Actions & Firestore Integration
const fetchProducts = async () => {
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { collection, getDocs } = firestoreModule;
        const { db } = configModule;

        const snapshot = await getDocs(collection(db, 'products'));
        if (!snapshot.empty) {
            const firestoreProducts = snapshot.docs.map((docItem) => {
                const data = docItem.data();
                return {
                    id: data.id || docItem.id,
                    ...data
                };
            });
            if (firestoreProducts.length > 0) {
                saveProducts(firestoreProducts);
                loadProductsTable();
                loadDashboardOverview();
                return firestoreProducts;
            }
        }
    } catch (err) {
        console.warn('Firestore products fetch notice in admin (using local storage):', err);
    }
    return getProducts();
};

const addProduct = async (productData) => {
    const newId = String(productData.id || Date.now());
    const normalized = normalizeProduct({
        ...productData,
        id: newId
    });

    let products = getProducts();
    products.unshift(normalized);
    saveProducts(products);

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, serverTimestamp } = firestoreModule;
        const { db } = configModule;

        await setDoc(doc(db, 'products', newId), {
            ...normalized,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (err) {
        console.warn('Firestore addProduct fallback:', err);
    }

    try {
        localStorage.setItem('luxe_products_updated', Date.now());
        window.dispatchEvent(new CustomEvent('products-updated', { detail: { products } }));
    } catch (e) {}

    loadProductsTable();
    loadDashboardOverview();
    return normalized;
};

const updateProduct = async (productId, productData) => {
    const targetId = String(productId);
    const normalized = normalizeProduct({
        ...productData,
        id: targetId
    });

    let products = getProducts();
    const idx = products.findIndex((p) => String(p.id) === targetId);
    if (idx > -1) {
        products[idx] = { ...products[idx], ...normalized };
    } else {
        products.unshift(normalized);
    }
    saveProducts(products);

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, serverTimestamp } = firestoreModule;
        const { db } = configModule;

        await setDoc(doc(db, 'products', targetId), {
            ...normalized,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (err) {
        console.warn('Firestore updateProduct fallback:', err);
    }

    try {
        localStorage.setItem('luxe_products_updated', Date.now());
        window.dispatchEvent(new CustomEvent('products-updated', { detail: { products } }));
    } catch (e) {}

    loadProductsTable();
    loadDashboardOverview();
    return normalized;
};

const showAddProductModal = () => {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    const form = document.getElementById('productForm');

    if (!modal) return;

    if (title) title.textContent = 'Add New Product Formula';
    const submitBtn = document.getElementById('saveProductBtn') || document.querySelector('#productForm button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save mr-1.5"></i><span>Save Product Formula</span>';

    if (form) form.reset();

    document.getElementById('productId').value = '';
    loadCategoriesTable();
    updateDiscountLabels();

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
    const targetId = String(productId);
    const products = getProducts();
    const product = products.find((p) => String(p.id) === targetId);
    if (!product) return;

    showAddProductModal();

    const title = document.getElementById('productModalTitle');
    if (title) title.textContent = 'Edit Product Formula';

    const submitBtn = document.getElementById('saveProductBtn') || document.querySelector('#productForm button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save mr-1.5"></i><span>Update Product Formula</span>';

    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productBarcode').value = product.barcode || '';
    document.getElementById('productOriginalPrice').value = product.originalPrice || product.price || 0;
    document.getElementById('productSalePrice').value = product.salePrice || product.price || 0;
    document.getElementById('productImage').value = product.image || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productRating').value = product.rating || 5;
    document.getElementById('productStock').value = product.stock || 50;
    document.getElementById('productCategory').value = typeof product.category === 'object' ? (product.category.en || product.category.ar) : (product.category || 'Serum');

    updateDiscountLabels();
};

const deleteProduct = async (productId) => {
    const targetId = String(productId);
    const isAr = window.i18n?.currentLang === 'ar';
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا الصنف نهائياً؟' : 'Delete this product formula?')) {
        let products = getProducts();
        products = products.filter((p) => String(p.id) !== targetId);
        saveProducts(products);

        try {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            const configModule = await import('./firebase-config.js');
            const { doc, deleteDoc } = firestoreModule;
            const { db } = configModule;
            await deleteDoc(doc(db, 'products', targetId));
        } catch (err) {
            console.warn('Firestore deleteProduct notice:', err);
        }

        try {
            localStorage.setItem('luxe_products_updated', Date.now());
            window.dispatchEvent(new CustomEvent('products-updated', { detail: { products } }));
        } catch (e) {}

        showToast(isAr ? 'تم حذف المنتج بنجاح' : 'Product deleted successfully');
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
    const badgePreviewEl = document.getElementById('productBadgePreview');

    const isAr = (window.i18n?.currentLang === 'ar' || localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');

    if (discEl) {
        discEl.textContent = isAr ? `خصم ${details.discountPercent}%` : `${details.discountPercent}% OFF`;
    }
    if (saveEl) {
        saveEl.textContent = isAr ? `وفرت ${details.savings.toFixed(2)} ج.م` : `EGP ${details.savings.toFixed(2)}`;
    }
    if (badgePreviewEl) {
        if (details.savings > 0) {
            badgePreviewEl.classList.remove('hidden');
            const savingsFormatted = details.savings % 1 === 0 ? details.savings.toFixed(0) : details.savings.toFixed(2);
            badgePreviewEl.innerHTML = `<i class="fas fa-tag text-[9px]"></i><span>${isAr ? `وفرت ${savingsFormatted} ج.م` : `Save EGP ${savingsFormatted}`}</span>`;
        } else {
            badgePreviewEl.classList.add('hidden');
        }
    }
};

// Category Actions
const resetCategoryForm = () => {
    const form = document.getElementById('categoryForm');
    if (form) form.reset();
    document.getElementById('categoryId').value = '';
    const title = document.getElementById('categoryFormTitle');
    if (title) title.textContent = 'Add New Category';
    const btn = document.getElementById('saveCategoryBtn');
    if (btn) btn.textContent = 'Save Category';
};

const deleteCategory = async (catId) => {
    const isAr = window.i18n?.currentLang === 'ar';
    const confirmMsg = isAr ? 'هل أنت متأكد من حذف هذا القسم؟ سيتم نقل منتجاته المرتبطة إلى القسم العام.' : 'Are you sure you want to delete this category? Associated products will be reassigned to General Skincare.';
    if (!confirm(confirmMsg)) return;

    try {
        const categories = await getCategories();
        const targetCategory = categories.find((c) => String(c.id) === String(catId));
        const targetNameEn = targetCategory ? (typeof targetCategory.name === 'object' ? targetCategory.name.en : targetCategory.name) : null;
        const targetNameAr = targetCategory ? (typeof targetCategory.name === 'object' ? targetCategory.name.ar : null) : null;

        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, deleteDoc, setDoc } = firestoreModule;
        const { db } = configModule;

        await deleteDoc(doc(db, 'categories', String(catId)));

        // CASCADE: Update associated products to 'Skincare'
        if (targetNameEn) {
            const products = getProducts();
            let changedCount = 0;
            for (const prod of products) {
                const prodCat = typeof prod.category === 'object' ? prod.category.en : prod.category;
                if (prodCat === targetNameEn || prodCat === targetNameAr) {
                    prod.category = 'Skincare';
                    changedCount++;
                    try {
                        await setDoc(doc(db, 'products', String(prod.id)), { category: 'Skincare' }, { merge: true });
                    } catch (e) {}
                }
            }
            if (changedCount > 0) {
                saveProducts(products);
                loadProductsTable();
            }
        }
    } catch (e) {
        console.warn('Firestore category delete notice:', e);
    }

    let categories = await getCategories();
    categories = categories.filter((c) => String(c.id) !== String(catId));
    saveCategories(categories);
    showToast(isAr ? 'تم حذف القسم وتحديث المنتجات المرتبطة به' : 'Category deleted and products updated');
    await loadCategoriesTable();
};

const editCategory = async (catId) => {
    const categories = await getCategories();
    const cat = categories.find((c) => String(c.id) === String(catId));
    if (!cat) return;

    document.getElementById('categoryId').value = cat.id;
    const nameEn = typeof cat.name === 'object' ? (cat.name.en || '') : cat.name;
    const nameAr = typeof cat.name === 'object' ? (cat.name.ar || '') : '';
    document.getElementById('categoryNameEn').value = nameEn;
    document.getElementById('categoryNameAr').value = nameAr;
    document.getElementById('categoryImage').value = cat.image || '';

    const title = document.getElementById('categoryFormTitle');
    if (title) title.textContent = 'Edit Category / تعديل القسم';
    const btn = document.getElementById('saveCategoryBtn');
    if (btn) btn.textContent = 'Update Category';

    document.getElementById('categoryForm')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// Banner Actions
const resetBannerForm = () => {
    const form = document.getElementById('bannerForm');
    if (form) form.reset();
    document.getElementById('bannerId').value = '';
    const title = document.getElementById('bannerFormTitle');
    if (title) title.textContent = 'Add New Banner';
    const btn = document.getElementById('saveBannerBtn');
    if (btn) btn.textContent = 'Save Banner';
};

const deleteBanner = async (bannerId) => {
    if (confirm('Delete this campaign banner? / هل تريد حذف هذا البانر؟')) {
        try {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            const configModule = await import('./firebase-config.js');
            const { doc, deleteDoc } = firestoreModule;
            const { db } = configModule;
            await deleteDoc(doc(db, 'banners', String(bannerId)));
        } catch (e) {
            console.warn('Firestore banner delete notice:', e);
        }

        let banners = await getBanners();
        banners = banners.filter((b) => String(b.id) !== String(bannerId));
        saveBanners(banners);
        showToast('Banner deleted / تم حذف البانر');
        await loadBannersTable();
    }
};

const editBanner = async (bannerId) => {
    const banners = await getBanners();
    const banner = banners.find((b) => String(b.id) === String(bannerId));
    if (!banner) return;

    document.getElementById('bannerId').value = banner.id;

    document.getElementById('bannerBadgeEn').value = typeof banner.badge === 'object' ? (banner.badge.en || '') : (banner.badge || '');
    document.getElementById('bannerBadgeAr').value = typeof banner.badge === 'object' ? (banner.badge.ar || '') : '';

    document.getElementById('bannerTitleEn').value = typeof banner.title === 'object' ? (banner.title.en || '') : (banner.title || '');
    document.getElementById('bannerTitleAr').value = typeof banner.title === 'object' ? (banner.title.ar || '') : '';

    document.getElementById('bannerSubtitleEn').value = typeof banner.subtitle === 'object' ? (banner.subtitle.en || '') : (banner.subtitle || '');
    document.getElementById('bannerSubtitleAr').value = typeof banner.subtitle === 'object' ? (banner.subtitle.ar || '') : '';

    document.getElementById('bannerDescriptionEn').value = typeof banner.description === 'object' ? (banner.description.en || '') : (banner.description || '');
    document.getElementById('bannerDescriptionAr').value = typeof banner.description === 'object' ? (banner.description.ar || '') : '';

    document.getElementById('bannerButtonTextEn').value = typeof banner.buttonText === 'object' ? (banner.buttonText.en || '') : (banner.buttonText || '');
    document.getElementById('bannerButtonTextAr').value = typeof banner.buttonText === 'object' ? (banner.buttonText.ar || '') : '';

    document.getElementById('bannerImageUrl').value = banner.imageUrl || '';
    document.getElementById('bannerTargetUrl').value = banner.targetUrl || 'products.html';

    const title = document.getElementById('bannerFormTitle');
    if (title) title.textContent = 'Edit Banner / تعديل البانر';
    const btn = document.getElementById('saveBannerBtn');
    if (btn) btn.textContent = 'Update Banner';

    document.getElementById('bannerForm')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
const updateOrderStatus = async (orderId, newStatus) => {
    const orders = getOrders();
    const order = orders.find((o) => o.orderId === orderId);

    if (order) {
        order.status = newStatus;
        if (newStatus === 'delivered' && typeof order.isRated === 'undefined') {
            order.isRated = false;
        }
        order.updatedAt = new Date().toISOString();
        order.statusHistory = order.statusHistory || [];
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: `Status updated by Admin to ${newStatus}`
        });

        saveOrders(orders);

        // Sync order status to Firestore collection 'orders'
        try {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            const configModule = await import('./firebase-config.js');
            const { doc, setDoc } = firestoreModule;
            const { db } = configModule;
            await setDoc(doc(db, 'orders', orderId), {
                ...order,
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch (err) {
            console.warn('Firestore order status update fallback:', err);
        }

        try {
            localStorage.setItem('luxe_orders_updated', Date.now());
            window.dispatchEvent(new CustomEvent('orders-updated'));
        } catch (e) {}

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

// ============================================
// SUPER ADMIN: USER MANAGEMENT & PERMISSIONS
// ============================================

const showAddUserForm = () => {
    const card = document.getElementById('addUserFormCard');
    if (card) card.classList.remove('hidden');
};

const hideAddUserForm = () => {
    const card = document.getElementById('addUserFormCard');
    if (card) card.classList.add('hidden');
};

const toggleUserBlock = async (identifier) => {
    const users = await getUsers();
    const user = users.find((u) => String(u.id) === String(identifier) || u.email?.toLowerCase() === String(identifier).toLowerCase());
    if (!user) return;

    user.isBlocked = !user.isBlocked;

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, serverTimestamp } = firestoreModule;
        const { db } = configModule;

        const docId = String(user.id || user.email);
        await setDoc(doc(db, 'users', docId), {
            isBlocked: user.isBlocked,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn('Firestore user block sync fallback:', e);
    }

    saveUsers(users);
    showToast(user.isBlocked ? 'Customer account blocked / تم حظر العميل' : 'Customer account unblocked / تم إلغاء حظر العميل');
    await loadUsersTable();
};

const updateUserRole = async (identifier, newRole) => {
    const users = await getUsers();
    const user = users.find((u) => String(u.id) === String(identifier) || u.email?.toLowerCase() === String(identifier).toLowerCase());
    if (!user) return;

    user.role = newRole;
    user.isAdmin = (newRole === 'admin');
    if (!user.permissions) user.permissions = {};
    if (newRole === 'admin') {
        user.permissions = { products: true, orders: true, banners: true, settings: true };
    } else if (newRole === 'moderator') {
        user.permissions = { products: false, orders: true, banners: false, settings: false };
    }

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, serverTimestamp } = firestoreModule;
        const { db } = configModule;

        const docId = String(user.id || user.email);
        await setDoc(doc(db, 'users', docId), {
            role: user.role,
            isAdmin: user.isAdmin,
            permissions: user.permissions,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn('Firestore user role sync fallback:', e);
    }

    saveUsers(users);
    showToast(`Role updated to ${newRole.toUpperCase()} / تم تحديث الصلاحية`);
    await loadUsersTable();
};

const openPermissionsModal = async (identifier) => {
    const users = await getUsers();
    const user = users.find((u) => String(u.id) === String(identifier) || u.email?.toLowerCase() === String(identifier).toLowerCase());
    if (!user) return;

    const modal = document.getElementById('permissionsModal');
    if (!modal) return;

    document.getElementById('permUserId').value = String(user.id || user.email);
    const emailEl = document.getElementById('permUserEmail');
    if (emailEl) emailEl.textContent = `${user.name} (${user.email || 'No email'})`;

    const roleSelect = document.getElementById('permRoleSelect');
    if (roleSelect) roleSelect.value = user.role || 'customer';

    const perms = user.permissions || {};
    const permProducts = document.getElementById('permProducts');
    const permOrders = document.getElementById('permOrders');
    const permBanners = document.getElementById('permBanners');
    const permSettings = document.getElementById('permSettings');

    if (permProducts) permProducts.checked = !!perms.products || user.role === 'admin';
    if (permOrders) permOrders.checked = !!perms.orders || user.role === 'admin';
    if (permBanners) permBanners.checked = !!perms.banners || user.role === 'admin';
    if (permSettings) permSettings.checked = !!perms.settings || user.role === 'admin';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
};

const closePermissionsModal = () => {
    const modal = document.getElementById('permissionsModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
};

const saveUserPermissions = async () => {
    const identifier = document.getElementById('permUserId')?.value;
    if (!identifier) return;

    const users = await getUsers();
    const user = users.find((u) => String(u.id) === String(identifier) || u.email?.toLowerCase() === String(identifier).toLowerCase());
    if (!user) return;

    const newRole = document.getElementById('permRoleSelect')?.value || 'customer';
    const permissions = {
        products: document.getElementById('permProducts')?.checked || false,
        orders: document.getElementById('permOrders')?.checked || false,
        banners: document.getElementById('permBanners')?.checked || false,
        settings: document.getElementById('permSettings')?.checked || false
    };

    user.role = newRole;
    user.isAdmin = (newRole === 'admin');
    user.permissions = permissions;

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, serverTimestamp } = firestoreModule;
        const { db } = configModule;

        const docId = String(user.id || user.email);
        await setDoc(doc(db, 'users', docId), {
            role: user.role,
            isAdmin: user.isAdmin,
            permissions: user.permissions,
            updatedAt: serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.warn('Firestore permissions save fallback:', e);
    }

    saveUsers(users);
    closePermissionsModal();
    showToast('Customer permissions updated / تم حفظ الصلاحيات بنجاح');
    await loadUsersTable();
};

const deleteUser = async (identifier) => {
    const isAr = window.i18n?.currentLang === 'ar';
    const confirmMsg = isAr ? 'هل أنت متأكد من حذف هذا العميل نهائياً من قاعدة البيانات؟' : 'Are you sure you want to permanently delete this customer?';
    if (!confirm(confirmMsg)) return;

    try {
        const users = await getUsers();
        const user = users.find((u) => String(u.id) === String(identifier) || u.email?.toLowerCase() === String(identifier).toLowerCase());
        const docId = user ? String(user.id || user.email) : String(identifier);

        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, deleteDoc } = firestoreModule;
        const { db } = configModule;

        await deleteDoc(doc(db, 'users', docId));
    } catch (e) {
        console.warn('Firestore user delete notice:', e);
    }

    let users = await getUsers();
    users = users.filter((u) => String(u.id) !== String(identifier) && u.email?.toLowerCase() !== String(identifier).toLowerCase());
    saveUsers(users);
    showToast(isAr ? 'تم حذف العميل بنجاح' : 'Customer account deleted successfully');
    await loadUsersTable();
    loadDashboardOverview();
};

// ============================================
// STORE SETTINGS & LIVE CMS LOADER
// ============================================
const loadStoreSettingsForm = async () => {
    const settings = await getStoreSettings();
    if (!settings) return;

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.value = val;
    };

    setVal('storeName', settings.storeName);
    setVal('supportEmail', settings.supportEmail);
    setVal('supportPhone', settings.supportPhone);
    setVal('freeShippingThreshold', settings.freeShippingThreshold);

    const hp = settings.homepage || {};
    setVal('homePhilosophyBadgeEn', hp.philosophyBadge?.en || hp.philosophyBadge || '');
    setVal('homePhilosophyBadgeAr', hp.philosophyBadge?.ar || '');
    setVal('homePhilosophyTitleEn', hp.philosophyTitle?.en || hp.philosophyTitle || '');
    setVal('homePhilosophyTitleAr', hp.philosophyTitle?.ar || '');
    setVal('homePhilosophyDescEn', hp.philosophyDesc?.en || hp.philosophyDesc || '');
    setVal('homePhilosophyDescAr', hp.philosophyDesc?.ar || '');
    setVal('homeFeaturedTitleEn', hp.featuredTitle?.en || hp.featuredTitle || '');
    setVal('homeFeaturedTitleAr', hp.featuredTitle?.ar || '');

    const ab = settings.aboutPage || {};
    setVal('aboutHeroTitleEn', ab.heroTitle?.en || ab.heroTitle || '');
    setVal('aboutHeroTitleAr', ab.heroTitle?.ar || '');
    setVal('aboutHeroDescEn', ab.heroDesc?.en || ab.heroDesc || '');
    setVal('aboutHeroDescAr', ab.heroDesc?.ar || '');
    setVal('aboutStoryDescEn', ab.storyDesc?.en || ab.storyDesc || '');
    setVal('aboutStoryDescAr', ab.storyDesc?.ar || '');

    const ft = settings.footer || {};
    setVal('footerAboutEn', ft.about?.en || ft.about || '');
    setVal('footerAboutAr', ft.about?.ar || '');
    setVal('footerCopyrightEn', ft.copyright?.en || ft.copyright || '');
    setVal('footerCopyrightAr', ft.copyright?.ar || '');

    const sc = settings.socials || {};
    setVal('socialFacebook', sc.facebook || '');
    setVal('socialTiktok', sc.tiktok || '');
    setVal('socialInstagram', sc.instagram || '');
    setVal('socialWhatsapp', sc.whatsapp || '');

    const gf = settings.gift || {};
    const giftCheckbox = document.getElementById('giftEnabled');
    if (giftCheckbox) giftCheckbox.checked = gf.enabled !== false;
    setVal('giftMinSpend', gf.minSpend ?? 500);
    setVal('giftNameEn', gf.name?.en || (typeof gf.name === 'string' ? gf.name : 'Mini Splash Khamrah'));
    setVal('giftNameAr', gf.name?.ar || 'ميني سبلاش خمرة');
    setVal('giftOriginalPrice', gf.originalPrice ?? 122.50);
    setVal('giftImage', gf.image || './images/slider 1.jpeg');
    setVal('giftTimerMinutes', gf.timerMinutes ?? 30);
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
    loadProductsTable();
    loadCategoriesTable();
    fetchProducts();

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
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const productId = document.getElementById('productId').value.trim();
            const originalPrice = parseFloat(document.getElementById('productOriginalPrice').value) || 0;
            const salePrice = parseFloat(document.getElementById('productSalePrice').value) || originalPrice;

            const productData = {
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

            const isAr = window.i18n?.currentLang === 'ar';
            if (productId) {
                // UPDATE existing product
                productData.id = productId;
                await updateProduct(productId, productData);
                showToast(isAr ? 'تم تحديث بيانات المنتج بنجاح' : 'Product formula updated successfully');
            } else {
                // ADD new product
                await addProduct(productData);
                showToast(isAr ? 'تمت إضافة المنتج الجديد بنجاح' : 'New product formula added successfully');
            }

            closeProductModal();
        });
    }

    // Category Form
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('categoryId')?.value.trim() || '';
            const nameEn = document.getElementById('categoryNameEn')?.value.trim() || '';
            const nameAr = document.getElementById('categoryNameAr')?.value.trim() || '';
            const image = document.getElementById('categoryImage')?.value.trim() || '';

            if (!nameEn && !nameAr) {
                showToast(window.i18n?.currentLang === 'ar' ? 'يرجى إدخال اسم القسم' : 'Please enter category name in at least one language', 'error');
                return;
            }

            try {
                await saveCategory({
                    id: id || undefined,
                    name: { en: nameEn || nameAr, ar: nameAr || nameEn },
                    image: image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
                });

                resetCategoryForm();
                showToast(window.i18n?.currentLang === 'ar' ? 'تم حفظ القسم بنجاح' : 'Category saved successfully');
                await loadCategoriesTable();
            } catch (err) {
                console.error('Error saving category:', err);
                showToast('Failed to save category', 'error');
            }
        });
    }

    // Banner Form
    const bannerForm = document.getElementById('bannerForm');
    if (bannerForm) {
        bannerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('bannerId')?.value.trim() || '';
            const badgeEn = document.getElementById('bannerBadgeEn')?.value.trim() || '';
            const badgeAr = document.getElementById('bannerBadgeAr')?.value.trim() || '';
            const titleEn = document.getElementById('bannerTitleEn')?.value.trim() || '';
            const titleAr = document.getElementById('bannerTitleAr')?.value.trim() || '';
            const subtitleEn = document.getElementById('bannerSubtitleEn')?.value.trim() || '';
            const subtitleAr = document.getElementById('bannerSubtitleAr')?.value.trim() || '';
            const descriptionEn = document.getElementById('bannerDescriptionEn')?.value.trim() || '';
            const descriptionAr = document.getElementById('bannerDescriptionAr')?.value.trim() || '';
            const buttonTextEn = document.getElementById('bannerButtonTextEn')?.value.trim() || '';
            const buttonTextAr = document.getElementById('bannerButtonTextAr')?.value.trim() || '';
            const imageUrl = document.getElementById('bannerImageUrl')?.value.trim() || '';
            const targetUrl = document.getElementById('bannerTargetUrl')?.value.trim() || 'products.html';

            if (!titleEn && !titleAr) {
                showToast(window.i18n?.currentLang === 'ar' ? 'يرجى إدخال عنوان البانر' : 'Please provide a banner title', 'error');
                return;
            }

            try {
                await saveBanner({
                    id: id || undefined,
                    badge: { en: badgeEn || badgeAr || 'Featured Ritual', ar: badgeAr || badgeEn || 'طقس مميز' },
                    title: { en: titleEn || titleAr, ar: titleAr || titleEn },
                    subtitle: { en: subtitleEn || subtitleAr, ar: subtitleAr || subtitleEn },
                    description: { en: descriptionEn || descriptionAr, ar: descriptionAr || descriptionEn },
                    buttonText: { en: buttonTextEn || buttonTextAr || 'Shop Now', ar: buttonTextAr || buttonTextEn || 'تسوق الآن' },
                    imageUrl: imageUrl || './images/slider 1.jpeg',
                    targetUrl
                });

                resetBannerForm();
                showToast(window.i18n?.currentLang === 'ar' ? 'تم حفظ البانر بنجاح' : 'Banner saved successfully');
                await loadBannersTable();
            } catch (err) {
                console.error('Error saving banner:', err);
                showToast('Failed to save banner', 'error');
            }
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
        addUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const userId = `user_${Date.now()}`;
            const newUser = {
                id: userId,
                name: document.getElementById('newUserName').value.trim(),
                email: document.getElementById('newUserEmail').value.trim(),
                phone: document.getElementById('newUserPhone').value.trim(),
                address: document.getElementById('newUserAddress').value.trim(),
                role: 'customer',
                isAdmin: false,
                permissions: { products: false, orders: false, banners: false, settings: false },
                orders: [],
                isBlocked: false,
                createdAt: new Date().toISOString()
            };

            try {
                const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
                const configModule = await import('./firebase-config.js');
                const { doc, setDoc, serverTimestamp } = firestoreModule;
                const { db } = configModule;

                await setDoc(doc(db, 'users', userId), {
                    ...newUser,
                    createdAt: serverTimestamp()
                }, { merge: true });
            } catch (err) {
                console.warn('Firestore user add sync fallback:', err);
            }

            const users = await getUsers();
            users.unshift(newUser);
            saveUsers(users);

            hideAddUserForm();
            addUserForm.reset();
            showToast(window.i18n?.currentLang === 'ar' ? 'تمت إضافة العميل بنجاح' : 'Customer added successfully');
            await loadUsersTable();
            loadDashboardOverview();
        });
    }

    // Store Settings Form (Live CMS)
    const storeSettingsForm = document.getElementById('storeSettingsForm');
    if (storeSettingsForm) {
        storeSettingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const settingsData = {
                storeName: document.getElementById('storeName')?.value.trim() || 'Koko Shop',
                supportEmail: document.getElementById('supportEmail')?.value.trim() || 'concierge@kokoshop.com',
                supportPhone: document.getElementById('supportPhone')?.value.trim() || '+20 100 000 0000',
                freeShippingThreshold: parseFloat(document.getElementById('freeShippingThreshold')?.value) || 500,
                homepage: {
                    philosophyBadge: {
                        en: document.getElementById('homePhilosophyBadgeEn')?.value.trim() || 'The Clean Philosophy',
                        ar: document.getElementById('homePhilosophyBadgeAr')?.value.trim() || 'فلسفة النقاء والجمال'
                    },
                    philosophyTitle: {
                        en: document.getElementById('homePhilosophyTitleEn')?.value.trim() || 'Nourish Your Skin With Pure Botanical Actives',
                        ar: document.getElementById('homePhilosophyTitleAr')?.value.trim() || 'غذّي بشرتكِ بخلاصات نباتية نقية وفعالة'
                    },
                    philosophyDesc: {
                        en: document.getElementById('homePhilosophyDescEn')?.value.trim() || '',
                        ar: document.getElementById('homePhilosophyDescAr')?.value.trim() || ''
                    },
                    featuredTitle: {
                        en: document.getElementById('homeFeaturedTitleEn')?.value.trim() || 'Featured Creations',
                        ar: document.getElementById('homeFeaturedTitleAr')?.value.trim() || 'إبداعاتنا المختارة'
                    }
                },
                aboutPage: {
                    heroTitle: {
                        en: document.getElementById('aboutHeroTitleEn')?.value.trim() || 'Where Botanical Wisdom Meets Clinical Formulation',
                        ar: document.getElementById('aboutHeroTitleAr')?.value.trim() || 'حيث تلتقي حكمة الطبيعة بالعلوم السريرية الحديثة'
                    },
                    heroDesc: {
                        en: document.getElementById('aboutHeroDescEn')?.value.trim() || '',
                        ar: document.getElementById('aboutHeroDescAr')?.value.trim() || ''
                    },
                    storyDesc: {
                        en: document.getElementById('aboutStoryDescEn')?.value.trim() || '',
                        ar: document.getElementById('aboutStoryDescAr')?.value.trim() || ''
                    }
                },
                footer: {
                    about: {
                        en: document.getElementById('footerAboutEn')?.value.trim() || '',
                        ar: document.getElementById('footerAboutAr')?.value.trim() || ''
                    },
                    copyright: {
                        en: document.getElementById('footerCopyrightEn')?.value.trim() || '© 2026 Koko Shop. All botanical clinical formulations preserved.',
                        ar: document.getElementById('footerCopyrightAr')?.value.trim() || '© 2026 كوكو شوب. جميع التركيبات النباتية والسريرية محفوظة ومحمية.'
                    }
                },
                socials: {
                    facebook: document.getElementById('socialFacebook')?.value.trim() || '',
                    tiktok: document.getElementById('socialTiktok')?.value.trim() || '',
                    instagram: document.getElementById('socialInstagram')?.value.trim() || '',
                    whatsapp: document.getElementById('socialWhatsapp')?.value.trim() || ''
                },
                gift: {
                    enabled: document.getElementById('giftEnabled')?.checked ?? true,
                    minSpend: Number(document.getElementById('giftMinSpend')?.value) || 500,
                    name: {
                        en: document.getElementById('giftNameEn')?.value.trim() || 'Mini Splash Khamrah',
                        ar: document.getElementById('giftNameAr')?.value.trim() || 'ميني سبلاش خمرة'
                    },
                    originalPrice: Number(document.getElementById('giftOriginalPrice')?.value) || 122.50,
                    image: document.getElementById('giftImage')?.value.trim() || './images/slider 1.jpeg',
                    timerMinutes: Number(document.getElementById('giftTimerMinutes')?.value) || 30
                }
            };

            await saveStoreSettings(settingsData);
            showToast(window.i18n?.currentLang === 'ar' ? 'تم حفظ ونشر إعدادات المتجر والـ CMS بنجاح' : 'Store configurations and Live CMS deployed successfully');
        });
    }

    // Sidebar Mobile Toggle & Backdrop listeners
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    if (sidebarToggle) {
        sidebarToggle.onclick = (e) => {
            e.preventDefault();
            toggleMobileSidebar();
        };
    }
    if (sidebarBackdrop) {
        sidebarBackdrop.onclick = () => {
            closeMobileSidebar();
        };
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMobileSidebar();
        }
    });

    // Load initial settings and users
    loadStoreSettingsForm();
    loadUsersTable();
});

// ============================================
// GLOBAL WINDOW EXPORTS (FOR INLINE HTML HANDLERS)
// ============================================
window.showTab = showTab;
window.logout = logout;
window.initMockData = initMockData;
window.showToast = showToast;

// Products
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.fetchProducts = fetchProducts;
window.getProducts = getProducts;
window.saveProducts = saveProducts;
window.showAddProductModal = showAddProductModal;
window.closeProductModal = closeProductModal;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.loadProductsTable = loadProductsTable;

// Categories
window.resetCategoryForm = resetCategoryForm;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.loadCategoriesTable = loadCategoriesTable;
window.getCategories = getCategories;

// Banners
window.resetBannerForm = resetBannerForm;
window.editBanner = editBanner;
window.deleteBanner = deleteBanner;
window.loadBannersTable = loadBannersTable;
window.getBanners = getBanners;

// Reviews
window.resetReviewForm = resetReviewForm;
window.deleteReview = deleteReview;
window.loadReviewsTable = loadReviewsTable;

// Notifications
window.markAllNotificationsAsRead = markAllNotificationsAsRead;
window.clearAllNotifications = clearAllNotifications;
window.loadAdminNotifications = loadAdminNotifications;

// Orders
window.viewOrderDetails = viewOrderDetails;
window.closeOrderDetailsModal = closeOrderDetailsModal;
window.updateOrderStatus = updateOrderStatus;
window.loadOrdersTable = loadOrdersTable;

// Users & Permissions (Super Admin)
window.showAddUserForm = showAddUserForm;
window.hideAddUserForm = hideAddUserForm;
window.toggleUserBlock = toggleUserBlock;
window.updateUserRole = updateUserRole;
window.openPermissionsModal = openPermissionsModal;
window.closePermissionsModal = closePermissionsModal;
window.saveUserPermissions = saveUserPermissions;
window.deleteUser = deleteUser;
window.loadUsersTable = loadUsersTable;
window.getUsers = getUsers;

// Store Settings & Live CMS
window.loadStoreSettingsForm = loadStoreSettingsForm;
window.getStoreSettings = getStoreSettings;
window.saveStoreSettings = saveStoreSettings;

// Dashboard
window.loadDashboardOverview = loadDashboardOverview;

// ============================================
// LIVE CHAT INBOX SYSTEM (PHASE 5)
// ============================================
let _activeInboxChatId = null;
let _inboxChatsCache = [];
let _inboxUnsubscribe = null;
let _activeChatUnsubscribe = null;

const getChats = () => JSON.parse(localStorage.getItem('luxe_chats')) || [];
const saveChats = (chats) => localStorage.setItem('luxe_chats', JSON.stringify(chats));

const loadInboxTab = async () => {
    const threadsContainer = document.getElementById('inboxThreadsList');
    if (!threadsContainer) return;

    threadsContainer.innerHTML = '<div class="text-center py-16 text-gray-400 text-xs"><i class="fas fa-spinner fa-spin text-xl mb-2 text-pink-400"></i><p>Loading conversations...</p></div>';

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { collection, onSnapshot, query, orderBy } = firestoreModule;
        const { db } = configModule;

        if (_inboxUnsubscribe) _inboxUnsubscribe();

        // Listen in real time to all chats
        const q = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'));
        _inboxUnsubscribe = onSnapshot(q, (snapshot) => {
            const chats = snapshot.docs.map((docItem) => ({
                id: docItem.id,
                ...docItem.data()
            }));

            // Merge with local fallback
            const localChats = getChats();
            const mergedMap = new Map();
            localChats.forEach((c) => mergedMap.set(c.id, c));
            chats.forEach((c) => mergedMap.set(c.id, { ...mergedMap.get(c.id), ...c }));
            _inboxChatsCache = Array.from(mergedMap.values()).sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
            saveChats(_inboxChatsCache);

            renderInboxThreads(_inboxChatsCache);
            updateInboxUnreadBadge();

            // If an active thread is selected, refresh its view
            if (_activeInboxChatId) {
                const currentChat = _inboxChatsCache.find((c) => c.id === _activeInboxChatId);
                if (currentChat) {
                    renderInboxActiveMessages(currentChat);
                }
            } else if (_inboxChatsCache.length > 0) {
                if (window.innerWidth >= 768) {
                    selectInboxThread(_inboxChatsCache[0].id);
                }
            }
        }, (err) => {
            console.warn('Realtime inbox snapshot notice:', err);
            _inboxChatsCache = getChats();
            renderInboxThreads(_inboxChatsCache);
            updateInboxUnreadBadge();
        });
    } catch (err) {
        console.warn('Load inbox fallback:', err);
        _inboxChatsCache = getChats();
        renderInboxThreads(_inboxChatsCache);
        updateInboxUnreadBadge();
    }
};

const updateInboxUnreadBadge = () => {
    const badge = document.getElementById('inboxUnreadBadge');
    if (!badge) return;
    const unreadCount = _inboxChatsCache.filter((c) => c.unreadByAdmin).length;
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
};

const renderInboxThreads = (threads) => {
    const listEl = document.getElementById('inboxThreadsList');
    if (!listEl) return;

    if (!threads || threads.length === 0) {
        listEl.innerHTML = `
            <div class="text-center py-16 text-gray-400 text-xs p-4">
                <i class="fas fa-inbox text-3xl mb-2 text-pink-200"></i>
                <p class="font-semibold text-gray-600 dark:text-gray-300">لا توجد محادثات حتى الآن</p>
                <p class="mt-1 text-gray-400">ستظهر رسائل واستفسارات العملاء هنا فور إرسالها من المتجر.</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = threads.map((chat) => {
        const isActive = chat.id === _activeInboxChatId;
        const name = chat.customerName || chat.customerEmail || 'Client';
        const initials = name.slice(0, 2).toUpperCase();
        const lastMsg = chat.lastMessage || 'بدأت محادثة جديدة';
        const isUnread = !!chat.unreadByAdmin;
        const timeStr = chat.updatedAt ? formatChatTime(chat.updatedAt) : 'الآن';
        const isResolved = chat.status === 'resolved';

        return `
            <div onclick="selectInboxThread('${chat.id}')" 
                class="p-3.5 flex items-start gap-3 cursor-pointer transition ${isActive ? 'bg-pink-50/80 dark:bg-slate-700/60 border-l-4 border-pink-500' : 'hover:bg-pink-50/30 dark:hover:bg-slate-700/30'}">
                <div class="w-10 h-10 rounded-full ${isActive ? 'bg-pink-500 text-white' : 'bg-pink-100 dark:bg-slate-700 text-pink-600 dark:text-pink-400'} flex items-center justify-center font-bold text-xs shrink-0 relative">
                    ${initials}
                    ${isUnread ? '<span class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-rose-500 border-2 border-white dark:border-slate-800 rounded-full"></span>' : ''}
                </div>
                <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-1 mb-0.5">
                        <h4 class="text-xs font-bold ${isUnread ? 'text-gray-900 dark:text-white font-extrabold' : 'text-gray-700 dark:text-gray-300'} truncate">${name}</h4>
                        <span class="text-[10px] text-gray-400 shrink-0 font-mono">${timeStr}</span>
                    </div>
                    <p class="text-[11px] ${isUnread ? 'text-pink-600 dark:text-pink-400 font-semibold' : 'text-gray-400'} truncate">${lastMsg}</p>
                    <div class="flex items-center gap-1.5 mt-1">
                        <span class="text-[9px] px-1.5 py-0.2 rounded font-medium ${isResolved ? 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-gray-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'}">
                            ${isResolved ? 'تم الحل' : 'مفتوحة'}
                        </span>
                        ${chat.customerEmail ? `<span class="text-[9px] text-gray-400 truncate max-w-[120px] font-mono">${chat.customerEmail}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

const selectInboxThread = async (chatId) => {
    _activeInboxChatId = chatId;
    const chat = _inboxChatsCache.find((c) => c.id === chatId);
    if (!chat) return;

    renderInboxThreads(_inboxChatsCache);

    const name = chat.customerName || chat.customerEmail || 'Client';
    const email = chat.customerEmail || 'Guest Client';

    const nameEl = document.getElementById('inboxActiveName');
    const emailEl = document.getElementById('inboxActiveEmail');
    const avatarEl = document.getElementById('inboxActiveAvatar');
    const actionsEl = document.getElementById('inboxActiveActions');
    const replyContainer = document.getElementById('inboxReplyContainer');
    const statusBadge = document.getElementById('inboxActiveStatusBadge');

    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;
    if (avatarEl) avatarEl.textContent = name.slice(0, 2).toUpperCase();
    if (actionsEl) actionsEl.classList.remove('hidden');
    if (replyContainer) replyContainer.classList.remove('hidden');

    if (statusBadge) {
        if (chat.status === 'resolved') {
            statusBadge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300';
            statusBadge.textContent = 'Resolved';
        } else {
            statusBadge.className = 'text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600';
            statusBadge.textContent = 'Active';
        }
    }

    renderInboxActiveMessages(chat);

    // Mark as read by admin in Firestore & local
    if (chat.unreadByAdmin) {
        chat.unreadByAdmin = false;
        saveChats(_inboxChatsCache);
        updateInboxUnreadBadge();

        try {
            const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
            const configModule = await import('./firebase-config.js');
            const { doc, updateDoc } = firestoreModule;
            const { db } = configModule;
            await updateDoc(doc(db, 'chats', chatId), {
                unreadByAdmin: false
            });
        } catch (e) {}
    }

    // Real-time listener on active chat document
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, onSnapshot } = firestoreModule;
        const { db } = configModule;

        if (_activeChatUnsubscribe) _activeChatUnsubscribe();
        _activeChatUnsubscribe = onSnapshot(doc(db, 'chats', chatId), (docSnap) => {
            if (docSnap.exists()) {
                const freshData = { id: docSnap.id, ...docSnap.data() };
                renderInboxActiveMessages(freshData);
            }
        });
    } catch (e) {}
};

const renderInboxActiveMessages = (chat) => {
    const stream = document.getElementById('inboxMessagesStream');
    if (!stream) return;

    const messages = chat.messages || [];
    if (messages.length === 0) {
        stream.innerHTML = `
            <div class="text-center py-16 text-gray-400 text-xs">
                <i class="fas fa-comment-dots text-3xl mb-2 text-pink-300"></i>
                <p>لا توجد رسائل سابقة في هذه المحادثة.</p>
                <p class="text-[11px] mt-1 text-gray-400">يمكنك كتابة رسالة أدناه لبدء التواصل مع العميل.</p>
            </div>
        `;
        return;
    }

    stream.innerHTML = messages.map((msg) => {
        const isAdmin = msg.sender === 'admin';
        const time = msg.timestamp ? formatChatTime(msg.timestamp) : '';
        const senderLabel = isAdmin ? 'Koko Support (أنت)' : (msg.senderName || chat.customerName || 'العميل');

        if (isAdmin) {
            return `
                <div class="flex flex-col items-end">
                    <div class="text-[10px] text-gray-400 mb-1 flex items-center gap-1.5">
                        <span>${time}</span>
                        <span class="font-bold text-pink-500">${senderLabel}</span>
                    </div>
                    <div class="max-w-[78%] bg-gradient-to-r from-pink-500 to-rose-500 text-white p-3 rounded-2xl rounded-tr-xs shadow-sm text-xs leading-relaxed">
                        ${escapeHtml(msg.text)}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-start">
                    <div class="text-[10px] text-gray-400 mb-1 flex items-center gap-1.5">
                        <span class="font-bold text-gray-700 dark:text-gray-300">${senderLabel}</span>
                        <span>${time}</span>
                    </div>
                    <div class="max-w-[78%] bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-3 rounded-2xl rounded-tl-xs shadow-sm border border-pink-100/60 dark:border-slate-700 text-xs leading-relaxed">
                        ${escapeHtml(msg.text)}
                    </div>
                </div>
            `;
        }
    }).join('');

    stream.scrollTop = stream.scrollHeight;
};

const sendAdminReply = async (event) => {
    if (event) event.preventDefault();
    if (!_activeInboxChatId) {
        showToast('يرجى اختيار محادثة أولاً', 'error');
        return;
    }

    const input = document.getElementById('inboxReplyInput');
    if (!input || !input.value.trim()) return;

    const replyText = input.value.trim();
    input.value = '';

    const newMsg = {
        id: 'msg_' + Date.now(),
        sender: 'admin',
        senderName: 'Koko Support / خدمة العملاء',
        text: replyText,
        timestamp: new Date().toISOString()
    };

    const chatIndex = _inboxChatsCache.findIndex((c) => c.id === _activeInboxChatId);
    let chat = null;
    if (chatIndex > -1) {
        chat = _inboxChatsCache[chatIndex];
        chat.messages = chat.messages || [];
        chat.messages.push(newMsg);
        chat.lastMessage = replyText;
        chat.lastSender = 'admin';
        chat.unreadByCustomer = true;
        chat.unreadByAdmin = false;
        chat.status = 'open';
        chat.updatedAt = new Date().toISOString();
        saveChats(_inboxChatsCache);
        renderInboxActiveMessages(chat);
        renderInboxThreads(_inboxChatsCache);
    }

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, setDoc, arrayUnion } = firestoreModule;
        const { db } = configModule;

        await setDoc(doc(db, 'chats', _activeInboxChatId), {
            id: _activeInboxChatId,
            customerEmail: chat?.customerEmail || '',
            customerName: chat?.customerName || 'Client',
            lastMessage: replyText,
            lastSender: 'admin',
            unreadByCustomer: true,
            unreadByAdmin: false,
            status: 'open',
            updatedAt: new Date().toISOString(),
            messages: arrayUnion(newMsg)
        }, { merge: true });

        localStorage.setItem('luxe_chats_updated', Date.now());
    } catch (err) {
        console.warn('Send admin reply Firestore fallback:', err);
    }
};

const toggleThreadResolved = async () => {
    if (!_activeInboxChatId) return;
    const chat = _inboxChatsCache.find((c) => c.id === _activeInboxChatId);
    if (!chat) return;

    const newStatus = chat.status === 'resolved' ? 'open' : 'resolved';
    chat.status = newStatus;
    chat.updatedAt = new Date().toISOString();
    saveChats(_inboxChatsCache);
    selectInboxThread(_activeInboxChatId);

    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, updateDoc } = firestoreModule;
        const { db } = configModule;
        await updateDoc(doc(db, 'chats', _activeInboxChatId), {
            status: newStatus,
            updatedAt: new Date().toISOString()
        });
    } catch (e) {}

    showToast(newStatus === 'resolved' ? 'تم تحديد المحادثة كمكتملة' : 'تم إعادة فتح المحادثة');
};

const filterInboxThreads = (query) => {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
        renderInboxThreads(_inboxChatsCache);
        return;
    }
    const filtered = _inboxChatsCache.filter((c) => 
        (c.customerName && c.customerName.toLowerCase().includes(q)) ||
        (c.customerEmail && c.customerEmail.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
    );
    renderInboxThreads(filtered);
};

const formatChatTime = (isoString) => {
    try {
        const d = new Date(isoString);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `${diffMins} د`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} س`;
        return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    } catch (e) {
        return '';
    }
};

const escapeHtml = (unsafe) => {
    return String(unsafe || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Export Inbox to window
window.loadInboxTab = loadInboxTab;
window.renderInboxThreads = renderInboxThreads;
window.selectInboxThread = selectInboxThread;
window.sendAdminReply = sendAdminReply;
window.toggleThreadResolved = toggleThreadResolved;
window.filterInboxThreads = filterInboxThreads;
window.getChats = getChats;
window.saveChats = saveChats;

// Language Change Re-render Listener
window.addEventListener('languageChanged', async () => {
    try {
        loadDashboardOverview();
        await loadCategoriesTable();
        await loadBannersTable();
        loadProductsTable();
        loadOrdersTable();
        await loadUsersTable();
        loadReviewsTable();
        loadStoreSettingsForm();
    } catch (e) {
        console.warn('Re-render on languageChanged notice:', e);
    }
});
