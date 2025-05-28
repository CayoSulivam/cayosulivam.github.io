// Configuração do Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyBEZaulMnzoFYHiiRxQDvUS4U5VaroQeA8",
    authDomain: "cayosulivamprojetos.firebaseapp.com",
    projectId: "cayosulivamprojetos",
    storageBucket: "cayosulivamprojetos.appspot.com",
    messagingSenderId: "329161017739",
    appId: "1:329161017739:web:36696a0fc8de564601878e",
    measurementId: "G-D5FHWFS5E5"
  };
  document.getElementById('proceed-to-payment').addEventListener('click', proceedToPayment);
  document.getElementById('back-to-delivery').addEventListener('click', backToDelivery);
  function backToDelivery() {
    // Esconde a seção de pagamento e mostra a de entrega
    document.getElementById('payment-section').classList.add('hidden');
    document.getElementById('delivery-section').classList.remove('hidden');
    
    // Os dados de entrega permanecem preenchidos
  }
  // Inicialização do Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // Referências às coleções
  const clientesRef = db.collection('clientes');
  const productsRef = db.collection('products');
  const ordersRef = db.collection('order');
  
  // State da aplicação
  let state = {
    cart: [],
    isLoggedIn: false,
    currentUser: null,
    orders: []
  };
  
  // Cache de elementos DOM
  const DOM = {
    // Elementos do Carrinho
    cartBtn: document.getElementById('cart-btn'),
    closeCartBtn: document.getElementById('close-cart'),
    cartSidebar: document.getElementById('cart-sidebar'),
    cartItemsContainer: document.getElementById('cart-items'),
    cartCount: document.getElementById('cart-count'),
    subtotalEl: document.getElementById('subtotal'),
    shippingEl: document.getElementById('shipping'),
    totalEl: document.getElementById('total'),
    calculateShippingBtn: document.getElementById('calculate-shipping'),
    cepInput: document.getElementById('cep'),
    shippingResult: document.getElementById('shipping-result'),
    btnFinalizar: document.getElementById('btnFinalizar'),
    
    // Elementos do Checkout
    checkoutModal: document.getElementById('checkout-modal'),
    cancelCheckoutBtn: document.getElementById('cancel-checkout'),
    confirmOrderBtn: document.getElementById('confirm-order'),
    orderConfirmation: document.getElementById('order-confirmation'),
    closeConfirmationBtn: document.getElementById('close-confirmation'),
    viewOrderBtn: document.getElementById('view-order'),
    orderNumberEl: document.getElementById('order-number'),
    
    // Elementos de Login/Registro
    loginBtn: document.getElementById('login-btn'),
    ordersBtn: document.getElementById('orders-btn'),
    loginModal: document.getElementById('login-modal'),
    closeLoginBtn: document.getElementById('close-login'),
    doLoginBtn: document.getElementById('do-login'),
    showRegisterBtn: document.getElementById('show-register'),
    registerModal: document.getElementById('register-modal'),
    closeRegisterBtn: document.getElementById('close-register'),
    doRegisterBtn: document.getElementById('do-register'),
    showLoginBtn: document.getElementById('show-login'),
    
    // Elementos de Pedidos
    ordersModal: document.getElementById('orders-modal'),
    closeOrdersBtn: document.getElementById('close-orders'),
    ordersList: document.getElementById('orders-list'),
    noOrders: document.getElementById('no-orders'),
    
    // Elementos de Pagamento
    paymentMethods: document.querySelectorAll('input[name="payment"]'),
    pixSection: document.getElementById('pix-section'),
    cardSection: document.getElementById('card-section'),
    
    // Botões de adicionar ao carrinho
    addToCartButtons: document.querySelectorAll('.add-to-cart'),
    
    // Elementos do usuário
    userGreeting: document.getElementById('user-greeting')
  };
  
  // ==================== FUNÇÕES DO CARRINHO ====================
  function toggleCart() {
    DOM.cartSidebar.classList.toggle('translate-x-full');
    updateCartUI();
  }
  
  function addToCart(id, name, price) {
    const existingItem = state.cart.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      state.cart.push({ id, name, price, quantity: 1 });
    }
    
    updateCartUI();
    showFeedback('Item adicionado ao carrinho', 'success');
  }
  
  function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    DOM.cartCount.textContent = totalItems;
    
    if (state.cart.length === 0) {
      DOM.cartItemsContainer.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-shopping-cart text-4xl mb-2"></i>
          <p>Seu carrinho está vazio</p>
        </div>
      `;
      DOM.btnFinalizar.disabled = true;
    } else {
      DOM.cartItemsContainer.innerHTML = state.cart.map(item => `
        <div class="cart-item bg-gray-50 rounded-lg p-3 flex justify-between items-center">
          <div>
            <h4 class="font-medium">${item.name}</h4>
            <div class="flex items-center mt-1">
              <button class="decrease-quantity text-gray-500 hover:text-indigo-600" data-id="${item.id}">
                <i class="fas fa-minus text-xs"></i>
              </button>
              <span class="mx-2">${item.quantity}</span>
              <button class="increase-quantity text-gray-500 hover:text-indigo-600" data-id="${item.id}">
                <i class="fas fa-plus text-xs"></i>
              </button>
              <span class="ml-4 text-sm text-gray-600">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
          <div class="font-medium">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</div>
        </div>
      `).join('');
      
      DOM.btnFinalizar.disabled = false;
      
      document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
          const id = e.target.closest('button').dataset.id;
          decreaseQuantity(id);
        });
      });
      
      document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
          const id = e.target.closest('button').dataset.id;
          increaseQuantity(id);
        });
      });
    }
    
    updateTotals();
  }
  
  function decreaseQuantity(id) {
    const item = state.cart.find(item => item.id === id);
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      state.cart = state.cart.filter(item => item.id !== id);
    }
    updateCartUI();
  }
  
  function increaseQuantity(id) {
    const item = state.cart.find(item => item.id === id);
    item.quantity += 1;
    updateCartUI();
  }
  
  function updateTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = parseFloat(DOM.shippingEl.textContent.replace('R$ ', '').replace(',', '.')) || 0;
    const total = subtotal + shipping;
    
    DOM.subtotalEl.textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    DOM.totalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  }
  
  function calculateShipping() {
    const cep = DOM.cepInput.value.trim();
    
    if (!cep || cep.length < 8) {
      showFeedback('Por favor, insira um CEP válido', 'error');
      return;
    }
    
    setTimeout(() => {
      const distance = Math.floor(Math.random() * 20) + 1;
      const shippingCost = distance * 10;
      
      DOM.shippingEl.textContent = `R$ ${shippingCost.toFixed(2).replace('.', ',')}`;
      DOM.shippingResult.innerHTML = `Frete calculado para ${distance} km de distância`;
      DOM.shippingResult.classList.remove('hidden', 'text-red-500');
      DOM.shippingResult.classList.add('text-green-600');
      
      updateTotals();
    }, 800);
  }
  
  // ==================== FUNÇÕES DE CHECKOUT ====================
  
  // Função para ir para a seção de pagamento
  function proceedToPayment() {
    // Validação básica dos campos de entrega
    const street = document.getElementById('street').value;
    const number = document.getElementById('number').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    
    if (!street || !number || !neighborhood || !city || !state) {
        showFeedback('Por favor, preencha todos os campos obrigatórios do endereço', 'error');
        return;
    }
    
    // Esconde a seção de entrega e mostra a de pagamento
    document.getElementById('delivery-section').classList.add('hidden');
    document.getElementById('payment-section').classList.remove('hidden');
  }
  function openCheckoutModal() {
    if (!state.isLoggedIn) {
      showFeedback('Por favor, faça login para finalizar a compra', 'error');
      openLoginModal();
      return;
    }
    
    if (state.cart.length === 0) {
      showFeedback('Seu carrinho está vazio', 'error');
      return;
    }
    
    DOM.checkoutModal.classList.remove('hidden');
  }
  
  function closeCheckoutModal() {
    DOM.checkoutModal.classList.add('hidden');
  }
  
  function closeOrderConfirmation() {
    DOM.orderConfirmation.classList.add('hidden');
  }
  
  function viewOrder() {
    closeOrderConfirmation();
    openOrdersModal();
  }
  
  async function confirmOrder() {
    if (!state.isLoggedIn || !state.currentUser) {
      showFeedback('Por favor, faça login para finalizar a compra', 'error');
      openLoginModal();
      return;
    }
  
    const street = document.getElementById('street').value;
    const number = document.getElementById('number').value;
    const complement = document.getElementById('complement').value;
    const neighborhood = document.getElementById('neighborhood').value;
    const city = document.getElementById('city').value;
    const stateInput = document.getElementById('state').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  
    if (!street || !number || !neighborhood || !city || !stateInput) {
      showFeedback('Por favor, preencha todos os campos obrigatórios do endereço', 'error');
      return;
    }
  
    try {
      const itensRefs = await Promise.all(state.cart.map(async item => {
        const productSnapshot = await productsRef.where('produto', '==', item.name).get();
        if (productSnapshot.empty) throw new Error(`Produto ${item.name} não encontrado`);
        return productSnapshot.docs[0].ref;
      }));
  
      const newOrder = {
        cliente: db.collection('clientes').doc(state.currentUser.id),
        itens: itensRefs,
        status: 'pendente',
        endereco: {
          rua: street,
          numero: number,
          complemento: complement,
          bairro: neighborhood,
          cidade: city,
          estado: stateInput,
          cep: DOM.cepInput.value
        },
        metodoPagamento: paymentMethod,
        total: parseFloat(DOM.totalEl.textContent.replace('R$ ', '').replace(',', '.')),
        data: new Date()
      };
  
      const orderDoc = await ordersRef.add(newOrder);
      
      const orderId = orderDoc.id;
      DOM.orderNumberEl.textContent = orderId;
      DOM.orderConfirmation.classList.remove('hidden');
      DOM.checkoutModal.classList.add('hidden');
      
      state.cart = [];
      updateCartUI();
      
      showFeedback('Pedido realizado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      showFeedback('Ocorreu um erro ao processar seu pedido. Por favor, tente novamente.', 'error');
    }
  }
  
  // ==================== FUNÇÕES DE AUTENTICAÇÃO ====================
  function openLoginModal() {
    DOM.loginModal.classList.remove('hidden');
  }
  
  function closeLoginModal() {
    DOM.loginModal.classList.add('hidden');
  }
  
  function showRegister() {
    DOM.loginModal.classList.add('hidden');
    DOM.registerModal.classList.remove('hidden');
  }
  
  function showLogin() {
    DOM.registerModal.classList.add('hidden');
    DOM.loginModal.classList.remove('hidden');
  }
  
  function closeRegisterModal() {
    DOM.registerModal.classList.add('hidden');
  }
  
  async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
      showFeedback('Por favor, preencha todos os campos', 'error');
      return;
    }
    
    try {
      const clienteSnapshot = await clientesRef.where('email', '==', email).get();
      
      if (clienteSnapshot.empty) {
        showFeedback('E-mail não cadastrado', 'error');
        return;
      }
      
      const clienteDoc = clienteSnapshot.docs[0];
      const clienteData = clienteDoc.data();
      
      if (clienteData.password !== password) {
        showFeedback('Senha incorreta', 'error');
        return;
      }
      
      state.isLoggedIn = true;
      state.currentUser = {
        id: clienteDoc.id,
        email: email,
        name: clienteData['nome-completo']
      };
      
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
      
      DOM.loginBtn.classList.add('hidden');
      DOM.ordersBtn.classList.remove('hidden');
      if (DOM.userGreeting) {
        DOM.userGreeting.textContent = `Olá, ${state.currentUser.name.split(' ')[0]}`;
        DOM.userGreeting.classList.remove('hidden');
      }
      closeLoginModal();
      
      await loadUserOrders(clienteDoc.ref);
      
      showFeedback('Login realizado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro no login:', error);
      showFeedback('Ocorreu um erro durante o login', 'error');
    }
  }
  
  async function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    if (!name || !email || !password || !confirm) {
      showFeedback('Por favor, preencha todos os campos', 'error');
      return;
    }
    
    if (password !== confirm) {
      showFeedback('As senhas não coincidem', 'error');
      return;
    }
    
    try {
      const emailExists = await clientesRef.where('email', '==', email).get();
      if (!emailExists.empty) {
        showFeedback('Este e-mail já está cadastrado', 'error');
        return;
      }
      
      const newUserRef = await clientesRef.add({
        'nome-completo': name,
        email: email,
        password: password,
        ativos: true,
        Cep: '',
        createTime: new Date(),
        updateTime: new Date()
      });
      
      state.isLoggedIn = true;
      state.currentUser = {
        id: newUserRef.id,
        email: email,
        name: name
      };
      
      localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
      
      DOM.loginBtn.classList.add('hidden');
      DOM.ordersBtn.classList.remove('hidden');
      if (DOM.userGreeting) {
        DOM.userGreeting.textContent = `Olá, ${name.split(' ')[0]}`;
        DOM.userGreeting.classList.remove('hidden');
      }
      closeRegisterModal();
      
      showFeedback('Cadastro realizado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      showFeedback('Ocorreu um erro durante o cadastro', 'error');
    }
  }
  
  function logout() {
    state.isLoggedIn = false;
    state.currentUser = null;
    localStorage.removeItem('currentUser');
    
    DOM.loginBtn.classList.remove('hidden');
    DOM.ordersBtn.classList.add('hidden');
    if (DOM.userGreeting) {
      DOM.userGreeting.classList.add('hidden');
    }
    
    showFeedback('Você saiu da sua conta', 'info');
  }
  
  // ==================== FUNÇÕES DE PEDIDOS ====================
  function openOrdersModal() {
    if (!state.isLoggedIn) {
      showFeedback('Por favor, faça login para ver seus pedidos', 'error');
      openLoginModal();
      return;
    }
    
    if (state.orders.length === 0) {
      DOM.ordersList.classList.add('hidden');
      DOM.noOrders.classList.remove('hidden');
    } else {
      DOM.ordersList.classList.remove('hidden');
      DOM.noOrders.classList.add('hidden');
      
      DOM.ordersList.innerHTML = state.orders.map(order => `
        <div class="border border-gray-200 rounded-lg overflow-hidden mb-4">
          <div class="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
            <div>
              <span class="font-medium">Pedido #${order.id}</span>
              <span class="text-sm text-gray-500 ml-2">${order.date}</span>
            </div>
            <span class="px-2 py-1 text-xs font-medium rounded-full ${
              order.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
              order.status === 'enviado' ? 'bg-blue-100 text-blue-800' : 
              'bg-green-100 text-green-800'
            }">
              ${order.status === 'pendente' ? 'Pendente' : 
                order.status === 'enviado' ? 'Enviado' : 
                'Entregue'}
            </span>
          </div>
          <div class="p-4">
            ${order.items.map(item => `
              <div class="flex justify-between mb-2">
                <span>${item.name}</span>
                <span>R$ ${item.price.toFixed(2).replace('.', ',')}</span>
              </div>
            `).join('')}
            <div class="flex justify-between pt-3 border-t border-gray-200 font-medium">
              <span>Total:</span>
              <span>R$ ${order.total.toFixed(2).replace('.', ',')}</span>
            </div>
          </div>
        </div>
      `).join('');
    }
    
    DOM.ordersModal.classList.remove('hidden');
  }
  
  function closeOrdersModal() {
    DOM.ordersModal.classList.add('hidden');
  }
  
  async function loadUserOrders(clienteRef) {
    try {
      const ordersSnapshot = await ordersRef.where('cliente', '==', clienteRef).get();
      
      state.orders = [];
      ordersSnapshot.forEach(doc => {
        const orderData = doc.data();
        state.orders.push({
          id: doc.id,
          date: orderData.data.toDate().toLocaleDateString('pt-BR'),
          status: orderData.status,
          items: [],
          total: orderData.total
        });
      });
      
      await Promise.all(state.orders.map(async (order, index) => {
        const orderDoc = ordersSnapshot.docs[index];
        const orderData = orderDoc.data();
        
        const itemsData = await Promise.all(
          orderData.itens.map(async itemRef => {
            const itemDoc = await itemRef.get();
            return itemDoc.data();
          })
        );
        
        order.items = itemsData.map(item => ({
          name: item.produto,
          price: parseFloat(item.valor.replace(',', '.'))
        }));
      }));
      
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  }
  
  // ==================== FUNÇÕES AUXILIARES ====================
  function showFeedback(message, type = 'info') {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500'
    };
    
    const feedback = document.createElement('div');
    feedback.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded shadow-lg flex items-center`;
    feedback.innerHTML = `
      <i class="fas ${
        type === 'success' ? 'fa-check-circle' : 
        type === 'error' ? 'fa-exclamation-circle' : 
        'fa-info-circle'
      } mr-2"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
      feedback.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      setTimeout(() => feedback.remove(), 300);
    }, 3000);
  }
  
  function handlePaymentMethodChange(e) {
    if (e.target.value === 'pix') {
      DOM.pixSection.classList.remove('hidden');
      DOM.cardSection.classList.add('hidden');
    } else {
      DOM.pixSection.classList.add('hidden');
      DOM.cardSection.classList.remove('hidden');
    }
  }
  
  // ==================== INICIALIZAÇÃO ====================
  function setupEventListeners() {
    // Carrinho
    DOM.cartBtn.addEventListener('click', toggleCart);
    DOM.closeCartBtn.addEventListener('click', toggleCart);
    DOM.calculateShippingBtn.addEventListener('click', calculateShipping);
    
    // Checkout
    DOM.btnFinalizar.addEventListener('click', openCheckoutModal);
    DOM.cancelCheckoutBtn.addEventListener('click', closeCheckoutModal);
    DOM.confirmOrderBtn.addEventListener('click', confirmOrder);
    DOM.closeConfirmationBtn.addEventListener('click', closeOrderConfirmation);
    DOM.viewOrderBtn.addEventListener('click', viewOrder);
    
    // Login/Registro
    DOM.loginBtn.addEventListener('click', openLoginModal);
    DOM.ordersBtn.addEventListener('click', openOrdersModal);
    DOM.closeLoginBtn.addEventListener('click', closeLoginModal);
    DOM.doLoginBtn.addEventListener('click', login);
    DOM.showRegisterBtn.addEventListener('click', showRegister);
    DOM.closeRegisterBtn.addEventListener('click', closeRegisterModal);
    DOM.doRegisterBtn.addEventListener('click', register);
    DOM.showLoginBtn.addEventListener('click', showLogin);
    DOM.closeOrdersBtn.addEventListener('click', closeOrdersModal);
    
    // Pagamento
    DOM.paymentMethods.forEach(method => {
      method.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Botões de adicionar ao carrinho
    DOM.addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const name = e.target.dataset.name;
        const price = parseFloat(e.target.dataset.price);
        addToCart(id, name, price);
      });
    });
  }
  
  // ==================== FUNÇÕES DE PRODUTOS ====================
async function loadProducts() {
    try {
      const productsContainer = document.querySelector('.grid.grid-cols-1'); // Seleciona o container de produtos
      if (!productsContainer) return;
  
      const snapshot = await productsRef.get();
      if (snapshot.empty) {
        productsContainer.innerHTML = '<p class="text-gray-500">Nenhum produto disponível no momento</p>';
        return;
      }
  
      let productsHTML = '';
      snapshot.forEach(doc => {
        const product = doc.data();
        if (product.ativo){
          productsHTML += `
          <div class="product-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300">
            <img src="${product.imagem || 'https://via.placeholder.com/300'}" alt="${product.produto}" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="font-semibold text-lg mb-1">${product.produto}</h3>
              <p class="text-gray-600 text-sm mb-2">${product.descricao || 'Sem descrição'}</p>
              <div class="flex justify-between items-center">
                <span class="font-bold text-indigo-600">R$ ${parseFloat(product.valor).toFixed(2).replace('.', ',')}</span>
                <button class="add-to-cart bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition" 
                  data-id="${doc.id}" 
                  data-name="${product.produto}" 
                  data-price="${parseFloat(product.valor)}">
                  <i class="fas fa-plus"></i> Carrinho
                </button>
              </div>
            </div>
          </div>
        `;
        }

      });
  
      productsContainer.innerHTML = productsHTML;
      
      // Atualiza os event listeners para os novos botões
      document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
          const id = e.target.closest('button').dataset.id;
          const name = e.target.closest('button').dataset.name;
          const price = parseFloat(e.target.closest('button').dataset.price);
          addToCart(id, name, price);
        });
      });
  
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      showFeedback('Erro ao carregar produtos', 'error');
    }
  }
  
  async function init() {
    setupEventListeners();
    updateCartUI();
    await loadProducts(); // Carrega os produtos do Firestore
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      state.currentUser = JSON.parse(savedUser);
      state.isLoggedIn = true;
      DOM.loginBtn.classList.add('hidden');
      DOM.ordersBtn.classList.remove('hidden');
      if (DOM.userGreeting) {
        DOM.userGreeting.textContent = `Olá, ${state.currentUser.name.split(' ')[0]}`;
        DOM.userGreeting.classList.remove('hidden');
      }
      
      const userRef = db.collection('clientes').doc(state.currentUser.id);
      loadUserOrders(userRef);
    }
  }
  
  
  document.addEventListener('DOMContentLoaded', init);
  async function searchProducts(query, filters = {}) {
  let queryRef = db.collection('products')
    .where('ativo', '==', true);
  
  // Filtro por texto
  if (query) {
    queryRef = queryRef.where('keywords', 'array-contains', query.toLowerCase());
  }
  
  // Filtros adicionais
  if (filters.category) {
    queryRef = queryRef.where('categoria', '==', filters.category);
  }
  
  if (filters.minPrice || filters.maxPrice) {
    if (filters.minPrice) {
      queryRef = queryRef.where('valor', '>=', Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      queryRef = queryRef.where('valor', '<=', Number(filters.maxPrice));
    }
  }
  
  const snapshot = await queryRef.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
function saveCartToLocalStorage() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

function loadCartFromLocalStorage() {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    state.cart = JSON.parse(savedCart);
    updateCartUI();
  }
}

// Chamar no carregamento da página
document.addEventListener('DOMContentLoaded', () => {
  loadCartFromLocalStorage();
});
// Ao enviar o formulário de busca
document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = document.getElementById('search-input').value;
  const filters = {
    category: document.getElementById('category-filter').value,
    minPrice: document.getElementById('min-price').value,
    maxPrice: document.getElementById('max-price').value
  };
  
  const products = await searchProducts(query, filters);
  displayProducts(products); // Sua função para exibir os produtos
});
