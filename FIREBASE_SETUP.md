# Firebase Integration Guide - Luxe Beauty

## تم ربط Firebase بنجاح! ✅

تم إضافة Firebase إلى موقع Luxe Beauty مع جميع الميزات التالية:

## الملفات التي تم إنشاؤها

### 1. `firebase-config.js`
ملف التكوين الأساسي لـ Firebase يحتوي على:
- تهيئة Firebase App
- Firebase Analytics
- Firebase Authentication
- Cloud Firestore
- Firebase Storage

### 2. `firebase-auth.js`
ملف إدارة المصادقة يحتوي على:
- تسجيل حساب جديد بالبريد الإلكتروني
- تسجيل الدخول بالبريد الإلكتروني
- تسجيل الدخول بـ Google
- تسجيل الدخول بـ Facebook
- تسجيل الخروج
- إدارة بيانات المستخدم في Firestore

## الصفحات المحدثة

تم إضافة Firebase إلى الصفحات التالية:
- ✅ `index.html` - الصفحة الرئيسية
- ✅ `login.html` - صفحة تسجيل الدخول (مع دعم كامل للمصادقة)
- ✅ `products.html` - صفحة المنتجات
- ✅ `cart.html` - سلة التسوق
- ✅ `profile.html` - الملف الشخصي

## الميزات المتاحة

### 1. المصادقة (Authentication)
```javascript
// تسجيل حساب جديد
import { signUpWithEmail } from './firebase-auth.js';
const result = await signUpWithEmail(name, email, password);

// تسجيل الدخول
import { signInWithEmail } from './firebase-auth.js';
const result = await signInWithEmail(email, password);

// تسجيل الدخول بـ Google
import { signInWithGoogle } from './firebase-auth.js';
const result = await signInWithGoogle();

// تسجيل الدخول بـ Facebook
import { signInWithFacebook } from './firebase-auth.js';
const result = await signInWithFacebook();

// تسجيل الخروج
import { signOutUser } from './firebase-auth.js';
const result = await signOutUser();
```

### 2. قاعدة البيانات (Firestore)
يتم حفظ بيانات المستخدمين تلقائياً في Firestore:
```javascript
{
  uid: "user-id",
  name: "User Name",
  email: "user@email.com",
  createdAt: timestamp,
  orders: [],
  wishlist: []
}
```

### 3. مراقبة حالة المصادقة
```javascript
import { onAuthStateChange } from './firebase-auth.js';

onAuthStateChange((user) => {
  if (user) {
    console.log('User logged in:', user);
  } else {
    console.log('User logged out');
  }
});
```

## إعدادات Firebase Console

### 1. تفعيل Authentication
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك: `koko-97681`
3. اذهب إلى **Authentication** > **Sign-in method**
4. فعّل الطرق التالية:
   - ✅ Email/Password
   - ✅ Google
   - ✅ Facebook (يتطلب App ID و App Secret)

### 2. إعداد Firestore
1. اذهب إلى **Firestore Database**
2. اضغط **Create database**
3. اختر **Start in test mode** (للتطوير)
4. اختر المنطقة الأقرب لك

### 3. قواعد الأمان (Security Rules)

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products collection (read-only for all)
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Orders collection
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. إعداد Google Sign-In
1. في Firebase Console > Authentication > Sign-in method
2. فعّل Google
3. أضف البريد الإلكتروني للدعم
4. احفظ التغييرات

### 5. إعداد Facebook Sign-In
1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. أنشئ تطبيق جديد
3. احصل على App ID و App Secret
4. في Firebase Console > Authentication > Sign-in method
5. فعّل Facebook وأضف App ID و App Secret
6. انسخ OAuth redirect URI وأضفه في إعدادات Facebook App

## الاستخدام

### تشغيل الموقع
```bash
# استخدم أي خادم محلي، مثل:
python -m http.server 8000
# أو
npx serve
```

ثم افتح المتصفح على: `http://localhost:8000`

### اختبار المصادقة
1. اذهب إلى صفحة تسجيل الدخول: `/login.html`
2. جرب إنشاء حساب جديد
3. جرب تسجيل الدخول بـ Google
4. تحقق من Firebase Console > Authentication لرؤية المستخدمين

## الميزات القادمة

يمكنك إضافة المزيد من الميزات:
- [ ] حفظ المنتجات في Firestore بدلاً من localStorage
- [ ] حفظ سلة التسوق في Firestore
- [ ] حفظ قائمة الأمنيات في Firestore
- [ ] إضافة Firebase Storage لرفع الصور
- [ ] إضافة Firebase Cloud Functions للعمليات الخلفية
- [ ] إضافة Firebase Cloud Messaging للإشعارات

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من Console في المتصفح (F12)
2. تحقق من Firebase Console > Authentication
3. تحقق من قواعد الأمان في Firestore

## ملاحظات مهمة

⚠️ **للإنتاج (Production):**
1. غيّر قواعد Firestore من test mode إلى production mode
2. أضف نطاقك (domain) إلى Authorized domains في Firebase Console
3. فعّل Firebase App Check للحماية من الاستخدام غير المصرح به
4. استخدم Environment Variables لإخفاء API Keys

## معلومات المشروع

- **Project ID:** koko-97681
- **Auth Domain:** koko-97681.firebaseapp.com
- **Storage Bucket:** koko-97681.firebasestorage.app

---

تم إنشاء هذا الدليل بواسطة Kiro AI ✨
