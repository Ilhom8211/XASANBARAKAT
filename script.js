/* ==========================================================================
   Ваш Магазин — Mobile Fast Food Application Logic (Kazakhstan / Tenge ₸)
   ========================================================================== */

// Telegram Configuration (Replace with your actual Telegram Bot values)
const BOT_TOKEN = "8833741545:AAHD5_kz49S1abXAKlraDsB-Vfwx98I4Z7I";
const CHAT_ID = "-1004408655120";

// Master Products Database Array (Prices in Kazakhstani Tenge ₸)
const products = [
    {
        id: 1,
        category: "burgers",
        title: "Чизбургер Deluxe",
        description: "Сочная говяжья котлета, хрустящий салат, плавленый чеддер",
        price: 2200,
        image: "images/burger1.jpg"
    },
    {
        id: 2,
        category: "burgers",
        title: "Двойной Гамбургер",
        description: "Две говяжьи котлеты, свежие томаты и маринованные огурчики",
        price: 2800,
        image: "images/burger1.jpg"
    },
    {
        id: 3,
        category: "lavash",
        title: "Лаваш с говядиной",
        description: "Сочная говядина, фри, томаты, пикантный соус",
        price: 1900,
        image: "images/lavash1.jpg"
    },
    {
        id: 4,
        category: "lavash",
        title: "Лаваш с курицей и сыром",
        description: "Куриное филе, моцарелла, свежая зелень",
        price: 1700,
        image: "images/lavash1.jpg"
    },
    {
        id: 5,
        category: "doners",
        title: "Донер-Кебаб Классический",
        description: "Мясо на вертеле, свежая капуста, огурцы в пите",
        price: 1600,
        image: "images/doner1.jpg"
    },
    {
        id: 6,
        category: "hotdogs",
        title: "Хот-дог Королевский",
        description: "Баварская сосиска, лук фри, горчица и кетчуп",
        price: 1300,
        image: "images/hotdog1.jpg"
    },
    {
        id: 7,
        category: "drinks",
        title: "Апельсиновый Фреш",
        description: "Свежевыжатый натуральный апельсиновый сок",
        price: 1100,
        image: "images/drink1.jpg"
    },
    {
        id: 8,
        category: "drinks",
        title: "Кока-Кола 0.5L",
        description: "Освежающий прохладительный газированный напиток",
        price: 600,
        image: "images/drink1.jpg"
    },
    {
        id: 9,
        category: "sauces",
        title: "Фирменный соус Хасан",
        description: "Чесночный соус со свежими пряными травами",
        price: 350,
        image: "images/sauce1.jpg"
    },
    {
        id: 10,
        category: "sauces",
        title: "Острый соус Чили",
        description: "Жгучий соус из спелого острого перца чили",
        price: 350,
        image: "images/sauce1.jpg"
    }
];

// Categories Configuration
const categories = [
    { id: "all", name: "Все" },
    { id: "burgers", name: "Бургеры" },
    { id: "lavash", name: "Лаваши" },
    { id: "drinks", name: "Напитки" },
    { id: "hotdogs", name: "Хот-доги" },
    { id: "doners", name: "Донеры" },
    { id: "sauces", name: "Соусы" },
    { id: "badring", name: "Бадринги" },
];

// Application State
let activeCategory = "all";
let searchQuery = "";
let cart = {}; // Format: { [productId]: quantity }
let generatedMapsLink = "";

// DOM Elements
const categoriesContainer = document.getElementById("categoriesContainer");
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const searchClearBtn = document.getElementById("searchClearBtn");
const emptyState = document.getElementById("emptyState");
const activeCategoryTitle = document.getElementById("activeCategoryTitle");
const productCount = document.getElementById("productCount");

// Cart Elements (Round FAB in bottom-right corner)
const cartFab = document.getElementById("cartFab");
const cartFabBadge = document.getElementById("cartFabBadge");

