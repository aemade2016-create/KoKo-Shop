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

let selectedPaymentMethod = null;

// ============================================
// MODULAR ORDER SUMMARY RENDERER
// ============================================

const createOrderItemRow = ({ name = 'Ritual Item', price = 0, quantity = 1, image = './images/slider-1.jpeg', isGift = false, id = '' }) => {
    const giftFlag = Boolean(isGift || id === 'free-gift-promo');
    const itemPrice = giftFlag ? 0 : (parseFloat(price) || 0);
    const itemQty = parseInt(quantity, 10) || 1;
    const itemTotal = itemPrice * itemQty;
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
    const qtyLabel = isAr ? 'الكمية:' : 'Quantity:';
    const totalFormatted = giftFlag 
        ? (isAr ? '0.00 ج.م' : 'EGP 0.00') 
        : (isAr ? `${itemTotal.toFixed(2)} ج.م` : `EGP ${itemTotal.toFixed(2)}`);

    return `
        <div class="flex items-center space-x-3 pt-3.5 first:pt-0">
            <div class="w-14 h-14 rounded-xl overflow-hidden bg-pink-50 dark:bg-slate-900 border border-pink-100 dark:border-slate-700 flex-shrink-0 relative">
                <img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" class="w-full h-full object-cover">
                ${giftFlag ? `
                    <span class="absolute top-1 left-1 bg-pink-500 text-white text-[8px] font-bold p-0.5 rounded-full flex items-center justify-center">
                        <i class="fas fa-gift text-[7px]"></i>
                    </span>
                ` : ''}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5">
                    <h4 class="font-display font-semibold text-xs text-gray-900 dark:text-white truncate">${escapeHtml(name)}</h4>
                    ${giftFlag ? `
                        <span class="text-[9px] bg-pink-100 text-pink-600 dark:bg-pink-950 dark:text-pink-300 px-1.5 py-0.5 rounded font-bold">
                            ${isAr ? 'هدية مجانية' : 'Free Gift'}
                        </span>
                    ` : ''}
                </div>
                <p class="text-[11px] text-gray-400 mt-0.5">${qtyLabel} <span class="font-medium text-gray-600 dark:text-gray-300">${itemQty}</span></p>
            </div>
            <span class="font-display font-bold text-xs ${giftFlag ? 'text-rose-600' : 'text-pink-600'} flex-shrink-0">
                ${totalFormatted}
            </span>
        </div>
    `;
};

