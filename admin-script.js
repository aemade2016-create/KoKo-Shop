// ============================================
// ADMIN DASHBOARD - LUXE BEAUTY (INTEGRATED SYSTEM)
// ============================================

// Check authentication (INTEGRATED WITH MAIN SYSTEM - FIXED)
function checkAuth() {
    var currentUser = JSON.parse(localStorage.getItem('luxe_currentUser'));

    // Check if user is logged in and is admin
    if (!currentUser || !currentUser.isAdmin || currentUser.email !== 'aemade2016@gmail.com') {
        // Prevent redirect loop
        if (!sessionStorage.getItem('redirecting_from_admin')) {
            sessionStorage.setItem('redirecting_from_admin', 'true');
            alert('Access Denied! Admin privileges required.');
            window.location.href = 'login.html';
        }
        return false;
    }
    // Clear redirect flag
    sessionStorage.removeItem('redirecting_from_admin');
    return true;
}

// Initialize (FIXED - Don't throw error, just redirect)
if (!checkAuth()) {
    // Redirect handled in checkAuth()
} else {
    // Display admin email
    var currentUser = JSON.parse(localStorage.getItem('luxe_currentUser'));
    if (currentUser && currentUser.email) {
        var emailDisplay = document.getElementById('adminEmailDisplay');
        if (emailDisplay) {
            emailDisplay.textContent = currentUser.email;
        }
    }
}

// ============================================
// DATA MANAGEMENT
// ============================================

function parseNumeric(value) {
    var parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
}

function calculateDiscountDetails(originalPrice, salePrice) {
    var original = parseNumeric(originalPrice);
    var sale = parseNumeric(salePrice);

    if (original <= 0) {
        return { originalPrice: 0, salePrice: 0, savings: 0, discountPercent: 0 };
    }

    if (sale <= 0 || sale > original) {
        sale = original;
    }

    var savings = Math.max(original - sale, 0);
    var discountPercent = Math.round((savings / original) * 100);

    return {
        originalPrice: original,
        salePrice: sale,
        savings: savings,
        discountPercent: discountPercent
    };
}

function normalizeProduct(product) {
    if (!product) return null;

    var details = calculateDiscountDetails(product.originalPrice || product.price || 0, product.salePrice || product.price || product.originalPrice || 0);
    product.originalPrice = details.originalPrice;
    product.salePrice = details.salePrice;
    product.savings = details.savings;
    product.discountPercent = details.discountPercent;
    product.price = details.salePrice || product.price || 0;
    product.image = product.image || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop';
    product.barcode = product.barcode || '';
    return product;
}

function getProducts() {
    var products = JSON.parse(localStorage.getItem('luxe_products')) || [];
    return products.map(normalizeProduct).filter(Boolean);
}

function saveProducts(products) {
    var normalized = (products || []).map(normalizeProduct).filter(Boolean);
    localStorage.setItem('luxe_products', JSON.stringify(normalized));
    syncCategoriesFromProducts();
}