// Bottom Sheet Elements
const sheetBackdrop = document.getElementById("sheetBackdrop");
const bottomSheet = document.getElementById("bottomSheet");
const sheetCloseBtn = document.getElementById("sheetCloseBtn");
const cartItemsList = document.getElementById("cartItemsList");
const emptyCartView = document.getElementById("emptyCartView");
const orderFormSection = document.getElementById("orderFormSection");
const sheetItemsCount = document.getElementById("sheetItemsCount");
const summaryCount = document.getElementById("summaryCount");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTotal = document.getElementById("summaryTotal");

// Form & Location Elements
const checkoutForm = document.getElementById("checkoutForm");
const inputFirstName = document.getElementById("inputFirstName");
const inputPhone = document.getElementById("inputPhone");
const inputLocation = document.getElementById("inputLocation");
const geoBtn = document.getElementById("geoBtn");
const openMapBtn = document.getElementById("openMapBtn");

// Success Modal Elements
const successOverlay = document.getElementById("successOverlay");
const successCloseBtn = document.getElementById("successCloseBtn");

// Helper: Format Price to Kazakhstani Tenge (₸)
function formatPrice(amount) {
    return amount.toLocaleString("ru-RU") + " ₸";
}

// Sound Synthesizer: Plays short audio "ping"
function playPingSound() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
        console.log("Web Audio not allowed or error:", e);
    }
}

// Ripple Effect Functionality
function createRipple(event) {
    const btn = event.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;

    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");

    const existingRipple = btn.getElementsByClassName("ripple")[0];
    if (existingRipple) {
        existingRipple.remove();
    }

    btn.appendChild(circle);
}

// Initialize Categories Bar Drag Scroll
let categoryDragState = { isDown: false, startX: 0, scrollLeft: 0, isDragging: false };

function setupCategoryDragScroll() {
    if (!categoriesContainer) return;

    categoriesContainer.addEventListener("mousedown", (e) => {
        categoryDragState.isDown = true;
        categoryDragState.isDragging = false;
        categoryDragState.startX = e.pageX - categoriesContainer.offsetLeft;
        categoryDragState.scrollLeft = categoriesContainer.scrollLeft;
        categoriesContainer.classList.add("dragging");
    });

    categoriesContainer.addEventListener("mouseleave", () => {
        categoryDragState.isDown = false;
        categoriesContainer.classList.remove("dragging");
    });

    categoriesContainer.addEventListener("mouseup", () => {
        categoryDragState.isDown = false;
        categoriesContainer.classList.remove("dragging");
    });

    categoriesContainer.addEventListener("mousemove", (e) => {
        if (!categoryDragState.isDown) return;
        e.preventDefault();
        const x = e.pageX - categoriesContainer.offsetLeft;
        const walk = (x - categoryDragState.startX) * 1.5;
        if (Math.abs(walk) > 4) {
            categoryDragState.isDragging = true;
        }
        categoriesContainer.scrollLeft = categoryDragState.scrollLeft - walk;
    });
}

function renderCategories() {
    if (!categoriesContainer) return;
    categoriesContainer.innerHTML = categories.map(cat => `
        <button class="category-pill ${cat.id === activeCategory ? 'active' : ''}" data-category="${cat.id}">
            ${cat.name}
        </button>
    `).join("");

    document.querySelectorAll(".category-pill").forEach(pill => {
        pill.addEventListener("click", (e) => {
            if (categoryDragState.isDragging) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            activeCategory = e.currentTarget.dataset.category;
            renderCategories();
            renderProducts();
        });
    });
}

// Render Card Bottom Controls (- Count +)
function renderCardControlsHTML(productId, qty) {
    const isZero = qty === 0;
    return `
        <div class="card-control-bar ${isZero ? 'is-zero' : 'active'}">
            <button class="card-ctrl-btn card-btn-minus" data-action="minus" data-id="${productId}" aria-label="Уменьшить" ${isZero ? 'disabled' : ''}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <span class="card-count-num ${isZero ? 'muted' : ''}">${qty}</span>
            <button class="card-ctrl-btn card-btn-plus" data-action="plus" data-id="${productId}" aria-label="Увеличить">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>
    `;
}

