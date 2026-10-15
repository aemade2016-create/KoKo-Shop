(() => {
    const SEEDED_KEY = 'luxe_mock_data_seeded';
    const ADMIN_EMAIL = 'aemade2016@gmail.com';
    const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
    const DEMO_CUSTOMERS = [
        { name: 'أحمد محمد', email: 'ahmed.demo@example.com', phone: '01000000001', address: 'القاهرة، مدينة نصر' },
        { name: 'سارة علي', email: 'sara.demo@example.com', phone: '01000000002', address: 'الجيزة، الدقي' },
        { name: 'منير حسن', email: 'monir.demo@example.com', phone: '01000000003', address: 'الإسكندرية، سموحة' },
        { name: 'ليلى ناصر', email: 'layla.demo@example.com', phone: '01000000004', address: 'القاهرة، مصر الجديدة' },
        { name: 'يوسف إبراهيم', email: 'yousef.demo@example.com', phone: '01000000005', address: 'المنصورة، حي الجامعة' }
    ];
    const DEMO_PRODUCTS = [
        { name: 'Vitamin C Serum', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80', price: 189 },
        { name: 'Hydrating Face Cream', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80', price: 245 },
        { name: 'Glow Facial Cleanser', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80', price: 165 },
        { name: 'Night Repair Mask', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80', price: 210 },
        { name: 'Rose Water Mist', image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=400&q=80', price: 140 }
    ];
    const DEMO_STATUSES = ['Under Review', 'Shipped', 'Delivered', 'Cancelled', 'Pending'];

    let isSeeding = false;

    const daysAgo = (days) => new Date(Date.now() - days * DAY_IN_MILLISECONDS).toISOString();

    const generateCustomers = () => DEMO_CUSTOMERS.map((customer, index) => ({
        ...customer,
        role: 'customer',
        status: 'Active',
        isBlocked: false,
        mockDataId: `demo-customer-${index + 1}`,
        createdAt: daysAgo((index + 1) * 5)
    }));

    const generateOrders = (customers) => Array.from({ length: 10 }, (_, index) => {
        const customer = customers[index % customers.length];
        const firstProduct = DEMO_PRODUCTS[index % DEMO_PRODUCTS.length];
        const secondProduct = DEMO_PRODUCTS[(index + 1) % DEMO_PRODUCTS.length];
        const items = [
            { ...firstProduct, quantity: 1 + (index % 2) },
            { ...secondProduct, quantity: 1 + (index % 3) }
        ];
        const subtotal = items.reduce((total, { price, quantity }) => total + price * quantity, 0);
        const shipping = 50;
        const tax = Number((subtotal * 0.05).toFixed(2));
        const createdAt = daysAgo(index + 1);

        return {
            orderId: `ORD-DEMO-${1001 + index}`,
            mockDataId: `demo-order-${index + 1}`,
            userId: customer.mockDataId,
            customerName: customer.name,
            customerEmail: customer.email,
            phone: customer.phone,
            customerInfo: {
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: { street: customer.address, city: 'Egypt', country: 'Egypt' }
            },
            items,
            status: DEMO_STATUSES[index % DEMO_STATUSES.length],
            total: subtotal + shipping + tax,
            pricing: { subtotal, shipping, tax, total: subtotal + shipping + tax },
            createdAt,
            updatedAt: createdAt
        };
    });

    const generateReviews = (customers) => customers.map((customer, index) => ({
        id: `demo-review-${String(index + 1).padStart(3, '0')}`,
        mockDataId: `demo-review-${index + 1}`,
        customerName: customer.name,
        profileImage: `https://i.pravatar.cc/100?img=${12 + index}`,
        rating: index === 1 || index === 4 ? 4 : 5,
        text: [
            'منتجات ممتازة، الجودة عالية والخدمة سريعة جدًا.',
            'تجربة جميلة والتوصيل كان سريعًا. سأطلب مرة أخرى.',
            'أحببت المنتج، مناسب لبشرتي والنتيجة واضحة.',
            'التغليف رائع والمنتجات أصلية، أنصح بها.',
            'خدمة ممتازة ومنتجات بجودة عالية.'
        ][index],
        createdAt: daysAgo((index + 1) * 2)
    }));

    const getFirestore = async () => {
        const [firestore, { db }] = await Promise.all([
            import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js'),
            import('./firebase-config.js')
        ]);

        return { ...firestore, db };
    };

    const createDemoCustomers = async (customers, firestore) => {
        const { addDoc, collection, getDocs, serverTimestamp, db } = firestore;
        const snapshot = await getDocs(collection(db, 'users'));
        const existingEmails = new Set(snapshot.docs
            .map((document) => String(document.data().email || '').toLowerCase()));
        let createdCount = 0;

        for (const customer of customers) {
            const email = customer.email.toLowerCase();
            if (email === ADMIN_EMAIL || existingEmails.has(email)) continue;

            await addDoc(collection(db, 'users'), {
                ...customer,
                createdAt: serverTimestamp()
            });
            existingEmails.add(email);
            createdCount += 1;
        }

        return createdCount;
    };

    const createDemoOrders = async (orders, firestore) => {
        const { addDoc, collection, getDocs, serverTimestamp, db } = firestore;
        const snapshot = await getDocs(collection(db, 'orders'));
        const existingOrderIds = new Set(snapshot.docs
            .map((document) => String(document.data().orderId || '')));
        let createdCount = 0;

        for (const order of orders) {
            if (existingOrderIds.has(order.orderId)) continue;

            await addDoc(collection(db, 'orders'), {
                ...order,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            existingOrderIds.add(order.orderId);
            createdCount += 1;
        }

        return createdCount;
    };

    const createDemoReviews = async (reviews, firestore) => {
        const { addDoc, collection, getDocs, serverTimestamp, db } = firestore;
        const snapshot = await getDocs(collection(db, 'reviews'));
        const existingReviewIds = new Set(snapshot.docs
            .map((document) => String(document.data().id || '')));
        let createdCount = 0;

        for (const review of reviews) {
            if (existingReviewIds.has(review.id)) continue;

            await addDoc(collection(db, 'reviews'), {
                ...review,
                createdAt: serverTimestamp()
            });
            existingReviewIds.add(review.id);
            createdCount += 1;
        }

        return createdCount;
    };

    const getCurrentAdmin = () => {
        const currentUser = JSON.parse(localStorage.getItem('luxe_currentUser') || 'null');
        return currentUser?.isAdmin === true && currentUser.email === ADMIN_EMAIL;
    };

    const setButtonState = (isDisabled, label) => {
        const button = document.getElementById('seedMockDataButton');
        if (!button) return;

        button.disabled = isDisabled;
        button.textContent = label;
        button.classList.toggle('opacity-60', isDisabled);
        button.classList.toggle('cursor-not-allowed', isDisabled);
    };

    const showMessage = (message, type) => {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        } else {
            console[type === 'error' ? 'error' : 'info'](message);
        }
    };

    const refreshAdminData = async () => {
        const refreshTasks = ['loadOrders', 'loadUsers', 'loadReviews']
            .map((functionName) => window[functionName])
            .filter((refreshFunction) => typeof refreshFunction === 'function')
            .map((refreshFunction) => refreshFunction());

        await Promise.all(refreshTasks);
        if (typeof window.loadDashboardStats === 'function') window.loadDashboardStats();
    };

    const initMockData = async () => {
        if (isSeeding) return;
        if (!getCurrentAdmin()) {
            showMessage('بيانات التجربة متاحة لحساب المدير فقط.', 'error');
            return;
        }
        if (localStorage.getItem(SEEDED_KEY) === 'true') {
            setButtonState(true, 'Demo Data Loaded');
            showMessage('تم تحميل البيانات التجريبية بالفعل.', 'info');
            return;
        }

        isSeeding = true;
        setButtonState(true, 'Loading Demo Data...');

        try {
            const customers = generateCustomers();
            const orders = generateOrders(customers);
            const reviews = generateReviews(customers);
            const firestore = await getFirestore();
            const [customerCount, orderCount, reviewCount] = await Promise.all([
                createDemoCustomers(customers, firestore),
                createDemoOrders(orders, firestore),
                createDemoReviews(reviews, firestore)
            ]);

            localStorage.setItem(SEEDED_KEY, 'true');
            await refreshAdminData();
            setButtonState(true, 'Demo Data Loaded');
            showMessage(
                `تمت إضافة ${customerCount} عملاء و${orderCount} طلبات و${reviewCount} تقييمات. حساب المدير لم يتغير.`,
                'success'
            );
        } catch (error) {
            console.error('Failed to initialize Firebase demo data:', error);
            setButtonState(false, 'Load Demo Data');
            showMessage(`فشل تحميل البيانات التجريبية: ${error.message || error}`, 'error');
        } finally {
            isSeeding = false;
        }
    };

    window.initMockData = initMockData;
    window.seedMockData = initMockData;

    if (localStorage.getItem(SEEDED_KEY) === 'true') {
        setButtonState(true, 'Demo Data Loaded');
    }
})();
