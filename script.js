
/* =====================================
   ZAUQ-E-ANDAZ - COMPLETE SCRIPT
   ===================================== */

let cart = [];

try {
    const savedCart = JSON.parse(localStorage.getItem("zauqCart") || "[]");

    if (Array.isArray(savedCart)) {
        cart = savedCart
            .filter(item => item && item.id != null && Number(item.price) >= 0)
            .map(item => ({
                ...item,
                price: Number(item.price) || 0,
                quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
            }));
    }
} catch (error) {
    cart = [];
}

function saveCart() {
    localStorage.setItem("zauqCart", JSON.stringify(cart));
}

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

/* =====================================
   PRODUCTS, SEARCH AND FILTERS
   ===================================== */

let activeFilter = "all";
let activeSearch = "";

function updateProductCount(count) {
    const countText = document.getElementById("productCount");

    if (!countText) return;

    countText.textContent = count === 0
        ? "No products available for this filter."
        : `Showing ${count} product${count === 1 ? "" : "s"}`;
}

function normalizeText(value) {
    return value ? value.toString().trim().toLowerCase() : "";
}

function renderProducts(productList) {
    if (!productContainer) return;

    productContainer.innerHTML = "";

    if (!productList || productList.length === 0) {
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
        const card = document.createElement("div");
        card.className = "product-card";
        card.style.cursor = "pointer";

        card.addEventListener("click", () => {
            window.location.href = `product.html?id=${product.id}`;
        });

        const saleBadge = product.sale
            ? '<div class="sale-badge">Hot Deal</div>'
            : "";

        card.innerHTML = `
            ${saleBadge}
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <div class="product-meta">
                    <span class="rating">
                        <i class="fa-solid fa-star"></i> 4.8
                    </span>
                    <span class="shipping-tag">
                        ${product.tag || product.category || ""}
                    </span>
                </div>

                <h3>${product.name}</h3>
                <p class="product-desc">${product.desc || ""}</p>

                <div class="price">
                    <span class="old-price">Rs.${product.oldPrice ?? ""}</span>
                    <span class="new-price">Rs.${product.price}</span>
                </div>

                <button class="cart-btn" type="button">
                    <i class="fa-solid fa-cart-shopping"></i> ADD TO CART
                </button>

                <button class="whatsapp-btn" type="button">
                    <i class="fa-brands fa-whatsapp"></i>
                    ORDER ON WHATSAPP
                </button>
            </div>
        `;

        card.querySelector(".cart-btn").addEventListener("click", event => {
            event.stopPropagation();
            addToCart(product.id);
        });

        card.querySelector(".whatsapp-btn").addEventListener("click", event => {
            event.stopPropagation();
            orderWhatsApp(product.name, product.price);
        });

        productContainer.appendChild(card);
    });

    updateProductCount(productList.length);
}

function filterProducts() {
    if (typeof products === "undefined" || !Array.isArray(products)) {
        console.error("Products array not found. Check product.js loading.");
        return;
    }

    const searchTerm = normalizeText(activeSearch);

    const filtered = products.filter(product => {
        const category = normalizeText(product.category);
        const tag = normalizeText(product.tag);

        const matchesFilter =
            activeFilter === "all" ||
            category === activeFilter ||
            tag === activeFilter;

        const matchesSearch =
            normalizeText(product.name).includes(searchTerm) ||
            normalizeText(product.desc).includes(searchTerm);

        return matchesFilter && matchesSearch;
    });

    renderProducts(filtered);
}

function loadProducts() {
    filterProducts();
}

loadProducts();

/* =====================================
   ADD TO CART
   ===================================== */

function addToCart(id) {
    if (typeof products === "undefined" || !Array.isArray(products)) {
        showToast("Products could not be loaded");
        return;
    }

    const product = products.find(p => String(p.id) === String(id));

    if (!product) {
        showToast("Product not found");
        return;
    }

    const existing = cart.find(item => String(item.id) === String(product.id));

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            ...product,
            price: Number(product.price) || 0,
            quantity: 1
        });
    }

    saveCart();
    updateCartCounter();
    showCartItems();
    showToast(product.name + " added to cart");
}

/* =====================================
   SEARCH AND CATEGORY FILTERS
   ===================================== */

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const categoryLinks = document.querySelectorAll(".main-nav a");

function applySearch() {
    activeSearch = searchInput ? searchInput.value : "";
    filterProducts();
}

if (searchInput) {
    searchInput.addEventListener("input", function () {
        activeSearch = this.value;
        filterProducts();
    });

    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            applySearch();
        }
    });
}

if (searchButton) {
    searchButton.addEventListener("click", applySearch);
}

categoryLinks.forEach(link => {
    link.addEventListener("click", function (event) {
        const filter = this.dataset.filter;

        if (!filter) return;

        event.preventDefault();

        categoryLinks.forEach(item => item.classList.remove("active"));
        this.classList.add("active");

        activeFilter = normalizeText(filter || "all");
        filterProducts();
    });
});

/* =====================================
   SINGLE PRODUCT WHATSAPP ORDER
   No delivery charges
   ===================================== */

function orderWhatsApp(productName, price) {
    const number = "923112656159";
    const productPrice = Number(price) || 0;

    const message = `Assalam O Alaikum,

I want to order:

Product: ${productName}
Price: Rs.${productPrice}

Please confirm my order.`;

    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
}

