/**
 * ==============================================================================
 * KOKO SHOP / LUXE BEAUTY - MOCK DATA SEEDER (ES6+ / CLEAN CODE)
 * ==============================================================================
 * سكريبت توليد وحقن البيانات التجريبية (Demo Data) في Firebase Firestore
 * 
 * المبادئ المطبقة:
 * 1. الاعتماد الحصري على async/await لجميع عمليات Firebase (بدون سلاسل then/catch).
 * 2. استخدام معايير ES6+ (Arrow functions, Object Destructuring, Template Literals, Spread/Rest).
 * 3. حظر استخدام var والاعتماد على const و let فقط.
 * 4. تقسيم برمجي تركيبي (Modular Functions) لكل نوع بيانات.
 * 5. معالجة أخطاء احترافية باستخدام try...catch مع سجلات Console تفصيلية.
 * 6. حماية مطلقة لحساب المدير (Admin) وعدم المساس ببياناته.
 * 7. تنفيذ لمرة واحدة فقط مع تعطيل الزر وحفظ الحالة في LocalStorage.
 * ==============================================================================
 */

// الثوابت الأساسية
const ADMIN_EMAIL = 'aemade2016@gmail.com';
const STORAGE_KEY_SEEDED = 'koko_mock_data_seeded';
const LEGACY_STORAGE_KEY_SEEDED = 'luxe_mock_data_seeded';
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// قائمة العملاء التجريبيين (5 عملاء)
const DEMO_CUSTOMERS_LIST = [
    {
        name: 'أحمد محمود سالم',
        email: 'ahmed.salem@demo.koko.com',
        phone: '01012345678',
        address: '15 شارع النصر، مدينة نصر، القاهرة'
    },
    {
        name: 'سارة عبد الرحمن',
        email: 'sara.abdelrahman@demo.koko.com',
        phone: '01123456789',
        address: '22 شارع مصدق، الدقي، الجيزة'
    },
    {
        name: 'محمود حسن فهمي',
        email: 'mahmoud.fahmy@demo.koko.com',
        phone: '01234567890',
        address: '45 طريق الجيش، رشدي، الإسكندرية'
    },
    {
        name: 'نور الهدى إبراهيم',
        email: 'nour.ibrahim@demo.koko.com',
        phone: '01545678901',
        address: '10 شارع الثورة، مصر الجديدة، القاهرة'
    },
    {
        name: 'كريم يوسف منصور',
        email: 'karim.mansour@demo.koko.com',
        phone: '01098765432',
        address: '8 شارع الجمهورية، حي الجامعة، المنصورة'
    }
];

// قائمة المنتجات التجريبية المعتمدة لإنشاء الطلبات
const DEMO_PRODUCTS_CATALOG = [
    {
        name: 'Radiant Glow Serum',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop'
    },
    {
        name: 'Hydra Boost Moisturizer',
        price: 39.99,
        image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop'
    },
    {
        name: 'Gentle Cleansing Foam',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'
    },
    {
        name: 'Age-Defying Night Cream',
        price: 59.99,
        image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop'
    },
    {
        name: 'Vitamin C Eye Cream',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop'
    }
];

// حالات الطلبات المتوافقة مع لوحة التحكم
const ORDER_STATUSES = [
    'Under Review',
    'Shipped',
    'Delivered',
    'Under Review',
    'Delivered',
    'Shipped',
    'Cancelled',
    'Delivered',
    'Under Review',
    'Shipped'
];

// مصفوفة صور رمزية موثوقة للتقييمات
const REVIEW_AVATARS = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop'
];

// نصوص آراء واقعية باللغة العربية
const REVIEW_FEEDBACK_TEXTS = [
    'سيروم فيتامين C مذهل بجد! نضارة فورية للبشرة والنتيجة ظهرت من أول أسبوع.',
    'المرطب خفيف جداً وامتصاصه سريع، وترطيبه يدوم طول اليوم بدون أي ملمس دهني.',
    'غسول البشرة لطيف جداً وما بينشفش الوجه نهائي، وتجربة الشراء والتوصيل كانت ممتازة.',
    'كريم الليل ممتاز ومغذي جداً للبشرة، التغليف راقي والمنتج أصلي 100%. سأكرر الطلب بالتأكيد.',
    'كريم محيط العين خفف الهالات والانتفاخ بشكل ملحوظ خلال 10 أيام. أنصح به بشدة!'
];

