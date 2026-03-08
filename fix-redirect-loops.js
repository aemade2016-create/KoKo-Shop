// ============================================
// FIX REDIRECT LOOPS - Run this once to clear all flags
// ============================================

(function fixRedirectLoops() {
    console.log('🔧 Fixing redirect loops...');

    // Clear all redirect flags
    sessionStorage.removeItem('redirecting_to_login');
    sessionStorage.removeItem('redirecting_from_admin');

    // Clear any corrupted user data
    var currentUser = localStorage.getItem('luxe_currentUser');
    if (currentUser) {
        try {
            var user = JSON.parse(currentUser);
            console.log('✅ Current user:', user.email);
            console.log('✅ Is Admin:', user.isAdmin);
        } catch (e) {
            console.error('❌ Corrupted user data, clearing...');
            localStorage.removeItem('luxe_currentUser');
        }
    }

    console.log('✅ Redirect loops fixed!');
    console.log('📝 You can now login normally');
})();