/* =====================================
   HEART / WISHLIST ICON
   ===================================== */

const heart = document.querySelector(".fa-heart");

if (heart) {
    heart.addEventListener("click", () => {
        heart.classList.toggle("fa-solid");
        heart.classList.toggle("fa-regular");
        heart.style.color = "#ff4f8b";
    });
}

/* =====================================
   CART SIDEBAR
   ===================================== */

const cartIcon = document.querySelector(".cart");
const cartSidebar = document.getElementById("cartSidebar");
const closeCart = document.getElementById("closeCart");
const cartOverlay = document.getElementById("cartOverlay");

if (cartIcon) {
    cartIcon.addEventListener("click", () => {
        if (cartSidebar) cartSidebar.classList.add("active");
        if (cartOverlay) cartOverlay.classList.add("active");
        showCartItems();
    });
}

if (closeCart) {
    closeCart.addEventListener("click", () => {
        if (cartSidebar) cartSidebar.classList.remove("active");
        if (cartOverlay) cartOverlay.classList.remove("active");
    });
}

if (cartOverlay) {
    cartOverlay.addEventListener("click", () => {
        if (cartSidebar) cartSidebar.classList.remove("active");
        cartOverlay.classList.remove("active");
    });
}

/* =====================================
   NEWSLETTER
   ===================================== */

const newsletter = document.querySelector(".newsletter-form");

if (newsletter) {
    newsletter.addEventListener("submit", function (event) {
        event.preventDefault();
        showToast("Thank you for subscribing!");
        this.reset();
    });
}

/* =====================================
   CART WHATSAPP ORDER
   Total = product prices only
   ===================================== */

function orderCartWhatsApp() {
    if (cart.length === 0) {
        showToast("Your cart is empty");
        return;
    }

    let subtotal = 0;
    let itemsText = "";

    cart.forEach(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const itemTotal = price * quantity;

        subtotal += itemTotal;

        itemsText += `${item.name} x ${quantity} = Rs.${itemTotal}\n`;
    });

    const message = `Assalam O Alaikum,

I want to order:

${itemsText}
Total: Rs.${subtotal}

Please confirm my order.`;

    const url =
        `https://wa.me/923112656159?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
}

/* =====================================
   HIDE DELIVERY ROW IN CART
   ===================================== */

function hideDeliveryRow() {
    const elements = document.querySelectorAll(
        "#cartSidebar p, #cartSidebar div, #cartSidebar span, #cartSidebar label"
    );

    elements.forEach(element => {
        const text = element.textContent.trim();

        if (
            /^Delivery\s*:\s*Rs\.?\s*[\d,]+$/i.test(text) ||
            /^Delivery Charges\s*:\s*Rs\.?\s*[\d,]+$/i.test(text)
        ) {
            element.style.display = "none";
        }
    });
}

/* =====================================
   DISPLAY CART ITEMS AND TOTALS
   ===================================== */

function showCartItems() {
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const cartSubtotal = document.getElementById("cartSubtotal");

    if (!cartItems) return;

    cartItems.innerHTML = "";

    let subtotal = 0;

    if (cart.length === 0) {
        cartItems.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';

        if (cartSubtotal) {
            cartSubtotal.style.display = "";
            cartSubtotal.textContent = "Rs.0";
        }

        if (cartTotal) {
            cartTotal.textContent = "Rs.0";
        }

        hideDeliveryRow();
        return;
    }

    cart.forEach((item, index) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;

        subtotal += price * quantity;

        const row = document.createElement("div");
        row.className = "cart-product";

        row.innerHTML = `
            <img src="${item.image || ""}" alt="${item.name}">
            <div>
                <h4>${item.name}</h4>
                <p>Rs.${price} x ${quantity}</p>
                <div class="quantity-box">
                    <button type="button" class="quantity-minus">-</button>
                    <span>${quantity}</span>
                    <button type="button" class="quantity-plus">+</button>
                </div>
            </div>
            <button type="button" class="remove-btn">Remove</button>
        `;

        row.querySelector(".quantity-minus").addEventListener("click", () => {
            changeQuantity(index, -1);
        });

        row.querySelector(".quantity-plus").addEventListener("click", () => {
            changeQuantity(index, 1);
        });

        row.querySelector(".remove-btn").addEventListener("click", () => {
            removeCartItem(index);
        });

        cartItems.appendChild(row);
    });

    if (cartSubtotal) {
        cartSubtotal.style.display = "";
        cartSubtotal.textContent = `Rs.${subtotal}`;
    }

    if (cartTotal) {
        cartTotal.textContent = `Rs.${subtotal}`;
    }

    hideDeliveryRow();
}

/* =====================================
   CHANGE QUANTITY
   ===================================== */

function changeQuantity(index, amount) {
    if (!cart[index]) return;

    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    updateCartCounter();
    showCartItems();
}

/* =====================================
   REMOVE CART ITEM
   ===================================== */

function removeCartItem(index) {
    if (!cart[index]) return;

    cart.splice(index, 1);

    saveCart();
    updateCartCounter();
    showCartItems();
    showToast("Item removed from cart");
}

/* =====================================
   INITIALIZE
   ===================================== */

window.addEventListener("load", () => {
    updateCartCounter();
    showCartItems();
    hideDeliveryRow();

    console.log("Zauq-e-Andaz loaded successfully");
});