// Update single card DOM surgically without re-rendering entire grid
function updateSingleCardUI(productId) {
    const qty = cart[productId] || 0;
    const card = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (!card) return;

    // Image Badge Update
    const imgWrapper = card.querySelector(".card-img-wrapper");
    let badge = imgWrapper ? imgWrapper.querySelector(".card-qty-badge") : null;

    if (qty > 0) {
        if (!badge) {
            badge = document.createElement("div");
            badge.className = "card-qty-badge";
            imgWrapper.appendChild(badge);
        }
        badge.textContent = qty;
    } else if (badge) {
        badge.remove();
    }

    // Controls Update
    const controlWrapper = card.querySelector(".card-control-wrapper");
    if (controlWrapper) {
        controlWrapper.innerHTML = renderCardControlsHTML(productId, qty);
    }
}

// Render Products Grid (2 per row)
function renderProducts() {
    if (!productsGrid) return;

    const filtered = products.filter(p => {
        const matchesCat = (activeCategory === "all") || (p.category === activeCategory);
        const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    const currentCatObj = categories.find(c => c.id === activeCategory);
    if (activeCategoryTitle) activeCategoryTitle.textContent = currentCatObj ? currentCatObj.name : "Все";
    if (productCount) productCount.textContent = `${filtered.length} блюд`;

    if (filtered.length === 0) {
        productsGrid.innerHTML = "";
        if (emptyState) emptyState.classList.remove("hidden");
        return;
    }

    if (emptyState) emptyState.classList.add("hidden");

    productsGrid.innerHTML = filtered.map(p => {
        const qty = cart[p.id] || 0;
        return `
            <div class="product-card" data-id="${p.id}">
                <div class="card-img-wrapper">
                    <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80'">
                    ${qty > 0 ? `<div class="card-qty-badge">${qty}</div>` : ''}
                </div>
                <div class="card-info">
                    <h3 class="card-title">${p.title}</h3>
                    <p class="card-desc">${p.description}</p>
                    <div class="card-price-row">
                        <span class="card-price">${formatPrice(p.price)}</span>
                    </div>
                    <div class="card-control-wrapper">
                        ${renderCardControlsHTML(p.id, qty)}
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

// Attach Event Delegation to Products Grid
if (productsGrid) {
    productsGrid.addEventListener("click", (e) => {
        const minusBtn = e.target.closest('[data-action="minus"]');
        const plusBtn = e.target.closest('[data-action="plus"]');
        const card = e.target.closest(".product-card");

        if (!card) return;
        const productId = parseInt(card.dataset.id, 10);

        if (minusBtn) {
            e.stopPropagation();
            removeFromCart(productId);
        } else if (plusBtn) {
            e.stopPropagation();
            addToCart(productId);
        } else {
            addToCart(productId);
            card.classList.remove("clicked-flash");
            void card.offsetWidth;
            card.classList.add("clicked-flash");
        }
    });
}

// Cart Controllers
function addToCart(productId) {
    cart[productId] = (cart[productId] || 0) + 1;
    updateCartUI();
    updateSingleCardUI(productId);
    if (bottomSheet.classList.contains("active")) {
        renderSheetCartItems();
    }
}

function removeFromCart(productId) {
    if (cart[productId]) {
        cart[productId] -= 1;
        if (cart[productId] <= 0) {
            delete cart[productId];
        }
    }
    updateCartUI();
    updateSingleCardUI(productId);
    if (bottomSheet.classList.contains("active")) {
        renderSheetCartItems();
    }
}

function getCartTotals() {
    let totalItems = 0;
    let totalPrice = 0;

    Object.keys(cart).forEach(id => {
        const qty = cart[id];
        const prod = products.find(p => p.id === parseInt(id, 10));
        if (prod) {
            totalItems += qty;
            totalPrice += prod.price * qty;
        }
    });

    return { totalItems, totalPrice };
}

// Update Cart Badge UI
function updateCartUI() {
    const { totalItems, totalPrice } = getCartTotals();

    if (cartFabBadge) cartFabBadge.textContent = totalItems;
    if (summaryCount) summaryCount.textContent = totalItems;
    if (summarySubtotal) summarySubtotal.textContent = formatPrice(totalPrice);
    if (summaryTotal) summaryTotal.textContent = formatPrice(totalPrice);
    if (sheetItemsCount) sheetItemsCount.textContent = `${totalItems} позиций`;
}

// Render Cart Items inside Bottom Sheet
function renderSheetCartItems() {
    const cartProductIds = Object.keys(cart);

    if (cartProductIds.length === 0) {
        cartItemsList.innerHTML = "";
        emptyCartView.classList.remove("hidden");
        orderFormSection.classList.add("hidden");
        return;
    }

    emptyCartView.classList.add("hidden");
    orderFormSection.classList.remove("hidden");

    cartItemsList.innerHTML = cartProductIds.map(idStr => {
        const id = parseInt(idStr, 10);
        const qty = cart[id];
        const prod = products.find(p => p.id === id);
        if (!prod) return "";

        return `
            <div class="cart-item">
                <img src="${prod.image}" alt="${prod.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${prod.title}</div>
                    <div class="cart-item-price">${formatPrice(prod.price * qty)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="cart-item-btn" onclick="removeFromCart(${prod.id})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                    <span class="cart-item-count">${qty}</span>
                    <button class="cart-item-btn" onclick="addToCart(${prod.id}); renderSheetCartItems();">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join("");
}

// Bottom Sheet Open / Close Handlers
function openBottomSheet() {
    renderSheetCartItems();
    updateCartUI();
    sheetBackdrop.classList.add("active");
    bottomSheet.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeBottomSheet() {
    sheetBackdrop.classList.remove("active");
    bottomSheet.classList.remove("active");
    document.body.style.overflow = "";
}

// Phone Input Masking & Auto Conversion (87... -> +7-707...)
function setupPhoneInputFormatting() {
    if (!inputPhone) return;

    inputPhone.addEventListener("input", () => {
        let val = inputPhone.value;
        let digits = val.replace(/\D/g, "");

        // Convert starting 87... or 8... to 7...
        if (digits.startsWith("87")) {
            digits = "7" + digits.slice(1);
        } else if (digits.startsWith("8") && digits.length > 1) {
            digits = "7" + digits.slice(1);
        } else if (!digits.startsWith("7") && digits.length > 0) {
            digits = "7" + digits;
        }

        // Limit to max 11 digits total (7 + 10 digits)
        if (digits.length > 11) {
            digits = digits.slice(0, 11);
        }

        // Format to +7-XXX-XXX-XXXX
        let formatted = "";
        if (digits.length > 0) {
            formatted = "+7";
            if (digits.length > 1) {
                formatted += "-" + digits.slice(1, Math.min(4, digits.length));
            }
            if (digits.length >= 4) {
                formatted += "-" + digits.slice(4, Math.min(7, digits.length));
            }
            if (digits.length >= 7) {
                formatted += "-" + digits.slice(7, Math.min(9, digits.length));
            }
            if (digits.length >= 9) {
                formatted += "-" + digits.slice(9, Math.min(11, digits.length));
            }
        }

        inputPhone.value = formatted;
    });
}

// Multi-provider Geolocation Reverse Geocoding Helper
async function fetchAccurateStreetAddress(lat, lng) {
    // Attempt 1: OpenStreetMap Nominatim with timeout
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const street = addr.road || addr.street || addr.suburb || addr.neighbourhood || addr.residential || "";
            const houseNumber = addr.house_number || "";
            const city = addr.city || addr.town || addr.village || addr.county || "";

            if (street && houseNumber) {
                return `${street}, ${houseNumber}`;
            } else if (street) {
                return city ? `${street}, ${city}` : street;
            } else if (data.display_name) {
                const parts = data.display_name.split(",");
                return parts.slice(0, 2).join(",").trim();
            }
        }
    } catch (err) {
        console.log("Nominatim reverse geocode failed, using fallback:", err);
    }

    // Attempt 2: BigDataCloud free reverse geocode API (Free, zero-key, CORS enabled)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ru`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            const street = data.locality || data.city || data.principalSubdivision || "";
            if (street) return street;
        }
    } catch (err) {
        console.log("BigDataCloud reverse geocode failed:", err);
    }

    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

// IP-based Geolocation Fallback when device has no GPS or browser blocks GPS
async function fetchIpLocation() {
    try {
        const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
        if (res.ok) {
            const data = await res.json();
            if (data.latitude && data.longitude) {
                return {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude),
                    city: data.city || "Мой город"
                };
            }
        }
    } catch (e) {
        console.log("IP location fetch 1 failed:", e);
    }

    try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
            const data = await res.json();
            if (data.latitude && data.longitude) {
                return {
                    lat: parseFloat(data.latitude),
                    lng: parseFloat(data.longitude),
                    city: data.city || "Мой город"
                };
            }
        }
    } catch (e) {
        console.log("IP location fetch 2 failed:", e);
    }

    return null;
}