// حالة قفل العملية لمنع التكرار المتزامن
let isSeedingInProgress = false;

/**
 * حساب تاريخ ماضي بصيغة ISO القياسية
 * @param {number} days - عدد الأيام للوراء
 * @returns {string} تاريخ ISO
 */
const getPastDateIso = (days = 0) => {
    const targetDate = new Date(Date.now() - days * MS_PER_DAY);
    return targetDate.toISOString();
};

/**
 * تحميل وحدات Firebase Firestore ديناميكياً
 * @returns {Promise<object>} كائن يحتوي على Firestore API و db
 */
const loadFirestoreServices = async () => {
    try {
        const [firestoreModule, configModule] = await Promise.all([
            import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'),
            import('./firebase-config.js')
        ]);

        return {
            ...firestoreModule,
            db: configModule.db,
            auth: configModule.auth
        };
    } catch (loadError) {
        console.error('[MockData] تعذر تحميل وحدات Firebase:', loadError);
        throw new Error(`فشل استيراد خدمات Firebase: ${loadError.message}`);
    }
};

/**
 * دالة لتوليد كائنات العملاء (5 عملاء)
 * @returns {Array<object>} مصفوفة العملاء
 */
const generateCustomers = () => {
    return DEMO_CUSTOMERS_LIST.map((customer, index) => {
        const pastDays = (index + 1) * 3;
        const createdAt = getPastDateIso(pastDays);

        return {
            ...customer,
            role: 'customer',
            status: 'Active',
            isBlocked: false,
            mockDataId: `demo-customer-${index + 1}`,
            orders: [],
            wishlist: [],
            createdAt,
            updatedAt: createdAt,
            isMockData: true
        };
    });
};

/**
 * دالة لتوليد كائنات الطلبات (10 طلبات بحالات وتواريخ مختلفة)
 * @param {Array<object>} customers - قائمة العملاء المولدين
 * @returns {Array<object>} مصفوفة الطلبات
 */
const generateOrders = (customers) => {
    return Array.from({ length: 10 }, (_, index) => {
        const customer = customers[index % customers.length];
        const primaryProduct = DEMO_PRODUCTS_CATALOG[index % DEMO_PRODUCTS_CATALOG.length];
        const secondaryProduct = DEMO_PRODUCTS_CATALOG[(index + 2) % DEMO_PRODUCTS_CATALOG.length];

        const items = [
            {
                name: primaryProduct.name,
                price: primaryProduct.price,
                image: primaryProduct.image,
                quantity: 1 + (index % 2)
            },
            {
                name: secondaryProduct.name,
                price: secondaryProduct.price,
                image: secondaryProduct.image,
                quantity: 1 + (index % 3)
            }
        ];

        const subtotal = Number(
            items.reduce((sum, { price, quantity }) => sum + price * quantity, 0).toFixed(2)
        );
        const shipping = 50.0;
        const tax = Number((subtotal * 0.05).toFixed(2));
        const total = Number((subtotal + shipping + tax).toFixed(2));

        const orderDate = getPastDateIso(index + 1);
        const status = ORDER_STATUSES[index % ORDER_STATUSES.length];

        return {
            orderId: `ORD-DEMO-${1001 + index}`,
            mockDataId: `demo-order-${index + 1}`,
            userId: customer.id || customer.mockDataId,
            customerName: customer.name,
            customerEmail: customer.email,
            phone: customer.phone,
            customerInfo: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: {
                    street: customer.address,
                    city: 'القاهرة',
                    state: 'القاهرة',
                    country: 'Egypt'
                }
            },
            items,
            status,
            total,
            pricing: {
                subtotal,
                shipping,
                tax,
                total
            },
            paymentMethod: index % 2 === 0 ? 'Cash on Delivery' : 'Credit Card',
            createdAt: orderDate,
            updatedAt: orderDate,
            isMockData: true
        };
    });
};

