// ============================================
// CHECKOUT SYSTEM - KOKO SHOP (MODERN ES6+)
// ============================================

const escapeHtml = (unsafe) => {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const safeUrl = (url, fallback = './images/slider-1.jpeg') => {
    if (!url || typeof url !== 'string') return fallback;
    const trimmed = url.trim();
    if (/^(?:javascript|data:text\/html):/i.test(trimmed)) {
        return fallback;
    }
    return trimmed;
};

// Global Exposure for Cross-script Compatibility
window.escapeHtml = escapeHtml;
window.safeUrl = safeUrl;

let selectedPaymentMethod = 'cod';

// ============================================
// CART HELPERS & RESOLUTION
// ============================================

const getCartItems = () => {
    try {
        if (typeof getCart === 'function') {
            const c = getCart();
            if (Array.isArray(c) && c.length > 0) return c;
        }
        const luxeCart = localStorage.getItem('luxe_cart');
        if (luxeCart) {
            const parsed = JSON.parse(luxeCart);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        const plainCart = localStorage.getItem('cart');
        if (plainCart) {
            const parsed = JSON.parse(plainCart);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (err) {
        console.warn('Error reading cart in checkout:', err);
    }
    return [];
};

// ============================================
// MODULAR ORDER SUMMARY RENDERER
// ============================================

const createOrderItemRow = (item = {}) => {
    const isGift = Boolean(item.isGift || item.id === 'free-gift-promo');
    const price = isGift ? 0 : (parseFloat(item.salePrice !== undefined && item.salePrice !== null ? item.salePrice : item.price) || 0);
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    const itemTotal = price * quantity;
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');

    let rawName = item.name;
    if (typeof rawName === 'object' && rawName !== null) {
        rawName = isAr ? (rawName.ar || rawName.en) : (rawName.en || rawName.ar);
    }
    const displayName = rawName || (isAr ? 'مستحضر كوكو' : 'Ritual Formulation');
    const displayImg = safeUrl(item.image, './images/slider-1.jpeg');

    const qtyLabel = isAr ? 'الكمية:' : 'Quantity:';
    const totalFormatted = isGift 
        ? (isAr ? '0.00 ج.م' : 'EGP 0.00') 
        : (isAr ? `${itemTotal.toFixed(2)} ج.م` : `EGP ${itemTotal.toFixed(2)}`);

    return `
        <div class="flex items-center space-x-3 pt-3.5 first:pt-0">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-pink-50 dark:bg-slate-900 border border-pink-100 dark:border-slate-700 flex-shrink-0 relative">
                <img src="${escapeHtml(displayImg)}" alt="${escapeHtml(displayName)}" class="w-full h-full object-cover" onerror="this.src='./images/slider-1.jpeg'">
                ${isGift ? `
                    <span class="absolute top-1 left-1 bg-pink-500 text-white text-[8px] font-bold p-0.5 rounded-full flex items-center justify-center">
                        <i class="fas fa-gift text-[7px]"></i>
                    </span>
                ` : ''}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                    <h4 class="font-display font-semibold text-xs text-gray-900 dark:text-white truncate">${escapeHtml(displayName)}</h4>
                    ${isGift ? `
                        <span class="text-[9px] bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-300 px-1.5 py-0.5 rounded font-bold">
                            ${isAr ? 'هدية مجانية' : 'Free Gift'}
                        </span>
                    ` : ''}
                </div>
                <p class="text-[11px] text-gray-400 mt-0.5">${qtyLabel} <span class="font-medium text-gray-600 dark:text-gray-300">${quantity}</span></p>
            </div>
            <span class="font-display font-bold text-xs ${isGift ? 'text-rose-600' : 'text-pink-600'} flex-shrink-0">
                ${totalFormatted}
            </span>
        </div>
    `;
};

const calculateTotals = (cart = null) => {
    try {
        const items = cart !== null ? cart : getCartItems();
        let subtotal = 0;

        items.forEach((item) => {
            const isGift = Boolean(item.isGift || item.id === 'free-gift-promo');
            if (!isGift) {
                const price = parseFloat(item.salePrice !== undefined && item.salePrice !== null ? item.salePrice : item.price) || 0;
                const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
                subtotal += price * quantity;
            }
        });

        const shipping = (subtotal > 500 || subtotal === 0) ? 0 : 49.00;
        const tax = subtotal * 0.10;
        const total = subtotal + shipping + tax;

        const subtotalEl = document.getElementById('subtotal');
        const shippingEl = document.getElementById('shipping');
        const taxEl = document.getElementById('tax');
        const totalEl = document.getElementById('total');

        const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
        const formatLocal = (amount) => isAr ? `${amount.toFixed(2)} ج.م` : `EGP ${amount.toFixed(2)}`;

        if (subtotalEl) subtotalEl.textContent = formatLocal(subtotal);
        if (shippingEl) shippingEl.textContent = shipping > 0 ? formatLocal(shipping) : (isAr ? 'مجاناً' : 'FREE');
        if (taxEl) taxEl.textContent = formatLocal(tax);
        if (totalEl) totalEl.textContent = formatLocal(total);
    } catch (error) {
        console.error('Error calculating checkout totals:', error);
    }
};

const loadOrderSummary = () => {
    try {
        const cart = getCartItems();
        const orderItemsContainer = document.getElementById('orderItems');
        if (!orderItemsContainer) return;

        const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');

        if (!cart || cart.length === 0) {
            orderItemsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-400 text-xs">
                    <i class="fas fa-bag-shopping text-2xl mb-2 text-pink-300 block"></i>
                    <p class="mb-3">${isAr ? 'حقيبة التسوق فارغة حالياً.' : 'Your shopping bag is currently empty.'}</p>
                    <a href="products.html" class="inline-block px-4 py-2 bg-pink-500 text-white rounded-full font-semibold text-[11px] hover:bg-pink-600 transition">
                        ${isAr ? 'تصفح المستحضرات' : 'Explore Formulations'}
                    </a>
                </div>
            `;
            calculateTotals([]);
            return;
        }

        orderItemsContainer.innerHTML = cart.map(createOrderItemRow).join('');
        calculateTotals(cart);
    } catch (error) {
        console.error('Error loading order summary:', error);
    }
};

// Expose globally so i18n triggers re-rendering
window.loadOrderSummary = loadOrderSummary;
window.calculateTotals = calculateTotals;

// ============================================
// PAYMENT SELECTION & ACCORDION
// ============================================

const selectPayment = (method) => {
    selectedPaymentMethod = method;

    // Remove selected style from all
    document.querySelectorAll('.payment-option').forEach((option) => {
        option.classList.remove('selected');
    });

    // Mark current selected
    const activeOption = document.querySelector(`.payment-option[onclick*="'${method}'"]`);
    if (activeOption) {
        activeOption.classList.add('selected');
    }

    // Check radio
    const radio = document.querySelector(`input[name="payment"][value="${method}"]`);
    if (radio) radio.checked = true;

    // Toggle accordions
    const cardDetails = document.getElementById('cardDetails');
    const walletDetails = document.getElementById('walletDetails');
    const codDetails = document.getElementById('codDetails');

    const isCard = (method === 'card');
    const isWallet = (method === 'wallet');
    const isCod = (method === 'cod');

    if (cardDetails) {
        cardDetails.classList.toggle('hidden', !isCard);
        ['cardNumber', 'cardName', 'cardExpiry', 'cardCVV'].forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.disabled = !isCard;
                field.required = isCard;
            }
        });
    }

    if (walletDetails) walletDetails.classList.toggle('hidden', !isWallet);
    if (codDetails) codDetails.classList.toggle('hidden', !isCod);
};

window.selectPayment = selectPayment;

// ============================================
// PASSWORD VISIBILITY & ACCOUNT TOGGLES
// ============================================

const togglePasswordVisibility = () => {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('passwordIcon');

    if (!passwordInput || !passwordIcon) return;

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
};

window.togglePasswordVisibility = togglePasswordVisibility;

const updateAccountSectionVisibility = () => {
    const loggedIn = isUserLoggedIn();
    const accountSection = document.getElementById('accountCreationSection');
    const createAccountCb = document.getElementById('createAccount');
    const passwordField = document.getElementById('passwordField');
    const passwordInput = document.getElementById('password');

    if (loggedIn) {
        // Authenticated user: hide account creation completely
        if (accountSection) accountSection.classList.add('hidden');
        if (createAccountCb) {
            createAccountCb.checked = false;
            createAccountCb.disabled = true;
        }
        if (passwordField) passwordField.classList.add('hidden');
        if (passwordInput) {
            passwordInput.disabled = true;
            passwordInput.required = false;
            passwordInput.value = '';
        }
    } else {
        // Guest user: show account creation option
        if (accountSection) accountSection.classList.remove('hidden');
        if (createAccountCb) {
            createAccountCb.disabled = false;
            const isChecked = createAccountCb.checked;
            if (passwordField) passwordField.classList.toggle('hidden', !isChecked);
            if (passwordInput) {
                passwordInput.disabled = !isChecked;
                passwordInput.required = isChecked;
            }
        }
    }
};

// ============================================
// FIREBASE AUTH & USER HELPERS
// ============================================

const isUserLoggedIn = () => {
    return (typeof isLoggedIn === 'function' && isLoggedIn()) ||
           (window.LuxeBeauty && typeof window.LuxeBeauty.isLoggedIn === 'function' && window.LuxeBeauty.isLoggedIn()) ||
           Boolean(localStorage.getItem('currentUser') || localStorage.getItem('luxe_currentUser'));
};

const getFirebaseAuthUser = async () => {
    try {
        const configModule = await import('./firebase-config.js');
        const { auth } = configModule;
        if (auth && auth.currentUser) return auth.currentUser;
        if (!auth) return null;
        const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        return await new Promise((resolve) => {
            const timer = setTimeout(() => resolve(null), 1500);
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                clearTimeout(timer);
                unsubscribe();
                resolve(user);
            });
        });
    } catch (e) {
        console.warn('Firebase auth resolution notice:', e);
        return null;
    }
};

const checkUserBlocked = async (uid) => {
    if (!uid) return false;
    try {
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const configModule = await import('./firebase-config.js');
        const { doc, getDoc } = firestoreModule;
        const { db } = configModule;
        if (!db || !doc || !getDoc) return false;
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists()) {
            const uData = userSnap.data();
            return uData.isBlocked === true || uData.status === 'Blocked';
        }
    } catch (err) {
        console.warn('Firestore blocked user verification notice:', err);
    }
    return false;
};

// ============================================
// SERVER-SIDE PRICE VERIFICATION (FIRESTORE)
// ============================================

const verifyCartPricesAndCalculateTotals = async (cart) => {
    let firestoreModule = null;
    let configModule = null;
    try {
        firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        configModule = await import('./firebase-config.js');
    } catch (modErr) {
        console.warn('Could not load Firestore modules for price check, fallback to local:', modErr);
    }

    const db = configModule?.db;
    const { doc, getDoc, collection, query, where, getDocs } = firestoreModule || {};

    let subtotal = 0;
    const verifiedItems = [];

    // Local products cache fallback
    let localProducts = [];
    try {
        localProducts = JSON.parse(localStorage.getItem('luxe_products') || '[]') || [];
        if (!localProducts.length && window.defaultLuxeProducts) {
            localProducts = window.defaultLuxeProducts;
        }
    } catch (e) {
        localProducts = [];
    }

    for (const item of cart) {
        const isGift = Boolean(item.isGift || item.id === 'free-gift-promo');
        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
        let unitPrice = 0;
        let productName = item.name;
        if (typeof productName === 'object' && productName !== null) {
            const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
            productName = isAr ? (productName.ar || productName.en) : (productName.en || productName.ar);
        }
        productName = productName || 'Ritual Formulation';

        let productImage = item.image || './images/slider-1.jpeg';

        if (!isGift) {
            let foundPrice = null;

            // 1. Try Firestore direct doc lookup if db is available
            if (db && doc && getDoc) {
                try {
                    const snap = await getDoc(doc(db, 'products', String(item.id)));
                    if (snap.exists()) {
                        const pData = snap.data();
                        const sale = parseFloat(pData.salePrice);
                        const reg = parseFloat(pData.price);
                        if (!isNaN(sale) && sale > 0) foundPrice = sale;
                        else if (!isNaN(reg) && reg >= 0) foundPrice = reg;
                        if (pData.name) {
                            if (typeof pData.name === 'string') productName = pData.name;
                            else if (typeof pData.name === 'object') {
                                const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
                                productName = isAr ? (pData.name.ar || pData.name.en) : (pData.name.en || pData.name.ar);
                            }
                        }
                        if (pData.image) productImage = pData.image;
                    }
                } catch (snapErr) {
                    console.warn(`Direct doc lookup failed for ${item.id}:`, snapErr);
                }

                // 2. If not found by doc id, try query by 'id' field in products collection
                if (foundPrice === null && collection && query && where && getDocs) {
                    try {
                        let q = query(collection(db, 'products'), where('id', '==', String(item.id)));
                        let qSnap = await getDocs(q);
                        if (qSnap.empty && !isNaN(Number(item.id))) {
                            q = query(collection(db, 'products'), where('id', '==', Number(item.id)));
                            qSnap = await getDocs(q);
                        }
                        if (!qSnap.empty) {
                            const pData = qSnap.docs[0].data();
                            const sale = parseFloat(pData.salePrice);
                            const reg = parseFloat(pData.price);
                            if (!isNaN(sale) && sale > 0) foundPrice = sale;
                            else if (!isNaN(reg) && reg >= 0) foundPrice = reg;
                            if (pData.name) {
                                if (typeof pData.name === 'string') productName = pData.name;
                                else if (typeof pData.name === 'object') {
                                    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
                                    productName = isAr ? (pData.name.ar || pData.name.en) : (pData.name.en || pData.name.ar);
                                }
                            }
                            if (pData.image) productImage = pData.image;
                        }
                    } catch (qErr) {
                        console.warn(`Query lookup failed for ${item.id}:`, qErr);
                    }
                }
            }

            // 3. Fallback to local products array
            if (foundPrice === null && localProducts.length > 0) {
                const localMatch = localProducts.find((p) => String(p.id) === String(item.id));
                if (localMatch) {
                    const sale = parseFloat(localMatch.salePrice);
                    const reg = parseFloat(localMatch.price);
                    if (!isNaN(sale) && sale > 0) foundPrice = sale;
                    else if (!isNaN(reg) && reg >= 0) foundPrice = reg;
                    if (localMatch.name) {
                        if (typeof localMatch.name === 'string') productName = localMatch.name;
                        else if (typeof localMatch.name === 'object') {
                            const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
                            productName = isAr ? (localMatch.name.ar || localMatch.name.en) : (localMatch.name.en || localMatch.name.ar);
                        }
                    }
                    if (localMatch.image) productImage = localMatch.image;
                }
            }

            // 4. Final fallback to cart item price
            unitPrice = (foundPrice !== null) ? foundPrice : (parseFloat(item.salePrice !== undefined && item.salePrice !== null ? item.salePrice : item.price) || 0);
        }

        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        verifiedItems.push({
            productId: String(item.id || item.productId || 'item'),
            name: productName,
            price: unitPrice,
            quantity: quantity,
            image: safeUrl(productImage, './images/slider-1.jpeg'),
            isGift: isGift
        });
    }

    const shipping = (subtotal > 500 || subtotal === 0) ? 0 : 49.00;
    const tax = subtotal * 0.10;
    const total = subtotal + shipping + tax;

    return {
        items: verifiedItems,
        pricing: {
            subtotal,
            shipping,
            tax,
            total
        }
    };
};

// ============================================
// CREATE & SAVE ORDER (MODERN ES6+)
// ============================================

const createOrderObject = (formData, userUid, verifiedData) => {
    return {
        orderId: `ORD-${Date.now()}`,
        userId: userUid,
        customerInfo: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address
        },
        items: verifiedData.items,
        payment: {
            method: selectedPaymentMethod,
            status: selectedPaymentMethod === 'cod' ? 'pending' : 'completed',
            transactionId: `TXN-${Date.now()}`
        },
        pricing: verifiedData.pricing,
        status: 'pending',
        isRated: false,
        statusHistory: [
            {
                status: 'pending',
                timestamp: new Date().toISOString(),
                note: 'Ritual order placed successfully'
            }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
};

const saveOrder = async (order) => {
    const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const configModule = await import('./firebase-config.js');
    const { doc, setDoc, serverTimestamp } = firestoreModule;
    const { db } = configModule;

    // 1. Sync order to Firestore collection 'orders' (Must throw if Firestore fails)
    await setDoc(doc(db, 'orders', order.orderId), {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }, { merge: true });

    // 2. Cache in localStorage only after Firestore write succeeds
    try {
        const orders = JSON.parse(localStorage.getItem('luxe_orders')) || [];
        orders.push(order);
        localStorage.setItem('luxe_orders', JSON.stringify(orders));

        // Update User History in localStorage
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser) {
            const users = JSON.parse(localStorage.getItem('luxe_users')) || [];
            const userIndex = users.findIndex((u) => u.email === currentUser.email || u.uid === order.userId);

            if (userIndex > -1) {
                users[userIndex].orders = users[userIndex].orders || [];
                users[userIndex].orders.push(order.orderId);
                users[userIndex].totalSpent = (users[userIndex].totalSpent || 0) + order.pricing.total;

                localStorage.setItem('luxe_users', JSON.stringify(users));

                currentUser.orders = users[userIndex].orders;
                currentUser.totalSpent = users[userIndex].totalSpent;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                localStorage.setItem('luxe_currentUser', JSON.stringify(currentUser));
            }
        }
    } catch (localErr) {
        console.warn('Local cache history update warning:', localErr);
    }
};

const registerUserFromCheckout = async (name, email, password) => {
    const { createUserWithEmailAndPassword, updateProfile } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    const { doc, setDoc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const { auth, db } = await import('./firebase-config.js');

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
        await updateProfile(cred.user, { displayName: name });
    }
    await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: name,
        email: email,
        createdAt: serverTimestamp(),
        orders: [],
        wishlist: []
    });

    const userData = {
        uid: cred.user.uid,
        email: email,
        name: name,
        isAdmin: false,
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('luxe_currentUser', JSON.stringify(userData));
    return cred.user;
};

// ============================================
// TOAST NOTIFICATIONS
// ============================================

const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast || !toastMessage) {
        alert(message);
        return;
    }

    toastMessage.textContent = message;

    if (type === 'error') {
        toast.className = 'fixed bottom-8 right-8 bg-rose-500 text-white px-5 py-3.5 rounded-2xl shadow-xl transform translate-y-0 transition-transform duration-300 z-50 flex items-center space-x-3';
        if (toastIcon) toastIcon.className = 'fas fa-circle-exclamation text-lg text-white';
    } else {
        toast.className = 'fixed bottom-8 right-8 bg-white dark:bg-slate-800 border border-pink-200 dark:border-slate-700 text-gray-800 dark:text-white px-5 py-3.5 rounded-2xl shadow-xl transform translate-y-0 transition-transform duration-300 z-50 flex items-center space-x-3';
        if (toastIcon) toastIcon.className = 'fas fa-check-circle text-pink-500 text-lg';
    }

    setTimeout(() => {
        toast.style.transform = 'translateY(8rem)';
    }, 3500);
};

window.showToast = showToast;

// ============================================
// PROCESS CHECKOUT FORM SUBMISSION
// ============================================

const processCheckout = async () => {
    const checkoutForm = document.getElementById('checkoutForm');
    const submitBtn = document.getElementById('submitOrderBtn') || checkoutForm?.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');

    try {
        // 1. Verify Cart has items
        const cart = getCartItems();
        if (!cart || cart.length === 0) {
            showToast(isAr ? 'حقيبة التسوق فارغة، يرجى إضافة منتجات أولاً' : 'Your shopping bag is empty. Please add items first.', 'error');
            return;
        }

        // 2. Validate form inputs
        if (checkoutForm && !checkoutForm.checkValidity()) {
            const firstInvalid = checkoutForm.querySelector(':invalid');
            if (firstInvalid) {
                firstInvalid.focus();
                const fieldLabel = firstInvalid.getAttribute('placeholder') || firstInvalid.id || 'الحقل المطلوب';
                showToast(isAr ? `يرجى إكمال الحقل المطلوب: ${fieldLabel}` : `Please complete required field: ${fieldLabel}`, 'error');
                if (typeof checkoutForm.reportValidity === 'function') {
                    checkoutForm.reportValidity();
                }
            }
            return;
        }

        // 3. Ensure Payment Method
        if (!selectedPaymentMethod) {
            selectedPaymentMethod = 'cod';
            selectPayment('cod');
        }

        // 4. Validate Card Details if card method selected
        if (selectedPaymentMethod === 'card') {
            const cardNumber = (document.getElementById('cardNumber')?.value || '').replace(/\s/g, '');
            const cardName = (document.getElementById('cardName')?.value || '').trim();
            const cardExpiry = (document.getElementById('cardExpiry')?.value || '').trim();
            const cardCVV = (document.getElementById('cardCVV')?.value || '').trim();

            if (!cardName) {
                showToast(isAr ? 'يرجى إدخال اسم حامل البطاقة' : 'Please enter cardholder name', 'error');
                return;
            }
            if (cardNumber.length < 13 || cardNumber.length > 19) {
                showToast(isAr ? 'رقم البطاقة غير صحيح' : 'Invalid card number', 'error');
                return;
            }
            if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
                showToast(isAr ? 'تاريخ انتهاء البطاقة غير صحيح (MM/YY)' : 'Invalid expiry date (MM/YY)', 'error');
                return;
            }
            if (cardCVV.length < 3 || cardCVV.length > 4) {
                showToast(isAr ? 'رمز الأمان CVV غير صحيح' : 'Invalid CVV', 'error');
                return;
            }
        }

        const formData = {
            email: document.getElementById('email')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            fullName: document.getElementById('fullName')?.value.trim() || 'Client',
            address: {
                street: document.getElementById('street')?.value.trim() || '',
                apartment: document.getElementById('apartment')?.value.trim() || '',
                city: document.getElementById('city')?.value.trim() || '',
                state: document.getElementById('state')?.value.trim() || '',
                zip: document.getElementById('zip')?.value.trim() || '',
                country: document.getElementById('country')?.value || 'EG'
            }
        };

        // 5. Resolve authenticated user or Account Creation
        let authUser = await getFirebaseAuthUser();
        const localUser = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
        let currentUid = authUser?.uid || localUser?.uid;

        const createAccountCheckbox = document.getElementById('createAccount');

        if (!currentUid) {
            if (createAccountCheckbox?.checked) {
                const password = document.getElementById('password')?.value;
                if (!password || password.length < 6) {
                    showToast(isAr ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Password must be at least 6 characters', 'error');
                    return;
                }
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin ${isAr ? 'ml-2' : 'mr-2'}"></i> ${isAr ? 'جاري إنشاء الحساب...' : 'Creating Account...'}`;
                }
                try {
                    const newUser = await registerUserFromCheckout(formData.fullName, formData.email, password);
                    currentUid = newUser.uid;
                } catch (regErr) {
                    console.error('Registration during checkout failed:', regErr);
                    showToast(regErr.message || (isAr ? 'فشل إنشاء الحساب الجديد' : 'Failed to create new account'), 'error');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                    return;
                }
            } else {
                // User is not logged in and didn't select create account
                showToast(isAr ? 'يرجى تسجيل الدخول أو تفعيل خيار إنشاء حساب لإتمام الطلب' : 'Please log in or check "Create an account" to place your order', 'error');
                sessionStorage.setItem('loginRedirect', 'checkout.html');
                setTimeout(() => {
                    window.location.href = 'login.html?redirect=checkout.html';
                }, 1400);
                return;
            }
        }

        // 6. Check if customer is blocked directly from Firestore users/{uid}
        const isBlocked = await checkUserBlocked(currentUid);
        if (isBlocked) {
            showToast(isAr ? 'تم إيقاف هذا الحساب من إتمام الطلبات. يُرجى التواصل مع إدارة المتجر.' : 'This customer account is blocked and cannot place orders.', 'error');
            return;
        }

        // 7. Show spinner on submit button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin ${isAr ? 'ml-2' : 'mr-2'}"></i> ${isAr ? 'جاري التحقق وتأكيد الطلب...' : 'Verifying & Placing Order...'}`;
        }

        // 8. Server-side price & totals verification from Firestore
        const verifiedData = await verifyCartPricesAndCalculateTotals(cart);

        // 9. Generate Order Object (order.userId is the real auth UID, email is in customerInfo)
        const order = createOrderObject(formData, currentUid, verifiedData);

        // 10. Save order and await Firestore write confirmation
        await saveOrder(order);

        // 11. Clear cart only after successful save to Firestore
        localStorage.removeItem('luxe_cart');
        localStorage.removeItem('cart');
        if (typeof updateCartCount === 'function') updateCartCount();

        showToast(isAr ? 'تم تأكيد طلبك بنجاح! جاري التحويل...' : 'Ritual order confirmed! Redirecting...', 'success');

        // 12. Redirect to order success page
        setTimeout(() => {
            window.location.href = `order-success.html?orderId=${encodeURIComponent(order.orderId)}`;
        }, 1200);

    } catch (error) {
        console.error('Checkout processing error:', error);
        showToast(isAr ? 'حدث خطأ أثناء حفظ الطلب في قاعدة البيانات. يُرجى التحقق والمحاولة مجدداً.' : 'Failed to save order to database. Please check your connection and try again.', 'error');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    }
};

window.processCheckout = processCheckout;

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Immediately render order summary
    loadOrderSummary();

    // 2. Default select Cash on Delivery and setup payment UI
    selectPayment('cod');

    // 3. Setup account section visibility & state
    updateAccountSectionVisibility();

    // 4. Bind account creation checkbox toggle
    const createAccountCb = document.getElementById('createAccount');
    if (createAccountCb) {
        createAccountCb.addEventListener('change', () => {
            updateAccountSectionVisibility();
        });
    }

    // 5. Auto-fill customer info if user is logged in
    try {
        const activeUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('luxe_currentUser') || 'null');
        if (activeUser) {
            const nameField = document.getElementById('fullName');
            const emailField = document.getElementById('email');
            const phoneField = document.getElementById('phone');
            if (nameField && !nameField.value && activeUser.name) nameField.value = activeUser.name;
            if (emailField && !emailField.value && activeUser.email) emailField.value = activeUser.email;
            if (phoneField && !phoneField.value && activeUser.phone) phoneField.value = activeUser.phone;
        }
    } catch (e) {
        console.warn('Could not auto-fill customer info:', e);
    }

    // 6. Card Input Formatters
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            const val = e.target.value.replace(/\s/g, '');
            e.target.value = val.match(/.{1,4}/g)?.join(' ') || val;
        });
    }

    const cardExpiry = document.getElementById('cardExpiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 2) {
                val = val.slice(0, 2) + '/' + val.slice(2, 4);
            }
            e.target.value = val;
        });
    }

    const cardCVV = document.getElementById('cardCVV');
    if (cardCVV) {
        cardCVV.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // 7. Form Submit Listener
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processCheckout();
        });
    }

    // 8. Submit Button Direct Click Fallback
    const submitBtn = document.getElementById('submitOrderBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            if (checkoutForm && !checkoutForm.checkValidity()) {
                const firstInvalid = checkoutForm.querySelector(':invalid');
                if (firstInvalid) {
                    firstInvalid.focus();
                    if (typeof checkoutForm.reportValidity === 'function') {
                        checkoutForm.reportValidity();
                    }
                }
            }
        });
    }

    // 9. Non-blocking background check for blocked status if user is logged in
    (async () => {
        try {
            const authUser = await getFirebaseAuthUser();
            const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            const uid = authUser?.uid || localUser?.uid;
            if (uid) {
                updateAccountSectionVisibility();
                const isBlocked = await checkUserBlocked(uid);
                if (isBlocked) {
                    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
                    showToast(isAr ? 'تم إيقاف هذا الحساب من إتمام الطلبات. يُرجى التواصل مع إدارة المتجر.' : 'This customer account is blocked and cannot place orders.', 'error');
                    if (submitBtn) submitBtn.disabled = true;
                }
            }
        } catch (authNotice) {
            console.warn('Background auth/block check notice:', authNotice);
        }
    })();

    // 10. Admin Crown Icon Check
    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const adminIcon = document.getElementById('adminPanelIcon');
        if (adminIcon && (currentUser.email === 'aemade2016@gmail.com' || currentUser.isAdmin)) {
            adminIcon.classList.remove('hidden');
        }
    } catch (e) {
        console.warn('Admin check notice:', e);
    }
});
