// Firebase Orders Management
import { db } from './firebase-config.js';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Create new order
export async function createOrder(userId, orderData) {
    try {
        const order = {
            userId: userId,
            items: orderData.items,
            subtotal: orderData.subtotal,
            tax: orderData.tax,
            shipping: orderData.shipping,
            total: orderData.total,
            shippingAddress: orderData.shippingAddress,
            paymentMethod: orderData.paymentMethod,
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'orders'), order);

        return { success: true, orderId: docRef.id };
    } catch (error) {
        console.error('Create order error:', error);
        return { success: false, error: error.message };
    }
}

// Get user orders
export async function getUserOrders(userId) {
    try {
        const ordersCol = collection(db, 'orders');
        const q = query(
            ordersCol,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const orderSnapshot = await getDocs(q);
        const orderList = orderSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, orders: orderList };
    } catch (error) {
        console.error('Get user orders error:', error);
        return { success: false, error: error.message };
    }
}

// Get order by ID
export async function getOrderById(orderId) {
    try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));

        if (orderDoc.exists()) {
            return {
                success: true,
                order: { id: orderDoc.id, ...orderDoc.data() }
            };
        } else {
            return { success: false, error: 'Order not found' };
        }
    } catch (error) {
        console.error('Get order error:', error);
        return { success: false, error: error.message };
    }
}

// Update order status (Admin only)
export async function updateOrderStatus(orderId, status) {
    try {
        await updateDoc(doc(db, 'orders', orderId), {
            status: status,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Update order status error:', error);
        return { success: false, error: error.message };
    }
}

// Get all orders (Admin only)
export async function getAllOrders() {
    try {
        const ordersCol = collection(db, 'orders');
        const q = query(ordersCol, orderBy('createdAt', 'desc'));

        const orderSnapshot = await getDocs(q);
        const orderList = orderSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return { success: true, orders: orderList };
    } catch (error) {
        console.error('Get all orders error:', error);
        return { success: false, error: error.message };
    }
}

// Update order
export async function updateOrder(orderId, orderData) {
    try {
        await updateDoc(doc(db, 'orders', orderId), {
            ...orderData,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Update order error:', error);
        return { success: false, error: error.message };
    }
}

// Get order statistics (Admin only)
export async function getOrderStatistics() {
    try {
        const ordersCol = collection(db, 'orders');
        const orderSnapshot = await getDocs(ordersCol);

        const orders = orderSnapshot.docs.map(doc => doc.data());

        const stats = {
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            completedOrders: orders.filter(o => o.status === 'completed').length,
            cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
            totalRevenue: orders
                .filter(o => o.status === 'completed')
                .reduce((sum, o) => sum + (o.total || 0), 0)
        };

        return { success: true, stats: stats };
    } catch (error) {
        console.error('Get order statistics error:', error);
        return { success: false, error: error.message };
    }
}