// Accurate "Мое местоположение" GPS & IP Fallback Handler
async function handleGeolocation() {
    if (!geoBtn) return;
    geoBtn.disabled = true;
    const origText = geoBtn.querySelector("span").textContent;
    geoBtn.querySelector("span").textContent = "Определение...";

    const setLocationResult = async (lat, lng) => {
        generatedMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
        const address = await fetchAccurateStreetAddress(lat, lng);
        inputLocation.value = address;
        mapSelectedCoords = { lat, lng };

        geoBtn.disabled = false;
        geoBtn.querySelector("span").textContent = "Обновлено ✓";
        setTimeout(() => {
            geoBtn.querySelector("span").textContent = origText;
        }, 2500);
    };

    const tryIpFallback = async () => {
        const ipLoc = await fetchIpLocation();
        if (ipLoc) {
            await setLocationResult(ipLoc.lat, ipLoc.lng);
        } else {
            geoBtn.disabled = false;
            geoBtn.querySelector("span").textContent = origText;
            alert("Не удалось автоматически определить местоположение. Пожалуйста, выберите место на карте.");
            if (openMapBtn) openMapBtn.click();
        }
    };

    if (!navigator.geolocation) {
        await tryIpFallback();
        return;
    }

    // Phase 1: High Accuracy GPS with 6s timeout
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            await setLocationResult(position.coords.latitude, position.coords.longitude);
        },
        async (error) => {
            if (error.code === error.PERMISSION_DENIED) {
                geoBtn.disabled = false;
                geoBtn.querySelector("span").textContent = origText;
                alert("Доступ к геолокации запрещен в настройках браузера. Открываем карту для выбора...");
                if (openMapBtn) openMapBtn.click();
            } else {
                // Phase 2: Low Accuracy GPS or IP fallback
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        await setLocationResult(pos.coords.latitude, pos.coords.longitude);
                    },
                    async () => {
                        await tryIpFallback();
                    },
                    { enableHighAccuracy: false, timeout: 4000, maximumAge: 60000 }
                );
            }
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
    );
}

