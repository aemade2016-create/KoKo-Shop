// ============================================
// INITIALIZE PRODUCTS IN LOCALSTORAGE
// ============================================

(function initializeProducts() {
    var defaultProducts = [
            {
                id: 1,
                name: 'Radiant Glow Serum',
                barcode: 'RGS-1001',
                price: 49.99,
                originalPrice: 69.99,
                salePrice: 49.99,
                discountPercent: 29,
                savings: 20,
                rating: 5,
                image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop',
                description: 'Brightening serum with Vitamin C and hyaluronic acid for radiant, youthful skin.',
                category: 'Serum',
                skinType: 'All',
                stock: 50
            },
            {
                id: 2,
                name: 'Hydra Boost Moisturizer',
                barcode: 'HBM-2002',
                price: 39.99,
                originalPrice: 59.99,
                salePrice: 39.99,
                discountPercent: 33,
                savings: 20,
                rating: 5,
                image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&h=400&fit=crop',
                description: '24-hour hydration with ceramides and peptides for smooth, supple skin.',
                category: 'Moisturizer',
                skinType: 'Dry',
                stock: 45
            },
            {
                id: 3,
                name: 'Gentle Cleansing Foam',
                barcode: 'GCF-3003',
                price: 24.99,
                originalPrice: 34.99,
                salePrice: 24.99,
                discountPercent: 29,
                savings: 10,
                rating: 4,
                image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
                description: 'pH-balanced cleanser that removes impurities without stripping natural oils.',
                category: 'Cleanser',
                skinType: 'Sensitive',
                stock: 60
            },
            {
                id: 4,
                name: 'Age-Defying Night Cream',
                barcode: 'ANC-4004',
                price: 59.99,
                originalPrice: 79.99,
                salePrice: 59.99,
                discountPercent: 25,
                savings: 20,
                rating: 5,
                image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop',
                description: 'Rich night cream with retinol and peptides to reduce fine lines and wrinkles.',
                category: 'Night Cream',
                skinType: 'All',
                stock: 30
            },
            {
                id: 5,
                name: 'Vitamin C Eye Cream',
                barcode: 'VCE-5005',
                price: 34.99,
                originalPrice: 44.99,
                salePrice: 34.99,
                discountPercent: 22,
                savings: 10,
                rating: 4,
                image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&h=400&fit=crop',
                description: 'Brightens dark circles and reduces puffiness for refreshed, youthful eyes.',
                category: 'Eye Cream',
                skinType: 'All',
                stock: 40
            },
            {
                id: 6,
                name: 'Exfoliating Toner',
                barcode: 'ET-6006',
                price: 29.99,
                originalPrice: 39.99,
                salePrice: 29.99,
                discountPercent: 25,
                savings: 10,
                rating: 5,
                image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop',
                description: 'Gentle AHA/BHA toner that refines pores and improves skin texture.',
                category: 'Toner',
                skinType: 'Oily',
                stock: 55
            },
            {
                id: 7,
                name: 'Nourishing Face Oil',
                barcode: 'NFO-7007',
                price: 44.99,
                originalPrice: 59.99,
                salePrice: 44.99,
                discountPercent: 25,
                savings: 15,
                rating: 5,
                image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&h=400&fit=crop',
                description: 'Luxurious blend of botanical oils for deep nourishment and radiance.',
                category: 'Face Oil',
                skinType: 'Dry',
                stock: 35
            },
            {
                id: 8,
                name: 'SPF 50 Sunscreen',
                barcode: 'SPF-8008',
                price: 32.99,
                originalPrice: 42.99,
                salePrice: 32.99,
                discountPercent: 23,
                savings: 10,
                rating: 5,
                image: 'https://images.unsplash.com/photo-1556228852-80a3c4e6d1f7?w=400&h=400&fit=crop',
                description: 'Broad-spectrum protection with a lightweight, non-greasy formula.',
                category: 'Sunscreen',
                skinType: 'All',
                stock: 70
            },
            {
                id: 9,
                name: 'Hydrating Sheet Mask',
                barcode: 'HSM-9009',
                price: 19.99,
                originalPrice: 29.99,
                salePrice: 19.99,
                discountPercent: 33,
                savings: 10,
                rating: 4,
                image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&h=400&fit=crop',
                description: 'Intensive hydration mask with hyaluronic acid and aloe vera.',
                category: 'Mask',
                skinType: 'All',
                stock: 100
            },
            {
                id: 10,
                name: 'Lip Treatment Balm',
                barcode: 'LTB-1010',
                price: 16.99,
                originalPrice: 24.99,
                salePrice: 16.99,
                discountPercent: 32,
                savings: 8,
                rating: 5,
                image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
                description: 'Nourishing lip balm with shea butter and vitamin E for soft, smooth lips.',
                category: 'Lip Care',
                skinType: 'All',
                stock: 80
            }
        ];

        var defaultCategories = [
            { id: 1, name: 'Serum', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=600&fit=crop' },
            { id: 2, name: 'Moisturizer', image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&h=600&fit=crop' },
            { id: 3, name: 'Cleanser', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop' },
            { id: 4, name: 'Sunscreen', image: 'https://images.unsplash.com/photo-1556228852-80a3c4e6d1f7?w=800&h=600&fit=crop' },
            { id: 5, name: 'Mask', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&h=600&fit=crop' },
            { id: 6, name: 'Toner', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=600&fit=crop' },
            { id: 7, name: 'Eye Cream', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&h=600&fit=crop' },
            { id: 8, name: 'Face Oil', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&h=600&fit=crop' },
            { id: 9, name: 'Lip Care', image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&h=600&fit=crop' },
            { id: 10, name: 'Night Cream', image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&h=600&fit=crop' }
        ];

        // Expose default datasets globally
        window.defaultLuxeProducts = defaultProducts;
        window.defaultLuxeCategories = defaultCategories;

        // Check if products exist and has items
        var existingProducts = null;
        try {
            existingProducts = JSON.parse(localStorage.getItem('luxe_products'));
        } catch (e) {
            existingProducts = null;
        }

        if (!existingProducts || !Array.isArray(existingProducts) || existingProducts.length === 0) {
            localStorage.setItem('luxe_products', JSON.stringify(defaultProducts));
            console.log('✅ Products initialized in localStorage');
        } else {
            console.log('✅ Products already exist in localStorage (' + existingProducts.length + ' items)');
        }

        // Check if categories exist and has items
        var existingCategories = null;
        try {
            existingCategories = JSON.parse(localStorage.getItem('luxe_categories'));
        } catch (e) {
            existingCategories = null;
        }

        if (!existingCategories || !Array.isArray(existingCategories) || existingCategories.length === 0) {
            localStorage.setItem('luxe_categories', JSON.stringify(defaultCategories));
            console.log('✅ Categories initialized in localStorage');
        }

        // Utility to restore default catalog if needed
        window.resetCatalogToDefault = function () {
            localStorage.setItem('luxe_products', JSON.stringify(defaultProducts));
            localStorage.setItem('luxe_categories', JSON.stringify(defaultCategories));
            if (typeof window.renderProducts === 'function') window.renderProducts();
            if (typeof window.renderCategoryFilters === 'function') window.renderCategoryFilters();
            console.log('🔄 Catalog reset to default');
        };
})();
