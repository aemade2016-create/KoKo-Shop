// Firebase Products Management
import { db } from './firebase-config.js';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Get all products
export async function getAllProducts() {
    try {
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        return { success: true, products: productList };
    } catch (error) {
        console.error('Get products error:', error);
        return { success: false, error: error.message };
    }
}

// Get product by ID
export async function getProductById(productId) {
    try {
        const productDoc = await getDoc(doc(db, 'products', productId));
        if (productDoc.exists()) {
            return {
                success: true,
                product: { id: productDoc.id, ...productDoc.data() }
            };
        } else {
            return { success: false, error: 'Product not found' };
        }
    } catch (error) {
        console.error('Get product error:', error);
        return { success: false, error: error.message };
    }
}

// Add new product (Admin only)
export async function addProduct(productData) {
    try {
        const docRef = await addDoc(collection(db, 'products'), {
            ...productData,
            createdAt: new Date().toISOString()
        });
        return { success: true, productId: docRef.id };
    } catch (error) {
        console.error('Add product error:', error);
        return { success: false, error: error.message };
    }
}

// Update product (Admin only)
export async function updateProduct(productId, productData) {
    try {
        await updateDoc(doc(db, 'products', productId), {
            ...productData,
            updatedAt: new Date().toISOString()
        });
        return { success: true };
    } catch (error) {
        console.error('Update product error:', error);
        return { success: false, error: error.message };
    }
}

// Delete product (Admin only)
export async function deleteProduct(productId) {
    try {
        await deleteDoc(doc(db, 'products', productId));
        return { success: true };
    } catch (error) {
        console.error('Delete product error:', error);
        return { success: false, error: error.message };
    }
}

// Search products
export async function searchProducts(searchTerm) {
    try {
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(productsCol);

        const productList = productSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );

        return { success: true, products: productList };
    } catch (error) {
        console.error('Search products error:', error);
        return { success: false, error: error.message };
    }
}

// Get products by category
export async function getProductsByCategory(category) {
    try {
        const productsCol = collection(db, 'products');
        const q = query(productsCol, where('category', '==', category));
        const productSnapshot = await getDocs(q);

        const productList = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, products: productList };
    } catch (error) {
        console.error('Get products by category error:', error);
        return { success: false, error: error.message };
    }
}

// Get featured products
export async function getFeaturedProducts(limitCount = 8) {
    try {
        const productsCol = collection(db, 'products');
        const q = query(
            productsCol,
            where('featured', '==', true),
            limit(limitCount)
        );
        const productSnapshot = await getDocs(q);

        const productList = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, products: productList };
    } catch (error) {
        console.error('Get featured products error:', error);
        return { success: false, error: error.message };
    }
}

// Sync localStorage products to Firestore (one-time migration)
export async function syncLocalProductsToFirestore() {
    try {
        const localProducts = JSON.parse(localStorage.getItem('luxe_products')) || [];

        if (localProducts.length === 0) {
            return { success: false, error: 'No local products found' };
        }

        const promises = localProducts.map(product =>
            setDoc(doc(db, 'products', product.id.toString()), product)
        );

        await Promise.all(promises);

        return {
            success: true,
            message: `${localProducts.length} products synced to Firestore`
        };
    } catch (error) {
        console.error('Sync products error:', error);
        return { success: false, error: error.message };
    }
}