/**
 * دالة لتوليد كائنات التقييمات (5 تقييمات)
 * @param {Array<object>} customers - قائمة العملاء المولدين
 * @returns {Array<object>} مصفوفة التقييمات
 */
const generateReviews = (customers) => {
    return customers.map((customer, index) => {
        const reviewDate = getPastDateIso((index + 1) * 2);

        return {
            id: `demo-review-${String(index + 1).padStart(3, '0')}`,
            mockDataId: `demo-review-${index + 1}`,
            customerName: customer.name,
            customerEmail: customer.email,
            profileImage: REVIEW_AVATARS[index % REVIEW_AVATARS.length],
            rating: index === 2 || index === 4 ? 4 : 5,
            text: REVIEW_FEEDBACK_TEXTS[index % REVIEW_FEEDBACK_TEXTS.length],
            status: 'approved',
            createdAt: reviewDate,
            updatedAt: reviewDate,
            isMockData: true
        };
    });
};

/**
 * حقن العملاء التجريبيين في Firestore بأمان
 * @param {Array<object>} customers - العملاء المراد إضافتهم
 * @param {object} firestore - خدمات Firestore
 * @returns {Promise<number>} عدد السجلات المضافة فعلياً
 */
const seedCustomers = async (customers, firestore) => {
    const { addDoc, collection, getDocs, db } = firestore;
    console.log('[MockData] فحص العملاء الحاليين في قاعدة البيانات لتفادي التكرار...');

    const snapshot = await getDocs(collection(db, 'users'));
    const existingEmails = new Set(
        snapshot.docs.map((docItem) => String(docItem.data()?.email || '').trim().toLowerCase())
    );

    let insertedCount = 0;

    for (const customer of customers) {
        const normalizedEmail = (customer.email || '').trim().toLowerCase();

        // حماية صارمة: منع أي تلاعب بحساب الأدمن نهائياً
        if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
            console.warn(`[MockData] حماية الحساب: تم تخطي بريد المدير (${ADMIN_EMAIL}) لمنع أي تعديل عليه.`);
            continue;
        }

        // تفادي تكرار الحسابات
        if (existingEmails.has(normalizedEmail)) {
            console.info(`[MockData] العميل مسجل بالفعل مسبقاً، تخطي: ${customer.email}`);
            continue;
        }

        const docRef = await addDoc(collection(db, 'users'), {
            ...customer,
            createdAt: customer.createdAt || new Date().toISOString()
        });

        customer.id = docRef.id;
        existingEmails.add(normalizedEmail);
        insertedCount += 1;
        console.log(`[MockData] تم إضافة العميل: ${customer.name} [ID: ${docRef.id}]`);
    }

    return insertedCount;
};

/**
 * حقن الطلبات التجريبية في Firestore
 * @param {Array<object>} orders - الطلبات المراد إضافتها
 * @param {object} firestore - خدمات Firestore
 * @returns {Promise<number>} عدد الطلبات المضافة
 */
const seedOrders = async (orders, firestore) => {
    const { addDoc, collection, getDocs, db } = firestore;
    console.log('[MockData] فحص الطلبات الحالية في قاعدة البيانات لتفادي التكرار...');

    const snapshot = await getDocs(collection(db, 'orders'));
    const existingOrderIds = new Set(
        snapshot.docs.map((docItem) => String(docItem.data()?.orderId || '').trim())
    );

    let insertedCount = 0;

    for (const order of orders) {
        if (existingOrderIds.has(order.orderId)) {
            console.info(`[MockData] الطلب موجود بالفعل، تخطي: ${order.orderId}`);
            continue;
        }

        const docRef = await addDoc(collection(db, 'orders'), {
            ...order,
            createdAt: order.createdAt || new Date().toISOString(),
            updatedAt: order.updatedAt || new Date().toISOString()
        });

        existingOrderIds.add(order.orderId);
        insertedCount += 1;
        console.log(`[MockData] تم إضافة الطلب: #${order.orderId} [ID: ${docRef.id}]`);
    }

    return insertedCount;
};

