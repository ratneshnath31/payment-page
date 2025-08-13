function getCart() {
    const userKey = localStorage.getItem('currentUser');
    return JSON.parse(localStorage.getItem(`cart_${userKey}`)) || [];
}
function saveCart(cart) {
    const userKey = localStorage.getItem('currentUser');
    localStorage.setItem(`cart_${userKey}`, JSON.stringify(cart));
}
function updateCartCount() {
    let cart = getCart();
    let count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const el = document.getElementById('cart-count');
    if (el) el.innerText = count;
}

function loadMiniCart() {
    let cart = getCart();
    const miniCartDiv = document.getElementById("mini-cart-items");
    const footer = document.getElementById("mini-cart-footer");

    if (cart.length === 0) {
        miniCartDiv.innerHTML = "<p class='text-gray-500 text-center'>Your cart is empty.</p>";
        footer.innerHTML = `<a href="products.html" class="w-full text-center bg-blue-600 hover:bg-blue-700 text-white rounded py-2 text-sm font-medium">Go to Home</a>`;
        return;
    }

    let html = "", total = 0;
    cart.forEach(item => {
        let subtotal = item.price * (item.quantity || 1);
        total += subtotal;
        html += `
            <div class="flex items-center justify-between">
                <img src="${item.image}" class="w-12 h-12 object-cover rounded">
                <div class="flex-1 ml-3">
                    <p class="text-sm font-medium">${item.name}</p>
                    <p class="text-xs text-gray-500">Qty: ${item.quantity || 1}</p>
                </div>
                <p class="text-sm font-semibold">₹${subtotal}</p>
            </div>`;
    });
    miniCartDiv.innerHTML = html + `<div class="border-t mt-2 pt-2 text-right text-sm font-semibold">Subtotal: ₹${total}</div>`;
    footer.innerHTML = `
        <a href="cart.html" class="w-1/2 text-center bg-gray-200 hover:bg-gray-300 rounded py-2 text-sm font-medium">View Cart</a>
        <a href="checkout.html" class="w-1/2 text-center bg-green-600 hover:bg-green-700 text-white rounded py-2 text-sm font-medium">Checkout</a>
    `;
}

document.addEventListener("click", (e) => {
    const cartIcon = document.getElementById("cart-icon");
    const miniCart = document.getElementById("mini-cart");
    if (cartIcon && cartIcon.contains(e.target)) {
        miniCart.classList.toggle("hidden");
    } else if (miniCart && !miniCart.contains(e.target)) {
        miniCart.classList.add("hidden");
    }
});
