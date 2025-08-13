document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');
    const loginBtn = document.querySelector('a[href="login.html"]');
    const profilePicEl = document.getElementById('header-profile-pic');

    // Only show profile icon on products.html and cart.html
    const pageName = window.location.pathname.split("/").pop();
    const allowProfileIcon = ["products.html", "cart.html"].includes(pageName);

    if (!allowProfileIcon && profilePicEl) {
        profilePicEl.style.display = "none";
    }

    if (token && loginBtn) {
        try {
            const res = await fetch('/api/profile', {
                headers: { Authorization: 'Bearer ' + token }
            });
            if (res.ok) {
                const data = await res.json();
                const name = data.user.first_name || data.user.email;
                const userKey = data.user.email;

                localStorage.setItem('currentUser', userKey);

                // Update login button to greeting
                loginBtn.textContent = `Hi, ${name}!`;
                loginBtn.href = "profile.html";
                loginBtn.classList.remove("bg-blue-600", "hover:bg-blue-700", "text-white");
                loginBtn.classList.add("text-blue-600", "font-semibold");

                // Show profile pic only if allowed page
                if (allowProfileIcon && profilePicEl) {
                    const savedPic = localStorage.getItem('profilePic');
                    if (savedPic) {
                        profilePicEl.src = savedPic;
                    } else if (data.user.profile_image_url) {
                        profilePicEl.src = data.user.profile_image_url;
                        localStorage.setItem('profilePic', data.user.profile_image_url);
                    }
                    profilePicEl.style.display = "block";
                }

                // Add logout button
                let logoutBtn = document.getElementById('logout-btn');
                if (!logoutBtn) {
                    logoutBtn = document.createElement('button');
                    logoutBtn.id = 'logout-btn';
                    logoutBtn.textContent = 'Logout';
                    logoutBtn.className = "ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition";
                    loginBtn.parentNode.appendChild(logoutBtn);
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('currentUser');
                        localStorage.removeItem('token');
                        if (typeof updateCartCount === "function") updateCartCount();
                        window.location.reload();
                    });
                }

                if (typeof updateCartCount === "function") updateCartCount();
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                if (profilePicEl) profilePicEl.style.display = "none";
                if (typeof updateCartCount === "function") updateCartCount();
            }
        } catch (e) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            if (profilePicEl) profilePicEl.style.display = "none";
            if (typeof updateCartCount === "function") updateCartCount();
        }
    } else {
        // If not logged in, hide profile icon
        if (profilePicEl) profilePicEl.style.display = "none";
    }
});