// Leaflet Interactive Map Modal Logic
let leafletMap = null;
let mapSelectedCoords = null;
let mapAddressText = "";

function initInteractiveMapModal() {
    const mapModalOverlay = document.getElementById("mapModalOverlay");
    const mapModalCloseBtn = document.getElementById("mapModalCloseBtn");
    const confirmLocationBtn = document.getElementById("confirmLocationBtn");
    const mapLocateSelfBtn = document.getElementById("mapLocateSelfBtn");
    const mapAddressVal = document.getElementById("mapAddressVal");

    if (!openMapBtn) return;

    openMapBtn.addEventListener("click", () => {
        mapModalOverlay.classList.remove("hidden");
        document.body.style.overflow = "hidden";

        if (!leafletMap && window.L) {
            // Default center: Sayram / Shymkent area (42.3155, 69.6170) or previously saved coordinates
            const initialLat = mapSelectedCoords ? mapSelectedCoords.lat : 42.3155;
            const initialLng = mapSelectedCoords ? mapSelectedCoords.lng : 69.6170;

            leafletMap = L.map("leafletMap", {
                zoomControl: false
            }).setView([initialLat, initialLng], 14);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: "&copy; OpenStreetMap"
            }).addTo(leafletMap);

            L.control.zoom({ position: "topright" }).addTo(leafletMap);

            let moveTimer = null;
            const updateAddressFromCenter = () => {
                clearTimeout(moveTimer);
                moveTimer = setTimeout(async () => {
                    const center = leafletMap.getCenter();
                    mapSelectedCoords = { lat: center.lat, lng: center.lng };
                    mapAddressVal.textContent = "Загрузка адреса...";
                    mapAddressText = await fetchAccurateStreetAddress(center.lat, center.lng);
                    mapAddressVal.textContent = mapAddressText;
                }, 300);
            };

            leafletMap.on("moveend", updateAddressFromCenter);
            leafletMap.on("click", (e) => {
                leafletMap.panTo(e.latlng);
            });
        } else if (leafletMap) {
            if (mapSelectedCoords) {
                leafletMap.setView([mapSelectedCoords.lat, mapSelectedCoords.lng], 15);
            }
        }

        setTimeout(() => {
            if (leafletMap) leafletMap.invalidateSize();
            if (!mapSelectedCoords) {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        mapSelectedCoords = { lat, lng };
                        if (leafletMap) leafletMap.setView([lat, lng], 16);
                    }, async () => {
                        const ipLoc = await fetchIpLocation();
                        if (ipLoc && leafletMap) {
                            mapSelectedCoords = { lat: ipLoc.lat, lng: ipLoc.lng };
                            leafletMap.setView([ipLoc.lat, ipLoc.lng], 14);
                        }
                    }, { enableHighAccuracy: true, timeout: 5000 });
                } else {
                    fetchIpLocation().then(ipLoc => {
                        if (ipLoc && leafletMap) {
                            mapSelectedCoords = { lat: ipLoc.lat, lng: ipLoc.lng };
                            leafletMap.setView([ipLoc.lat, ipLoc.lng], 14);
                        }
                    });
                }
            }
        }, 200);
    });

    const closeMap = () => {
        mapModalOverlay.classList.add("hidden");
        document.body.style.overflow = "";
    };

    if (mapModalCloseBtn) mapModalCloseBtn.addEventListener("click", closeMap);

    if (confirmLocationBtn) {
        confirmLocationBtn.addEventListener("click", () => {
            if (mapAddressText) {
                inputLocation.value = mapAddressText;
            }
            if (mapSelectedCoords) {
                generatedMapsLink = `https://www.google.com/maps?q=${mapSelectedCoords.lat.toFixed(6)},${mapSelectedCoords.lng.toFixed(6)}`;
            }
            closeMap();
        });
    }

    if (mapLocateSelfBtn) {
        mapLocateSelfBtn.addEventListener("click", () => {
            mapAddressVal.textContent = "Определение местоположения...";
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    if (leafletMap) leafletMap.setView([lat, lng], 17);
                }, async () => {
                    const ipLoc = await fetchIpLocation();
                    if (ipLoc && leafletMap) {
                        leafletMap.setView([ipLoc.lat, ipLoc.lng], 15);
                    } else {
                        mapAddressVal.textContent = "Нажмите на карту для выбора местоположения";
                    }
                }, { enableHighAccuracy: true, timeout: 6000 });
            } else {
                fetchIpLocation().then(ipLoc => {
                    if (ipLoc && leafletMap) leafletMap.setView([ipLoc.lat, ipLoc.lng], 15);
                });
            }
        });
    }
}