function getCategories() {
    try {
        var stored = JSON.parse(localStorage.getItem('luxe_categories')) || [];
        if (Array.isArray(stored) && stored.length > 0) {
            return stored.map(function (category) {
                if (typeof category === 'string') {
                    return { id: Date.now() + Math.random(), name: category, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop' };
                }
                return {
                    id: category.id || Date.now() + Math.random(),
                    name: category.name,
                    image: category.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
                };
            });
        }
    } catch (error) {
        console.warn('Unable to read categories from storage', error);
    }

    var fallback = ['Serum', 'Moisturizer', 'Cleanser', 'Sunscreen', 'Mask', 'Toner', 'Eye Cream', 'Face Oil', 'Lip Care', 'Night Cream'];
    var defaultCategories = fallback.map(function (name, index) {
        return { id: index + 1, name: name, image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop' };
    });
    saveCategories(defaultCategories);
    return defaultCategories;
}

function saveCategories(categories) {
    localStorage.setItem('luxe_categories', JSON.stringify(categories || []));
}

function syncCategoriesFromProducts() {
    var products = getProducts();
    var categories = getCategories();
    var names = categories.map(function (category) { return category.name; });

    products.forEach(function (product) {
        if (product.category && names.indexOf(product.category) === -1) {
            names.push(product.category);
        }
    });

    var merged = names.map(function (name, index) {
        var existing = categories.find(function (category) {
            return category.name === name;
        });
        return {
            id: existing ? existing.id : index + 1,
            name: name,
            image: existing ? existing.image : 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop'
        };
    });

    saveCategories(merged);
}

function populateProductCategoryOptions() {
    var select = document.getElementById('productCategory');
    if (!select) return;

    var categories = getCategories();
    select.innerHTML = '';
    categories.forEach(function (category) {
        var option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

function updateProductSavingsPreview() {
    var originalValue = parseNumeric(document.getElementById('productOriginalPrice').value);
    var saleValue = parseNumeric(document.getElementById('productSalePrice').value);
    var result = calculateDiscountDetails(originalValue, saleValue);

    var savingsLabel = document.getElementById('productSavingsLabel');
    var discountLabel = document.getElementById('productDiscountLabel');

    if (savingsLabel) {
        savingsLabel.textContent = 'EGP ' + result.savings.toFixed(2);
    }

    if (discountLabel) {
        discountLabel.textContent = result.discountPercent + '% off';
    }
}

function resetCategoryForm() {
    var form = document.getElementById('categoryForm');
    if (form) form.reset();
    document.getElementById('categoryId').value = '';
    document.getElementById('categoryFormTitle').textContent = 'Add New Category';
}

function loadCategories() {
    var categories = getCategories();
    var tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;

    if (!categories.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="px-6 py-8 text-center text-gray-500">No categories found</td></tr>';
        return;
    }

    var html = '';
    categories.forEach(function (category) {
        html += '<tr>';
        html += '<td class="px-6 py-4"><img src="' + (category.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop') + '" alt="' + category.name + '" class="w-16 h-16 object-cover rounded-lg"></td>';
        html += '<td class="px-6 py-4 font-semibold">' + category.name + '</td>';
        html += '<td class="px-6 py-4">';
        html += '<button onclick="editCategory(' + (category.id || 0) + ')" class="text-blue-500 hover:text-blue-600 mr-3"><i class="fas fa-edit"></i></button>';
        html += '<button onclick="deleteCategory(' + (category.id || 0) + ')" class="text-red-500 hover:text-red-600"><i class="fas fa-trash"></i></button>';
        html += '</td>';
        html += '</tr>';
    });

    tbody.innerHTML = html;
}

function editCategory(categoryId) {
    var categories = getCategories();
    var category = categories.find(function (item) {
        return item.id === categoryId;
    });

    if (!category) return;

    document.getElementById('categoryId').value = category.id;
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryImage').value = category.image || '';
    document.getElementById('categoryFormTitle').textContent = 'Edit Category';
}

function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category?')) return;

    var categories = getCategories().filter(function (category) {
        return category.id !== categoryId;
    });

    saveCategories(categories);
    loadCategories();
    populateProductCategoryOptions();
    showToast('Category deleted successfully');
}

function saveCategoryFromForm(event) {
    event.preventDefault();

    var id = document.getElementById('categoryId').value;
    var name = document.getElementById('categoryName').value.trim();
    var image = document.getElementById('categoryImage').value.trim();

    if (!name || !image) {
        showToast('Please complete category name and image URL');
        return;
    }

    var categories = getCategories();
    var categoryData = {
        id: id ? Number(id) : Date.now(),
        name: name,
        image: image
    };

    if (id) {
        categories = categories.map(function (category) {
            return category.id === Number(id) ? categoryData : category;
        });
        showToast('Category updated successfully');
    } else {
        categories.push(categoryData);
        showToast('Category added successfully');
    }

    saveCategories(categories);
    loadCategories();
    populateProductCategoryOptions();
    resetCategoryForm();
}

function getStoredArray(key, fallback) {
    try {
        var stored = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(stored) ? stored : fallback;
    } catch (error) {
        return fallback;
    }
}

function renderStarIcons(rating) {
    var output = '';
    for (var i = 1; i <= 5; i++) {
        output += '<i class="fas fa-star ' + (i <= Number(rating || 0) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600') + '"></i>';
    }
    return output;
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
        console.warn('Banner Firestore fallback triggered:', error);
        var fallbackBanners = getStoredArray('luxe_banners', [
            {
                id: 'fallback-banner-1',
                imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop',
                targetUrl: 'products.html',
                badge: 'Featured',
                title: 'Luxe Beauty',
                subtitle: 'Exclusive Offers',
                description: 'Discover premium beauty essentials',
                buttonText: 'Shop Now',
                gradient: 'from-primary-500 to-pink-600',
                imagePosition: 'right'
            },
            {
                id: 'fallback-banner-2',
                imageUrl: 'https://images.unsplash.com/photo-1556228852-80a3c4e6d1f7?w=600&h=600&fit=crop',
                targetUrl: 'products.html',
                badge: 'Limited Offer',
                title: 'Up to 40% Off',
                subtitle: 'Spring Collection',
                description: 'Refresh your beauty routine with our exclusive spring collection.',
                buttonText: 'Shop Sale',
                gradient: 'from-pink-500 to-purple-600',
                imagePosition: 'left'
            }
        ]);
        return fallbackBanners;
    }
}

function resetBannerForm() {
    var form = document.getElementById('bannerForm');
    if (form) form.reset();
    document.getElementById('bannerId').value = '';
    document.getElementById('bannerFormTitle').textContent = 'Add New Banner';
}

async function loadBanners() {
    var tbody = document.getElementById('bannersTableBody');
    if (!tbody) return;

    try {
        var banners = await getBanners();
        if (!banners || !banners.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No banners found</td></tr>';
            return;
        }

        tbody.innerHTML = banners.map(function (banner) {
            var titleText = (banner.title || 'Luxe Beauty').substring(0, 30);
            var subtitleText = (banner.subtitle || 'Exclusive Offers').substring(0, 30);
            return '<tr>' +
                '<td class="px-6 py-4"><img src="' + (banner.imageUrl || banner.image || '') + '" alt="Banner" class="w-20 h-16 object-cover rounded-lg"></td>' +
                '<td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300"><div class="font-semibold text-gray-800 dark:text-white">' + (banner.title || 'Luxe Beauty') + '</div><div class="text-xs text-gray-500">' + (banner.subtitle || 'Exclusive Offers') + '</div></td>' +
                '<td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">' + (banner.targetUrl || '#') + '</td>' +
                '<td class="px-6 py-4">' +
                '<button onclick="editBanner(\'' + (banner.id || '') + '\')" class="text-blue-500 hover:text-blue-600 mr-3"><i class="fas fa-edit"></i></button>' +
                '<button onclick="deleteBanner(\'' + (banner.id || '') + '\')" class="text-red-500 hover:text-red-600"><i class="fas fa-trash"></i></button>' +
                '</td>' +
                '</tr>';
        }).join('');
    } catch (error) {
        console.error('loadBanners error', error);
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">Unable to load banners</td></tr>';
        showToast('Unable to load banners', 'error');
    }
}

function editBanner(bannerId) {
    var banners = getStoredArray('luxe_banners', []);
    var banner = banners.find(function (item) { return item.id === bannerId; });
    if (!banner) return;

    document.getElementById('bannerId').value = banner.id;
    document.getElementById('bannerBadge').value = banner.badge || '';
    document.getElementById('bannerTitle').value = banner.title || '';
    document.getElementById('bannerSubtitle').value = banner.subtitle || '';
    document.getElementById('bannerDescription').value = banner.description || '';
    document.getElementById('bannerButtonText').value = banner.buttonText || '';
    document.getElementById('bannerGradient').value = banner.gradient || 'from-primary-500 to-pink-600';
    document.getElementById('bannerImagePosition').value = banner.imagePosition || 'right';
    document.getElementById('bannerImageUrl').value = banner.imageUrl || '';
    document.getElementById('bannerTargetUrl').value = banner.targetUrl || '';
    document.getElementById('bannerFormTitle').textContent = 'Edit Banner';
}

async function saveBannerFromForm(event) {
    event.preventDefault();

    var bannerId = document.getElementById('bannerId').value;
    var badge = document.getElementById('bannerBadge').value.trim();
    var title = document.getElementById('bannerTitle').value.trim();
    var subtitle = document.getElementById('bannerSubtitle').value.trim();
    var description = document.getElementById('bannerDescription').value.trim();
    var buttonText = document.getElementById('bannerButtonText').value.trim();
    var gradient = document.getElementById('bannerGradient').value || 'from-primary-500 to-pink-600';
    var imagePosition = document.getElementById('bannerImagePosition').value || 'right';
    var imageUrl = document.getElementById('bannerImageUrl').value.trim();
    var targetUrl = document.getElementById('bannerTargetUrl').value.trim();

    if (!title || !subtitle || !description || !buttonText || !imageUrl || !targetUrl) {
        showToast('Please complete all banner fields');
        return;
    }

    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { collection, addDoc, updateDoc, doc, serverTimestamp } = firestoreModule;
        var { db } = configModule;

        var payload = {
            badge: badge || 'Featured',
            title: title,
            subtitle: subtitle,
            description: description,
            buttonText: buttonText,
            gradient: gradient,
            imagePosition: imagePosition,
            imageUrl: imageUrl,
            targetUrl: targetUrl,
            createdAt: serverTimestamp()
        };

        if (bannerId) {
            await updateDoc(doc(db, 'banners', bannerId), {
                badge: badge || 'Featured',
                title: title,
                subtitle: subtitle,
                description: description,
                buttonText: buttonText,
                gradient: gradient,
                imagePosition: imagePosition,
                imageUrl: imageUrl,
                targetUrl: targetUrl,
                updatedAt: serverTimestamp()
            });
        } else {
            await addDoc(collection(db, 'banners'), payload);
        }

        var currentBanners = getStoredArray('luxe_banners', []);
        var nextBanners = currentBanners.filter(function (item) { return item.id !== bannerId; });
        nextBanners.unshift({
            id: bannerId || 'banner-' + Date.now(),
            badge: badge || 'Featured',
            title: title,
            subtitle: subtitle,
            description: description,
            buttonText: buttonText,
            gradient: gradient,
            imagePosition: imagePosition,
            imageUrl: imageUrl,
            targetUrl: targetUrl,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('luxe_banners', JSON.stringify(nextBanners));

        resetBannerForm();
        loadBanners();
        showToast(bannerId ? 'Banner updated successfully' : 'Banner added successfully');
    } catch (error) {
        console.error('saveBannerFromForm error', error);
        showToast('Failed to save banner. Please try again.', 'error');
    }
}

async function deleteBanner(bannerId) {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { deleteDoc, doc } = firestoreModule;
        var { db } = configModule;

        if (bannerId && bannerId.indexOf('fallback-') === -1) {
            await deleteDoc(doc(db, 'banners', bannerId));
        }

        var banners = getStoredArray('luxe_banners', []).filter(function (item) {
            return item.id !== bannerId;
        });
        localStorage.setItem('luxe_banners', JSON.stringify(banners));
        loadBanners();
        showToast('Banner deleted successfully');
    } catch (error) {
        console.error('deleteBanner error', error);
        showToast('Failed to delete banner.', 'error');
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
        console.warn('Review Firestore fallback triggered:', error);
        return getStoredArray('luxe_reviews', [
            {
                id: 'fallback-review-1',
                customerName: 'Sarah Johnson',
                profileImage: 'https://i.pravatar.cc/100?img=1',
                rating: 5,
                text: 'The Vitamin C serum transformed my skin! Highly recommend.'
            },
            {
                id: 'fallback-review-2',
                customerName: 'Emily Chen',
                profileImage: 'https://i.pravatar.cc/100?img=5',
                rating: 5,
                text: 'Best skincare shopping experience! Fast shipping and amazing support.'
            }
        ]);
    }
}

function resetReviewForm() {
    var form = document.getElementById('reviewForm');
    if (form) form.reset();
    document.getElementById('reviewId').value = '';
    document.getElementById('reviewFormTitle').textContent = 'Add New Review';
    document.getElementById('reviewRating').value = 5;
}

async function loadReviews() {
    var tbody = document.getElementById('reviewsTableBody');
    if (!tbody) return;

    try {
        var reviews = await getReviews();
        if (!reviews || !reviews.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">No reviews found</td></tr>';
            return;
        }

        tbody.innerHTML = reviews.map(function (review) {
            return '<tr>' +
                '<td class="px-6 py-4"><div class="flex items-center"><img src="' + (review.profileImage || '') + '" alt="' + (review.customerName || 'Customer') + '" class="w-12 h-12 rounded-full object-cover mr-3"><div><div class="font-semibold">' + (review.customerName || 'Customer') + '</div></div></div></td>' +
                '<td class="px-6 py-4"><div class="flex text-yellow-400">' + renderStarIcons(review.rating) + '</div></td>' +
                '<td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-md">"' + (review.text || '') + '"</td>' +
                '<td class="px-6 py-4">' +
                '<button onclick="editReview(\'' + (review.id || '') + '\')" class="text-blue-500 hover:text-blue-600 mr-3"><i class="fas fa-edit"></i></button>' +
                '<button onclick="deleteReview(\'' + (review.id || '') + '\')" class="text-red-500 hover:text-red-600"><i class="fas fa-trash"></i></button>' +
                '</td>' +
                '</tr>';
        }).join('');
    } catch (error) {
        console.error('loadReviews error', error);
        tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-gray-500">Unable to load reviews</td></tr>';
        showToast('Unable to load reviews', 'error');
    }
}

function editReview(reviewId) {
    var reviews = getStoredArray('luxe_reviews', []);
    var review = reviews.find(function (item) { return item.id === reviewId; });
    if (!review) return;

    document.getElementById('reviewId').value = review.id;
    document.getElementById('reviewCustomerName').value = review.customerName || '';
    document.getElementById('reviewProfileImage').value = review.profileImage || '';
    document.getElementById('reviewRating').value = review.rating || 5;
    document.getElementById('reviewText').value = review.text || '';
    document.getElementById('reviewFormTitle').textContent = 'Edit Review';
}

async function saveReviewFromForm(event) {
    event.preventDefault();

    var reviewId = document.getElementById('reviewId').value;
    var customerName = document.getElementById('reviewCustomerName').value.trim();
    var profileImage = document.getElementById('reviewProfileImage').value.trim();
    var rating = parseInt(document.getElementById('reviewRating').value, 10);
    var text = document.getElementById('reviewText').value.trim();

    if (!customerName || !profileImage || !text || rating < 1 || rating > 5) {
        showToast('Please complete all review fields with a valid rating');
        return;
    }

    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { collection, addDoc, updateDoc, doc, serverTimestamp } = firestoreModule;
        var { db } = configModule;

        var payload = {
            customerName: customerName,
            profileImage: profileImage,
            rating: rating,
            text: text,
            createdAt: serverTimestamp()
        };

        if (reviewId) {
            await updateDoc(doc(db, 'reviews', reviewId), {
                customerName: customerName,
                profileImage: profileImage,
                rating: rating,
                text: text,
                updatedAt: serverTimestamp()
            });
        } else {
            await addDoc(collection(db, 'reviews'), payload);
        }

        var currentReviews = getStoredArray('luxe_reviews', []);
        var nextReviews = currentReviews.filter(function (item) { return item.id !== reviewId; });
        nextReviews.unshift({
            id: reviewId || 'review-' + Date.now(),
            customerName: customerName,
            profileImage: profileImage,
            rating: rating,
            text: text,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('luxe_reviews', JSON.stringify(nextReviews));

        resetReviewForm();
        loadReviews();
        showToast(reviewId ? 'Review updated successfully' : 'Review added successfully');
    } catch (error) {
        console.error('saveReviewFromForm error', error);
        showToast('Failed to save review. Please try again.', 'error');
    }
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { deleteDoc, doc } = firestoreModule;
        var { db } = configModule;

        if (reviewId && reviewId.indexOf('fallback-') === -1) {
            await deleteDoc(doc(db, 'reviews', reviewId));
        }

        var reviews = getStoredArray('luxe_reviews', []).filter(function (item) {
            return item.id !== reviewId;
        });
        localStorage.setItem('luxe_reviews', JSON.stringify(reviews));
        loadReviews();
        showToast('Review deleted successfully');
    } catch (error) {
        console.error('deleteReview error', error);
        showToast('Failed to delete review.', 'error');
    }
}

function normalizeUserRecord(user) {
    var raw = user || {};
    var addressValue = raw.address || '';

    if (typeof addressValue === 'object') {
        addressValue = [addressValue.street, addressValue.city, addressValue.state, addressValue.country].filter(Boolean).join(', ');
    }

    var isBlocked = Boolean(raw.isBlocked || raw.blocked || raw.status === 'blocked' || raw.status === 'Blocked');

    return {
        id: raw.id || raw.uid || raw.email || ('user-' + Date.now()),
        name: raw.name || raw.fullName || raw.displayName || 'Customer',
        email: raw.email || '',
        phone: raw.phone || raw.mobile || '',
        address: addressValue || 'N/A',
        role: String(raw.role || 'customer').toLowerCase() === 'admin' ? 'admin' : 'customer',
        isBlocked: isBlocked,
        status: isBlocked ? 'Blocked' : (raw.status || 'Active'),
        createdAt: raw.createdAt || new Date().toISOString(),
        orders: Array.isArray(raw.orders) ? raw.orders : []
    };
}

function normalizeOrderStatus(status) {
    var value = (status || '').toString().trim();
    var key = value.toLowerCase();

    if (key === 'pending' || key === 'under review' || key === 'قيد المراجعة') return 'Under Review';
    if (key === 'shipped' || key === 'تم الشحن') return 'Shipped';
    if (key === 'delivered' || key === 'تم التوصيل') return 'Delivered';
    if (key === 'cancelled' || key === 'canceled' || key === 'ملغي') return 'Cancelled';

    return value || 'Under Review';
}

function normalizeOrderRecord(order) {
    var raw = order || {};
    var customerInfo = raw.customerInfo || {};
    var address = customerInfo.address || {};
    var createdAt = raw.createdAt || raw.date || new Date().toISOString();
    var orderId = raw.orderId || raw.id || ('ORD-' + Date.now());

    return {
        id: raw.id || orderId,
        orderId: orderId,
        customerName: customerInfo.name || raw.customerName || 'Customer',
        customerEmail: customerInfo.email || raw.customerEmail || '',
        phone: customerInfo.phone || raw.phone || '',
        address: typeof address === 'string' ? address : [address.street, address.city, address.state, address.country].filter(Boolean).join(', '),
        total: Number(raw.total || (raw.pricing && raw.pricing.total) || 0),
        status: normalizeOrderStatus(raw.status),
        items: Array.isArray(raw.items) ? raw.items : [],
        createdAt: createdAt,
        fullOrder: raw
    };
}

function getOrders() {
    try {
        var orders = JSON.parse(localStorage.getItem('luxe_orders')) || [];
        return orders.map(normalizeOrderRecord).sort(function (a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    } catch (error) {
        return [];
    }
}

function getUsers() {
    try {
        return (JSON.parse(localStorage.getItem('luxe_users')) || []).map(normalizeUserRecord);
    } catch (error) {
        return [];
    }
}

function getSettings() {
    return JSON.parse(localStorage.getItem('luxe_admin_settings')) || {
        maintenanceMode: false,
        siteBanner: ''
    };
}

function saveSettings(settings) {
    localStorage.setItem('luxe_admin_settings', JSON.stringify(settings));
}

// ============================================
// NAVIGATION & TABS
// ============================================

function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(function (tab) {
        tab.classList.remove('active');
    });

    // Remove active class from all sidebar links
    document.querySelectorAll('.sidebar-link').forEach(function (link) {
        link.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');

    // Add active class to clicked link
    event.target.closest('.sidebar-link').classList.add('active');

    // Load data for the tab
    switch (tabName) {
        case 'overview':
            loadDashboardStats();
            break;
        case 'products':
            loadProducts();
            populateProductCategoryOptions();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'banners':
            loadBanners();
            break;
        case 'reviews':
            loadReviews();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'users':
            loadUsers();
            break;
        case 'settings':
            loadSettings();
            break;
    }

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('translate-x-0');
    document.getElementById('sidebar').classList.add('-translate-x-full');
}

// Sidebar toggle for mobile
var sidebarToggle = document.getElementById('sidebarToggle');
if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function () {
        var sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        sidebar.classList.toggle('-translate-x-full');
        sidebar.classList.toggle('translate-x-0');
    });
}

// ============================================
// DASHBOARD OVERVIEW
// ============================================

function loadDashboardStats() {
    var products = getProducts();
    var orders = getOrders();
    var users = getUsers();

    // Calculate stats
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalUsers').textContent = users.length;

    // Calculate revenue
    var revenue = orders.reduce(function (sum, order) {
        return sum + (order.total || 0);
    }, 0);
    document.getElementById('totalRevenue').textContent = 'EGP ' + revenue.toFixed(2);

    // Load recent orders
    loadRecentOrders();
}

function loadRecentOrders() {
    var orders = getOrders();
    var recentOrders = orders.slice(-5).reverse();
    var container = document.getElementById('recentOrdersList');

    if (recentOrders.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No orders yet</p>';
        return;
    }

    var html = '';
    recentOrders.forEach(function (order) {
        html += '<div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">';
        html += '<div>';
        html += '<p class="font-semibold">#' + order.orderId + '</p>';
        html += '<p class="text-sm text-gray-600 dark:text-gray-400">' + order.customerName + '</p>';
        html += '</div>';
        html += '<div class="text-right">';
        html += '<p class="font-bold text-primary-500">EGP ' + order.total.toFixed(2) + '</p>';
        html += '<span class="text-xs px-2 py-1 rounded-full ' + getStatusClass(order.status) + '">' + order.status + '</span>';
        html += '</div>';
        html += '</div>';
    });

    container.innerHTML = html;
}

function getStatusClass(status) {
    switch (status) {
        case 'Pending':
        case 'Under Review':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'Shipped':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        case 'Delivered':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'Cancelled':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
}

// ============================================
// PRODUCTS MANAGEMENT
// ============================================

var currentProductId = null;

function loadProducts() {
    var products = getProducts();
    var tbody = document.getElementById('productsTableBody');

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No products found</td></tr>';
        return;
    }

    var html = '';
    products.forEach(function (product) {
        var displayPrice = Number(product.salePrice || product.price || 0);
        var originalPrice = Number(product.originalPrice || product.price || 0);
        var hasDiscount = originalPrice > displayPrice && displayPrice > 0;

        html += '<tr>';
        html += '<td class="px-6 py-4"><img src="' + (product.image || '') + '" alt="' + product.name + '" class="w-16 h-16 object-cover rounded-lg"></td>';
        html += '<td class="px-6 py-4"><div class="font-semibold">' + product.name + '</div><div class="text-xs text-gray-500 mt-1">' + (product.barcode || 'No barcode') + '</div></td>';
        html += '<td class="px-6 py-4">';
        if (hasDiscount) {
            html += '<div class="text-gray-400 line-through text-sm">EGP ' + originalPrice.toFixed(2) + '</div>';
            html += '<div class="text-primary-500 font-bold">EGP ' + displayPrice.toFixed(2) + '</div>';
        } else {
            html += '<div class="text-primary-500 font-bold">EGP ' + displayPrice.toFixed(2) + '</div>';
        }
        html += '</td>';
        html += '<td class="px-6 py-4">' + product.category + '</td>';
        html += '<td class="px-6 py-4">' + (product.stock || 0) + '</td>';
        html += '<td class="px-6 py-4">';
        html += '<button onclick="editProduct(' + product.id + ')" class="text-blue-500 hover:text-blue-600 mr-3"><i class="fas fa-edit"></i></button>';
        html += '<button onclick="deleteProduct(' + product.id + ')" class="text-red-500 hover:text-red-600"><i class="fas fa-trash"></i></button>';
        html += '</td>';
        html += '</tr>';
    });

    tbody.innerHTML = html;
}

function showAddProductModal() {
    currentProductId = null;
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('productForm').reset();
    populateProductCategoryOptions();
    document.getElementById('productOriginalPrice').value = 0;
    document.getElementById('productSalePrice').value = 0;
    updateProductSavingsPreview();
    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModal').classList.add('flex');
}

function editProduct(productId) {
    var products = getProducts();
    var product = products.find(function (p) { return p.id === productId; });
    if (!product) return;

    currentProductId = productId;
    populateProductCategoryOptions();

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productBarcode').value = product.barcode || '';
    document.getElementById('productImageUrl').value = product.image || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productSkinType').value = product.skinType || 'All';
    document.getElementById('productOriginalPrice').value = product.originalPrice || product.price || 0;
    document.getElementById('productSalePrice').value = product.salePrice || product.price || 0;
    document.getElementById('productRating').value = product.rating || 5;
    document.getElementById('productStock').value = product.stock || 100;
    updateProductSavingsPreview();

    document.getElementById('productModal').classList.remove('hidden');
    document.getElementById('productModal').classList.add('flex');
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    var products = getProducts();
    products = products.filter(function (p) { return p.id !== productId; });
    saveProducts(products);
    loadProducts();
    showToast('Product deleted successfully');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.getElementById('productModal').classList.remove('flex');
    currentProductId = null;
}

var productOriginalPriceInput = document.getElementById('productOriginalPrice');
var productSalePriceInput = document.getElementById('productSalePrice');
if (productOriginalPriceInput && productSalePriceInput) {
    productOriginalPriceInput.addEventListener('input', updateProductSavingsPreview);
    productSalePriceInput.addEventListener('input', updateProductSavingsPreview);
}

var productForm = document.getElementById('productForm');
if (productForm) {
    productForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var products = getProducts();
        var originalPrice = parseNumeric(document.getElementById('productOriginalPrice').value);
        var salePrice = parseNumeric(document.getElementById('productSalePrice').value);
        var pricing = calculateDiscountDetails(originalPrice, salePrice);

        var productData = {
            id: currentProductId || Date.now(),
            name: document.getElementById('productName').value,
            barcode: document.getElementById('productBarcode').value,
            image: document.getElementById('productImageUrl').value || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            skinType: document.getElementById('productSkinType').value,
            rating: parseInt(document.getElementById('productRating').value),
            stock: parseInt(document.getElementById('productStock').value),
            price: pricing.salePrice,
            originalPrice: pricing.originalPrice,
            salePrice: pricing.salePrice,
            savings: pricing.savings,
            discountPercent: pricing.discountPercent,
            reviews: Math.floor(Math.random() * 500 + 100)
        };

        if (currentProductId) {
            var index = products.findIndex(function (p) { return p.id === currentProductId; });
            if (index > -1) {
                products[index] = productData;
            }
            showToast('Product updated successfully');
        } else {
            products.push(productData);
            showToast('Product added successfully');
        }

        saveProducts(products);
        loadProducts();
        closeProductModal();
    });
}

var categoryForm = document.getElementById('categoryForm');
if (categoryForm) {
    categoryForm.addEventListener('submit', saveCategoryFromForm);
}

var bannerForm = document.getElementById('bannerForm');
if (bannerForm) {
    bannerForm.addEventListener('submit', saveBannerFromForm);
}

var reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', saveReviewFromForm);
}

// ============================================
// ORDERS MANAGEMENT
// ============================================

async function fetchOrdersFromFirestore() {
    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp } = firestoreModule;
        var { db } = configModule;

        var snapshot = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
        var orders = snapshot.docs.map(function (docItem) {
            return normalizeOrderRecord({ id: docItem.id, ...docItem.data() });
        });

        localStorage.setItem('luxe_orders', JSON.stringify(orders));
        return orders;
    } catch (error) {
        console.warn('Orders Firestore fallback used:', error);
        return getOrders();
    }
}

async function loadOrders() {
    var tbody = document.getElementById('ordersTableBody');
    if (!tbody) return;

    try {
        var orders = await fetchOrdersFromFirestore();

        if (!orders || orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">No orders found</td></tr>';
            return;
        }

        var html = '';
        orders.forEach(function (order) {
            var statusClass = getStatusClass(order.status);
            var orderId = order.orderId || order.id || 'N/A';

            html += '<tr>';
            html += '<td class="px-6 py-4 font-mono text-sm">#' + String(orderId).replace(/^ORD-/, '') + '</td>';
            html += '<td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">' + formatDate(order.createdAt) + '</td>';
            html += '<td class="px-6 py-4 font-bold text-primary-500">EGP ' + Number(order.total || 0).toFixed(2) + '</td>';
            html += '<td class="px-6 py-4">';
            html += '<select onchange="updateOrderStatus(\'' + (order.id || orderId) + '\', this.value)" class="px-3 py-1 rounded-full text-sm ' + statusClass + ' border border-transparent">';
            html += '<option value="Under Review" ' + (order.status === 'Under Review' ? 'selected' : '') + '>Under Review</option>';
            html += '<option value="Shipped" ' + (order.status === 'Shipped' ? 'selected' : '') + '>Shipped</option>';
            html += '<option value="Delivered" ' + (order.status === 'Delivered' ? 'selected' : '') + '>Delivered</option>';
            html += '<option value="Cancelled" ' + (order.status === 'Cancelled' ? 'selected' : '') + '>Cancelled</option>';
            html += '</select>';
            html += '</td>';
            html += '<td class="px-6 py-4">';
            html += '<button onclick="viewOrderDetails(\'' + (order.id || orderId) + '\')" class="text-blue-500 hover:text-blue-600 mr-3"><i class="fas fa-eye"></i></button>';
            html += '<button onclick="cancelOrder(\'' + (order.id || orderId) + '\')" class="text-red-500 hover:text-red-600" title="Cancel order"><i class="fas fa-ban"></i></button>';
            html += '</td>';
            html += '</tr>';
        });

        tbody.innerHTML = html;
    } catch (error) {
        console.error('loadOrders error', error);
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">Unable to load orders</td></tr>';
        showToast('Unable to load orders', 'error');
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { doc, updateDoc, serverTimestamp } = firestoreModule;
        var { db } = configModule;

        var orders = getOrders();
        var order = orders.find(function (item) {
            return String(item.id) === String(orderId) || String(item.orderId) === String(orderId);
        });

        if (!order) {
            showToast('Order not found', 'error');
            return;
        }

        await updateDoc(doc(db, 'orders', String(order.id)), {
            status: newStatus,
            updatedAt: serverTimestamp()
        });

        var savedOrders = JSON.parse(localStorage.getItem('luxe_orders')) || [];
        savedOrders = savedOrders.map(function (item) {
            if (String(item.id || item.orderId) === String(order.id || order.orderId)) {
                item.status = newStatus;
                item.updatedAt = new Date().toISOString();
            }
            return item;
        });
        localStorage.setItem('luxe_orders', JSON.stringify(savedOrders));

        showToast('Order status updated to ' + newStatus, 'success');
        loadOrders();
    } catch (error) {
        console.error('updateOrderStatus error', error);
        showToast('Failed to update order status', 'error');
    }
}

async function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    await updateOrderStatus(orderId, 'Cancelled');
}

