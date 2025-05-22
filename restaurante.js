let menuData = {
    dishes: [
        {
            id: 1,
            name: "Bife à Parmegiana",
            ingredients: "Filé mignon, molho de tomate, queijo mussarela, arroz e batata frita",
            price: 45.90,
            rating: "4.8",
            timesOrdered: 120,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
        },
        {
            id: 2,
            name: "Frango Grelhado",
            ingredients: "Peito de frango grelhado, arroz, feijão e salada",
            price: 32.50,
            rating: "4.5",
            timesOrdered: 95,
            image: "https://images.unsplash.com/photo-1518492104633-130d0cc89537?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
        }
    ],
    beverages: [
        {
            id: 1,
            name: "Suco de Laranja",
            price: 8.90,
            rating: "4.7",
            timesOrdered: 150,
            image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
        },
        {
            id: 2,
            name: "Coca-Cola",
            price: 7.50,
            rating: "4.5",
            timesOrdered: 200,
            image: "https://images.unsplash.com/photo-1554866585-cd94860890b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
        }
    ],
    desserts: [
        {
            id: 1,
            name: "Pudim",
            price: 12.90,
            rating: "4.9",
            timesOrdered: 85,
            image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
        },
        {
            id: 2,
            name: "Sorvete",
            price: 10.50,
            rating: "4.6",
            timesOrdered: 110,
            image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
        }
    ]
};

let orders = [];
let finishedOrders = [];

// DOM Elements
const loginSection = document.getElementById('loginSection');
const mainContent = document.getElementById('mainContent');
const showLoginBtn = document.getElementById('showLoginBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginError = document.getElementById('loginError');
const adminSidebar = document.getElementById('adminSidebar');
const adminToggleBtn = document.getElementById('adminToggleBtn');
const menuTabs = document.querySelectorAll('.menu-tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const adminMenuBtns = document.querySelectorAll('.admin-menu-btn');
const orderModal = document.getElementById('orderModal');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');
const orderForm = document.getElementById('orderForm');

// Image preview elements
const dishImageInput = document.getElementById('dishImage');
const dishImagePreview = document.getElementById('dishImagePreview');
const beverageImageInput = document.getElementById('beverageImage');
const beverageImagePreview = document.getElementById('beverageImagePreview');
const dessertImageInput = document.getElementById('dessertImage');
const dessertImagePreview = document.getElementById('dessertImagePreview');

// Form elements
const addDishForm = document.getElementById('addDishForm');
const addBeverageForm = document.getElementById('addBeverageForm');
const addDessertForm = document.getElementById('addDessertForm');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Load sample data from localStorage if available
    const savedMenuData = localStorage.getItem('menuData');
    const savedOrders = localStorage.getItem('orders');
    const savedFinishedOrders = localStorage.getItem('finishedOrders');
    
    if (savedMenuData) {
        menuData = JSON.parse(savedMenuData);
    }
    
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
    
    if (savedFinishedOrders) {
        finishedOrders = JSON.parse(savedFinishedOrders);
    }
    
    // Always load the menu items
    loadMenuItems();
});

// Show login modal
showLoginBtn.addEventListener('click', () => {
    loginSection.classList.remove('hidden');
});

// Login functionality
loginBtn.addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Simple validation (in a real app, this would check against a database)
    if (username === 'admin' && password === 'admin') {
        loginError.classList.add('hidden');
        loginSection.classList.add('hidden');
        localStorage.setItem('isLoggedIn', 'true');
        
        // Show admin features
        adminToggleBtn.classList.remove('hidden');
        showLoginBtn.classList.add('hidden');
        
        // Load admin sections
        loadCatalogItems();
        loadOrders();
        loadFinishedOrders();
        loadStatistics();
    } else {
        loginError.classList.remove('hidden');
    }
});