// Send Order to Telegram Bot API
async function sendTelegramOrder(orderData) {
    if (BOT_TOKEN === "PASTE_BOT_TOKEN" || !BOT_TOKEN) {
        console.log("Telegram Bot token is set to default. Order summary:", orderData);
        return true;
    }

    const message = `
📌 <b>НАЗВАНИЕ САЙТА: Ваш Магазин (Казахстан)</b>

👤 <b>Имя:</b> ${orderData.firstName}
📞 <b>Телефон:</b> ${orderData.phone}
📍 <b>Местоположение:</b> ${orderData.location}
🗺 <b>Ссылка Google Maps:</b> ${orderData.mapsLink || "Не указана"}

🛒 <b>СПИСОК ТОВАРОВ:</b>
${orderData.items.map((item, index) => `${index + 1}. <b>${item.title}</b> — ${item.qty} шт. x ${formatPrice(item.price)} = ${formatPrice(item.total)}`).join("\n")}

💰 <b>ОБЩАЯ СУММА:</b> <b>${formatPrice(orderData.totalPrice)}</b>

📅 <b>Дата:</b> ${orderData.date}
⏰ <b>Время:</b> ${orderData.time}
    `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: "HTML"
            })
        });

        return response.ok;
    } catch (err) {
        console.error("Telegram API Error:", err);
        return false;
    }
}