/**
 * حقن التقييمات التجريبية في Firestore
 * @param {Array<object>} reviews - التقييمات المراد إضافتها
 * @param {object} firestore - خدمات Firestore
 * @returns {Promise<number>} عدد التقييمات المضافة
 */
const seedReviews = async (reviews, firestore) => {
    const { addDoc, collection, getDocs, db } = firestore;
    console.log('[MockData] فحص التقييمات الحالية في قاعدة البيانات لتفادي التكرار...');

    const snapshot = await getDocs(collection(db, 'reviews'));
    const existingReviewIds = new Set(
        snapshot.docs.map((docItem) => String(docItem.data()?.id || '').trim())
    );

    let insertedCount = 0;

    for (const review of reviews) {
        if (existingReviewIds.has(review.id)) {
            console.info(`[MockData] التقييم موجود بالفعل، تخطي: ${review.id}`);
            continue;
        }

        const docRef = await addDoc(collection(db, 'reviews'), {
            ...review,
            createdAt: review.createdAt || new Date().toISOString()
        });

        existingReviewIds.add(review.id);
        insertedCount += 1;
        console.log(`[MockData] تم إضافة تقييم من: ${review.customerName} [ID: ${docRef.id}]`);
    }

    return insertedCount;
};

/**
 * التحقق من صلاحية المدير الحالي
 * @returns {boolean} true إذا كان المستخدم الحالي هو الأدمن
 */
const isCurrentAdminAuthorized = () => {
    try {
        const storedUser = JSON.parse(localStorage.getItem('luxe_currentUser') || 'null');
        return Boolean(storedUser?.isAdmin === true && storedUser?.email === ADMIN_EMAIL);
    } catch (parseError) {
        console.error('[MockData] خطأ أثناء التحقق من بيانات المدير الحالي:', parseError);
        return false;
    }
};

/**
 * تحديث حالة زر التحميل في واجهة الإدارة
 * @param {object} options - خيارات الحالة (disabled, label, icon, isSpinner)
 */
const setButtonState = ({ disabled, label, icon = 'fa-database', isSpinner = false }) => {
    const button = document.getElementById('seedMockDataButton');
    if (!button) return;

    button.disabled = disabled;
    button.classList.toggle('opacity-50', disabled);
    button.classList.toggle('cursor-not-allowed', disabled);
    button.classList.toggle('hover:opacity-90', !disabled);

    const iconHtml = isSpinner
        ? '<i class="fas fa-spinner fa-spin mr-2"></i>'
        : `<i class="fas ${icon} mr-2"></i>`;

    button.innerHTML = `${iconHtml}<span>${label}</span>`;
};

/**
 * عرض رسائل تنبيهية للمستخدم عبر Toast أو Console
 * @param {string} message - نص الرسالة
 * @param {'success'|'error'|'info'} type - نوع الإشعار
 */
const showNotification = (message, type = 'info') => {
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
    } else {
        const logMethod = type === 'error' ? console.error : console.info;
        logMethod(`[MockData] [${type.toUpperCase()}]: ${message}`);
    }
};

/**
 * إعادة تحميل جداول لوحة التحكم وإحصائياتها ديناميكياً
 */
const refreshDashboardData = async () => {
    try {
        if (typeof window.loadUsers === 'function') await window.loadUsers();
        if (typeof window.loadOrders === 'function') await window.loadOrders();
        if (typeof window.loadReviews === 'function') await window.loadReviews();
        if (typeof window.loadDashboardStats === 'function') window.loadDashboardStats();
    } catch (refreshError) {
        console.warn('[MockData] تنبيه غير حرج أثناء تحديث واجهة لوحة التحكم:', refreshError);
    }
};

/**
 * الدالة الرئيسية لتوليد وحقن البيانات التجريبية بالكامل
 * تُشغل من خلال زر واجهة الإدارة لمرة واحدة فقط
 */
