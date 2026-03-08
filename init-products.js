// ============================================
// INITIALIZE PRODUCTS IN LOCALSTORAGE
// ============================================

(function initializeProducts() {
    // Check if products already exist
    var existingProducts = localStorage.getItem('luxe_products');

    if (!existingProducts) {
        // Default products
        var products = [
            {
                id: 1,
                name: 'Radiant Glow Serum',
                price: 49.99,
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
                price: 39.99,
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
                price: 24.99,
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
                price: 59.99,
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
                price: 34.99,
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
                price: 29.99,
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
                price: 44.99,
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
                price: 32.99,
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
                price: 19.99,
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
                price: 16.99,
                rating: 5,
                image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&h=400&fit=crop',
                description: 'Nourishing lip balm with shea butter and vitamin E for soft, smooth lips.',
                category: 'Lip Care',
                skinType: 'All',
                stock: 80
            }
        ];

        // Save to localStorage
        localStorage.setItem('luxe_products', JSON.stringify(products));
        console.log('✅ Products initialized in localStorage');
    } else {
        console.log('✅ Products already exist in localStorage');
    }
})();