const loadOrderSummary = () => {
    try {
        const cart = typeof getCart === 'function' ? getCart() : JSON.parse(localStorage.getItem('luxe_cart') || '[]');
        const orderItemsContainer = document.getElementById('orderItems');

        if (!orderItemsContainer) return;

        const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');

        if (!cart || cart.length === 0) {
            orderItemsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-400 text-xs">
                    <i class="fas fa-bag-shopping text-2xl mb-2 text-pink-300 block"></i>
                    ${isAr ? 'حقيبة التسوق فارغة حالياً.' : 'Your shopping bag is empty.'}
                </div>
            `;
            setTimeout(() => {
                window.location.href = 'cart.html';
            }, 1000);
            return;
        }

        orderItemsContainer.innerHTML = cart.map(createOrderItemRow).join('');
        calculateTotals();
    } catch (error) {
        console.error('Error loading order summary:', error);
    }
};

const calculateTotals = () => {
    try {
        const cart = typeof getCart === 'function' ? getCart() : JSON.parse(localStorage.getItem('luxe_cart') || '[]');
        let subtotal = 0;

        cart.forEach((item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity, 10) || 1;
            subtotal += price * quantity;
        });

        // Free shipping over EGP 500
        const shipping = (subtotal > 500 || subtotal === 0) ? 0 : 49.00;
        const tax = subtotal * 0.10; // 10% Clinical VAT
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

// Expose loadOrderSummary globally so i18n triggers re-rendering
window.loadOrderSummary = loadOrderSummary;

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

    if (cardDetails) cardDetails.classList.toggle('hidden', method !== 'card');
    if (walletDetails) walletDetails.classList.toggle('hidden', method !== 'wallet');
    if (codDetails) codDetails.classList.toggle('hidden', method !== 'cod');

    // Toggle requirements for card fields
    const isCard = (method === 'card');
    ['cardNumber', 'cardName', 'cardExpiry', 'cardCVV'].forEach((fieldId) => {
        const field = document.getElementById(fieldId);
        if (field) field.required = isCard;
    });
};

// ============================================
// PASSWORD VISIBILITY TOGGLE
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

// ============================================
// FIREBASE AUTH & USER HELPERS
// ============================================

const getFirebaseAuthUser = async () => {
    try {
        const configModule = await import('./firebase-config.js');
        const { auth } = configModule;
        if (auth && auth.currentUser) return auth.currentUser;
        const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
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
    const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const configModule = await import('./firebase-config.js');
    const { doc, getDoc } = firestoreModule;
    const { db } = configModule;

    let subtotal = 0;
    const verifiedItems = [];

    for (const item of cart) {
        const isGift = Boolean(item.isGift || item.id === 'free-gift-promo');
        const quantity = parseInt(item.quantity, 10) || 1;
        let unitPrice = 0;

        if (!isGift) {
            try {
                const prodSnap = await getDoc(doc(db, 'products', String(item.id)));
                if (prodSnap.exists()) {
                    const pData = prodSnap.data();
                    const sale = parseFloat(pData.salePrice);
                    const regular = parseFloat(pData.price);
                    if (!isNaN(sale) && sale > 0) {
                        unitPrice = sale;
                    } else if (!isNaN(regular) && regular >= 0) {
                        unitPrice = regular;
                    } else {
                        unitPrice = parseFloat(item.price) || 0;
                    }
                } else {
                    unitPrice = parseFloat(item.price) || 0;
                }
            } catch (err) {
                console.warn(`Firestore price lookup fallback for item ${item.id}:`, err);
                unitPrice = parseFloat(item.price) || 0;
            }
        }

        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        verifiedItems.push({
            productId: String(item.id),
            name: item.name || 'Ritual Item',
            price: unitPrice,
            quantity: quantity,
            image: item.image || './images/slider-1.jpeg',
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
    // 1. Sync order to Firestore collection 'orders' (Must throw if Firestore fails)
    const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const configModule = await import('./firebase-config.js');
    const { doc, setDoc, serverTimestamp } = firestoreModule;
    const { db } = configModule;

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
    await updateProfile(cred.user, { displayName: name });
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
// PROCESS CHECKOUT FORM SUBMISSION
// ============================================

const isUserLoggedIn = () => {
    return (typeof isLoggedIn === 'function' && isLoggedIn()) ||
           (window.LuxeBeauty && typeof window.LuxeBeauty.isLoggedIn === 'function' && window.LuxeBeauty.isLoggedIn()) ||
           Boolean(localStorage.getItem('currentUser') || localStorage.getItem('luxe_currentUser'));
};

const processCheckout = async () => {
    const checkoutForm = document.getElementById('checkoutForm');
    const submitBtn = checkoutForm?.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
    const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');

    try {
        // Resolve authenticated user from Firebase Auth
        const authUser = await getFirebaseAuthUser();
        const localUser = typeof getCurrentUser === 'function' ? getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
        let currentUid = authUser?.uid || localUser?.uid;

        if (!authUser && !isUserLoggedIn()) {
            showToast(isAr ? 'يرجى تسجيل الدخول أولاً لإتمام الشراء' : 'Please log in to complete your purchase', 'error');
            sessionStorage.setItem('loginRedirect', 'checkout.html');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=checkout.html';
            }, 1100);
            return;
        }

        if (!selectedPaymentMethod) {
            showToast(isAr ? 'يرجى اختيار طريقة الدفع' : 'Please select a payment method', 'error');
            return;
        }

        const formData = {
            email: document.getElementById('email')?.value.trim() || authUser?.email || localUser?.email || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            fullName: document.getElementById('fullName')?.value.trim() || authUser?.displayName || localUser?.name || 'Client',
            address: {
                street: document.getElementById('street')?.value.trim() || '',
                apartment: document.getElementById('apartment')?.value.trim() || '',
                city: document.getElementById('city')?.value.trim() || '',
                state: document.getElementById('state')?.value.trim() || '',
                zip: document.getElementById('zip')?.value.trim() || '',
                country: document.getElementById('country')?.value || 'EG'
            }
        };

        // Check if customer is blocked directly from Firestore users/{uid}
        const isBlocked = await checkUserBlocked(currentUid);
        if (isBlocked) {
            showToast(isAr ? 'تم إيقاف هذا الحساب من إتمام الطلبات. يُرجى التواصل مع إدارة المتجر.' : 'This customer account is blocked and cannot place orders.', 'error');
            return;
        }

        // Validate Card Details if card method selected
        if (selectedPaymentMethod === 'card') {
            const cardNumber = (document.getElementById('cardNumber')?.value || '').replace(/\s/g, '');
            const cardExpiry = document.getElementById('cardExpiry')?.value || '';
            const cardCVV = document.getElementById('cardCVV')?.value || '';

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

        // Account Creation handler (minimum 6 characters)
        const createAccountCheckbox = document.getElementById('createAccount');
        if (createAccountCheckbox?.checked && !authUser) {
            const password = document.getElementById('password')?.value;
            if (password && password.length < 6) {
                showToast(isAr ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل' : 'Password must be at least 6 characters', 'error');
                return;
            }
            if (password) {
                try {
                    const newUser = await registerUserFromCheckout(formData.fullName, formData.email, password);
                    currentUid = newUser.uid;
                } catch (regErr) {
                    console.error('Registration during checkout failed:', regErr);
                    showToast(regErr.message || (isAr ? 'فشل إنشاء الحساب الجديد' : 'Failed to create new account'), 'error');
                    return;
                }
            }
        }

        if (!currentUid) {
            currentUid = authUser?.uid || localUser?.uid;
            if (!currentUid) {
                showToast(isAr ? 'تعذر التعرف على هوية المستخدم. يرجى تسجيل الدخول مجدداً.' : 'Could not identify authenticated user. Please re-login.', 'error');
                return;
            }
        }

        // Verify cart items
        const cart = typeof getCart === 'function' ? getCart() : JSON.parse(localStorage.getItem('luxe_cart') || '[]');
        if (!cart || cart.length === 0) {
            showToast(isAr ? 'حقيبة التسوق فارغة' : 'Your shopping bag is empty', 'error');
            return;
        }

        // Show spinner on submit button
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin ${isAr ? 'ml-2' : 'mr-2'}"></i> ${isAr ? 'جاري التحقق وتأكيد الطلب...' : 'Verifying & Placing Order...'}`;
        }

        // Server-side price & totals verification from Firestore
        const verifiedData = await verifyCartPricesAndCalculateTotals(cart);

        // Generate Order Object (order.userId is the real auth UID, email is in customerInfo)
        const order = createOrderObject(formData, currentUid, verifiedData);

        // Save order and await Firestore write confirmation
        await saveOrder(order);

        // Clear cart only after successful save to Firestore
        localStorage.removeItem('luxe_cart');
        if (typeof updateCartCount === 'function') updateCartCount();

        showToast(isAr ? 'تم تأكيد طلبك بنجاح! جاري التحويل...' : 'Ritual order confirmed! Redirecting...', 'success');

        // Redirect to order success page
        setTimeout(() => {
            window.location.href = `order-success.html?orderId=${order.orderId}`;
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

// ============================================
// TOAST NOTIFICATIONS
// ============================================

const showToast = (message, type = 'success') => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toast || !toastMessage) return;

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
    }, 3200);
};

