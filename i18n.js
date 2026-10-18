// ============================================
// KOKO SHOP - LUXE BEAUTY I18N SYSTEM (MODERN ES6+)
// Professional Arabic & English Localization Engine
// ============================================

(function () {
    'use strict';

    // 1. Comprehensive Localization Dictionary (Flawless Arabic & English)
    const translations = {
        en: {
            // Top Announcement Bar
            'announcement_shipping': 'Complimentary Express Shipping on Orders Over EGP 500',
            'announcement_clean': '100% Certified Clean Formulas',
            'announcement_quiz': 'Free 2-Min Skin Quiz',

            // Brand & Navigation
            'brand_name': 'KoKo',
            'brand_suffix': 'Shop',
            'brand_tagline': 'Clean Beauty Rituals',
            'nav_home': 'Home',
            'nav_shop_all': 'Shop All',
            'nav_shop_all_products': 'Shop All Products',
            'nav_serums': 'Serums',
            'nav_serums_elixirs': 'Serums & Elixirs',
            'nav_moisturizers': 'Moisturizers',
            'nav_barrier_creams': 'Barrier Creams',
            'nav_skin_diagnostic': 'Skin Diagnostic',
            'nav_diagnostic_quiz': 'Skin Diagnostic Quiz',
            'nav_our_ethos': 'Our Ethos',
            'nav_about_ethos': 'About Our Ethos',
            'nav_account': 'Account',
            'nav_wishlist': 'Wishlist',
            'nav_cart': 'Shopping Bag',
            'nav_admin': 'Admin Dashboard',
            'nav_theme_toggle': 'Toggle Light/Dark Theme',
            'lang_button_text': 'AR',

            // Hero Section (Home)
            'hero_badge': 'New Botanical Launch 2026',
            'hero_title': 'The Art of Radiant, Healthy Skin.',
            'hero_desc': 'Elevate your daily ritual with high-potency clinical botanicals formulated to nourish, protect, and illuminate your skin naturally.',
            'hero_btn_shop': 'Shop the Collection',
            'hero_btn_serums': 'Explore Serums',
            'hero_discount_value': '30% OFF',
            'hero_discount_title': 'Spring Radiance Ritual',
            'hero_stat_cruelty_free': '100% Cruelty Free',
            'hero_stat_parabens': 'Zero Parabens',
            'hero_stat_clinical': 'Clinical Efficacy',

            // Trust Pillars
            'pillar_clean_title': 'Clean & Non-Toxic',
            'pillar_clean_desc': 'Formulated without parabens, sulfates, or artificial fragrances.',
            'pillar_botanical_title': 'Botanical Actives',
            'pillar_botanical_desc': 'Sustainably harvested plant extracts backed by dermatology.',
            'pillar_shipping_title': 'Complimentary Shipping',
            'pillar_shipping_desc': 'Express delivery across Egypt for orders over EGP 500.',
            'pillar_tested_title': 'Dermatologist Tested',
            'pillar_tested_desc': 'Rigorously tested for sensitive skin and maximum tolerance.',

            // Curated Skin Rituals (Home)
            'rituals_title': 'Curated Skin Rituals',
            'rituals_subtitle': 'Formulated to target specific concerns with clinically proven results.',
            'rituals_view_all': 'View All Rituals',
            'rituals_explore_all': 'Explore All Products',

            // Clinical Results & Proof
            'clinical_title': 'Clinically Proven Formulations',
            'clinical_stat1_num': '98%',
            'clinical_stat1_title': 'Visible Hydration',
            'clinical_stat1_desc': 'Reported immediate and long-lasting barrier hydration.',
            'clinical_stat2_num': '94%',
            'clinical_stat2_title': 'Improved Texture',
            'clinical_stat2_desc': 'Observed visibly smoother, more refined skin within 14 days.',
            'clinical_stat3_num': '91%',
            'clinical_stat3_title': 'Luminous Glow',
            'clinical_stat3_desc': 'Confirmed a natural, dewy radiance without excess oiliness.',

            // Promo Banner
            'promo_tag': 'Signature Elixir',
            'promo_title': 'The Radiant Renewal Elixir',
            'promo_desc': 'Infused with cold-pressed rosehip seed oil, encapsulated hyaluronic acid, and botanical bakuchiol for effortless luminosity.',
            'promo_btn_shop': 'Shop the Elixir',
            'promo_btn_learn': 'Learn More',

            // Diagnostic Skin Quiz Section
            'quiz_badge': 'Diagnostic Skin Analysis',
            'quiz_title': 'Find Your Perfect Match',
            'quiz_desc': 'Take our 2-minute diagnostic quiz to discover the bespoke ritual designed specifically for your skin\'s unique needs.',
            'quiz_btn': 'Start Diagnosis',
            'quiz_modal_title': 'Skin Diagnostic Assessment',
            'quiz_q1': 'What is your primary skin concern?',
            'quiz_q1_opt1': 'Dullness & Uneven Skin Tone',
            'quiz_q1_opt2': 'Dryness & Dehydration',
            'quiz_q1_opt3': 'Fine Lines & Loss of Firmness',
            'quiz_q1_opt4': 'Sensitivity & Redness',
            'quiz_btn_calculate': 'Reveal My Bespoke Ritual',

            // Testimonials & Reviews
            'reviews_badge': 'Real Results, Real Skin',
            'reviews_title': 'Loved by 50,000+ Skin Enthusiasts',
            'verified_ritual': 'Verified Ritual',

            // Newsletter
            'newsletter_title': 'Join the KoKo Inner Circle',
            'newsletter_desc': 'Receive 15% off your first ritual, exclusive early access, and curated skincare advice.',
            'newsletter_placeholder': 'Enter your email address',
            'newsletter_btn': 'Subscribe',
            'newsletter_privacy': 'We respect your privacy. Unsubscribe at any time.',

            // Products Catalog Page
            'catalog_title': 'Curated Formulations',
            'catalog_subtitle': 'Explore our full collection of clean, high-performance skincare rituals.',
            'search_placeholder': 'Search formulas, actives, concerns...',
            'filter_all': 'All Products',
            'filter_all_categories': 'All Categories',
            'filter_by_category': 'Filter by Category',
            'filter_sort_by': 'Sort By',
            'sort_featured': 'Featured Formulations',
            'sort_price_low': 'Price: Low to High',
            'sort_price_high': 'Price: High to Low',
            'sort_rating': 'Highest Rated',
            'filter_price_range': 'Price Range',
            'filter_in_stock': 'In Stock Only',
            'filter_reset': 'Reset Filters',
            'showing_text': 'Showing',
            'formulations_text': 'formulations',
            'no_products_title': 'No formulations found',
            'no_products_desc': 'Try adjusting your filters or search terms to discover our clinical rituals.',
            'btn_quick_view': 'Quick View',
            'btn_view_details': 'View Details',
            'badge_out_of_stock': 'Out of Stock',
            'badge_in_stock': 'In Stock',

            // Product Cards & Actions
            'btn_add_to_bag': 'Add to Bag',
            'btn_move_to_bag': 'Move to Bag',
            'btn_remove': 'Remove',
            'btn_save': 'Save',
            'btn_cancel': 'Cancel',
            'btn_close': 'Close',
            'currency_egp': 'EGP',
            'currency_symbol': 'EGP',

            // Shopping Bag (Cart)
            'cart_page_title': 'Your Shopping Bag',
            'cart_page_subtitle': 'Review your curated beauty rituals and proceed to seamless checkout.',
            'cart_th_product': 'Product',
            'cart_th_price': 'Price',
            'cart_th_quantity': 'Quantity',
            'cart_th_total': 'Total',
            'cart_th_action': 'Action',
            'cart_order_summary': 'Order Summary',
            'cart_subtotal': 'Subtotal',
            'cart_shipping': 'Estimated Shipping',
            'cart_shipping_free': 'FREE',
            'cart_tax': 'Estimated Tax (10%)',
            'cart_total': 'Total',
            'cart_btn_checkout': 'Proceed to Checkout',
            'cart_btn_continue': 'Continue Shopping',
            'cart_promo_title': 'Have a Promo Code?',
            'cart_promo_placeholder': 'Enter promo code (try LUXE20)',
            'cart_promo_apply': 'Apply',
            'cart_empty_title': 'Your Bag is Currently Empty',
            'cart_empty_desc': 'Looks like you haven\'t added any beauty rituals to your bag yet.',
            'cart_empty_btn': 'Explore Formulations',

            // Checkout Page
            'checkout_page_title': 'Seamless Checkout',
            'checkout_page_subtitle': 'Complete your order with secure, encrypted payment.',
            'checkout_step1': '1. Bag',
            'checkout_step2': '2. Shipping & Payment',
            'checkout_step3': '3. Confirmation',
            'checkout_section_shipping': 'Contact & Shipping Information',
            'checkout_name_label': 'Full Name',
            'checkout_name_placeholder': 'Your complete name',
            'checkout_phone_label': 'Phone Number',
            'checkout_phone_placeholder': '01x xxxx xxxx',
            'checkout_email_label': 'Email Address',
            'checkout_email_placeholder': 'you@example.com',
            'checkout_address_label': 'Delivery Address',
            'checkout_address_placeholder': 'Street, building, apartment number',
            'checkout_city_label': 'City / Area',
            'checkout_city_placeholder': 'e.g., New Cairo, Maadi, Dokki',
            'checkout_gov_label': 'Governorate',
            'checkout_gov_select': 'Select Governorate',
            'checkout_notes_label': 'Special Delivery Instructions (Optional)',
            'checkout_notes_placeholder': 'e.g., apartment buzzer, preferred delivery hour',
            'checkout_section_payment': 'Select Payment Method',
            'checkout_pay_cod': 'Cash on Delivery (COD)',
            'checkout_pay_cod_desc': 'Pay with cash upon package arrival at your doorstep.',
            'checkout_pay_card': 'Credit / Debit Card',
            'checkout_pay_card_desc': 'Visa, MasterCard, and major debit cards accepted securely.',
            'checkout_pay_instapay': 'InstaPay / Mobile Wallet',
            'checkout_pay_instapay_desc': 'Instant transfer via InstaPay or Egyptian mobile wallets.',
            'checkout_card_num': 'Card Number',
            'checkout_card_holder': 'Cardholder Name',
            'checkout_card_expiry': 'MM/YY',
            'checkout_card_cvv': 'CVV',
            'checkout_review_title': 'Your Curated Order',
            'checkout_btn_place_order': 'Complete Ritual Purchase',
            'checkout_ssl_text': '256-Bit SSL Encrypted',
            'checkout_authentic_text': 'Guaranteed Authentic',
            'checkout_returns_text': 'Easy 14-Day Returns',

            // Order Success
            'order_success_title': 'Ritual Confirmed!',
            'order_success_subtitle': 'Thank you for your order. We are carefully packaging your clean beauty rituals.',
            'order_number_label': 'Order Reference:',
            'order_date_label': 'Order Date:',
            'order_est_delivery': 'Estimated Delivery: 2-4 Business Days',
            'btn_track_order': 'Track Your Order',
            'btn_back_home': 'Return to Home',

            // Wishlist Page
            'wishlist_title': 'Saved Skincare Rituals',
            'wishlist_subtitle': 'Your personal curation of desired botanical formulations.',
            'wishlist_empty_title': 'Your Wishlist is Empty',
            'wishlist_empty_desc': 'Save your favorite clean beauty formulations to curate your bespoke daily ritual.',
            'wishlist_empty_btn': 'Explore Collections',

            // Login & Register
            'tab_login': 'Sign In',
            'tab_register': 'Create Account',
            'login_title': 'Welcome Back',
            'login_subtitle': 'Sign in to access your curated rituals and skin profile.',
            'register_title': 'Join the Inner Circle',
            'register_subtitle': 'Create an account for personalized skin diagnostics and rewards.',
            'label_email': 'Email Address',
            'placeholder_email': 'you@example.com',
            'label_password': 'Password',
            'placeholder_password': '••••••••',
            'label_confirm_password': 'Confirm Password',
            'label_remember_me': 'Remember me',
            'link_forgot_password': 'Forgot Password?',
            'btn_sign_in': 'Sign In to Account',
            'btn_create_account': 'Create My Account',
            'or_continue_with': 'Or continue with',
            'btn_google': 'Continue with Google',
            'btn_facebook': 'Continue with Facebook',
            'text_no_account': 'Don\'t have an account?',
            'text_have_account': 'Already have an account?',
            'link_register': 'Create one here',
            'link_login': 'Sign in here',

            // Profile Page
            'profile_title': 'My Beauty Profile',
            'profile_subtitle': 'Manage your saved rituals, track orders, and personal details.',
            'profile_tab_orders': 'Order History',
            'profile_tab_info': 'Personal Info',
            'profile_tab_wishlist': 'Saved Rituals',
            'profile_tab_security': 'Security',
            'profile_stat_orders': 'Total Orders',
            'profile_stat_saved': 'Saved Rituals',
            'profile_stat_points': 'Loyalty Points',
            'profile_btn_update': 'Save Profile Changes',
            'profile_btn_logout': 'Sign Out',
            'profile_no_orders': 'You have not placed any orders yet.',

            // About Page
            'about_hero_tag': 'Our Philosophy',
            'about_hero_title': 'Rooted in Nature, Validated by Science',
            'about_hero_desc': 'KoKo Shop was founded on an unyielding belief: clean skincare shouldn\'t require a compromise between gentle botanicals and clinical efficacy.',
            'about_pillar1_title': '100% Clean Actives',
            'about_pillar1_desc': 'Every single ingredient must serve a clinical purpose for skin health.',
            'about_pillar2_title': 'Cruelty-Free Ethics',
            'about_pillar2_desc': 'Never tested on animals, and certified ethical throughout all sourcing.',
            'about_pillar3_title': 'Dermatologist Approved',
            'about_pillar3_desc': 'Formulated to meet strict clinical safety and skin-tolerance standards.',

            // Admin Dashboard
            'admin_title': 'Admin Dashboard',
            'admin_sidebar_overview': 'Store Overview',
            'admin_sidebar_orders': 'Orders Management',
            'admin_sidebar_products': 'Products Catalog',
            'admin_sidebar_banners': 'Hero Banners',
            'admin_sidebar_customers': 'Customers',
            'admin_sidebar_back': 'Back to Store',
            'admin_stat_revenue': 'Total Revenue',
            'admin_stat_orders': 'Total Orders',
            'admin_stat_products': 'Total Formulations',
            'admin_stat_pending': 'Pending Orders',
            'admin_btn_add_product': 'Add New Formulation',
            'admin_btn_add_banner': 'Add Hero Banner',

            // Footer
            'footer_about_title': 'About KoKo Shop',
            'footer_about_desc': 'Dedicated to providing luxury skincare rituals backed by clean botanical science. Nourish your skin naturally.',
            'footer_quick_links': 'Quick Navigation',
            'footer_customer_care': 'Customer Care',
            'footer_clean_standards': 'Clean Standards',
            'footer_privacy': 'Privacy Policy',
            'footer_terms': 'Terms of Service',
            'footer_shipping': 'Shipping & Returns',
            'footer_faqs': 'Frequently Asked Questions',
            'footer_rights': 'All Rights Reserved.',

            // Categories
            'cat_serum': 'Serum',
            'cat_moisturizer': 'Moisturizer',
            'cat_cleanser': 'Cleanser',
            'cat_night_cream': 'Night Cream',
            'cat_toner': 'Toner',
            'cat_sunscreen': 'Sunscreen',
            'cat_all': 'All Formulations',

            // Toasts & Alerts
            'toast_added_to_cart': 'Added to your shopping bag ✨',
            'toast_removed_from_cart': 'Item removed from bag',
            'toast_cart_cleared': 'Shopping bag cleared',
            'toast_added_to_wishlist': 'Added to saved rituals ❤️',
            'toast_removed_from_wishlist': 'Removed from saved rituals',
            'toast_logged_out': 'Logged out successfully',
            'toast_logged_in': 'Welcome back to KoKo Shop ✨',
            'toast_lang_changed': 'Language switched to English',
            'toast_order_placed': 'Order confirmed successfully! 🎉',
            'toast_fill_required': 'Please fill in all required fields'
        },

        ar: {
            // شريط الإعلانات العلوي
            'announcement_shipping': 'شحن سريع ومجاني لجميع الطلبات بقيمة 500 ج.م فأكثر',
            'announcement_clean': 'تركيبات طبيعية ونظيفة معتمدة 100%',
            'announcement_quiz': 'اختبار مجاني لتشخيص البشرة (دقيقتان)',

            // الهوية وشريط التنقل الرئيسي
            'brand_name': 'كوكو',
            'brand_suffix': 'شوب',
            'brand_tagline': 'طقوس الجمال النظيف',
            'nav_home': 'الرئيسية',
            'nav_shop_all': 'تسوق الكل',
            'nav_shop_all_products': 'جميع المنتجات',
            'nav_serums': 'السيروم',
            'nav_serums_elixirs': 'السيروم والإكسير',
            'nav_moisturizers': 'المرطبات',
            'nav_barrier_creams': 'كريمات حماية البشرة',
            'nav_skin_diagnostic': 'تشخيص البشرة',
            'nav_diagnostic_quiz': 'اختبار تشخيص نوع البشرة',
            'nav_our_ethos': 'رؤيتنا وقيمنا',
            'nav_about_ethos': 'عن هويتنا وقيمنا',
            'nav_account': 'حسابي',
            'nav_wishlist': 'قائمة الرغبات',
            'nav_cart': 'حقيبة التسوق',
            'nav_admin': 'لوحة التحكم',
            'nav_theme_toggle': 'تبديل المظهر النهاري/الليلي',
            'lang_button_text': 'EN',

            // الواجهة الرئيسية (Hero Section)
            'hero_badge': 'إطلاق التشكيلة النباتية الجديدة 2026',
            'hero_title': 'فن العناية ببشرة مشرقة، نضرة وصحية.',
            'hero_desc': 'ارتقِ بروتينك اليومي مع مستحضرات نباتية علاجية فائقة الفعالية، صُممت خصيصاً لتغذية بشرتك وحمايتها وإبراز إشراقتها الطبيعية.',
            'hero_btn_shop': 'تسوق التشكيلة الآن',
            'hero_btn_serums': 'استكشف السيروم',
            'hero_discount_value': 'خصم 30%',
            'hero_discount_title': 'روتين إشراقة الربيع',
            'hero_stat_cruelty_free': 'خالٍ من القسوة 100%',
            'hero_stat_parabens': 'خالٍ تماماً من البارابين',
            'hero_stat_clinical': 'فعالية سريرية مثبتة',

            // ركائز الثقة والتميز
            'pillar_clean_title': 'نقي وآمن تماماً',
            'pillar_clean_desc': 'تركيبات نقية خالية من البارابين، الكبريتات، والعطور الاصطناعية الضارة.',
            'pillar_botanical_title': 'خلاصات نباتية نشطة',
            'pillar_botanical_desc': 'مستخلصات نباتية مستدامة معتمدة ومثبتة في أبحاث طب الجلد.',
            'pillar_shipping_title': 'شحن سريع ومجاني',
            'pillar_shipping_desc': 'توصيل فائق السرعة لكافة محافظات مصر للطلبات التي تتجاوز 500 ج.م.',
            'pillar_tested_title': 'مختبر من أطباء الجلد',
            'pillar_tested_desc': 'تم اختباره سريرياً ليناسب أكثر أنواع البشرة حساسية بأعلى معايير الأمان.',

            // قسم طقوس العناية المختارة
            'rituals_title': 'طقوس العناية المختارة',
            'rituals_subtitle': 'صُممت بدقة لعلاج مختلف مشاكل البشرة بنتائج مثبتة مخبرياً وسريرياً.',
            'rituals_view_all': 'عرض كافة الطقوس',
            'rituals_explore_all': 'استكشف جميع المنتجات',

            // النتائج السريرية
            'clinical_title': 'تركيبات علاجية مثبتة الفعالية',
            'clinical_stat1_num': '98%',
            'clinical_stat1_title': 'ترطيب فوري ملحوظ',
            'clinical_stat1_desc': 'أكد المستخدمون ترطيباً عميقاً وفورياً لحاجز البشرة يدوم طوال اليوم.',
            'clinical_stat2_num': '94%',
            'clinical_stat2_title': 'تحسن ملموس في النعومة',
            'clinical_stat2_desc': 'لاحظوا بشرة أكثر نعومة ونقاءً وتجانساً خلال 14 يوماً فقط.',
            'clinical_stat3_num': '91%',
            'clinical_stat3_title': 'إشراقة ونضارة طبيعية',
            'clinical_stat3_desc': 'أكدوا الحصول على توهج صحي نضر دون أي مظهر دهني أو لمعان زائد.',

            // البانر الترويجي المميز
            'promo_tag': 'الإكسير المميز',
            'promo_title': 'إكسير التجديد والإشراق الفائق',
            'promo_desc': 'غني بزيت بذور الورد المعصور على البارد، وحمض الهيالورونيك المطور، والباكوتشيول النباتي لنضارة استثنائية ونعومة حريرية.',
            'promo_btn_shop': 'تسوق الإكسير الآن',
            'promo_btn_learn': 'اعرف المزيد',

            // اختبار تشخيص البشرة
            'quiz_badge': 'تحليل وتشخيص البشرة',
            'quiz_title': 'اكتشفي روتينك المثالي',
            'quiz_desc': 'أجيبي على اختبارنا السريع في دقيقتين لاكتشاف الروتين المخصص والمناسب لاحتياجات نوع بشرتك الفردية.',
            'quiz_btn': 'ابدأ التشخيص الآن',
            'quiz_modal_title': 'اختبار تشخيص نوع البشرة',
            'quiz_q1': 'ما هو التحدي الرئيسي الذي ترغبين في علاجه؟',
            'quiz_q1_opt1': 'بهتان البشرة وتفاوت اللون',
            'quiz_q1_opt2': 'الجفاف ونقص الترطيب العميق',
            'quiz_q1_opt3': 'الخطوط التعبيرية وفقدان المرونة',
            'quiz_q1_opt4': 'الحساسية والاحمرار والتهيج',
            'quiz_btn_calculate': 'عرض روتيني المخصص',

            // التقييمات وآراء العملاء
            'reviews_badge': 'تجارب حقيقية لبشرة طبيعية',
            'reviews_title': 'محل ثقة أكثر من 50,000 عميل وعميلة',
            'verified_ritual': 'مشتري موثق',

            // النشرة البريدية
            'newsletter_title': 'انضمي إلى مجتمع كوكو الخاص',
            'newsletter_desc': 'احصلي على خصم 15% على أول طلب لكِ، مع أسبقية حصرية للوصول إلى العروض ونصائح متخصصة للعناية ببشرتكِ.',
            'newsletter_placeholder': 'أدخلي بريدكِ الإلكتروني هنا',
            'newsletter_btn': 'اشتراك الآن',
            'newsletter_privacy': 'نحن نقدر خصوصيتكِ تماماً. يمكنكِ إلغاء الاشتراك في أي وقت بنقرة واحدة.',

            // صفحة كتالوج المنتجات
            'catalog_title': 'التشكيلة الكاملة للعناية',
            'catalog_subtitle': 'استكشفي تشكيلتنا المتكاملة من تركيبات العناية النظيفة وعالية الفعالية.',
            'search_placeholder': 'ابحثي عن التركيبات، المكونات، أو نوع المشكلة...',
            'filter_all': 'جميع المنتجات',
            'filter_all_categories': 'كافة التصنيفات',
            'filter_by_category': 'تصفية حسب التصنيف',
            'filter_sort_by': 'ترتيب حسب',
            'sort_featured': 'المميز لدينا',
            'sort_price_low': 'السعر: من الأقل إلى الأعلى',
            'sort_price_high': 'السعر: من الأعلى إلى الأقل',
            'sort_rating': 'الأعلى تقييماً',
            'filter_price_range': 'نطاق السعر',
            'filter_in_stock': 'المتوفر في المخزون فقط',
            'filter_reset': 'إعادة ضبط الفلاتر',
            'showing_text': 'عرض',
            'formulations_text': 'منتجات',
            'no_products_title': 'لم يتم العثور على أي منتجات',
            'no_products_desc': 'يرجى تعديل خيارات التصفية أو كلمات البحث للوصول إلى طقوسك المفضلة.',
            'btn_quick_view': 'نظرة سريعة',
            'btn_view_details': 'عرض التفاصيل',
            'badge_out_of_stock': 'نفد من المخزون',
            'badge_in_stock': 'متوفر',

            // كروت المنتجات والأزرار
            'btn_add_to_bag': 'أضف للحقيبة',
            'btn_move_to_bag': 'نقل إلى الحقيبة',
            'btn_remove': 'حذف',
            'btn_save': 'حفظ',
            'btn_cancel': 'إلغاء',
            'btn_close': 'إغلاق',
            'currency_egp': 'ج.م',
            'currency_symbol': 'ج.م',

            // صفحة حقيبة التسوق (Cart)
            'cart_page_title': 'حقيبة التسوق',
            'cart_page_subtitle': 'راجعي منتجاتك المختارة وتابعي لإتمام عملية الشراء بكل أمان ويسر.',
            'cart_th_product': 'المنتج',
            'cart_th_price': 'السعر',
            'cart_th_quantity': 'الكمية',
            'cart_th_total': 'الإجمالي',
            'cart_th_action': 'الإجراء',
            'cart_order_summary': 'ملخص الطلب',
            'cart_subtotal': 'المجموع الفرعي',
            'cart_shipping': 'الشحن التقديري',
            'cart_shipping_free': 'مجاناً',
            'cart_tax': 'الضريبة التقديرية (10%)',
            'cart_total': 'الإجمالي النهائي',
            'cart_btn_checkout': 'متابعة إتمام الطلب',
            'cart_btn_continue': 'مواصلة التسوق',
            'cart_promo_title': 'هل لديكِ رمز ترويجي (كوبون)؟',
            'cart_promo_placeholder': 'أدخلي رمز الكوبون (مثال: LUXE20)',
            'cart_promo_apply': 'تطبيق',
            'cart_empty_title': 'حقيبة التسوق فارغة حالياً',
            'cart_empty_desc': 'يبدو أنكِ لم تضيفي أي مستحضرات علاجية إلى حقيبتكِ بعد.',
            'cart_empty_btn': 'استكشفي المنتجات الآن',

            // صفحة إتمام الطلب (Checkout)
            'checkout_page_title': 'إتمام الشراء بكل سهولة',
            'checkout_page_subtitle': 'أكملي طلبكِ عبر خطوات دفع آمنة ومشفرة بالكامل.',
            'checkout_step1': '1. الحقيبة',
            'checkout_step2': '2. الشحن والدفع',
            'checkout_step3': '3. تأكيد الطلب',
            'checkout_section_shipping': 'بيانات التواصل والشحن',
            'checkout_name_label': 'الاسم بالكامل',
            'checkout_name_placeholder': 'أدخل اسمك بالكامل',
            'checkout_phone_label': 'رقم الهاتف',
            'checkout_phone_placeholder': '01x xxxx xxxx',
            'checkout_email_label': 'البريد الإلكتروني',
            'checkout_email_placeholder': 'you@example.com',
            'checkout_address_label': 'عنوان التوصيل بالتفصيل',
            'checkout_address_placeholder': 'اسم الشارع، رقم المبنى، رقم الشقة أو الطابق',
            'checkout_city_label': 'المدينة / المنطقة',
            'checkout_city_placeholder': 'مثال: القاهرة الجديدة، المعادي، الدقي',
            'checkout_gov_label': 'المحافظة',
            'checkout_gov_select': 'اختر المحافظة',
            'checkout_notes_label': 'ملاحظات إضافية للتوصيل (اختياري)',
            'checkout_notes_placeholder': 'مثال: علامة مميزة بجوار المبنى، وقت التوصيل المفضل',
            'checkout_section_payment': 'اختر طريقة الدفع المناسبة',
            'checkout_pay_cod': 'الدفع عند الاستلام (نقداً)',
            'checkout_pay_cod_desc': 'ادفع نقداً عند استلام شحنتك حتى باب منزلك بكل راحة.',
            'checkout_pay_card': 'بطاقة ائتمان / خصم مباشر',
            'checkout_pay_card_desc': 'نقبل بطاقات فيزا، ماستركارد، والبطاقات البنكية المشفرة بأعلى معايير الحماية.',
            'checkout_pay_instapay': 'انستاباي / المحافظ الإلكترونية',
            'checkout_pay_instapay_desc': 'تحويل فوري فائق السرعة عبر تطبيق انستاباي أو المحافظ الذكية (فودافون كاش وغيرها).',
            'checkout_card_num': 'رقم البطاقة البنكية',
            'checkout_card_holder': 'الاسم المطبوع على البطاقة',
            'checkout_card_expiry': 'شهر / سنة',
            'checkout_card_cvv': 'رمز الأمان (CVV)',
            'checkout_review_title': 'محتويات طلبك',
            'checkout_btn_place_order': 'تأكيد وشراء الطلب الآن',
            'checkout_ssl_text': 'تشفير آمن 256 بت SSL',
            'checkout_authentic_text': 'منتجات أصلية ومضمونة 100%',
            'checkout_returns_text': 'إرجاع واستبدال سهل خلال 14 يوماً',

            // نجاح تسجيل الطلب
            'order_success_title': 'تم تأكيد طلبكِ بنجاح! 🎉',
            'order_success_subtitle': 'شكراً لثقتكِ بنا. نحن نقوم حالياً بتجهيز مستحضراتكِ وتغليفها بكل عناية لتصلكِ في أسرع وقت.',
            'order_number_label': 'رقم الطلب المرجعي:',
            'order_date_label': 'تاريخ الطلب:',
            'order_est_delivery': 'موعد التوصيل المتوقع: خلال 2 إلى 4 أيام عمل',
            'btn_track_order': 'تتبع حالة الطلب',
            'btn_back_home': 'العودة للصفحة الرئيسية',

            // قائمة الرغبات (Wishlist)
            'wishlist_title': 'الطقوس المحفوظة (المفضلة)',
            'wishlist_subtitle': 'مجموعتكِ الخاصة والمختارة بعناية من أرقى مستحضرات العناية النظيفة.',
            'wishlist_empty_title': 'قائمة الرغبات فارغة حالياً',
            'wishlist_empty_desc': 'احفظي تركيباتكِ المفضلة هنا لإنشاء روتينكِ اليومي المخصص متى شئتِ.',
            'wishlist_empty_btn': 'استكشفي التشكيلات الآن',

            // تسجيل الدخول وإنشاء حساب
            'tab_login': 'تسجيل الدخول',
            'tab_register': 'إنشاء حساب جديد',
            'login_title': 'مرحباً بكِ مجدداً',
            'login_subtitle': 'سجلي دخولك للوصول إلى طقوسكِ المحفوظة وسجل طلباتكِ الخاصة.',
            'register_title': 'انضمي لعائلة كوكو شوب',
            'register_subtitle': 'أنشئي حسابك للاستفادة من التشخيص المخصص والمكافآت الحصرية للأعضاء.',
            'label_email': 'البريد الإلكتروني',
            'placeholder_email': 'you@example.com',
            'label_password': 'كلمة المرور',
            'placeholder_password': '••••••••',
            'label_confirm_password': 'تأكيد كلمة المرور',
            'label_remember_me': 'تذكر بياناتي',
            'link_forgot_password': 'هل نسيتِ كلمة المرور؟',
            'btn_sign_in': 'تسجيل الدخول إلى الحساب',
            'btn_create_account': 'إنشاء حسابي الآن',
            'or_continue_with': 'أو تابعي باستخدام',
            'btn_google': 'المتابعة عبر حساب جوجل',
            'btn_facebook': 'المتابعة عبر فيسبوك',
            'text_no_account': 'ليس لديكِ حساب بعد؟',
            'text_have_account': 'هل لديكِ حساب بالفعل؟',
            'link_register': 'أنشئي حساباً جديداً هنا',
            'link_login': 'سجلي دخولك هنا',

            // الملف الشخصي (Profile)
            'profile_title': 'ملفي الشخصي',
            'profile_subtitle': 'إدارة طقوسكِ المفضلة، تتبع الطلبات، وتعديل بياناتك الشخصية.',
            'profile_tab_orders': 'سجل الطلبات',
            'profile_tab_info': 'المعلومات الشخصية',
            'profile_tab_wishlist': 'المنتجات المحفوظة',
            'profile_tab_security': 'الأمان والحساب',
            'profile_stat_orders': 'إجمالي الطلبات',
            'profile_stat_saved': 'المنتجات المفضلة',
            'profile_stat_points': 'نقاط الولاء',
            'profile_btn_update': 'حفظ التعديلات',
            'profile_btn_logout': 'تسجيل الخروج',
            'profile_no_orders': 'لم تقومي بتسجيل أي طلبات حتى الآن.',

            // صفحة من نحن (About)
            'about_hero_tag': 'فلسفتنا وهويتنا',
            'about_hero_title': 'من وحي الطبيعة، ومثبت علمياً وسريرياً',
            'about_hero_desc': 'تأسس كوكو شوب على إيمان راسخ: العناية النظيفة بالبشرة لا ينبغي أن تكون مساومة بين المكونات اللطيفة والفعالية السريرية الفائقة.',
            'about_pillar1_title': 'خلاصات نشطة ونقية 100%',
            'about_pillar1_desc': 'كل مكون يدخل في منتجاتنا يؤدي دوراً علاجياً واضحاً ومباشراً لصحة ونضارة البشرة.',
            'about_pillar2_title': 'معايير أخلاقية صارمة',
            'about_pillar2_desc': 'لا نختبر منتجاتنا على الحيوانات مطلقاً، ونلتزم بأعلى معايير الاستدامة البيئية.',
            'about_pillar3_title': 'معتمد من أطباء الجلد',
            'about_pillar3_desc': 'تم تطوير جميع التركيبات لتلائم معايير السلامة السريرية وأعلى درجات التسامح الجلدي.',

            // لوحة الإدارة (Admin Dashboard)
            'admin_title': 'لوحة تحكم الإدارة',
            'admin_sidebar_overview': 'نظرة عامة على المتجر',
            'admin_sidebar_orders': 'إدارة الطلبات',
            'admin_sidebar_products': 'كتالوج المنتجات',
            'admin_sidebar_banners': 'بانرات الواجهة',
            'admin_sidebar_customers': 'العملاء',
            'admin_sidebar_back': 'العودة للمتجر',
            'admin_stat_revenue': 'إجمالي الإيرادات',
            'admin_stat_orders': 'إجمالي الطلبات',
            'admin_stat_products': 'عدد المنتجات',
            'admin_stat_pending': 'طلبات قيد الانتظار',
            'admin_btn_add_product': 'إضافة منتج جديد',
            'admin_btn_add_banner': 'إضافة بانر جديد',

            // الفوتر والحقوق
            'footer_about_title': 'عن كوكو شوب',
            'footer_about_desc': 'متجر رائد مكرس لتقديم أفخر طقوس العناية بالبشرة القائمة على العلوم النباتية النظيفة. نغذي بشرتكِ برقة وأمان.',
            'footer_quick_links': 'روابط سريعة',
            'footer_customer_care': 'خدمة العملاء',
            'footer_clean_standards': 'معايير النقاء',
            'footer_privacy': 'سياسة الخصوصية',
            'footer_terms': 'شروط الخدمة',
            'footer_shipping': 'الشحن والإرجاع',
            'footer_faqs': 'الأسئلة الشائعة',
            'footer_rights': 'جميع الحقوق محفوظة.',

            // تصنيفات المنتجات
            'cat_serum': 'سيروم',
            'cat_moisturizer': 'مرطب',
            'cat_cleanser': 'غسول',
            'cat_night_cream': 'كريم ليلي',
            'cat_toner': 'تونر',
            'cat_sunscreen': 'واقي شمس',
            'cat_all': 'كافة التركيبات',

            // رسائل التنبيه والإشعارات (Toasts)
            'toast_added_to_cart': 'تمت الإضافة إلى حقيبة التسوق بنجاح ✨',
            'toast_removed_from_cart': 'تم حذف المنتج من الحقيبة',
            'toast_cart_cleared': 'تم تفريغ حقيبة التسوق بالكامل',
            'toast_added_to_wishlist': 'تمت الإضافة إلى المفضلة ❤️',
            'toast_removed_from_wishlist': 'تم الحذف من المفضلة',
            'toast_logged_out': 'تم تسجيل الخروج بنجاح',
            'toast_logged_in': 'مرحباً بكِ مجدداً في كوكو شوب ✨',
            'toast_lang_changed': 'تم تحويل لغة الموقع إلى العربية بنجاح ✨',
            'toast_order_placed': 'تم تسجيل طلبكِ بنجاح! شكراً لثقتكِ 🎉',
            'toast_fill_required': 'يرجى استيفاء جميع الحقول المطلوبة'
        }
    };

    // 2. Direct Text Map for Instant Translation of Existing Text Nodes
    const directTextMap = {
        'Home': 'الرئيسية',
        'Shop All': 'تسوق الكل',
        'Shop All Products': 'جميع المنتجات',
        'Serums': 'السيروم',
        'Serums & Elixirs': 'السيروم والإكسير',
        'Moisturizers': 'المرطبات',
        'Barrier Creams': 'كريمات حماية البشرة',
        'Skin Diagnostic': 'تشخيص البشرة',
        'Skin Diagnostic Quiz': 'اختبار تشخيص نوع البشرة',
        'Our Ethos': 'رؤيتنا وقيمنا',
        'About Our Ethos': 'عن هويتنا وقيمنا',
        'Shopping Bag': 'حقيبة التسوق',
        'Wishlist': 'قائمة الرغبات',
        'Account': 'حسابي',
        'Admin Dashboard': 'لوحة التحكم',
        'Complimentary Express Shipping on Orders Over EGP 500': 'شحن سريع ومجاني لجميع الطلبات بقيمة 500 ج.م فأكثر',
        '100% Certified Clean Formulas': 'تركيبات طبيعية ونظيفة معتمدة 100%',
        'Free 2-Min Skin Quiz': 'اختبار مجاني لتشخيص البشرة (دقيقتان)',
        'New Botanical Launch 2026': 'إطلاق التشكيلة النباتية الجديدة 2026',
        'The Art of Radiant, Healthy Skin.': 'فن العناية ببشرة مشرقة، نضرة وصحية.',
        'Shop the Collection': 'تسوق التشكيلة الآن',
        'Explore Serums': 'استكشف السيروم',
        'Spring Radiance Ritual': 'روتين إشراقة الربيع',
        '30% OFF': 'خصم 30%',
        '100% Cruelty Free': 'خالٍ من القسوة 100%',
        'Zero Parabens': 'خالٍ تماماً من البارابين',
        'Clinical Efficacy': 'فعالية سريرية مثبتة',
        'Clean & Non-Toxic': 'نقي وآمن تماماً',
        'Formulated without parabens, sulfates, or artificial fragrances.': 'تركيبات نقية خالية من البارابين، الكبريتات، والعطور الاصطناعية الضارة.',
        'Botanical Actives': 'خلاصات نباتية نشطة',
        'Sustainably harvested plant extracts backed by dermatology.': 'مستخلصات نباتية مستدامة معتمدة ومثبتة في أبحاث طب الجلد.',
        'Complimentary Shipping': 'شحن سريع ومجاني',
        'Express delivery across Egypt for orders over EGP 500.': 'توصيل فائق السرعة لكافة محافظات مصر للطلبات التي تتجاوز 500 ج.م.',
        'Dermatologist Tested': 'مختبر من أطباء الجلد',
        'Rigorously tested for sensitive skin and maximum tolerance.': 'تم اختباره سريرياً ليناسب أكثر أنواع البشرة حساسية بأعلى معايير الأمان.',
        'Curated Skin Rituals': 'طقوس العناية المختارة',
        'Formulated to target specific concerns with clinically proven results.': 'صُممت بدقة لعلاج مختلف مشاكل البشرة بنتائج مثبتة مخبرياً وسريرياً.',
        'View All Rituals': 'عرض كافة الطقوس',
        'Explore All Products': 'استكشف جميع المنتجات',
        'Clinically Proven Formulations': 'تركيبات علاجية مثبتة الفعالية',
        'Visible Hydration': 'ترطيب فوري ملحوظ',
        'Reported immediate and long-lasting barrier hydration.': 'أكد المستخدمون ترطيباً عميقاً وفورياً لحاجز البشرة يدوم طوال اليوم.',
        'Improved Texture': 'تحسن ملموس في النعومة',
        'Observed visibly smoother, more refined skin within 14 days.': 'لاحظوا بشرة أكثر نعومة ونقاءً وتجانساً خلال 14 يوماً فقط.',
        'Luminous Glow': 'إشراقة ونضارة طبيعية',
        'Confirmed a natural, dewy radiance without excess oiliness.': 'أكدوا الحصول على توهج صحي نضر دون أي مظهر دهني أو لمعان زائد.',
        'The Radiant Renewal Elixir': 'إكسير التجديد والإشراق الفائق',
        'Shop the Elixir': 'تسوق الإكسير الآن',
        'Learn More': 'اعرف المزيد',
        'Diagnostic Skin Analysis': 'تحليل وتشخيص البشرة',
        'Find Your Perfect Match': 'اكتشفي روتينك المثالي',
        'Start Diagnosis': 'ابدأ التشخيص الآن',
        'Real Results, Real Skin': 'تجارب حقيقية لبشرة طبيعية',
        'Loved by 50,000+ Skin Enthusiasts': 'محل ثقة أكثر من 50,000 عميل وعميلة',
        'Verified Ritual': 'مشتري موثق',
        'Join the KoKo Inner Circle': 'انضمي إلى مجتمع كوكو الخاص',
        'Receive 15% off your first ritual, exclusive early access, and curated skincare advice.': 'احصلي على خصم 15% على أول طلب لكِ، مع أسبقية حصرية للوصول إلى العروض ونصائح متخصصة للعناية ببشرتكِ.',
        'Subscribe': 'اشتراك الآن',
        'We respect your privacy. Unsubscribe at any time.': 'نحن نقدر خصوصيتكِ تماماً. يمكنكِ إلغاء الاشتراك في أي وقت بنقرة واحدة.',
        'About KoKo Shop': 'عن كوكو شوب',
        'Quick Navigation': 'روابط سريعة',
        'Customer Care': 'خدمة العملاء',
        'Clean Standards': 'معايير النقاء',
        'Privacy Policy': 'سياسة الخصوصية',
        'Terms of Service': 'شروط الخدمة',
        'Shipping & Returns': 'الشحن والإرجاع',
        'Frequently Asked Questions': 'الأسئلة الشائعة',
        'All Rights Reserved.': 'جميع الحقوق محفوظة.',
        'Add to Bag': 'أضف للحقيبة',
        'Add to Wishlist': 'أضف إلى المفضلة',
        'Move to Bag': 'نقل إلى الحقيبة',
        'Quick View': 'نظرة سريعة',
        'View Details': 'عرض التفاصيل',
        'Out of Stock': 'نفد من المخزون',
        'In Stock': 'متوفر بالمخزون',
        'In Stock Only': 'المتوفر في المخزون فقط',
        'Reset Filters': 'إعادة ضبط الفلاتر',
        'Order Summary': 'ملخص الطلب',
        'Subtotal': 'المجموع الفرعي',
        'Estimated Shipping': 'الشحن التقديري',
        'Estimated Tax': 'الضريبة التقديرية',
        'Estimated Tax (10%)': 'الضريبة التقديرية (10%)',
        'Total': 'الإجمالي النهائي',
        'FREE': 'مجاناً',
        'Free': 'مجاناً',
        'Proceed to Checkout': 'متابعة إتمام الطلب',
        'Continue Shopping': 'مواصلة التسوق',
        'Have a Promo Code?': 'هل لديكِ رمز ترويجي (كوبون)؟',
        'Apply': 'تطبيق',
        'Your Shopping Bag': 'حقيبة التسوق',
        'Review your curated beauty rituals and proceed to seamless checkout.': 'راجعي منتجاتك المختارة وتابعي لإتمام عملية الشراء بكل أمان ويسر.',
        'Your Bag is Currently Empty': 'حقيبة التسوق فارغة حالياً',
        'Looks like you haven\'t added any beauty rituals to your bag yet.': 'يبدو أنكِ لم تضيفي أي مستحضرات علاجية إلى حقيبتكِ بعد.',
        'Explore Formulations': 'استكشفي المنتجات الآن',
        'Contact & Shipping Information': 'بيانات التواصل والشحن',
        'Full Name': 'الاسم بالكامل',
        'Phone Number': 'رقم الهاتف',
        'Email Address': 'البريد الإلكتروني',
        'Delivery Address': 'عنوان التوصيل بالتفصيل',
        'City / Area': 'المدينة / المنطقة',
        'Governorate': 'المحافظة',
        'Select Governorate': 'اختر المحافظة',
        'Special Delivery Instructions (Optional)': 'ملاحظات إضافية للتوصيل (اختياري)',
        'Select Payment Method': 'اختر طريقة الدفع المناسبة',
        'Cash on Delivery (COD)': 'الدفع عند الاستلام (نقداً)',
        'Pay with cash upon package arrival at your doorstep.': 'ادفع نقداً عند استلام شحنتك حتى باب منزلك بكل راحة.',
        'Credit / Debit Card': 'بطاقة ائتمان / خصم مباشر',
        'Visa, MasterCard, and major debit cards accepted securely.': 'نقبل بطاقات فيزا، ماستركارد، والبطاقات البنكية المشفرة بأعلى معايير الحماية.',
        'InstaPay / Mobile Wallet': 'انستاباي / المحافظ الإلكترونية',
        'Instant transfer via InstaPay or Egyptian mobile wallets.': 'تحويل فوري فائق السرعة عبر تطبيق انستاباي أو المحافظ الذكية (فودافون كاش وغيرها).',
        'Card Number': 'رقم البطاقة البنكية',
        'Cardholder Name': 'الاسم المطبوع على البطاقة',
        'Expiry Date': 'تاريخ الانتهاء (شهر/سنة)',
        'Security Code (CVV)': 'رمز الأمان (CVV)',
        'Your Curated Order': 'محتويات طلبك',
        'Complete Ritual Purchase': 'تأكيد وشراء الطلب الآن',
        '256-Bit SSL Encrypted': 'تشفير آمن 256 بت SSL',
        'Guaranteed Authentic': 'منتجات أصلية ومضمونة 100%',
        'Easy 14-Day Returns': 'إرجاع واستبدال سهل خلال 14 يوماً',
        'Sign In': 'تسجيل الدخول',
        'Create Account': 'إنشاء حساب جديد',
        'Welcome Back': 'مرحباً بكِ مجدداً',
        'Sign in to access your curated rituals and skin profile.': 'سجلي دخولك للوصول إلى طقوسكِ المحفوظة وسجل طلباتكِ الخاصة.',
        'Join the Inner Circle': 'انضمي لعائلة كوكو شوب',
        'Create an account for personalized skin diagnostics and rewards.': 'أنشئي حسابك للاستفادة من التشخيص المخصص والمكافآت الحصرية للأعضاء.',
        'Password': 'كلمة المرور',
        'Confirm Password': 'تأكيد كلمة المرور',
        'Remember me': 'تذكر بياناتي',
        'Forgot Password?': 'هل نسيتِ كلمة المرور؟',
        'Sign In to Account': 'تسجيل الدخول إلى الحساب',
        'Create My Account': 'إنشاء حسابي الآن',
        'Or continue with': 'أو تابعي باستخدام',
        'Continue with Google': 'المتابعة عبر حساب جوجل',
        'Continue with Facebook': 'المتابعة عبر فيسبوك',
        'Don\'t have an account?': 'ليس لديكِ حساب بعد؟',
        'Already have an account?': 'هل لديكِ حساب بالفعل؟',
        'Create one here': 'أنشئي حساباً جديداً هنا',
        'Sign in here': 'سجلي دخولك هنا',
        'Saved Skincare Rituals': 'الطقوس المحفوظة (المفضلة)',
        'Your personal curation of desired botanical formulations.': 'مجموعتكِ الخاصة والمختارة بعناية من أرقى مستحضرات العناية النظيفة.',
        'Your Wishlist is Empty': 'قائمة الرغبات فارغة حالياً',
        'Save your favorite clean beauty formulations to curate your bespoke daily ritual.': 'احفظي تركيباتكِ المفضلة هنا لإنشاء روتينكِ اليومي المخصص متى شئتِ.',
        'Explore Collections': 'استكشفي التشكيلات الآن',
        'My Beauty Profile': 'ملفي الشخصي',
        'Manage your saved rituals, track orders, and personal details.': 'إدارة طقوسكِ المفضلة، تتبع الطلبات، وتعديل بياناتك الشخصية.',
        'Order History': 'سجل الطلبات',
        'Personal Info': 'المعلومات الشخصية',
        'Saved Rituals': 'المنتجات المحفوظة',
        'Security': 'الأمان والحساب',
        'Total Orders': 'إجمالي الطلبات',
        'Loyalty Points': 'نقاط الولاء',
        'Save Profile Changes': 'حفظ التعديلات',
        'Sign Out': 'تسجيل الخروج',
        'You have not placed any orders yet.': 'لم تقومي بتسجيل أي طلبات حتى الآن.',
        'Store Overview': 'نظرة عامة على المتجر',
        'Orders Management': 'إدارة الطلبات',
        'Products Catalog': 'كتالوج المنتجات',
        'Hero Banners': 'بانرات الواجهة',
        'Customers': 'العملاء',
        'Back to Store': 'العودة للمتجر',
        'Total Revenue': 'إجمالي الإيرادات',
        'Total Formulations': 'عدد المنتجات',
        'Pending Orders': 'طلبات قيد الانتظار',
        'Add New Formulation': 'إضافة منتج جديد',
        'Add Hero Banner': 'إضافة بانر جديد',

        // Trust Pillars & Homepage Highlights
        '100% Clean Actives': 'خلاصات نشطة ونقية 100%',
        'Zero toxins, sulfates & parabens': 'خالية تماماً من السموم والكبريتات والبارابين',
        'Free Express Shipping': 'شحن سريع ومجاني',
        'On all orders over EGP 500': 'لجميع الطلبات التي تتجاوز 500 ج.م',
        'Hypoallergenic & clinically verified': 'مضاد للحساسية ومثبت سريرياً ومخبرياً',
        '30-Day Guarantee': 'ضمان استرجاع لمدة 30 يوماً',
        '100% visible radiant results': 'نتائج إشراقة ملحوظة 100%',
        'Browse All Categories': 'تصفح كافة التصنيفات',
        'Serums & Oils': 'السيروم والزيوت',
        'Intensive Radiance': 'إشراقة ونضارة مركزة',
        '24H Deep Moisture': 'ترطيب عميق يدوم 24 ساعة',
        'Cleansers': 'الغسول والمنظفات',
        'Gentle Purifying': 'تنقية فائقة بلطف',
        'Night Creams': 'كريمات العناية الليلية',
        'Barrier Repair': 'ترميم وتقوية حاجز البشرة',
        'Eye Care': 'العناية بمحيط العينين',
        'Brighten & Depuff': 'تفتيح وتقليل الانتفاخ',
        'Bio-Compatible Formulations': 'تركيبات متوافقة حيوياً مع البشرة',
        'Ethical & Eco-Conscious': 'أخلاقية وصديقة للبيئة 100%',
        'Clinically Tested Efficacy': 'فعالية مثبتة سريرياً ومخبرياً',
        'The Clean Philosophy': 'فلسفة الجمال النظيف',
        'Nourish Your Skin With': 'غذّي بشرتكِ بخلاصات',
        'Pure Botanical Actives': 'المكونات النباتية النقية',
        'We believe transformative skincare should never compromise purity. Every formula is crafted with scientifically proven botanicals, cold-pressed antioxidants, and skin-identical bio-lipids to restore your natural glow.': 'نحن نؤمن بأن العناية التحويلية بالبشرة يجب ألا تساوم على النقاء أبداً. كل تركيبة مصنوعة من نباتات مثبتة علمياً، ومضادات أكسدة معصورة على البارد لاستعادة إشراقتكِ الطبيعية.',
        'Penetrates deep into the dermal matrix without clogging pores or causing sensitivity.': 'يتغلغل بعمق دون انسداد المسام أو التسبب في أي تحسس للبشرة.',
        '100% Cruelty-free certified, sustainably harvested botanical actives, and recyclable containers.': 'معتمد خالٍ من القسوة 100%، بمكونات نباتية مستدامة وعبوات قابلة لإعادة التدوير.',
        'Rigorously tested under dermatological surveillance on sensitive and reactive skin types.': 'مختبر بدقة فائقة تحت إشراف أطباء الجلد على أنواع البشرة الحساسة والمتفاعلة.',
        'Tailored Solutions': 'حلول مخصصة لنوع بشرتكِ',
        'Targeted for Your': 'عناية موجهة لتقوية',
        'Skin Barrier': 'حاجز البشرة',
        'Select your primary concern to reveal clinically matched botanical protocols': 'اختاري مشكلتكِ الأساسية لاكتشاف البرتوكول النباتي المطابق سريرياً',
        'Dry & Parched': 'البشرة الجافة والعطشى',
        'Oily & Blemish': 'البشرة الدهنية والمعرضة للشوائب',
        'Sensitive Skin': 'البشرة الحساسة والرقيقة',
        'Combination': 'البشرة المختلطة والمتوازنة',
        'Pore Balancing': 'موازنة المسام',
        'Calm & Soothe': 'تهدئة وتلطيف البشرة',
        'Zone Control': 'توازن المناطق المختلطة',
        'Deep ceramide hydration': 'ترطيب عميق بالسيراميد',
        'Niacinamide & BHA balance': 'موازنة النياسيناميد وأحماض BHA',
        'Centella & oat calmatives': 'مستخلصات السنتيلا والشوفان المهدئة',
        'Targeted dual moisture': 'ترطيب مزدوج موجه',
        'Loved by Thousands': 'محل حب وإشادة الآلاف',
        'Iconic': 'أيقونات',
        'Best Sellers': 'الأكثر مبيعاً',
        'View All Cult Favorites': 'عرض جميع المنتجات المفضلة',
        '#1 Best Seller': 'الأكثر مبيعاً رقم 1',
        '#2 Best Seller': 'الأكثر مبيعاً رقم 2',
        '#3 Best Seller': 'الأكثر مبيعاً رقم 3',
        '50K+': '+50 ألف',
        'Happy Rituals': 'تجربة سعيدة',
        'Clean Certified': 'نظافة معتمدة',
        'Verified Rating': 'تقييم موثق',
        'Vitamin C Radiance Elixir': 'إكسير فيتامين C للإشراق',
        'Hydra-Barrier Dew Cream': 'كريم ديو لترطيب وحماية الحاجز',
        'SPF 50 Mineral Veil Shield': 'واقي الشمس المعدني مينرال فيل SPF 50',
        'Serum Ritual': 'طقس السيروم',
        'Deep Moisture': 'ترطيب عميق',
        'Mineral Shield': 'حماية معدنية',
        'Sun Defense': 'واقي ضد أشعة الشمس',
        'Brightening, Collagen-Support & Firming with 15% THD Ascorbate': 'تفتيح، دعم الكولاجين وشد البشرة مع 15% أسكوربات THD',
        'Multi-Molecular Hyaluronic & Ceramide NP 24-Hour Sustained Release': 'هيالورونيك متعدد الأوزان وسيراميد NP بترطيب مستمر 24 ساعة',
        'Invisible Zinc Oxide, Blue Light Defense & Dewy Botanical Finish': 'أكسيد الزنك الشفاف، حماية من الضوء الأزرق ولمسة نهائية نضرة',
        'Clinically Verified & Clean Certified': 'مثبت سريرياً ومعتمد بمعايير النقاء العالمية',
        '100% VEGAN': 'نباتي 100%',
        'CRUELTY FREE': 'خالٍ من القسوة',
        'PARABEN FREE': 'خالٍ من البارابين',
        'ECO PACKAGING': 'تغليف صديق للبيئة',
        'DERM APPROVED': 'معتمد من أطباء الجلد',
        'RECYCLABLE': 'قابل لإعادة التدوير',
        'Botanical Science': 'العلوم النباتية',
        'The Skincare': 'مدونة',
        'Journal': 'العناية بالبشرة',
        'Clinical advice, ingredient deep dives, and mindful rituals from our dermatologists.': 'استشارات طبية، تفاصيل المكونات، وطقوس عناية يومية من أطباء الجلد المتخصصين لدينا.',
        'The Science of Cold-Pressed Squalane & Barrier Health': 'علم السكوالين المعصور على البارد وصحة حاجز البشرة',
        'Why biomimetic lipids are essential to lock in hydration without disrupting skin microbiota.': 'لماذا تعتبر الدهون الحيوية ضرورية لحبس الرطوبة دون الإخلال بالميكروبيوم الطبيعي للبشرة.',
        'Morning vs Night: How to Layer High-Potency Serums': 'الصباح والمساء: الطريقة المثالية لدمج أنواع السيروم',
        'A step-by-step masterclass on pairing Vitamin C with Niacinamide and Peptides safely.': 'دليل شامل خطوة بخطوة للدمج الآمن بين فيتامين C، النياسيناميد، والببتيدات.',
        'Finding Your Holy Grail Vitamin C Formula': 'كيف تختارين تركيبة فيتامين C المثالية لبشرتكِ',
        'Comparing L-Ascorbic Acid vs THD Ascorbate for luminous skin without irritation.': 'مقارنة علمية دقيقة بين حمض الأسكوربيك وأسكوربات THD لبشرة نضرة بدون أي تهيج.',
        'Read Article': 'قراءة المقال',
        'Read More': 'اقرأ المزيد',
        'Verified Transformations': 'تحولات وتجارب موثقة',
        'Real People,': 'تجارب حقيقية،',
        'Real Glow': 'إشراقة طبيعية',
        'Over 2,800+ 5-star clinical reviews from customers who transformed their skin barrier.': 'أكثر من 2,800 تقييم 5 نجوم من عملاء استعادوا صحة ونضارة حاجز بشرتهم.',
        'Exclusive Beauty Circle': 'مجتمع الجمال الحصري',
        'Join The Luxe Circle &': 'انضمي إلى مجتمعنا الفاخر و',
        'Receive 15% Off Your First Order': 'احصلي على خصم 15% على طلبكِ الأول',
        'Subscribe to our curated newsletter for clinical launches, private member sales, and custom ritual advice.': 'اشتركي في نشرتنا البريدية لتصلكِ أحدث المنتجات، العروض الخاصة بالأعضاء، ونصائح العناية المخصصة.',
        'Enter your email address': 'أدخلي بريدكِ الإلكتروني',
        'Subscribe Now': 'اشتراك الآن',
        'We respect your privacy. No spam, ever.': 'نحن نحترم خصوصيتكِ. لا رسائل مزعجة على الإطلاق.',
        'Home Rituals': 'طقوس البداية',
        'All Formulations': 'جميع التركيبات',
        'Serums & Treatments': 'السيروم والعلاجات',
        'About Our Clean Ethos': 'عن هويتنا وقيمنا النظيفة',
        'Express Shipping & Delivery': 'الشحن والتوصيل السريع',
        '30-Day Radiant Guarantee': 'ضمان الإشراقة لمدة 30 يوماً',
        'Ingredient Transparency': 'شفافية ونقاء المكونات',
        'Track Your Order': 'تتبع حالة طلبكِ',
        'Concierge': 'خدمة العملاء والاستشارات',
        'Zamalek & New Cairo, Egypt': 'الزمالك والقاهرة الجديدة، مصر',
        'Guaranteed Safe Checkout:': 'دفع آمن ومحمي 100%:',
        'Fast Cairo & Alex Dispatch': 'شحن سريع للقاهرة والإسكندرية والمحافظات',
        'Crafted with': 'صُنع بكل',
        'for pure, radiant skin.': 'من أجل بشرة نقية ومشرقة.',
        'Pure botanical intelligence for transcendent skin. Formulated with biocompatible actives and certified clean standards.': 'ذكاء نباتي نقي لبشرة متألقة وفائقة النضارة. صُممت بمركبات متوافقة حيوياً مع أعلى معايير النقاء العالمية.',

        // 10 Catalog Products & Clinical Formulations
        'Radiant Glow Serum': 'سيروم التوهج والإشراق الفائق',
        'Brightening serum with Vitamin C and hyaluronic acid for radiant, youthful skin.': 'سيروم تفتيح ونضارة بفيتامين C وحمض الهيالورونيك لبشرة شابة ومشرقة ومتألقة.',
        'Hydra Boost Moisturizer': 'مرطب هيدرا بوست فائق الترطيب',
        '24-hour hydration with ceramides and peptides for smooth, supple skin.': 'ترطيب عميق يدوم 24 ساعة بالسيراميد والببتيدات لبشرة ناعمة ومرنة ومحمية.',
        'Gentle Cleansing Foam': 'رغوة التنظيف النباتية اللطيفة',
        'pH-balanced cleanser that removes impurities without stripping natural oils.': 'غسول رغوي متوازن الحموضة ينقي البشرة ويزيل الشوائب دون تجريدها من زيوتها الطبيعية.',
        'Age-Defying Night Cream': 'كريم العناية الليلية لمقاومة التجاعيد',
        'Rich night cream with retinol and peptides to reduce fine lines and wrinkles.': 'كريم ليلي غني بالريتينول والببتيدات لتجديد خلايا البشرة وتقليل الخطوط الدقيقة والتجاعيد.',
        'Vitamin C Eye Cream': 'كريم فيتامين C لمحيط العينين',
        'Brightens dark circles and reduces puffiness for refreshed, youthful eyes.': 'يفتح الهالات السوداء ويقلل من الانتفاخات لمنح محيط العينين مظهراً منتعشاً وشاباً.',
        'Exfoliating Toner': 'تونر التقشير والتجديد اليومي',
        'Gentle AHA/BHA toner that refines pores and improves skin texture.': 'تونر لطيف بأحماض AHA وBHA لتضييق المسام وتنعيم ملمس البشرة وتوحيد لونها.',
        'Nourishing Face Oil': 'زيت الوجه النباتي المغذي الفاخر',
        'Luxurious blend of botanical oils for deep nourishment and radiance.': 'مزيج فاخر من الزيوت النباتية المعصورة على البارد لتغذية عميقة وتوهج صحي آسر.',
        'SPF 50 Sunscreen': 'واقي الشمس المعدني المتطور SPF 50',
        'Broad-spectrum protection with a lightweight, non-greasy formula.': 'حماية واسعة النطاق بتركيبة شفافة خفيفة غير دهنية تحمي حاجز البشرة بأمان.',
        'Hydrating Sheet Mask': 'قناع الترطيب الفائق والإنعاش',
        'Intensive hydration mask with hyaluronic acid and aloe vera.': 'قناع علاجي مكثف بحمض الهيالورونيك والصبار لترطيب فوري وتهدئة عميقة.',
        'Lip Treatment Balm': 'بلسم علاج وترطيب الشفاه',
        'Nourishing lip balm with shea butter and vitamin E for soft, smooth lips.': 'بلسم مغذٍ ومطري بزبدة الشيا وفيتامين E لشفاه ناعمة، ممتلئة وصحية.',
        'Gentle Botanical Foaming Cleanser': 'غسول رغوي نباتي نقي ومتوازن',
        'Radiant Renewal Elixir': 'إكسير التجديد والإشراق',
        'ATTRACTIVE Fragrance Collection': 'تشكيلة عطور ATTRACTIVE الفاخرة',
        'Essence of Elegance': 'جوهر الأناقة والجاذبية',
        'Because your scent is your invisible signature, we present the new ATTRACTIVE collection.': 'لأن عطركِ هو توقيعكِ غير المرئي، نقدم لكِ تشكيلة ATTRACTIVE الجديدة والمميزة.',

        // Diagnostic Skin Quiz & Analysis
        'Step 1 of 3': 'الخطوة 1 من 3',
        'Step 2 of 3': 'الخطوة 2 من 3',
        'Step 3 of 3': 'الخطوة 3 من 3',
        'What is your primary skin type?': 'ما هو نوع بشرتكِ الأساسي؟',
        'Dry / Dehydrated': 'جافة / فاقدة للترطيب',
        'Oily / Blemish-Prone': 'دهنية / معرضة للشوائب والحبوب',
        'Sensitive / Reactive': 'حساسة / سريعة التأثر والاحمرار',
        'Normal / Balanced': 'عادية / متوازنة وصحية',
        'Select the option that best describes your daily skin condition': 'اختاري الخيار الذي يصف حالة بشرتكِ اليومية بدقة',
        'What is your top skin barrier goal?': 'ما هو هدفكِ الأهم لصحة حاجز بشرتكِ؟',
        'Intense Hydration & Plumpness': 'ترطيب فائق ونضارة ممتلئة',
        'Radiance & Hyperpigmentation': 'إشراقة وتوحيد لون البشرة والتصبغات',
        'Calming Redness & Sensitivity': 'تهدئة الاحمرار وتلطيف الحساسية',
        'Pore Refining & Oil Balance': 'تضييق المسام وموازنة الإفرازات الدهنية',
        'Firming & Fine Lines': 'شد البشرة ومقاومة الخطوط الرفيعة',
        'What texture do you prefer for daily rituals?': 'ما هو القوام المفضل لديكِ لطقوسكِ اليومية؟',
        'Weightless Gel-Serum': 'سيروم جل خفيف الوزن سريع الامتصاص',
        'Silky Dew Cream': 'كريم ندي حريري الملمس',
        'Rich Ceramide Balm': 'بلسم غني بالسيراميد المغذي',
        'Active Botanical Oil': 'زيت نباتي نشط وفاخر',
        'Previous': 'السابق',
        'Diagnosis Complete': 'اكتمل التشخيص بنجاح ✨',
        'Your Personalized Radiance Protocol': 'بروتوكول الإشراقة المخصص لبشرتكِ',
        'Based on your answers, our clinical dermatologists recommend this synergistic botanical routine:': 'بناءً على إجاباتكِ، يوصي أطباؤنا بهذا الروتين النباتي المتكامل سريرياً:',
        'Morning Cleanse': 'تنقية صباحية لطيفة',
        'Active Treatment': 'علاج مركز ونشط',
        'Vitamin C Radiance Elixir (15% THD)': 'إكسير فيتامين C للإشراق والنضارة (15% THD)',
        'Barrier Lock': 'حماية وترميم حاجز البشرة',
        'Hydra-Barrier Dew Cream + SPF 50 Shield': 'كريم ديو المرطب + درع واقي الشمس المعدني SPF 50',
        'Shop Recommended Ritual': 'تسوق الروتين الموصى به الآن',

        // Hero, Offer & Section Highlights
        'Botanical Clinical Formulation \'26': 'تركيبة نباتية سريرية متطورة 2026',
        'Reveal Your Skin\'s': 'أعيدي لبشرتكِ',
        'Natural Radiance': 'إشراقتها الطبيعية',
        'Shop Clean Collection': 'تسوق التشكيلة النظيفة',
        'Take Skin Quiz': 'ابدأ اختبار البشرة',
        'Over EGP 500 across Egypt': 'للطلبات أكثر من 500 ج.م لكافة محافظات مصر',
        'Visible within 14 days': 'نتائج مثبتة خلال 14 يوماً',
        'Hypoallergenic formulas': 'تركيبات خالية من مسببات الحساسية',
        'Spring Radiance Offer': 'عرض إشراقة الربيع',
        'Use code RADIANT30': 'استخدمي الرمز RADIANT30',
        'Signature Formulas': 'تركيباتنا الأيقونية الحصرية',
        'Featured': 'إبداعاتنا',
        'Creations': 'المختارة',
        'Handcrafted with clinical botanical potency for real, visible transformation': 'صُممت بفعالية نباتية سريرية لإحداث تحول حقيقي وملموس في صحة ونضارة بشرتكِ',
        'Explore All Formulations': 'استكشف كافة التركيبات العلاجية',
        'Clinical Satisfaction': 'نسبة رضا سريرية معتمدة',
        'Independent Laboratory Study': 'دراسة سريرية معملية مستقلة',
        'Participants reported visibly enhanced barrier resilience, reduced redness, and instant luminosity within 7 days.': 'أكد المشاركون تقوية ملحوظة لحاجز البشرة مع انخفاض الاحمرار وإشراقة فورية خلال 7 أيام فقط.',
        '2-Minute Personalized Skincare Concierge': 'استشارة وتشخيص مخصص للعناية بالبشرة في دقيقتين',
        'Unlock Your Custom': 'اكتشفي بروتوكولكِ',
        'Radiance Protocol': 'المخصص للإشراق والنضارة',
        'Every skin barrier is unique. Answer 3 diagnostic questions to receive targeted botanical actives, customized daily routines, and dermatologist recommendations.': 'كل بشرة لها احتياجاتها الفريدة. أجيبي عن 3 أسئلة سريعة للحصول على بروتوكول نباتي موجه وتوصيات أطباء الجلد المخصصة لكِ.',
        'Begin Diagnostic Quiz': 'ابدأ اختبار التشخيص الآن',
        'Read Routine Guides': 'قراءة أدلة العناية والروتين',
        'Join The Luxe Circle &': 'انضمي إلى مجتمع الجمال الخاص و',
        'Receive 15% Off Your First Order': 'احصلي على خصم 15% على طلبكِ الأول',
        'Subscribe for exclusive botanical harvest launches, private flash events, and personalized skincare protocols delivered to your inbox.': 'اشتركي للحصول على إطلاقاتنا الحصرية، عروض الأعضاء الخاصة، وبروتوكولات العناية الموجهة مباشرة إلى بريدكِ.',
        'Join The Circle': 'انضمي للمجتمع الآن',
        'Zero spam. Pure skincare elegance. Unsubscribe anytime.': 'لا رسائل مزعجة على الإطلاق. أناقة ونقاء تام. يمكنكِ إلغاء الاشتراك في أي وقت.',

        // Products Catalog & Filter Elements
        'All Rituals': 'كافة الطقوس',
        'Filters': 'تصفية المنتجات',
        'Reset All': 'إعادة ضبط الكل',
        'Category': 'التصنيف',
        'Customer Rating': 'تقييم العملاء',
        'All Ratings': 'كافة التقييمات',
        '5 Stars Only': '5 نجوم فقط',
        '4+ Stars': '4 نجوم فأكثر',
        'Skin Barrier Target': 'الهدف ونوع البشرة',
        'All Complexions': 'كافة أنواع البشرة',
        'Sort by:': 'ترتيب حسب:',
        'Curated & Featured': 'المختارة والمميزة',
        'Price: Low to High': 'السعر: من الأقل إلى الأعلى',
        'Price: High to Low': 'السعر: من الأعلى إلى الأقل',
        'Ritual Name: A to Z': 'اسم المستحضر: أ إلى ي',
        'Highest Rated': 'الأعلى تقييماً',
        'Loading rituals...': 'جاري تحميل المستحضرات...',
        'No Matching Rituals Found': 'لم يتم العثور على تركيبات مطابقة',
        'We couldn\'t find any products matching your selected combination. Try clearing filters or searching for alternative ingredients.': 'لم نتمكن من العثور على تركيبات تطابق اختياراتك الحالية. جربي مسح الفلاتر أو استخدام كلمات بحث بديلة.',
        'Reset All Filters': 'إعادة ضبط جميع الفلاتر',
        '0 rituals found': 'لم يتم العثور على أي منتج',
        'Showing 0 rituals': 'عرض 0 منتج',
        'Showing': 'عرض',
        'rituals found': 'منتج',
        'Sunscreens': 'واقيات الشمس',
        'Masks': 'الأقنعة العلاجية',
        'Toners': 'أنواع التونر',
        'Serums': 'السيروم',
        'Moisturizers': 'المرطبات',
        'Cleansers': 'الغسول والمنظفات',
        'Clear search': 'مسح البحث',
        'Search Formulations': 'البحث في التركيبات',
        'Search formulas, actives, concerns...': 'ابحثي عن التركيبات، المكونات، أو نوع البشرة...',

        // Cart, Checkout & Wishlist
        'Review Your Ritual Selection': 'راجعي اختياراتكِ من المستحضرات',
        'Selected Formulations': 'المستحضرات المختارة',
        'Add More Rituals': 'إضافة المزيد من الطقوس',
        'Carbon-Neutral Delivery': 'توصيل صديق للبيئة وسريع',
        'Clinical Tax (10%)': 'ضريبة القيمة المضافة (10%)',
        'Estimated Total': 'الإجمالي التقديري',
        'Includes applicable taxes and formulation duties': 'شامل كافة الضرائب ورسوم التجهيز',
        'Continue Exploring Products': 'مواصلة استكشاف المنتجات',
        'Promo or Concierge Code': 'رمز الكوبون أو الرمز الترويجي',
        'Try LUXE10 or WELCOME20': 'جربي كود LUXE10 أو WELCOME20',
        '256-Bit Bank Grade SSL Encrypted Checkout': 'دفع آمن ومحمي بأعلى تشفير بنكي 256-بت SSL',
        '30-Day Ritual Satisfaction Guarantee': 'ضمان رضا تام عن النتائج لمدة 30 يوماً',
        'Checkout & Delivery': 'الشحن وبيانات التوصيل',
        'Confirmation': 'تأكيد الطلب',
        'Contact Details': 'بيانات التواصل',
        'Email Address *': 'البريد الإلكتروني *',
        'Mobile Phone Number *': 'رقم الهاتف المحمول *',
        'Delivery Ritual Destination': 'عنوان وجهة التوصيل',
        'Full Name *': 'الاسم بالكامل *',
        'Street Address & Building *': 'اسم الشارع، رقم العقار والمبنى *',
        'Apartment, Suite, Unit (Optional)': 'رقم الشقة / الدور / الملاحظات (اختياري)',
        'City / Governorate *': 'المدينة / المحافظة *',
        'District / Area *': 'الحي / المنطقة *',
        'Postal Code *': 'الرمز البريدي *',
        'Country *': 'الدولة *',
        'Create an account to track delivery rituals and receive VIP concierge access': 'إنشاء حساب لتتبع حالة الشحنات والاستفادة من خدمات الدعم المتميزة',
        'Create Password *': 'تعيين كلمة المرور *',
        'Payment Selection': 'اختيار وسيلة الدفع',
        'Select your preferred secure payment method': 'اختاري وسيلة الدفع الآمنة والمفضلة لديكِ',
        'Cash on Delivery': 'الدفع نقداً عند الاستلام (COD)',
        'Pay with cash upon ritual arrival at your doorstep': 'ادفعي نقداً عند وصول مندوب التوصيل حتى باب منزلكِ',
        'Credit / Debit Card': 'بطاقة بنكية / فيزا وماستركارد',
        'Visa, Mastercard with 256-bit bank grade encryption': 'بطاقات فيزا وماستركارد المشفرة بأعلى معايير الحماية',
        'Mobile Wallet / InstaPay': 'المحافظ الذكية / انستاباي',
        'Instant zero-fee transfer via Vodafone Cash or InstaPay': 'تحويل فوري بدون أي رسوم إضافية عبر انستاباي أو فودافون كاش',
        'Order Review': 'مراجعة تفاصيل الطلب',
        'Place Order Now': 'تأكيد وشراء الطلب الآن',
        'Clear All': 'مسح الكل',
        'Saved Formulations': 'المستحضرات المحفوظة',
        'Save your favorite botanical formulas while exploring to curate your custom daily routine.': 'احفظي تركيباتكِ المفضلة أثناء التصفح لإنشاء روتينكِ اليومي المخصص.',
        'Explore Products': 'استكشفي المنتجات الآن',
        'Your Wishlist is Empty': 'قائمة الرغبات فارغة حالياً',

        // About & Clinical Story
        'Our Clinical Philosophy': 'فلسفتنا السريرية والطبية',
        'Where Botanical Wisdom Meets': 'حيث تلتقي حكمة الطبيعة النباتية',
        'Clinical Formulation': 'بالتركيبات السريرية المعتمدة',
        'Founded on the belief that healthy skin radiance is cultivated through bio-compatible nourishment rather than harsh interventions.': 'تأسسنا على إيمان بأن نضارة وصحة البشرة تُبنى من خلال التغذية الحيوية المتوافقة، بعيداً عن التدخلات الكيميائية القاسية.',
        'Bio-Identical Actives': 'مكونات متطابقة حيوياً',
        'Formulas designed to mirror the natural lipids and moisture barriers of healthy skin.': 'تركيبات صُممت لمحاكاة الدهون الطبيعية وحواجز الترطيب في البشرة الصحية.',
        'Dermatologist Verified': 'معتمد ومثبت سريرياً',
        'Each formula undergoes multi-tier patch testing to guarantee non-comedogenic results.': 'تخضع كل تركيبة لاختبارات دقيقة متعددة المراحل لضمان عدم انسداد المسام وأقصى درجات الأمان.',
        'Cruelty-Free & Vegan': 'نباتي 100% وخالٍ من القسوة',
        '100% ethical botanical ingredients, free from parabens, synthetic fragrances, and sulfates.': 'مكونات نباتية أخلاقية نقية، خالية تماماً من البارابين والعطور المصنعة والكبريتات.',
        'Carbon-Neutral Delivery': 'شحن مستدام ومحايد للكربون',
        'Sustainable glass packaging and offset courier transit across all delivery destinations.': 'عبوات زجاجية صديقة للبيئة قابلة لإعادة التدوير وشحن سريع ومستدام.',
        'Our Origin Story': 'قصة بدايتنا',
        'Crafting Formulations That Work With Your Skin,': 'نبتكر تركيبات متناغمة مع بشرتكِ،',
        'Not Against It': 'لا تعمل ضدها أبداً',
        'Koko Shop was conceived out of a passion to bridge the gap between clinical potency and gentle botanical harmony. Conventional skincare frequently relies on harsh peeling agents that temporarily mask issues while compromising long-term lipid integrity.': 'انطلق كوكو شوب من شغف عميق لدمج الفعالية السريرية العالية مع الرقة النباتية الطبيعية. غالباً ما تعتمد مستحضرات التجميل التقليدية على مقشرات قاسية تعالج المظهر الخارجي مؤقتاً بينما تضر بصحة الحاجز الجلدي.',
        'Our laboratory isolates potent plant actives, cold-pressed seed oils, and skin-identical ceramides to create rituals that fortify your skin\'s moisture mantle while promoting natural, luminous vitality.': 'يقوم مختبرنا باستخلاص خلاصات نباتية قوية وزيوت بذور معصورة على البارد وسيراميدات مطابقة للبشرة لتقوية حاجز الترطيب ومنحكِ إشراقة حيوية دائمة.',
        'Discover Our Catalog': 'استكشفي كتالوج منتجاتنا',
        'Clinical Results & Satisfaction': 'النتائج السريرية ونسبة الرضا',
        'Reported Barrier Hydration': 'أكدوا ترطيباً عميقاً للحاجز',
        'Average Client Rating': 'متوسط تقييمات العملاء',
        'Rituals Preserved': 'طقوس عناية موثقة',
        'Cruelty-Free & Ethical': 'خالٍ من القسوة وأخلاقي 100%',

        // Profile & Account Tabs
        'VIP Client Rituals': 'طقوس العضوية الخاصة VIP',
        'Member since 2026': 'عضو منذ عام 2026',
        'Orders Completed': 'طلبات مكتملة',
        'Account Rituals': 'طقوس الحساب',
        'Overview': 'نظرة عامة',
        'My Orders': 'طلباتي السابقة',
        'Notifications': 'الإشعارات والتنبيهات',
        'Saved Wishlist': 'قائمة الرغبات المحفوظة',
        'Account Settings': 'إعدادات الحساب',
        'Sign Out': 'تسجيل الخروج',
        'Sign In to Ritual': 'تسجيل الدخول إلى حسابي',
        'Access your personalized skincare rituals and orders': 'ادخلي لحسابكِ للوصول إلى طقوسكِ المخصصة وسجل طلباتكِ',
        'Create VIP Account': 'إنشاء حساب عضوية VIP',
        'Join our botanical skincare circle for VIP protocols': 'انضمي لعائلة الجمال النظيف للاستمتاع ببروتوكولات وخصومات حصرية',
        'I accept the': 'أوافق على',
        'Terms & Conditions': 'الشروط والأحكام',
        'and': 'و',
        'Privacy Policy': 'سياسة الخصوصية',
        'Password (Min 6 Characters)': 'كلمة المرور (6 أحرف على الأقل)',
        'Repeat password': 'أعيدي إدخال كلمة المرور',
        'Enter password': 'أدخلي كلمة المرور',
        'Create password': 'أنشئي كلمة المرور',
        'Forgot password?': 'هل نسيتِ كلمة المرور؟',
        'Live Storefront': 'المتجر المباشر',
        'Management Studio': 'استوديو الإدارة',

        // Comprehensive Coverage for Catalog, Filters, Cart & About
        'The Skincare Collection': 'مجموعة العناية بالبشرة',
        'The Skincare': 'مجموعة العناية',
        'Collection': 'بالبشرة',
        'Targeted, nutrient-dense rituals formulated with bio-compatible botanical actives to restore and illuminate your natural barrier.': 'طقوس موجهة وغنية بالمغذيات الحيوية صُممت بمركبات نباتية متوافقة لترميم حاجز البشرة وإعادة إشراقتها الطبيعية.',
        'Search rituals, serums, ceramides...': 'ابحثي عن المنتجات، السيروم، السيراميد...',
        'Clinical Formulations & Botanical Actives': 'تركيبات علاجية وخلاصات نباتية نشطة',
        'Price Range': 'نطاق السعر',
        'Customer Rating': 'تقييم العملاء',
        'Skin Barrier Target': 'الهدف ونوع البشرة',
        'Dry / Dehydrated': 'جافة / فاقدة للترطيب',
        'Oily / Blemish-Prone': 'دهنية / معرضة للشوائب',
        'Sensitive / Reactive': 'حساسة / سريعة التأثر والاحمرار',
        'All Complexions': 'كافة أنواع البشرة',
        'All Ratings': 'كافة التقييمات',
        '5 Stars Only': '5 نجوم فقط',
        '4+ Stars': '4 نجوم فأكثر',
        'Clear Wishlist': 'تفريغ المفضلة',
        'Move All to Bag': 'نقل الكل إلى الحقيبة',
        'Your Curated Wishlist': 'قائمة الرغبات والمفضلة',
        'Your personal sanctuary of selected botanical treatments to revisit whenever your skin seeks renewal.': 'ملاذكِ الشخصي من المستحضرات النباتية المختارة للعودة إليها متى ما تاقت بشرتكِ للتجدد.',
        'Save your favorite botanical rituals to monitor availability or prepare your next skincare regimen.': 'احفظي تركيباتكِ المفضلة لمتابعة توفرها وتجهيز روتينكِ القادم بكل راحة.',
        'Review Your Ritual Selection': 'مراجعة خيارات العناية الخاصة بكِ',
        'Your Shopping Bag': 'حقيبة التسوق الخاصة بكِ',
        'Your Shopping': 'حقيبة',
        'Bag': 'التسوق',
        'Carefully formulated botanicals ready for your daily skin ritual.': 'مستحضرات نباتية نقية جاهزة لروتينكِ اليومي للعناية بالبشرة.',
        'Clean botanical clinical formulations crafted for discerning skincare rituals. Certified non-comedogenic and cruelty-free.': 'تركيبات نباتية سريرية فاخرة صُممت لعشاق العناية الراقية. معتمدة لا تسد المسام وخالية من القسوة.',
        'Quick Links': 'روابط سريعة',
        'Client Service': 'خدمة العملاء',
        'Clinical Assurance': 'ضماناتنا السريرية',
        'About Our Philosophy': 'عن فلسفتنا',
        'Contact Concierge': 'تواصل مع خدمة العملاء',
        'Order History & Tracking': 'سجل الطلبات وتتبع الشحنات',
        'Saved Formulations': 'المستحضرات المحفوظة',
        'Skin Quiz Concierge': 'استشارة اختبار البشرة',
        'Shipping & Return Policy': 'سياسة الشحن والإرجاع',
        '30-Day Money-Back Guarantee': 'ضمان استرداد الأموال لمدة 30 يوماً',
        'Free Carbon-Neutral Delivery': 'توصيل مجاني صديق للبيئة',
        'All botanical clinical formulations preserved.': 'جميع التركيبات النباتية السريرية محفوظة ومحمية.',
        'Your Shopping Bag is Empty': 'حقيبة التسوق فارغة حالياً',
        'Discover our curated collection of clean botanical treatments to begin your radiance journey.': 'استكشفي مجموعتنا المميزة من التركيبات النباتية النقية لبدء رحلة النقاء والإشراق.',
        'Explore The Collection': 'استكشاف التشكيلة',
        'Discover The Catalog': 'تصفح قائمة المستحضرات',
        'per unit': 'لكل عبوة',
        '/ unit': 'لكل عبوة',
        'Remove item': 'حذف المنتج من الحقيبة',
        'Remove from wishlist': 'حذف من المفضلة',
        'saved ritual': 'منتج محفوظ',
        'saved rituals': 'منتجات محفوظة',
        'Where Botanical Wisdom Meets Clinical Formulation': 'حيث تلتقي حكمة الطبيعة النباتية بالتركيبات السريرية المعتمدة',
        'Where Botanical Wisdom Meets': 'حيث تلتقي حكمة الطبيعة النباتية بـ',
        'Pure bio-compatible botanical formulation.': 'تركيبة نباتية نقية متوافقة حيوياً مع البشرة.',
        'Clinical botanical formula designed to restore skin barrier health, hydration, and natural radiance.': 'تركيبة نباتية سريرية صُممت لاستعادة صحة حاجز البشرة، وترطيبها، وإشراقتها الطبيعية.',
        'All Categories': 'كافة التصنيفات',
        'Showing': 'عرض',
        'rituals found': 'مستحضر',
        '0 rituals found': 'لم يتم العثور على أي منتج',
        'Reset All Filters': 'إعادة ضبط جميع الفلاتر',
        'No Matching Rituals Found': 'لم يتم العثور على أي تركيبات مطابقة',
        'We couldn\'t find any products matching your selected combination. Try clearing filters or searching for alternative ingredients.': 'لم نعثر على منتجات تطابق مجموعة الفلاتر المحددة. جربي مسح الفلاتر أو استخدام كلمات بحث بديلة.',
        'Proceed to Secure Checkout': 'متابعة الدفع وإتمام الطلب الآمن',
        'Promo / Gift Card': 'كوبون الخصم / قسيمة الهدية',
        'Enter code (e.g. LUXE20)': 'أدخلي الكود (مثل LUXE20)',
        'Apply': 'تطبيق',
        'Estimated Total': 'الإجمالي التقديري',
        '30-Day Ritual Satisfaction Guarantee': 'ضمان الرضا التام لمدة 30 يوماً',
        'Complimentary Express': 'شحن سريع ومجاني'
    };

    // Inverse Map for Arabic to English
    const reverseTextMap = {};
    Object.keys(directTextMap).forEach((enKey) => {
        const arVal = directTextMap[enKey];
        reverseTextMap[arVal] = enKey;
    });

    // 3. State & Storage Helper
    const getCurrentLanguage = () => {
        const stored = localStorage.getItem('koko_lang');
        if (stored === 'ar' || stored === 'en') return stored;

        const legacy = localStorage.getItem('luxe_lang');
        if (legacy === 'AR') return 'ar';
        if (legacy === 'EN') return 'en';

        return 'en';
    };

    // 4. Translation Helper
    const t = (key, fallback = '') => {
        const lang = getCurrentLanguage();
        if (translations[lang] && translations[lang][key]) {
            return translations[lang][key];
        }
        return fallback || key;
    };

    // Direct String Translator Helper
    const translateText = (text) => {
        if (!text || typeof text !== 'string') return text;
        const trimmed = text.trim();
        return directTextMap[trimmed] || text;
    };

    const reverseTranslateText = (text) => {
        if (!text || typeof text !== 'string') return text;
        const trimmed = text.trim();
        return reverseTextMap[trimmed] || text;
    };

    const translateProduct = (product, lang = getCurrentLanguage()) => {
        if (!product) return product;
        if (lang !== 'ar') return product;
        return {
            ...product,
            name: translateText(product.name),
            description: translateText(product.description),
            category: translateText(product.category)
        };
    };

    // 5. Price Formatter (Localized currency)
    const formatLocalizedPrice = (price) => {
        const num = parseFloat(price) || 0;
        const lang = getCurrentLanguage();
        if (lang === 'ar') {
            return `${num.toFixed(2)} ج.م`;
        }
        return `EGP ${num.toFixed(2)}`;
    };

    // 6. Deep Text Node Replacer (Ensures 100% translation of every sentence)
    const translateTextNodes = (rootElement, lang) => {
        const map = lang === 'ar' ? directTextMap : reverseTextMap;

        const walker = document.createTreeWalker(
            rootElement || document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;
                    const tag = parent.tagName.toLowerCase();
                    if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'textarea') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (parent.closest('[data-no-translate]')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodesToReplace = [];
        let currentNode = walker.nextNode();
        while (currentNode) {
            const raw = currentNode.nodeValue;
            const trimmed = raw.trim();
            let newText = raw;

            if (trimmed && map[trimmed]) {
                newText = raw.replace(trimmed, map[trimmed]);
            } else if (trimmed) {
                // Currency conversion for dynamic or nested prices
                if (lang === 'ar' && /EGP\s*[\d,]+(\.\d+)?/i.test(newText)) {
                    newText = newText.replace(/EGP\s*([\d,]+(\.\d+)?)/gi, '$1 ج.م');
                } else if (lang === 'en' && /[\d,]+(\.\d+)?\s*ج\.م/i.test(newText)) {
                    newText = newText.replace(/([\d,]+(\.\d+)?)\s*ج\.م/gi, 'EGP $1');
                }
            }

            if (newText !== raw) {
                nodesToReplace.push({ node: currentNode, newText });
            }
            currentNode = walker.nextNode();
        }

        nodesToReplace.forEach(({ node, newText }) => {
            node.nodeValue = newText;
        });
    };

    // 7. Apply Language Changes to the entire DOM
    const applyLanguage = (lang, showToastMessage = false) => {
        const isRtl = lang === 'ar';
        const html = document.documentElement;

        // Set attributes on <html> tag
        html.setAttribute('lang', lang);
        html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
        html.classList.toggle('rtl', isRtl);

        // Save to LocalStorage
        localStorage.setItem('koko_lang', lang);
        localStorage.setItem('luxe_lang', isRtl ? 'AR' : 'EN');

        // Update all Language Switcher Buttons
        document.querySelectorAll('#langText').forEach((el) => {
            el.textContent = isRtl ? 'EN' : 'AR';
        });

        // Translate explicitly tagged elements: [data-i18n]
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });

        // Translate HTML tagged elements: [data-i18n-html]
        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        // Translate Placeholders: [data-i18n-placeholder]
        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });

        // Translate Titles: [data-i18n-title]
        document.querySelectorAll('[data-i18n-title]').forEach((el) => {
            const key = el.getAttribute('data-i18n-title');
            if (translations[lang] && translations[lang][key]) {
                el.title = translations[lang][key];
            }
        });

        // Translate input placeholders with common text
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach((el) => {
            const currentPh = el.placeholder.trim();
            const map = isRtl ? directTextMap : reverseTextMap;
            if (map[currentPh]) {
                el.placeholder = map[currentPh];
            }
        });

        // First pass: Deep Text Node Replacement for static DOM elements
        if (document.body) {
            translateTextNodes(document.body, lang);
        }

        // Trigger dynamic page re-render hooks
        try {
            if (typeof window.renderProducts === 'function') window.renderProducts();
            if (typeof window.loadCart === 'function') window.loadCart();
            if (typeof window.loadWishlist === 'function') window.loadWishlist();
            if (typeof window.loadOrderSummary === 'function') window.loadOrderSummary();
            if (typeof window.renderReviews === 'function') window.renderReviews();
            if (typeof window.renderCategoryFilters === 'function') window.renderCategoryFilters();
            if (typeof window.updateCartCount === 'function') window.updateCartCount();
            if (typeof window.updateWishlistCount === 'function') window.updateWishlistCount();
            if (typeof window.showQuizQuestion === 'function') window.showQuizQuestion();
        } catch (e) {
            console.debug('Re-render hook note:', e);
        }

        // Second pass: Re-translate newly generated dynamic nodes (e.g., product cards, cart rows, etc.)
        if (document.body) {
            translateTextNodes(document.body, lang);
        }

        // Dispatch a global event so any custom component can react
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang, isRtl } }));

        // Optional Toast Feedback
        if (showToastMessage && typeof window.LuxeBeauty?.showToast === 'function') {
            const msg = isRtl
                ? 'تم تحويل لغة الموقع إلى العربية بنجاح ✨'
                : 'Language switched to English ✨';
            window.LuxeBeauty.showToast(msg);
        }
    };

    // 8. Public Toggle Function
    const toggleLanguage = () => {
        const current = getCurrentLanguage();
        const next = current === 'ar' ? 'en' : 'ar';
        applyLanguage(next, true);
    };

    // 9. Early Bootstrap (Execute immediately before DOM ready to prevent FOUC / layout flicker)
    const earlyLang = getCurrentLanguage();
    if (earlyLang === 'ar') {
        document.documentElement.setAttribute('lang', 'ar');
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.classList.add('rtl');
    } else {
        document.documentElement.setAttribute('lang', 'en');
        document.documentElement.setAttribute('dir', 'ltr');
    }

    // 10. DOMContentLoaded Setup
    document.addEventListener('DOMContentLoaded', () => {
        const activeLang = getCurrentLanguage();
        applyLanguage(activeLang, false);
    });

    // 11. Expose to Global Scope
    window.i18n = {
        translations,
        directTextMap,
        reverseTextMap,
        getCurrentLanguage,
        setLanguage: (lang) => applyLanguage(lang, true),
        toggleLanguage,
        t,
        formatPrice: formatLocalizedPrice,
        translateText,
        reverseTranslateText,
        translateProduct
    };

    // Expose directly on window for inline handlers and modules
    window.toggleLanguage = toggleLanguage;
    window.t = t;
    window.formatLocalizedPrice = formatLocalizedPrice;
    window.translateText = translateText;
    window.reverseTranslateText = reverseTranslateText;

})();