// Logout functionality
function logout() {
    localStorage.removeItem('isLoggedIn');
    adminSidebar.classList.add('hidden');
    adminToggleBtn.classList.add('hidden');
    showLoginBtn.classList.remove('hidden');
    
    // Hide all admin sections
    document.querySelectorAll('.tab-content').forEach(section => {
        if (section.id !== 'menuSection') {
            section.classList.add('hidden');
        }
    });
    
    // Show the menu section
    document.getElementById('menuSection').classList.add('active');
}

// Admin sidebar toggle
adminToggleBtn.addEventListener('click', () => {
    adminSidebar.classList.toggle('hidden');
});

// Menu tabs functionality
menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        menuTabs.forEach(t => t.classList.remove('active', 'text-blue-600', 'border-blue-600'));
        menuTabs.forEach(t => t.classList.add('text-gray-500'));
        
        // Add active class to clicked tab
        tab.classList.add('active', 'text-blue-600', 'border-blue-600');
        tab.classList.remove('text-gray-500');
        
        // Hide all tab contents
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Show the selected tab content
        const tabId = tab.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Admin menu navigation
adminMenuBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        
        // Hide all admin sections
        document.querySelectorAll('.tab-content').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the selected section
        document.getElementById(target).classList.add('active');
        
        // Load data if needed
        if (target === 'catalogSection') {
            loadCatalogItems();
        } else if (target === 'ordersSection') {
            loadOrders();
        } else if (target === 'finishedOrdersSection') {
            loadFinishedOrders();
        } else if (target === 'statisticsSection') {
            loadStatistics();
        }
    });
});

// Image preview functionality
dishImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            dishImagePreview.src = event.target.result;
            dishImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

beverageImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            beverageImagePreview.src = event.target.result;
            beverageImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

dessertImageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            dessertImagePreview.src = event.target.result;
            dessertImagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Form submissions
addDishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dishName = document.getElementById('dishName').value;
    const dishIngredients = document.getElementById('dishIngredients').value;
    const dishPrice = parseFloat(document.getElementById('dishPrice').value);
    const dishImage = document.getElementById('dishImage').files[0];
    
    if (dishName && dishIngredients && dishPrice && dishImage) {
        // In a real app, we would upload the image to a server and get a URL
        // For this demo, we'll just use a placeholder
        const newDish = {
            id: menuData.dishes.length + 1,
            name: dishName,
            ingredients: dishIngredients,
            price: dishPrice,
            rating: "N/A",
            timesOrdered: 0,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
        };
        
        menuData.dishes.push(newDish);
        localStorage.setItem('menuData', JSON.stringify(menuData));
        
        // Reset form
        addDishForm.reset();
        dishImagePreview.style.display = 'none';
        
        // Show success message
        alert('Prato cadastrado com sucesso!');
        
        // Reload menu and catalog
        loadMenuItems();
        loadCatalogItems();
    }
});

addBeverageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const beverageName = document.getElementById('beverageName').value;
    const beveragePrice = parseFloat(document.getElementById('beveragePrice').value);
    const beverageImage = document.getElementById('beverageImage').files[0];
    
    if (beverageName && beveragePrice && beverageImage) {
        const newBeverage = {
            id: menuData.beverages.length + 1,
            name: beverageName,
            price: beveragePrice,
            rating: "N/A",
            timesOrdered: 0,
            image: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
        };
        
        menuData.beverages.push(newBeverage);

        localStorage.setItem('menuData', JSON.stringify(menuData));
        
        // Reset form
        addBeverageForm.reset();
        beverageImagePreview.style.display = 'none';
        
        // Show success message
        alert('Bebida cadastrada com sucesso!');
        
        // Reload menu and catalog
        loadMenuItems();
        loadCatalogItems();
    }
});

addDessertForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dessertName = document.getElementById('dessertName').value;
    const dessertPrice = parseFloat(document.getElementById('dessertPrice').value);
    const dessertImage = document.getElementById('dessertImage').files[0];
    
    if (dessertName && dessertPrice && dessertImage) {
        const newDessert = {
            id: menuData.desserts.length + 1,
            name: dessertName,
            price: dessertPrice,
            rating: "N/A",
            timesOrdered: 0,
            image: "https://images.unsplash.com/photo-1560008581-09826d1de69e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
        };
        
        menuData.desserts.push(newDessert);
        localStorage.setItem('menuData', JSON.stringify(menuData));
        
        // Reset form
        addDessertForm.reset();
        dessertImagePreview.style.display = 'none';
        
        // Show success message
        alert('Doce cadastrado com sucesso!');
        
        // Reload menu and catalog
        loadMenuItems();
        loadCatalogItems();
    }
});

// Order modal functionality
function openOrderModal(itemType, itemId) {
    let item;
    
    if (itemType === 'dish') {
        item = menuData.dishes.find(d => d.id === itemId);
    } else if (itemType === 'beverage') {
        item = menuData.beverages.find(b => b.id === itemId);
    } else if (itemType === 'dessert') {
        item = menuData.desserts.find(d => d.id === itemId);
    }
    
    if (item) {
        document.getElementById('orderItemName').textContent = `Pedir ${item.name}`;
        document.getElementById('orderItemType').value = itemType;
        document.getElementById('orderItemId').value = itemId;
        orderModal.classList.remove('hidden');
    }
}

cancelOrderBtn.addEventListener('click', () => {
    orderModal.classList.add('hidden');
});

orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const itemType = document.getElementById('orderItemType').value;
    const itemId = parseInt(document.getElementById('orderItemId').value);
    const tableNumber = document.getElementById('tableNumber').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    
    let item;
    
    if (itemType === 'dish') {
        item = menuData.dishes.find(d => d.id === itemId);
    } else if (itemType === 'beverage') {
        item = menuData.beverages.find(b => b.id === itemId);
    } else if (itemType === 'dessert') {
        item = menuData.desserts.find(d => d.id === itemId);
    }
    
    if (item) {
        const newOrder = {
            itemName: item.name,
            itemType: itemType,
            quantity: quantity,
            tableNumber: tableNumber,
            price: item.price,
            timestamp: new Date().toISOString()
        };
        
        orders.push(newOrder);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Update times ordered
        if (itemType === 'dish') {
            const dishIndex = menuData.dishes.findIndex(d => d.id === itemId);
            menuData.dishes[dishIndex].timesOrdered += quantity;
        } else if (itemType === 'beverage') {
            const beverageIndex = menuData.beverages.findIndex(b => b.id === itemId);
            menuData.beverages[beverageIndex].timesOrdered += quantity;
        } else if (itemType === 'dessert') {
            const dessertIndex = menuData.desserts.findIndex(d => d.id === itemId);
            menuData.desserts[dessertIndex].timesOrdered += quantity;
        }
        
        localStorage.setItem('menuData', JSON.stringify(menuData));
        
        // Close modal and reset form
        orderModal.classList.add('hidden');
        orderForm.reset();
        
        // Show success message
        alert(`Pedido de ${item.name} enviado para a mesa ${tableNumber}`);
        
        // Reload orders and menu
        if (localStorage.getItem('isLoggedIn') === 'true') {
            loadOrders();
        }
        loadMenuItems();
        loadCatalogItems();
    }
});