// ============================================
// EVENT LISTENERS & INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Auth Guard for Checkout
    if (!isUserLoggedIn()) {
        sessionStorage.setItem('loginRedirect', 'checkout.html');
        const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
        showToast(isAr ? 'يرجى تسجيل الدخول أولاً لإتمام طلب الشراء' : 'Please log in to complete your checkout', 'error');
        setTimeout(() => {
            window.location.replace('login.html?redirect=checkout.html');
        }, 1100);
        return;
    }

    // Hide redundant create account section for authenticated users
    const accountSection = document.getElementById('accountCreationSection');
    if (accountSection) {
        accountSection.classList.add('hidden');
    }

    // Check if current user is blocked on page load
    (async () => {
        const authUser = await getFirebaseAuthUser();
        const localUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const uid = authUser?.uid || localUser?.uid;
        if (uid) {
            const isBlocked = await checkUserBlocked(uid);
            if (isBlocked) {
                const isAr = (localStorage.getItem('koko_lang') === 'ar' || localStorage.getItem('luxe_lang') === 'AR');
                showToast(isAr ? 'تم إيقاف هذا الحساب من إتمام الطلبات. يُرجى التواصل مع إدارة المتجر.' : 'This customer account is blocked and cannot place orders.', 'error');
                const submitBtn = document.querySelector('#checkoutForm button[type="submit"]');
                if (submitBtn) submitBtn.disabled = true;
            }
        }
    })();

    loadOrderSummary();

    // Auto-fill customer info if logged in
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

    // Default select Cash on Delivery or Card
    selectPayment('cod');

    // Account Creation Field Toggle
    const createAccountCb = document.getElementById('createAccount');
    const passwordField = document.getElementById('passwordField');
    const passwordInput = document.getElementById('password');

    if (createAccountCb && passwordField) {
        createAccountCb.addEventListener('change', (e) => {
            passwordField.classList.toggle('hidden', !e.target.checked);
            if (passwordInput) passwordInput.required = e.target.checked;
        });
    }

    // Card Input Formatters
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

    // Form Submit
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            processCheckout();
        });
    }

    // Admin Crown Icon Check
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
