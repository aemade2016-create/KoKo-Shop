# 🔔 Customer-Admin Notification System

## Overview
A bidirectional notification system connecting customers and admin, enabling instant communication for order updates.

---

## ✨ Key Features

### Admin Notifications
- Instant notification when customer cancels order
- Display customer name, order ID, and order total
- Read/unread status tracking
- Notification badge with unread count
- Mark all as read / Clear all actions

### Customer Notifications
- Notification when admin updates order status
- Notification when order is cancelled
- Dedicated Notifications tab in Profile page
- Notification badge in sidebar
- Auto-refresh every 30 seconds

---

## 🗂️ Data Structure

### Admin Notification
```javascript
{
    type: 'order_cancelled',
    orderId: 'ORD-1234567890',
    customerName: 'John Doe',
    customerEmail: 'customer@email.com',
    orderTotal: 150.00,
    timestamp: '2026-03-13T10:30:00Z',
    message: 'Customer John Doe cancelled order #1234567890',
    isRead: false
}
```

### Customer Notification
```javascript
{
    type: 'order_updated',
    orderId: 'ORD-1234567890',
    newStatus: 'shipped',
    timestamp: '2026-03-13T10:30:00Z',
    message: 'Your order #1234567890 status has been updated to shipped',
    isRead: false
}
```

---

## 💾 localStorage Keys

- `luxe_adminNotifications` - All admin notifications
- `luxe_customerNotifications_{email}` - Customer notifications (separated by email)

---

## 🔄 Usage Scenarios

### Scenario 1: Customer Cancels Order
1. Customer clicks "Cancel Order" in Profile page
2. Order status updated to `cancelled`
3. **Admin notification**: "Customer [Name] cancelled order #[ID]"
4. **Customer notification**: "Your order #[ID] has been cancelled successfully"
5. Admin notification badge updated

### Scenario 2: Admin Updates Order Status
1. Admin changes order status from Orders Tab
2. Order status updated in system
3. **Customer notification**: "Your order #[ID] status has been updated to [Status]"
4. Customer notification badge updated

---

## 📍 Modified Files

### 1. `profile.html`
- Added Notifications tab in sidebar
- Added notification badge
- Added Notifications Tab section
- Notification functions:
  - `loadCustomerNotifications()`
  - `markCustomerNotificationAsRead(index)`
  - `markAllCustomerNotificationsAsRead()`
  - `clearAllCustomerNotifications()`
  - `updateCustomerNotificationBadge()`

### 2. `admin-script.js`
- Updated `updateOrderStatus` to use `updateOrderStatusWithNotification`
- Notification functions:
  - `loadAdminNotifications()`
  - `markNotificationAsRead(index)`
  - `markAllNotificationsAsRead()`
  - `clearAllNotifications()`
  - `updateNotificationBadge()`
  - `updateOrderStatusWithNotification()`
  - `createCustomerNotificationFromAdmin()`

### 3. `admin-dashboard.html`
- Added Notifications button in Sidebar with badge
- Added Notifications Tab
- Added "Mark All as Read" and "Clear All" buttons

---

## 🎨 Notification Types & Colors

### Admin
| Type | Icon | Color |
|------|------|-------|
| `order_cancelled` | `fa-times-circle` | Red |
| `order_placed` | `fa-shopping-bag` | Green |
| `order_updated` | `fa-sync-alt` | Blue |
| `new_user` | `fa-user-plus` | Purple |

### Customer
| Type | Icon | Color |
|------|------|-------|
| `order_cancelled` | `fa-times-circle` | Red |
| `order_updated` | `fa-sync-alt` | Blue |
| `order_delivered` | `fa-check-circle` | Green |
| `order_shipped` | `fa-truck` | Purple |

---

## 🧪 Testing

### Test 1: Customer Cancels Order
1. Login as customer
2. Go to Profile > My Orders
3. Click "Cancel Order" on a Pending/Processing order
4. Verify "Order cancelled successfully" toast
5. Login as admin (`aemade2016@gmail.com`)
6. Verify notification appears in Notifications Tab
7. Verify badge updated in Sidebar

### Test 2: Admin Updates Order Status
1. Login as admin
2. Go to Orders Tab
3. Change order status from Pending to Shipped
4. Logout and login as the order's customer
5. Go to Profile > Notifications
6. Verify "Your order status has been updated to Shipped" notification
7. Verify badge updated

### Test 3: Notification Management
1. Click unread notification (becomes read)
2. Click "Mark All as Read" (all notifications marked as read)
3. Click "Clear All" (all notifications cleared)

---

## ✅ Status
- ✅ Admin notification system - Complete
- ✅ Customer notification system - Complete
- ✅ Order cancellation notification - Complete
- ✅ Order update notification - Complete
- ✅ Notification badges - Complete
- ✅ Auto-refresh - Complete
- ✅ Notification management - Complete

---

Created: March 13, 2026
