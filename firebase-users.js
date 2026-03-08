// Firebase Users Management
import { db } from './firebase-config.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Get All Users (Admin only)
export async function getAllUsers() {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const users = [];

        snapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, users: users };
    } catch (error) {
        console.error('Get users error:', error);
        return { success: false, error: error.message };
    }
}

// Get Single User
export async function getUser(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            return { success: true, user: { id: userDoc.id, ...userDoc.data() } };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Get user error:', error);
        return { success: false, error: error.message };
    }
}

// Update User Profile
export async function updateUserProfile(userId, updates) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
}

// Delete User (Admin only)
export async function deleteUser(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        return { success: true, message: 'User deleted successfully' };
    } catch (error) {
        console.error('Delete user error:', error);
        return { success: false, error: error.message };
    }
}

// Add to User Wishlist
export async function addToWishlist(userId, productId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const wishlist = userData.wishlist || [];

            if (!wishlist.includes(productId)) {
                wishlist.push(productId);
                await updateDoc(userRef, {
                    wishlist: wishlist,
                    updatedAt: serverTimestamp()
                });
            }

            return { success: true, message: 'Added to wishlist' };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Add to wishlist error:', error);
        return { success: false, error: error.message };
    }
}

// Remove from User Wishlist
export async function removeFromWishlist(userId, productId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const wishlist = userData.wishlist || [];
            const updatedWishlist = wishlist.filter(id => id !== productId);

            await updateDoc(userRef, {
                wishlist: updatedWishlist,
                updatedAt: serverTimestamp()
            });

            return { success: true, message: 'Removed from wishlist' };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return { success: false, error: error.message };
    }
}

// Get User Wishlist
export async function getUserWishlist(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            return { success: true, wishlist: userData.wishlist || [] };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Get wishlist error:', error);
        return { success: false, error: error.message };
    }
}

// Add Order to User
export async function addUserOrder(userId, orderData) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const orders = userData.orders || [];
            orders.push({
                ...orderData,
                orderedAt: serverTimestamp()
            });

            await updateDoc(userRef, {
                orders: orders,
                updatedAt: serverTimestamp()
            });

            return { success: true, message: 'Order added successfully' };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Add order error:', error);
        return { success: false, error: error.message };
    }
}

// Get User Orders
export async function getUserOrders(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            return { success: true, orders: userData.orders || [] };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Get orders error:', error);
        return { success: false, error: error.message };
    }
}

// Search Users by Email
export async function searchUsersByEmail(email) {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const snapshot = await getDocs(q);
        const users = [];

        snapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, users: users };
    } catch (error) {
        console.error('Search users error:', error);
        return { success: false, error: error.message };
    }
}

// Block/Unblock User (Admin only)
export async function toggleUserBlock(userId, blocked) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            blocked: blocked,
            updatedAt: serverTimestamp()
        });
        return { success: true, message: blocked ? 'User blocked' : 'User unblocked' };
    } catch (error) {
        console.error('Toggle block error:', error);
        return { success: false, error: error.message };
    }
}
