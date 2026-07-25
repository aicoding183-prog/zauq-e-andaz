// ===============================
// ZAUQ-E-ANDAZ SCRIPT
// ===============================

let cart = [];
let cartCount = 0;

const productContainer = document.getElementById("product-list");
const cartCounter = document.querySelector(".cart span");
const toast = document.getElementById("toast");

function getCartCount() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartCounter() {
    cartCount = getCartCount();
    if (cartCounter) {
        cartCounter.textContent = cartCount;
    }
}

function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 1800);
}

// ===============================
// LOAD PRODUCTS
// ===============================

let activeFilter = 'all';
let activeSearch = '';

function renderProducts(productList) {
    if (!productContainer) return;
    productContainer.innerHTML = "";

    if (productList.length === 0) {
        productContainer.innerHTML = `
            <div class="no-results">
                <h3>No products found</h3>
                <p>Try a different keyword or category.</p>
            </div>
        `;
        updateProductCount(0);
        return;
    }

    productList.forEach(product => {
        productContainer.innerHTML += `
            <div class="product-card">
                ${product.sale ? `<div class="sale-badge">Hot Deal</div>` : ""}
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <div class="product-meta">
                        <span class="rating"><i class="fa-solid fa-star"></i> 4.8</span>
                        <span class="shipping-tag">${product.tag || product.category}</span>
                    </div>
                    <h3>${product.name}</h3>
                    <p class="product-desc">${product.desc}</p>
                    <div class="price">
                        <span class="old-price">Rs.${product.oldPrice}</span>
                        <span class="new-price">Rs.${product.price}</span>
                    </div>
                    <button class="cart-btn" onclick="addToCart(${product.id})">
                        <i class="fa-solid fa-cart-shopping"></i>
                        ADD TO CART
                    </button>
                    <button class="whatsapp-btn" onclick="orderWhatsApp('${product.name}', ${product.price})">
                        <i class="fa-brands fa-whatsapp"></i>
                        ORDER ON WHATSAPP
                    </button>
                </div>
            </div>
        `;
    });

    updateProductCount(productList.length);
}

function updateProductCount(count) {
    const countText = document.getElementById('productCount');
    if (!countText) return;
    countText.textContent = count === 0 ? 'No products available for this filter.' : `Showing ${count} product${count === 1 ? '' : 's'}`;
}

function normalizeText(value) {
    return value ? value.toString().trim().toLowerCase() : '';
}

function filterProducts() {
    const searchTerm = normalizeText(activeSearch);

    const filtered = products.filter(product => {
        const productCategory = normalizeText(product.category);
        const productTag = normalizeText(product.tag);
        const matchesFilter = activeFilter === 'all'
            || productCategory === activeFilter
            || productTag === activeFilter;
        const matchesSearch = normalizeText(product.name).includes(searchTerm)
            || normalizeText(product.desc).includes(searchTerm);
        return matchesFilter && matchesSearch;
    });

    renderProducts(filtered);
}

function loadProducts() {
    filterProducts();
}

loadProducts();

// ===============================
// ADD TO CART
// ===============================

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartCounter();
    showToast(`${product.name} added to cart`);
    showCartItems();
}

// ===============================
// SEARCH + CATEGORY FILTER
// ===============================

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const categoryLinks = document.querySelectorAll('.main-nav a');

function applySearch() {
    activeSearch = searchInput ? searchInput.value : '';
    filterProducts();
}

if (searchInput) {
    searchInput.addEventListener("keyup", function (event) {
        activeSearch = this.value;
        if (event.key === 'Enter') {
            applySearch();
        } else {
            filterProducts();
        }
    });
}

if (searchButton) {
    searchButton.addEventListener("click", function () {
        applySearch();
    });
}

categoryLinks.forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault();
        categoryLinks.forEach(item => item.classList.remove('active'));
        this.classList.add('active');
        activeFilter = normalizeText(this.dataset.filter || 'all');
        filterProducts();
    });
});

// ===============================
// WHATSAPP ORDER
// ===============================

function orderWhatsApp(productName, price) {
    const number = "923112656159";
    const message = `Assalam O Alaikum,

I want to order:

Product: ${productName}
Price: Rs.${price}`;

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
}

// ===============================
// WISHLIST
// ===============================

const heart = document.querySelector(".fa-heart");

if (heart) {
    heart.addEventListener("click", () => {
        heart.classList.toggle("fa-solid");
        heart.classList.toggle("fa-regular");
        heart.style.color = "#ff4f8b";
    });
}

// ===============================
// CART SIDEBAR
// ===============================

const cartIcon = document.querySelector(".cart");
const cartSidebar = document.getElementById("cartSidebar");
const closeCart = document.getElementById("closeCart");
const cartOverlay = document.getElementById("cartOverlay");

if (cartIcon) {
    cartIcon.addEventListener("click", () => {
        cartSidebar.classList.add("active");
        cartOverlay.classList.add("active");
    });
}

if (closeCart) {
    closeCart.addEventListener("click", () => {
        cartSidebar.classList.remove("active");
        cartOverlay.classList.remove("active");
    });
}

if (cartOverlay) {
    cartOverlay.addEventListener("click", () => {
        cartSidebar.classList.remove("active");
        cartOverlay.classList.remove("active");
    });
}

// ===============================
// NEWSLETTER
// ===============================

const newsletter = document.querySelector(".newsletter-form");

if (newsletter) {
    newsletter.addEventListener("submit", function (e) {
        e.preventDefault();
        showToast("Thank you for subscribing!");
        this.reset();
    });
}

// ===============================
// PAGE LOADED
// ===============================

window.addEventListener("load", () => {
    updateCartCounter();
    showCartItems();
    console.log("✅ Zauq-e-Andaz Loaded Successfully");
});

function orderCartWhatsApp() {
    if (cart.length === 0) {
        showToast("Your cart is empty");
        return;
    }

    let message = `Assalam O Alaikum,

I want to order:

`;

    let total = 0;

    cart.forEach((item, index) => {
        message += `${index + 1}. ${item.name} x${item.quantity} - Rs.${item.price * item.quantity}\n`;
        total += item.price * item.quantity;
    });

    message += `

Total: Rs.${total}`;

    const number = "923112656159";

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank");
}

function showCartItems() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItems) return;

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-cart">Your cart is empty.</p>`;
        cartTotal.innerHTML = "Rs.0";
        return;
    }

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        cartItems.innerHTML += `
            <div class="cart-product">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>Rs.${item.price * item.quantity}</p>
                    <div class="quantity-box">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeCartItem(${index})">Remove</button>
            </div>
        `;
    });

    cartTotal.innerHTML = "Rs." + total;
}

function changeQuantity(index, amount) {
    if (!cart[index]) return;

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCartCounter();
    showCartItems();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    updateCartCounter();
    showCartItems();
    showToast("Item removed from cart");
}