function viewOrderDetails(orderId) {
    var orders = getOrders();
    var order = orders.find(function (item) {
        return String(item.id) === String(orderId) || String(item.orderId) === String(orderId);
    });

    if (!order) {
        showToast('Order not found', 'error');
        return;
    }

    var modal = document.getElementById('orderDetailsModal');
    var content = document.getElementById('orderDetailsContent');
    if (!modal || !content) return;

    var fullOrder = order.fullOrder || {};
    var customer = fullOrder.customerInfo || {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.phone || '',
        address: { street: order.address || '', city: '', state: '', zip: '', country: '' }
    };
    var items = Array.isArray(fullOrder.items) ? fullOrder.items : (Array.isArray(order.items) ? order.items : []);
    var pricing = fullOrder.pricing || {};

    var itemHtml = items.map(function (item) {
        var safeName = item.name || 'Product';
        var safeImage = item.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&h=300&fit=crop';
        var price = Number(item.price || 0);
        var quantity = Number(item.quantity || 1);
        return '<div class="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 py-3">' +
            '<img src="' + safeImage + '" alt="' + safeName + '" class="w-16 h-16 object-cover rounded-lg">' +
            '<div class="flex-1">' +
            '<p class="font-semibold">' + safeName + '</p>' +
            '<p class="text-sm text-gray-500">Qty: ' + quantity + '</p>' +
            '</div>' +
            '<p class="font-semibold text-primary-500">EGP ' + (price * quantity).toFixed(2) + '</p>' +
            '</div>';
    }).join('');

    var productListHtml = itemHtml || '<p class="text-gray-500">No products found</p>';

    content.innerHTML = '<div class="space-y-6">' +
        '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">' +
        '<div><p class="text-sm text-gray-500">Order ID</p><p class="font-bold">#' + String(order.orderId || order.id).replace(/^ORD-/, '') + '</p></div>' +
        '<div><p class="text-sm text-gray-500">Date</p><p class="font-semibold">' + formatDate(order.createdAt) + '</p></div>' +
        '<div><p class="text-sm text-gray-500">Status</p><span class="inline-flex px-3 py-1 rounded-full text-sm ' + getStatusClass(order.status) + '">' + order.status + '</span></div>' +
        '</div>' +
        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
        '<div class="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">' +
        '<h3 class="font-semibold text-lg mb-3">Customer Details</h3>' +
        '<p><strong>Name:</strong> ' + (customer.name || order.customerName || 'N/A') + '</p>' +
        '<p><strong>Email:</strong> ' + (customer.email || order.customerEmail || 'N/A') + '</p>' +
        '<p><strong>Phone:</strong> ' + (customer.phone || order.phone || 'N/A') + '</p>' +
        '<p><strong>Address:</strong> ' + (customer.address && (customer.address.street || customer.address.city || customer.address.country) ? [customer.address.street, customer.address.city, customer.address.state, customer.address.country].filter(Boolean).join(', ') : (order.address || 'N/A')) + '</p>' +
        '</div>' +
        '<div class="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">' +
        '<h3 class="font-semibold text-lg mb-3">Order Summary</h3>' +
        '<div class="space-y-2 text-sm">' +
        '<div class="flex justify-between"><span>Subtotal</span><span>EGP ' + Number(pricing.subtotal || order.total || 0).toFixed(2) + '</span></div>' +
        '<div class="flex justify-between"><span>Shipping</span><span>EGP ' + Number(pricing.shipping || 0).toFixed(2) + '</span></div>' +
        '<div class="flex justify-between"><span>Tax</span><span>EGP ' + Number(pricing.tax || 0).toFixed(2) + '</span></div>' +
        '<div class="flex justify-between font-bold text-primary-500"><span>Total</span><span>EGP ' + Number(order.total || 0).toFixed(2) + '</span></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '<div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">' +
        '<h3 class="font-semibold text-lg mb-3">Products</h3>' +
        productListHtml +
        '</div>' +
        '</div>';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeOrderDetailsModal() {
    var modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// ============================================
// USERS MANAGEMENT
// ============================================

async function fetchUsersFromFirestore() {
    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { collection, getDocs, query, orderBy } = firestoreModule;
        var { db } = configModule;

        var snapshot = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
        var users = snapshot.docs.map(function (docItem) {
            return normalizeUserRecord({ id: docItem.id, ...docItem.data() });
        });

        localStorage.setItem('luxe_users', JSON.stringify(users));
        return users;
    } catch (error) {
        console.warn('Users Firestore fallback used:', error);
        return getUsers();
    }
}

async function loadUsers() {
    var tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    try {
        var users = await fetchUsersFromFirestore();

        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">No users found</td></tr>';
            return;
        }

        var html = '';
        users.forEach(function (user) {
            var isAdmin = user.role === 'admin';
            var isBlocked = Boolean(user.isBlocked || user.status === 'Blocked');
            html += '<tr>';
            html += '<td data-label="Name" class="px-6 py-4 font-semibold">' + (user.name || 'Customer') + '</td>';
            html += '<td data-label="Email" class="px-6 py-4">' + (user.email || 'N/A') + '</td>';
            html += '<td data-label="Phone" class="px-6 py-4">' + (user.phone || 'N/A') + '</td>';
            html += '<td data-label="Address" class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">' + (user.address || 'N/A') + '</td>';
            html += '<td data-label="Status" class="px-6 py-4"><span class="px-3 py-1 rounded-full text-xs font-semibold ' + (isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800') + '">' + (isBlocked ? 'Blocked' : 'Active') + '</span></td>';
            html += '<td data-label="Role" class="px-6 py-4"><span class="px-3 py-1 rounded-full text-xs font-semibold ' + (isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700') + '">' + (isAdmin ? 'Admin' : 'Customer') + '</span></td>';
            html += '<td data-label="Actions" class="px-6 py-4 space-x-2">';
            html += '<button onclick="toggleUserRole(\'' + (user.id || '') + '\', \'' + (isAdmin ? 'customer' : 'admin') + '\')" class="' + (isAdmin ? 'text-red-500 hover:text-red-600' : 'text-blue-500 hover:text-blue-600') + ' font-semibold text-sm">' + (isAdmin ? 'Remove Admin' : 'Make Admin') + '</button>';
            html += '<button onclick="toggleUserAccess(\'' + (user.id || '') + '\')" class="' + (isBlocked ? 'text-green-500 hover:text-green-600' : 'text-orange-500 hover:text-orange-600') + ' font-semibold text-sm">' + (isBlocked ? 'Unblock' : 'Block') + '</button>';
            html += '<button onclick="deleteUser(\'' + (user.id || '') + '\')" class="text-red-500 hover:text-red-600 font-semibold text-sm">Delete</button>';
            html += '</td>';
            html += '</tr>';
        });

        tbody.innerHTML = html;
    } catch (error) {
        console.error('loadUsers error', error);
        tbody.innerHTML = '<tr><td colspan="7" class="px-6 py-8 text-center text-gray-500">Unable to load users</td></tr>';
        showToast('Unable to load users', 'error');
    }
}

function showAddUserForm() {
    var card = document.getElementById('addUserFormCard');
    if (card) {
        card.classList.remove('hidden');
    }
}

function hideAddUserForm() {
    var card = document.getElementById('addUserFormCard');
    if (card) {
        card.classList.add('hidden');
    }
    var form = document.getElementById('addUserForm');
    if (form) form.reset();
}

function saveManualCustomer(formData) {
    var users = getUsers();
    var email = (formData.email || '').trim().toLowerCase();
    if (!email) {
        showToast('Email is required', 'error');
        return;
    }

    var existingUser = users.find(function (user) { return String(user.email || '').toLowerCase() === email; });
    if (existingUser) {
        showToast('This customer already exists', 'error');
        return;
    }

    var newCustomer = {
        id: 'manual-' + Date.now(),
        name: formData.name || 'New Customer',
        email: email,
        phone: formData.phone || '',
        address: formData.address || 'N/A',
        role: 'customer',
        isBlocked: false,
        status: 'Active',
        createdAt: new Date().toISOString(),
        orders: []
    };

    users.unshift(newCustomer);
    localStorage.setItem('luxe_users', JSON.stringify(users));
    showToast('Customer added successfully');
    loadUsers();
    hideAddUserForm();
}

var addUserForm = document.getElementById('addUserForm');
if (addUserForm) {
    addUserForm.addEventListener('submit', function (event) {
        event.preventDefault();
        saveManualCustomer({
            name: document.getElementById('newUserName').value.trim(),
            email: document.getElementById('newUserEmail').value.trim(),
            phone: document.getElementById('newUserPhone').value.trim(),
            address: document.getElementById('newUserAddress').value.trim()
        });
    });
}

async function toggleUserRole(userId, nextRole) {
    if (!userId) {
        showToast('User is missing.', 'error');
        return;
    }

    try {
        var firestoreModule = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        var configModule = await import('./firebase-config.js');
        var { doc, updateDoc, serverTimestamp } = firestoreModule;
        var { db } = configModule;

        await updateDoc(doc(db, 'users', userId), {
            role: nextRole,
            updatedAt: serverTimestamp()
        });

        var users = getUsers().map(function (user) {
            if (String(user.id) === String(userId)) {
                user.role = nextRole;
            }
            return user;
        });
        localStorage.setItem('luxe_users', JSON.stringify(users));

        showToast('User role updated successfully', 'success');
        loadUsers();
    } catch (error) {
        console.error('toggleUserRole error', error);
        showToast('Failed to update user role', 'error');
    }
}

function toggleUserAccess(userId) {
    var users = getUsers();
    var targetUser = users.find(function (user) { return String(user.id) === String(userId); });
    if (!targetUser) {
        showToast('User not found', 'error');
        return;
    }

    targetUser.isBlocked = !Boolean(targetUser.isBlocked);
    targetUser.status = targetUser.isBlocked ? 'Blocked' : 'Active';
    localStorage.setItem('luxe_users', JSON.stringify(users));
    showToast(targetUser.isBlocked ? 'Customer blocked successfully' : 'Customer unblocked successfully');
    loadUsers();
}

function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    var users = getUsers().filter(function (user) { return String(user.id) !== String(userId); });
    localStorage.setItem('luxe_users', JSON.stringify(users));
    showToast('Customer deleted successfully');
    loadUsers();
}

// ============================================
// SETTINGS
// ============================================

function loadSettings() {
    var settings = getSettings();
    document.getElementById('maintenanceToggle').checked = settings.maintenanceMode;
    document.getElementById('siteBanner').value = settings.siteBanner || '';
}

var maintenanceToggle = document.getElementById('maintenanceToggle');
if (maintenanceToggle) {
    maintenanceToggle.addEventListener('change', function () {
        var settings = getSettings();
        settings.maintenanceMode = this.checked;
        saveSettings(settings);
        showToast('Maintenance mode ' + (this.checked ? 'enabled' : 'disabled'));
    });
}

function saveBanner() {
    var settings = getSettings();
    settings.siteBanner = document.getElementById('siteBanner').value;
    saveSettings(settings);
    showToast('Banner saved successfully');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    var date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function showToast(message, type) {
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toastMessage');
    var toastIcon = document.getElementById('toastIcon');

    if (!toast || !toastMessage) return;

    type = type || 'success';
    toast.classList.remove('bg-green-500', 'bg-red-500', 'bg-blue-500');
    toast.classList.add(type === 'error' ? 'bg-red-500' : type === 'info' ? 'bg-blue-500' : 'bg-green-500');

    if (toastIcon) {
        toastIcon.className = 'text-2xl ' + (type === 'error' ? 'fas fa-exclamation-circle' : type === 'info' ? 'fas fa-info-circle' : 'fas fa-check-circle');
    }

    toastMessage.textContent = message;
    toast.style.transform = 'translateY(0)';

    setTimeout(function () {
        toast.style.transform = 'translateY(8rem)';
    }, 3000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js')
            .then(function (firebaseAuth) {
                return import('./firebase-config.js').then(function (config) {
                    return firebaseAuth.signOut(config.auth);
                });
            })
            .catch(function () { /* ignore if firebase not available */ })
            .finally(function () {
                localStorage.removeItem('luxe_currentUser');
                localStorage.removeItem('luxe_isAdmin');
                localStorage.removeItem('luxe_adminEmail');
                localStorage.removeItem('luxe_adminLoginTime');
                window.location.href = 'login.html';
            });
    }
}

// ============================================
// INITIALIZE DASHBOARD
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    loadDashboardStats();
});