// Load menu items
function loadMenuItems() {
    const dishesContainer = document.getElementById('dishesContainer');
    const beveragesContainer = document.getElementById('beveragesContainer');
    const dessertsContainer = document.getElementById('dessertsContainer');
    
    // Clear containers
    dishesContainer.innerHTML = '';
    beveragesContainer.innerHTML = '';
    dessertsContainer.innerHTML = '';
    
    // Load dishes
    menuData.dishes.forEach(dish => {
        const dishElement = document.createElement('div');
        dishElement.className = 'bg-white rounded-lg shadow-md overflow-hidden menu-item';
        dishElement.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800">${dish.name}</h3>
                <p class="text-gray-600 text-sm mt-1">${dish.ingredients}</p>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-lg font-bold text-blue-600">R$${dish.price.toFixed(2)}</span>
                    <div class="flex items-center">
                        <span class="text-yellow-500 mr-1">${dish.rating}</span>
                        <i class="fas fa-star text-yellow-500"></i>
                    </div>
                </div>
                <div class="mt-2 text-sm text-gray-500">Pedido ${dish.timesOrdered} vezes</div>
                <button class="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 order-btn" data-type="dish" data-id="${dish.id}">
                    Pedir
                </button>
            </div>
        `;
        dishesContainer.appendChild(dishElement);
    });
    
    // Load beverages
    menuData.beverages.forEach(beverage => {
        const beverageElement = document.createElement('div');
        beverageElement.className = 'bg-white rounded-lg shadow-md overflow-hidden menu-item';
        beverageElement.innerHTML = `
            <img src="${beverage.image}" alt="${beverage.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800">${beverage.name}</h3>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-lg font-bold text-blue-600">R$${beverage.price.toFixed(2)}</span>
                    <div class="flex items-center">
                        <span class="text-yellow-500 mr-1">${beverage.rating}</span>
                        <i class="fas fa-star text-yellow-500"></i>
                    </div>
                </div>
                <div class="mt-2 text-sm text-gray-500">Pedido ${beverage.timesOrdered} vezes</div>
                <button class="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 order-btn" data-type="beverage" data-id="${beverage.id}">
                    Pedir
                </button>
            </div>
        `;
        beveragesContainer.appendChild(beverageElement);
    });
    
    // Load desserts
    menuData.desserts.forEach(dessert => {
        const dessertElement = document.createElement('div');
        dessertElement.className = 'bg-white rounded-lg shadow-md overflow-hidden menu-item';
        dessertElement.innerHTML = `
            <img src="${dessert.image}" alt="${dessert.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-800">${dessert.name}</h3>
                <div class="mt-4 flex justify-between items-center">
                    <span class="text-lg font-bold text-blue-600">R$${dessert.price.toFixed(2)}</span>
                    <div class="flex items-center">
                        <span class="text-yellow-500 mr-1">${dessert.rating}</span>
                        <i class="fas fa-star text-yellow-500"></i>
                    </div>
                </div>
                <div class="mt-2 text-sm text-gray-500">Pedido ${dessert.timesOrdered} vezes</div>
                <button class="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 order-btn" data-type="dessert" data-id="${dessert.id}">
                    Pedir
                </button>
            </div>
        `;
        dessertsContainer.appendChild(dessertElement);
    });
    
    // Add event listeners to order buttons
    document.querySelectorAll('.order-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemType = btn.getAttribute('data-type');
            const itemId = parseInt(btn.getAttribute('data-id'));
            openOrderModal(itemType, itemId);
        });
    });
}

// Load catalog items
function loadCatalogItems() {
    const dishesCatalog = document.getElementById('dishesCatalog');
    const beveragesCatalog = document.getElementById('beveragesCatalog');
    const dessertsCatalog = document.getElementById('dessertsCatalog');
    
    // Clear containers
    dishesCatalog.innerHTML = '';
    beveragesCatalog.innerHTML = '';
    dessertsCatalog.innerHTML = '';
    
    // Load dishes catalog
    menuData.dishes.forEach(dish => {
        const dishElement = document.createElement('div');
        dishElement.className = 'bg-white rounded-lg shadow-sm p-4 order-item';
        dishElement.innerHTML = `
            <div class="flex items-center">
                <img src="${dish.image}" alt="${dish.name}" class="w-16 h-16 object-cover rounded-lg mr-4">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-800">${dish.name}</h3>
                    <p class="text-sm text-gray-600">${dish.ingredients}</p>
                </div>
                <div class="text-right">
                    <span class="font-bold text-blue-600">R$${dish.price.toFixed(2)}</span>
                    <div class="flex items-center justify-end mt-1">
                        <span class="text-yellow-500 mr-1 text-sm">${dish.rating}</span>
                        <i class="fas fa-star text-yellow-500 text-sm"></i>
                    </div>
                </div>
            </div>
            <div class="mt-3 flex justify-end space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-btn" data-type="dish" data-id="${dish.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-type="dish" data-id="${dish.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        dishesCatalog.appendChild(dishElement);
    });
    
    // Load beverages catalog
    menuData.beverages.forEach(beverage => {
        const beverageElement = document.createElement('div');
        beverageElement.className = 'bg-white rounded-lg shadow-sm p-4 order-item';
        beverageElement.innerHTML = `
            <div class="flex items-center">
                <img src="${beverage.image}" alt="${beverage.name}" class="w-16 h-16 object-cover rounded-lg mr-4">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-800">${beverage.name}</h3>

                </div>
                <div class="text-right">
                    <span class="font-bold text-blue-600">R$${beverage.price.toFixed(2)}</span>
                    <div class="flex items-center justify-end mt-1">
                        <span class="text-yellow-500 mr-1 text-sm">${beverage.rating}</span>
                        <i class="fas fa-star text-yellow-500 text-sm"></i>
                    </div>
                </div>
            </div>
            <div class="mt-3 flex justify-end space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-btn" data-type="beverage" data-id="${beverage.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-type="beverage" data-id="${beverage.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        beveragesCatalog.appendChild(beverageElement);
    });
    
    // Load desserts catalog
    menuData.desserts.forEach(dessert => {
        const dessertElement = document.createElement('div');
        dessertElement.className = 'bg-white rounded-lg shadow-sm p-4 order-item';
        dessertElement.innerHTML = `
            <div class="flex items-center">
                <img src="${dessert.image}" alt="${dessert.name}" class="w-16 h-16 object-cover rounded-lg mr-4">
                <div class="flex-1">
                    <h3 class="font-medium text-gray-800">${dessert.name}</h3>
                </div>
                <div class="text-right">
                    <span class="font-bold text-blue-600">R$${dessert.price.toFixed(2)}</span>
                    <div class="flex items-center justify-end mt-1">
                        <span class="text-yellow-500 mr-1 text-sm">${dessert.rating}</span>
                        <i class="fas fa-star text-yellow-500 text-sm"></i>
                    </div>
                </div>
            </div>
            <div class="mt-3 flex justify-end space-x-2">
                <button class="text-blue-500 hover:text-blue-700 edit-btn" data-type="dessert" data-id="${dessert.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-type="dessert" data-id="${dessert.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        dessertsCatalog.appendChild(dessertElement);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemType = btn.getAttribute('data-type');
            const itemId = parseInt(btn.getAttribute('data-id'));
            editItem(itemType, itemId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const itemType = btn.getAttribute('data-type');
            const itemId = parseInt(btn.getAttribute('data-id'));
            deleteItem(itemType, itemId);
        });
    });
}

// Edit item
function editItem(itemType, itemId) {
    let item;
    let itemIndex;
    
    if (itemType === 'dish') {
        itemIndex = menuData.dishes.findIndex(d => d.id === itemId);
        item = menuData.dishes[itemIndex];
        
        if (item) {
            document.getElementById('dishName').value = item.name;
            document.getElementById('dishIngredients').value = item.ingredients;
            document.getElementById('dishPrice').value = item.price;
            dishImagePreview.src = item.image;
            dishImagePreview.style.display = 'block';
            
            // Show the add dish section
            document.querySelectorAll('.tab-content').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('addDishSection').classList.add('active');
            
            // Change the form to edit mode
            addDishForm.dataset.mode = 'edit';
            addDishForm.dataset.itemType = itemType;
            addDishForm.dataset.itemId = itemId;
        }
    } else if (itemType === 'beverage') {
        itemIndex = menuData.beverages.findIndex(b => b.id === itemId);
        item = menuData.beverages[itemIndex];
        
        if (item) {
            document.getElementById('beverageName').value = item.name;
            document.getElementById('beveragePrice').value = item.price;
            beverageImagePreview.src = item.image;
            beverageImagePreview.style.display = 'block';
            
            // Show the add beverage section
            document.querySelectorAll('.tab-content').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('addBeverageSection').classList.add('active');
            
            // Change the form to edit mode
            addBeverageForm.dataset.mode = 'edit';
            addBeverageForm.dataset.itemType = itemType;
            addBeverageForm.dataset.itemId = itemId;
        }
    } else if (itemType === 'dessert') {
        itemIndex = menuData.desserts.findIndex(d => d.id === itemId);
        item = menuData.desserts[itemIndex];
        
        if (item) {
            document.getElementById('dessertName').value = item.name;
            document.getElementById('dessertPrice').value = item.price;
            dessertImagePreview.src = item.image;
            dessertImagePreview.style.display = 'block';
            
            // Show the add dessert section
            document.querySelectorAll('.tab-content').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById('addDessertSection').classList.add('active');
            
            // Change the form to edit mode
            addDessertForm.dataset.mode = 'edit';
            addDessertForm.dataset.itemType = itemType;
            addDessertForm.dataset.itemId = itemId;
        }
    }
}

// Delete item
function deleteItem(itemType, itemId) {
    if (confirm('Tem certeza que deseja remover este item?')) {
        if (itemType === 'dish') {
            menuData.dishes = menuData.dishes.filter(d => d.id !== itemId);
        } else if (itemType === 'beverage') {
            menuData.beverages = menuData.beverages.filter(b => b.id !== itemId);
        } else if (itemType === 'dessert') {
            menuData.desserts = menuData.desserts.filter(d => d.id !== itemId);
        }
        
        localStorage.setItem('menuData', JSON.stringify(menuData));
        loadMenuItems();
        loadCatalogItems();
        alert('Item removido com sucesso!');
    }
}

// Load orders
function loadOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    
    // Clear container
    ordersContainer.innerHTML = '';
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p class="text-gray-500">Nenhum pedido em aberto.</p>';
        return;
    }
    
    orders.forEach((order, index) => {
        const orderElement = document.createElement('div');
        orderElement.className = 'bg-white rounded-lg shadow-sm p-4 order-item';
        orderElement.innerHTML = `
            <div class="flex justify between items-center">
                <div>
                    <h3 class="font-medium text-gray-800">${order.itemName}</h3>
                    <p class="text-sm text-gray-600">Mesa ${order.tableNumber} | Quantidade: ${order.quantity}</p>
                </div>
                <div class="text-right">
                    <span class="font-bold text-blue-600">R$${(order.price * order.quantity).toFixed(2)}</span>
                    <button class="mt-2 bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-600 transition duration-200 finish-order-btn" data-index="${index}">
                        Finalizar
                    </button>
                </div>
            </div>
        `;
        ordersContainer.appendChild(orderElement);
    });
    
    // Add event listeners to finish order buttons
    document.querySelectorAll('.finish-order-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const orderIndex = parseInt(btn.getAttribute('data-index'));
            finishOrder(orderIndex);
        });
    });
}