// Checkout Form Submission
if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const { totalItems, totalPrice } = getCartTotals();
        if (totalItems === 0) {
            alert("Пожалуйста, добавьте товары в корзину перед оформлением.");
            return;
        }

        // Phone validation: require exactly 11 digits
        const rawPhoneDigits = inputPhone.value.replace(/\D/g, "");
        if (rawPhoneDigits.length < 11) {
            alert("Пожалуйста, введите полный номер телефона (напр. +7-707-123-4567)");
            return;
        }

        const now = new Date();
        const dateStr = now.toLocaleDateString("ru-RU");
        const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

        const orderItems = Object.keys(cart).map(idStr => {
            const id = parseInt(idStr, 10);
            const prod = products.find(p => p.id === id);
            return {
                title: prod.title,
                qty: cart[id],
                price: prod.price,
                total: prod.price * cart[id]
            };
        });

        const locationText = inputLocation.value.trim();
        const mapsLink = generatedMapsLink || (locationText.startsWith("http") ? locationText : "");

        const orderData = {
            firstName: inputFirstName.value.trim(),
            phone: inputPhone.value.trim(),
            location: locationText,
            mapsLink: mapsLink,
            items: orderItems,
            totalPrice: totalPrice,
            date: dateStr,
            time: timeStr
        };

        // 1. Play Short "Ping" Sound
        playPingSound();

        // 2. Send Telegram Bot Notification
        await sendTelegramOrder(orderData);

        // 3. Show Success Animation Modal
        closeBottomSheet();
        if (successOverlay) successOverlay.classList.remove("hidden");

        // Reset Cart & Form
        cart = {};
        updateCartUI();
        renderProducts();
        checkoutForm.reset();
        generatedMapsLink = "";
    });
}

// Event Listeners Setup
document.addEventListener("DOMContentLoaded", () => {
    // 1. Splash Preloader Fade Out
    setTimeout(() => {
        const preloader = document.getElementById("appPreloader");
        if (preloader) {
            preloader.classList.add("fade-out");
            setTimeout(() => { preloader.style.display = "none"; }, 500);
        }
    }, 800);

    setupCategoryDragScroll();
    renderCategories();
    renderProducts();
    setupPhoneInputFormatting();
    initInteractiveMapModal();

    // Search Input Real-time Filtering
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderProducts();
        });
    }

    if (searchClearBtn) {
        searchClearBtn.addEventListener("click", () => {
            searchInput.value = "";
            searchQuery = "";
            renderProducts();
        });
    }

    // Cart FAB Trigger (Round button in bottom right corner)
    if (cartFab) cartFab.addEventListener("click", openBottomSheet);
    if (sheetCloseBtn) sheetCloseBtn.addEventListener("click", closeBottomSheet);
    if (sheetBackdrop) sheetBackdrop.addEventListener("click", closeBottomSheet);

    // Geolocation Button
    if (geoBtn) geoBtn.addEventListener("click", handleGeolocation);

    // Success Close Button
    if (successCloseBtn) {
        successCloseBtn.addEventListener("click", () => {
            successOverlay.classList.add("hidden");
        });
    }

    // Attach Ripple to elements
    document.querySelectorAll(".ripple-btn").forEach(btn => {
        btn.addEventListener("click", createRipple);
    });
});