// ============================================
// NOTIFICATION SYSTEM
// ============================================

function loadAdminNotifications() {
    var notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    var container = document.getElementById('notificationsList');

    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-500">No notifications</div>';
        return;
    }

    var html = '';
    notifications.forEach(function (notification, index) {
        var bgClass = notification.isRead ? 'bg-gray-50 dark:bg-gray-700' : 'bg-blue-50 dark:bg-blue-900/20';
        var iconClass = getNotificationIcon(notification.type);
        var iconColor = getNotificationColor(notification.type);

        html += '<div class="' + bgClass + ' rounded-lg p-4 mb-3 cursor-pointer hover:shadow-md transition" onclick="markNotificationAsRead(' + index + ')">';
        html += '<div class="flex items-start space-x-3">';
        html += '<div class="w-10 h-10 rounded-full ' + iconColor + ' flex items-center justify-center flex-shrink-0">';
        html += '<i class="' + iconClass + '"></i>';
        html += '</div>';
        html += '<div class="flex-1">';
        html += '<p class="font-semibold mb-1">' + notification.message + '</p>';
        html += '<p class="text-sm text-gray-500">' + formatNotificationTime(notification.timestamp) + '</p>';
        if (notification.orderTotal) {
            html += '<p class="text-sm text-primary-500 font-semibold mt-1">Order Total: EGP ' + notification.orderTotal.toFixed(2) + '</p>';
        }
        html += '</div>';
        if (!notification.isRead) {
            html += '<div class="w-2 h-2 bg-blue-500 rounded-full"></div>';
        }
        html += '</div>';
        html += '</div>';
    });

    container.innerHTML = html;
    updateNotificationBadge();
}