// Finish order
function finishOrder(orderIndex) {
    const order = orders[orderIndex];
    finishedOrders.push(order);
    orders.splice(orderIndex, 1);
    
    localStorage.setItem('orders', JSON.stringify(orders));
    localStorage.setItem('finishedOrders', JSON.stringify(finishedOrders));
    
    loadOrders();
    loadFinishedOrders();
    loadStatistics();
    
    alert(`Pedido de ${order.itemName} finalizado com sucesso!`);
}

// Load finished orders
function loadFinishedOrders() {
    const finishedOrdersContainer = document.getElementById('finishedOrdersContainer');
    
    // Clear container
    finishedOrdersContainer.innerHTML = '';
    
    if (finishedOrders.length === 0) {
        finishedOrdersContainer.innerHTML = '<p class="text-gray-500">Nenhum pedido finalizado.</p>';
        return;
    }
    
    finishedOrders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'bg-white rounded-lg shadow-sm p-4 completed-order';
        orderElement.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-medium text-gray-800">${order.itemName}</h3>
                    <p class="text-sm text-gray-6 00">Mesa ${order.tableNumber} | Quantidade: ${order.quantity}</p>
                </div>
                <div class="text-right">
                    <span class="font-bold text-green-600">R$${(order.price * order.quantity).toFixed(2)}</span>
                    <div class="text-xs text-gray-500 mt-1">${new Date(order.timestamp).toLocaleString()}</div>
                </div>
            </div>
        `;
        finishedOrdersContainer.appendChild(orderElement);
    });
}

// Load statistics
function loadStatistics() {
    const statisticsContainer = document.getElementById('statisticsContainer');
    
    // Clear container
    statisticsContainer.innerHTML = '';
    
    if (finishedOrders.length === 0) {
        statisticsContainer.innerHTML = '<p class="text-gray-500">Nenhuma estatística disponível.</p>';
        return;
    }
    
    // Calculate total revenue
    const totalRevenue = finishedOrders.reduce((sum, order) => sum + (order.price * order.quantity), 0);
    
    // Calculate total orders
    const totalOrders = finishedOrders.reduce((sum, order) => sum + order.quantity, 0);
    
    // Find most ordered item
    const itemCounts = {};
    finishedOrders.forEach(order => {
        if (itemCounts[order.itemName]) {
            itemCounts[order.itemName] += order.quantity;
        } else {
            itemCounts[order.itemName] = order.quantity;
        }
    });
    
    let mostOrderedItem = '';
    let maxCount = 0;
    for (const item in itemCounts) {
        if (itemCounts[item] > maxCount) {
            mostOrderedItem = item;
            maxCount = itemCounts[item];
        }
    }
    
    // Create statistics cards
    const revenueCard = document.createElement('div');
    revenueCard.className = 'bg-white rounded-lg shadow-sm p-6';
    revenueCard.innerHTML = `
        <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <i class="fas fa-money-bill-wave text-xl"></i>
            </div>
            <div>
                <h3 class="text-gray-500 text-sm">Rendimento Total</h3>
                <p class="text-2xl font-bold text-gray-800">R$${totalRevenue.toFixed(2)}</p>
            </div>
        </div>
    `;
    
    const ordersCard = document.createElement('div');
    ordersCard.className = 'bg-white rounded-lg shadow-sm p-6';
    ordersCard.innerHTML = `
        <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <i class="fas fa-clipboard-list text-xl"></i>
            </div>
            <div>
                <h3 class="text-gray-500 text-sm">Total de Pedidos</h3>
                <p class="text-2xl font-bold text-gray-800">${totalOrders}</p>
            </div>
        </div>
    `;
    
    const popularCard = document.createElement('div');
    popularCard.className = 'bg-white rounded-lg shadow-sm p-6';
    popularCard.innerHTML = `
        <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <i class="fas fa-star text-xl"></i>
            </div>
            <div>
                <h3 class="text-gray-500 text-sm">Item Mais Pedido</h3>
                <p class="text-xl font-bold text-gray-800">${mostOrderedItem}</p>
                <p class="text-sm text-gray-500">${maxCount} pedidos</p>
            </div>
        </div>
    `;
    
    statisticsContainer.appendChild(revenueCard);
    statisticsContainer.appendChild(ordersCard);
    statisticsContainer.appendChild(popularCard);
}