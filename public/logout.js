function logout() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        localStorage.removeItem(`profileData_${currentUser}`);
        localStorage.removeItem(`profilePic_${currentUser}`);
        localStorage.removeItem(`cart_${currentUser}`);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentProfilePic');
    localStorage.removeItem('profilePic');
    
    // Update cart count if function exists
    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
    
    window.location.href = 'login.html';
}
