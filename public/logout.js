function logout() {
    // Remove only login/session info
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');

    // Do NOT remove `cart_<currentUser>` so it stays for next login
    window.location.href = 'login.html';
}