const initMockData = async () => {
    if (isSeedingInProgress) {
        console.warn('[MockData] عملية إضافة البيانات التجريبية جارية بالفعل حالياً.');
        return;
    }

    // 1. التحقق من صلاحية الأدمن
    if (!isCurrentAdminAuthorized()) {
        const authError = 'عملية إضافة البيانات التجريبية مسموحة لحساب المدير (Admin) فقط.';
        console.warn(`[MockData] ${authError}`);
        showNotification(authError, 'error');
        return;
    }

    // 2. التحقق مما إذا كانت البيانات قد حُقنت مسبقاً
    const isAlreadySeeded =
        localStorage.getItem(STORAGE_KEY_SEEDED) === 'true' ||
        localStorage.getItem(LEGACY_STORAGE_KEY_SEEDED) === 'true';

    if (isAlreadySeeded) {
        const seededNotice = 'تم تحميل البيانات التجريبية مسبقاً في قاعدة البيانات.';
        console.info(`[MockData] ${seededNotice}`);
        setButtonState({ disabled: true, label: 'Demo Data Loaded', icon: 'fa-check-circle' });
        showNotification(seededNotice, 'info');
        return;
    }

    isSeedingInProgress = true;
    setButtonState({ disabled: true, label: 'Loading Demo Data...', isSpinner: true });

    try {
        console.log('[MockData] بدء عملية إنشاء البيانات التجريبية...');

        // توليد البيانات عبر الدوال المتخصصة
        const customers = generateCustomers();
        const orders = generateOrders(customers);
        const reviews = generateReviews(customers);

        console.log(`[MockData] تم تجهيز: ${customers.length} عملاء، ${orders.length} طلبات، ${reviews.length} تقييمات.`);

        // استيراد وحدات Firebase Firestore
        const firestore = await loadFirestoreServices();

        // حقن البيانات في Firestore عبر async/await
        const [customerCount, orderCount, reviewCount] = await Promise.all([
            seedCustomers(customers, firestore),
            seedOrders(orders, firestore),
            seedReviews(reviews, firestore)
        ]);

        console.log(`[MockData] اكتملت الإضافة: ${customerCount} عميل، ${orderCount} طلب، ${reviewCount} تقييم.`);

        // تسجيل حالة الإتمام لمنع التكرار
        localStorage.setItem(STORAGE_KEY_SEEDED, 'true');
        localStorage.setItem(LEGACY_STORAGE_KEY_SEEDED, 'true');

        // تحديث واجهة لوحة التحكم
        await refreshDashboardData();

        // تثبيت حالة الزر كمنتهٍ
        setButtonState({ disabled: true, label: 'Demo Data Loaded', icon: 'fa-check-circle' });

        const successNotice = `تمت إضافة ${customerCount} عملاء و${orderCount} طلبات و${reviewCount} تقييمات بنجاح دون أي مساس بحساب المدير!`;
        showNotification(successNotice, 'success');
        console.log(`[MockData] نجاح: ${successNotice}`);
    } catch (fatalError) {
        console.error('[MockData] خطأ غير متوقع أثناء حقن البيانات التجريبية:', fatalError);
        setButtonState({ disabled: false, label: 'Load Demo Data', icon: 'fa-database' });
        showNotification(`فشل تحميل البيانات التجريبية: ${fatalError.message || fatalError}`, 'error');
    } finally {
        isSeedingInProgress = false;
    }
};

/**
 * تهيئة مستمعي الأحداث والزر عند اكتمال تحميل الصفحة
 */
const setupSeedButtonComponent = () => {
    const isAlreadySeeded =
        localStorage.getItem(STORAGE_KEY_SEEDED) === 'true' ||
        localStorage.getItem(LEGACY_STORAGE_KEY_SEEDED) === 'true';

    if (isAlreadySeeded) {
        setButtonState({ disabled: true, label: 'Demo Data Loaded', icon: 'fa-check-circle' });
    }

    const button = document.getElementById('seedMockDataButton');
    if (button && !button.dataset.listenerBound) {
        button.addEventListener('click', initMockData);
        button.dataset.listenerBound = 'true';
    }
};

// تفعيل التهيئة عند جهوزية الـ DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSeedButtonComponent);
} else {
    setupSeedButtonComponent();
}

// تصدير الدالة لنطاق window للتوافق التام مع سمات onclick
window.initMockData = initMockData;
window.seedMockData = initMockData;