function getNotificationIcon(type) {
    var icons = {
        'order_cancelled': 'fas fa-times-circle',
        'order_placed': 'fas fa-shopping-bag',
        'order_updated': 'fas fa-sync-alt',
        'new_user': 'fas fa-user-plus'
    };
    return icons[type] || 'fas fa-bell';
}

function getNotificationColor(type) {
    var colors = {
        'order_cancelled': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        'order_placed': 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        'order_updated': 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        'new_user': 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    };
    return colors[type] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
}

function formatNotificationTime(timestamp) {
    var date = new Date(timestamp);
    var now = new Date();
    var diff = now - date;
    var minutes = Math.floor(diff / 60000);
    var hours = Math.floor(diff / 3600000);
    var days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return minutes + ' minutes ago';
    if (hours < 24) return hours + ' hours ago';
    if (days < 7) return days + ' days ago';
    return date.toLocaleDateString();
}

function markNotificationAsRead(index) {
    var notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    if (notifications[index]) {
        notifications[index].isRead = true;
        localStorage.setItem('luxe_adminNotifications', JSON.stringify(notifications));
        loadAdminNotifications();
    }
}

function markAllNotificationsAsRead() {
    var notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    notifications.forEach(function (n) { n.isRead = true; });
    localStorage.setItem('luxe_adminNotifications', JSON.stringify(notifications));
    loadAdminNotifications();
    showToast('All notifications marked as read');
}

function clearAllNotifications() {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    localStorage.setItem('luxe_adminNotifications', JSON.stringify([]));
    loadAdminNotifications();
    showToast('All notifications cleared');
}

function updateNotificationBadge() {
    var notifications = JSON.parse(localStorage.getItem('luxe_adminNotifications')) || [];
    var unreadCount = notifications.filter(function (n) { return !n.isRead; }).length;

    var badge = document.getElementById('notificationBadge');
    if (badge) {
        badge.textContent = unreadCount;
        if (unreadCount > 0) {
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

// Update order status with notification
function updateOrderStatusWithNotification(orderId, newStatus) {
    var orders = JSON.parse(localStorage.getItem('luxe_orders')) || [];
    var order = orders.find(function (o) { return o.orderId === orderId; });

    if (order) {
        var oldStatus = order.status;
        order.status = newStatus;
        order.updatedAt = new Date().toISOString();
        order.statusHistory.push({
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: 'Status updated by admin',
            updatedBy: 'admin'
        });

        localStorage.setItem('luxe_orders', JSON.stringify(orders));

        // Create notification for customer
        createCustomerNotificationFromAdmin(order.customerInfo.email, {
            type: 'order_updated',
            orderId: orderId,
            newStatus: newStatus,
            timestamp: new Date().toISOString(),
            message: 'Your order #' + orderId.split('-')[1] + ' status has been updated to ' + newStatus,
            isRead: false
        });

        showToast('Order status updated to ' + newStatus + '. Customer has been notified.');
        loadOrders();
    }
}

function createCustomerNotificationFromAdmin(customerEmail, notification) {
    var key = 'luxe_customerNotifications_' + customerEmail;
    var notifications = JSON.parse(localStorage.getItem(key)) || [];
    notifications.unshift(notification);
    localStorage.setItem(key, JSON.stringify(notifications));
}

// Initialize notifications on page load
if (document.getElementById('notificationsList')) {
    loadAdminNotifications();
    // Refresh notifications every 30 seconds
    setInterval(function () {
        updateNotificationBadge();
    }, 30000);
}
