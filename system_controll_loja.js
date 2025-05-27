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
  
  // Inicialização garantida
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();
  const storage = firebase.storage();
  const auth = firebase.auth(); // Agora auth está definida
  
  // Restante do código...
  
    // Instâncias de modal
    const crudModal = new bootstrap.Modal(document.getElementById('crudModal'));
    const userModal = new bootstrap.Modal(document.getElementById('userModal'));
    
    // Variáveis globais
    let currentUser = null;
    let currentPage = null;
    let selectedItemId = null;
    
    // Mapeamento de coleções para CRUD dinâmico
  // Configuração das coleções (exemplo completo)
  const collectionsConfig = {
      'products': {
        name: 'Produtos',
        singular: 'Produto',
        fields: [
          { name: 'produto', label: 'Nome', type: 'text', required: true },
          { name: 'descricao', label: 'Descrição', type: 'textarea' },
          { name: 'valor', label: 'Preço', type: 'number', required: true },
          { name: 'stock', label: 'Estoque', type: 'number' },
          { name: 'ativo', label: 'Ativo', type: 'checkbox', default: true },
          { name: 'imagem', label: 'Imagem do Produto', type: 'file' }
        ],
        permissions: {
          create: true,
          read: true,
          update: true,
          delete: true
        }
      },
      'clientes': {
      name: 'Clientes',
      singular: 'Cliente',
      fields: [
        { name: 'nome-completo', label: 'Nome Completo', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Senha', type: 'password', required: true },
        { name: 'Cep', label: 'CEP', type: 'text' },
        { name: 'ativos', label: 'Ativo', type: 'checkbox', default: true }
      ]
    },
    'order': {
      name: 'Pedidos',
      singular: 'Pedido',
      fields: [
        { 
          name: 'cliente', 
          label: 'Cliente', 
          type: 'reference', 
          collection: 'clientes',
          displayField: 'nome-completo',
          required: true 
        },
        { name: 'data', label: 'Data', type: 'datetime', required: true },
        { 
          name: 'endereco', 
          label: 'Endereço', 
          type: 'map',
          subfields: [
            { name: 'rua', label: 'Rua', type: 'text', required: true },
            { name: 'numero', label: 'Número', type: 'text', required: true },
            { name: 'complemento', label: 'Complemento', type: 'text' },
            { name: 'bairro', label: 'Bairro', type: 'text', required: true },
            { name: 'cidade', label: 'Cidade', type: 'text', required: true },
            { name: 'estado', label: 'Estado', type: 'text', required: true },
            { name: 'cep', label: 'CEP', type: 'text', required: true }
          ]
        },
        { 
          name: 'itens', 
          label: 'Itens', 
          type: 'array', 
          itemType: 'reference',
          collection: 'products',
          displayField: 'name',
          required: true 
        },
        { 
          name: 'metodoPagamento', 
          label: 'Método de Pagamento', 
          type: 'select',
          options: ['Cartão', 'Boleto', 'PIX', 'Dinheiro'],
          required: true
        },
        { 
          name: 'status', 
          label: 'Status', 
          type: 'select',
          options: ['Pendente', 'Processando', 'Enviado', 'Entregue', 'Cancelado'],
          required: true
        },
        { name: 'total', label: 'Total', type: 'number', required: true }
      ]
    }
  };
    
    
    // Inicialização do sistema
    document.addEventListener('DOMContentLoaded', () => {
      // Configurar listeners
      document.getElementById('loginBtn')?.addEventListener('click', login);
      document.getElementById('toggleSidebar')?.addEventListener('click', toggleSidebar);
      document.getElementById('logout')?.addEventListener('click', logout);
    
      // Verificar autenticação
      auth.onAuthStateChanged(user => {
        if (user) {
          // Carregar dados do usuário antes de mostrar a aplicação
          loadUserData(user.uid).then(() => {
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('app').style.display = 'flex';
          });
        } else {
          // Redirecionar para login se não autenticado
          document.getElementById('login-page').style.display = 'flex';
          document.getElementById('app').style.display = 'none';
        }
      });
  
    });
    
    // Função de login
    async function login() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorElement = document.getElementById('login-error');
      
      errorElement.textContent = '';
      
      if (!email || !password) {
        errorElement.textContent = 'Por favor, preencha todos os campos.';
        return;
      }
      
      try {
        const querySnapshot = await db.collection('employees')
          .where('email', '==', email)
          .where('password', '==', password)
          .get();
        
        if (querySnapshot.empty) {
          errorElement.textContent = 'Credenciais inválidas.';
          return;
        }
        
        currentUser = querySnapshot.docs[0].data();
        currentUser.id = querySnapshot.docs[0].id;
        
        document.getElementById('login-page').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        document.getElementById('welcome-message').textContent = `Bem-vindo, ${currentUser.name}`;
        
        buildSidebarMenu();
        loadPage('dashboard');
        
        
      } catch (error) {
          console.error('Erro detalhado:', error.code, error.message);
          // Tratamento específico para cada erro
          switch(error.code) {
            case 'auth/operation-not-allowed':
              alert('Método de login não habilitado. Contate o administrador.');
              break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
              alert('Credenciais inválidas');
              break;
            default:
              alert('Erro desconhecido: ' + error.message);
          }
      }
    }
    
    // Construir menu lateral baseado nas permissões
    function buildSidebarMenu() {
      const sidebarMenu = document.getElementById('sidebar-menu');
      sidebarMenu.innerHTML = '';
      
      // Adicionar dashboard
      const dashboardLink = document.createElement('a');
      dashboardLink.className = 'nav-link';
      dashboardLink.href = '#';
      dashboardLink.innerHTML = '<i class="fas fa-fw fa-tachometer-alt"></i><span>Dashboard</span>';
      dashboardLink.onclick = () => loadPage('dashboard');
      sidebarMenu.appendChild(dashboardLink);
      
      // Verificar se é Developer (acesso completo)
      const isDeveloper = currentUser.position?.Developer === true;
      
      // Adicionar módulos baseados nas permissões
      Object.entries(collectionsConfig).forEach(([collection, config]) => {
        // Se for Developer ou se a permissão estiver ativa para o módulo
        if (isDeveloper || currentUser.pages?.[collection] === true) {
          const link = document.createElement('a');
          link.className = 'nav-link';
          link.href = '#';
          
          // Definir ícone baseado no tipo
          let iconClass = 'fas fa-fw fa-file';
          if (collection === 'products') iconClass = 'fas fa-fw fa-box-open';
          else if (collection === 'employees') iconClass = 'fas fa-fw fa-users';
          else if (collection === 'order') iconClass = 'fas fa-fw fa-shopping-cart';
          else if (collection === 'clientes') iconClass = 'fas fa-fw fa-address-book';
          
          link.innerHTML = `<i class="${iconClass}"></i><span>${config.name}</span>`;
          link.onclick = () => loadPage(collection);
          sidebarMenu.appendChild(link);
        }
      });
    }
    // Adicionar esta função para atualizar o item ativo no menu
      function updateActiveMenuItem(page) {
          const menuItems = document.querySelectorAll('#sidebar-menu .nav-link');
          menuItems.forEach(item => {
          item.classList.remove('active');
          const pageName = item.textContent.trim().toLowerCase();
          if (page === 'dashboard' && item.innerHTML.includes('fa-tachometer-alt')) {
              item.classList.add('active');
          } else if (pageName.includes(page.toLowerCase())) {
              item.classList.add('active');
          }
          });
      }
    
      // Função para carregar página de CRUD
      async function loadCRUDPage(collection) {
          const dynamicContent = document.getElementById('dynamic-content');
          const config = collectionsConfig[collection];
          
          // Obter dados da coleção
          const snapshot = await db.collection(collection).get();
          const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Gerar HTML da tabela CRUD
          dynamicContent.innerHTML = `
          <div class="card shadow mb-4">
              <div class="card-header py-3 d-flex justify-content-between align-items-center">
              <h6 class="m-0 font-weight-bold text-primary">${config.name}</h6>
              <button class="btn btn-primary btn-sm" onclick="showCRUDModal('add', '${collection}')">
                  <i class="fas fa-plus"></i> Adicionar
              </button>
              </div>
              <div class="card-body">
              <div class="table-responsive">
                  <table class="table table-bordered" width="100%" cellspacing="0">
                  <thead>
                      <tr>
                      ${config.fields.map(field => `<th>${field.label}</th>`).join('')}
                      <th>Ações</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${items.map(item => `
                      <tr>
                          ${config.fields.map(field => `
                          <td>${formatFieldValue(item[field.name], field.type)}</td>
                          `).join('')}
                          <td>
                          <button class="btn btn-sm btn-primary" onclick="showCRUDModal('edit', '${collection}', '${item.id}')">
                              <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn btn-sm btn-danger" onclick="deleteItem('${collection}', '${item.id}')">
                              <i class="fas fa-trash"></i>
                          </button>
                          </td>
                      </tr>
                      `).join('')}
                  </tbody>
                  </table>
              </div>
              </div>
          </div>
          `;
          await resolveReferences();

      }
    
      async function resolveReferences() {
        const refs = document.querySelectorAll('[data-ref][data-type="reference"]');
      
        for (const el of refs) {
          const path = el.getAttribute('data-ref');
          try {
            const doc = await db.doc(path).get();
            el.textContent = doc.exists ? (doc.data()['nome-completo'] || doc.id) : '[Desconhecido]';
          } catch {
            el.textContent = '[Erro]';
          }
        }
      }
      
    
      function formatFieldValue(value, type) {
          if (value === undefined || value === null) return '-';
          
          switch(type) {
            case 'checkbox':
              return value ? '<span class="badge bg-success">Sim</span>' : '<span class="badge bg-secondary">Não</span>';
            case 'date':
            case 'timestamp':
              return value.toDate ? value.toDate().toLocaleString() : new Date(value).toLocaleString();
            case 'reference':
              return value.split('/').pop(); // Mostra apenas o ID da referência
            case 'map':
              return '[Dados Complexos]';
            case 'array':
              return `[${value.length} itens]`;
            default:
              return value.toString();
          }
        }
        
    
    
    // Carregar página dinâmica
    async function loadPage(page) {
      currentPage = page;
      const pageTitle = document.getElementById('page-title');
      const dynamicContent = document.getElementById('dynamic-content');
      
      // Atualizar título da página
      pageTitle.textContent = collectionsConfig[page]?.name || 'Dashboard';
      
      // Atualizar item ativo no menu
      updateActiveMenuItem(page);
      
      // Mostrar estado de carregamento
      showLoadingState();
      
      try {
        if (page === 'dashboard') {
          await loadDashboard();
        } else {
          await loadCRUDPage(page);
        }
      } catch (error) {
        console.error('Erro ao carregar página:', error);
        showErrorState(error);
      } finally {
        hideLoadingState();
      }
    }
    
    // Adicionar estas funções para gerenciar estados de carregamento
  function showLoadingState() {
      const dynamicContent = document.getElementById('dynamic-content');
      dynamicContent.innerHTML = `
        <div class="d-flex justify-content-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando...</span>
          </div>
        </div>
      `;
    }
    
    function hideLoadingState() {
      // O conteúdo será substituído automaticamente quando a página carregar
    }
    
    function showErrorState(error) {
      const dynamicContent = document.getElementById('dynamic-content');
      dynamicContent.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <h4 class="alert-heading">Erro ao carregar a página</h4>
          <p>${error.message || 'Ocorreu um erro desconhecido'}</p>
          <button class="btn btn-primary" onclick="loadPage('${currentPage}')">Tentar novamente</button>
        </div>
      `;
    }
    
    
    // Carregar dashboard com relatórios
    async function loadDashboard() {
      const dynamicContent = document.getElementById('dynamic-content');
      
      // Obter contagens de todas as coleções
      const counts = {};
      for (const collection in collectionsConfig) {
        counts[collection] = await getCollectionCount(collection);
      }
      
      // Obter totais financeiros (se aplicável)
      let totalSales = 0;
      try {
        const salesSnapshot = await db.collection('sales').get();
        salesSnapshot.forEach(doc => {
          totalSales += doc.data().total || 0;
        });
      } catch {
        console.log('Coleção de vendas não encontrada');
      }
    
      // Gerar HTML do dashboard
      dynamicContent.innerHTML = `
        <div class="row mb-4">
          ${Object.entries(collectionsConfig).map(([collection, config]) => `
            <div class="col-xl-3 col-md-6 mb-4">
              <div class="card dashboard-card h-100" onclick="loadPage('${collection}')" style="cursor: pointer;">
                <div class="card-body">
                  <div class="row align-items-center">
                    <div class="col mr-2">
                      <div class="dashboard-card-title">${config.name.toUpperCase()}</div>
                      <div class="dashboard-card-value">${counts[collection]}</div>
                    </div>
                    <div class="col-auto">
                      <i class="dashboard-card-icon fas fa-fw fa-${getIconForCollection(collection)}"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
          ${totalSales > 0 ? `
            <div class="col-xl-3 col-md-6 mb-4">
              <div class="card dashboard-card h-100">
                <div class="card-body">
                  <div class="row align-items-center">
                    <div class="col mr-2">
                      <div class="dashboard-card-title">VENDAS TOTAIS</div>
                      <div class="dashboard-card-value">R$ ${totalSales.toFixed(2)}</div>
                    </div>
                    <div class="col-auto">
                      <i class="dashboard-card-icon fas fa-fw fa-money-bill-wave"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="row">
          <div class="col-lg-12">
            <div class="card shadow mb-4">
              <div class="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 class="m-0 font-weight-bold text-primary">Atividade Recente</h6>
                <button class="btn btn-sm btn-primary" onclick="loadRecentActivity()">
                  <i class="fas fa-sync-alt"></i> Atualizar
                </button>
              </div>
              <div class="card-body">
                <div class="table-responsive">
                  <table class="table table-bordered" width="100%" cellspacing="0">
                    <thead>
                      <tr>
                        <th>Tipo</th>
                        <th>Data/Hora</th>
                        <th>Descrição</th>
                      </tr>
                    </thead>
                    <tbody id="recentActivityBody">
                      <tr>
                        <td colspan="3" class="text-center">
                          <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Carregando...</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Carregar atividade recente
      await loadRecentActivity();
    }
    
    
    // Carregar página de CRUD dinâmica
    async function loadCRUDPage(collection) {
      const dynamicContent = document.getElementById('dynamic-content');
      const config = collectionsConfig[collection];
      
      // Obter dados da coleção
      const snapshot = await db.collection(collection).get();
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Gerar HTML da tabela
      dynamicContent.innerHTML = `
        <div class="card shadow mb-4">
          <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">Lista de ${config.name}</h6>
            <button class="btn btn-primary btn-sm" onclick="showCRUDModal('add', '${collection}')">
              <i class="fas fa-plus"></i> Adicionar ${config.name.singular || config.name}
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-bordered" width="100%" cellspacing="0">
                <thead>
                  <tr>
                    ${config.fields.map(field => `<th>${field.label}</th>`).join('')}
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr>
                      ${config.fields.map(field => `
                        <td>${renderFieldValue(item[field.name], field.type)}</td>
                      `).join('')}
                      <td>
                        <button class="btn btn-sm btn-primary" onclick="showCRUDModal('edit', '${collection}', '${item.id}')">
                          <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteItem('${collection}', '${item.id}')">
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    }
    
    // Mostrar modal de CRUD dinâmico
    window.showCRUDModal = async (action, collection, itemId = null) => {
      const modalTitle = document.getElementById('modalTitle');
      const modalBody = document.getElementById('modalBody');
      const modalSaveBtn = document.getElementById('modalSaveBtn');
      const crudModal = new bootstrap.Modal(document.getElementById('crudModal'));
      
      selectedItemId = itemId;
      const config = collectionsConfig[collection];
      let itemData = {};
      
      // Carregar dados existentes se for edição
      if (action === 'edit' && itemId) {
        const doc = await db.collection(collection).doc(itemId).get();
        if (doc.exists) {
          itemData = doc.data();
        }
      }
      
      // Configurar modal
      modalTitle.textContent = `${action === 'add' ? 'Adicionar' : 'Editar'} ${config.singular || config.name}`;
      
      // Gerar formulário dinâmico
      modalBody.innerHTML = `
        <form id="crudForm">
          ${config.fields.map(field => `
            <div class="mb-3">
              <label for="${field.name}" class="form-label">${field.label}</label>
              ${generateFormField(field, itemData[field.name])}
            </div>
          `).join('')}
        </form>
      `;
      
      // Configurar botão de salvar
      modalSaveBtn.onclick = async () => {
        const formData = {};
        const base64Promises = [];
        const configFields = config.fields;
      
        for (const field of configFields) {
          const element = document.getElementById(field.name);
      
          if (field.type === 'file') {
            if (element.files.length > 0) {
              const file = element.files[0];
              const reader = new FileReader();
      
              const promise = new Promise((resolve) => {
                reader.onloadend = () => {
                  formData[field.name] = reader.result; // base64 string
                  resolve();
                };
              });
      
              reader.readAsDataURL(file);
              base64Promises.push(promise);
            } else if (action === 'edit' && itemData[field.name]) {
              formData[field.name] = itemData[field.name];
            }
          } else if (field.type === 'checkbox') {
            formData[field.name] = element.checked;
          } else if (field.type === 'map') {
            const mapData = {};
            field.subfields.forEach(sub => {
              mapData[sub.name] = document.getElementById(`${field.name}_${sub.name}`).value;
            });
            formData[field.name] = mapData;
          } else if (field.type === 'array') {
            const items = [];
            const itemElements = document.querySelectorAll(`#${field.name}_items select`);
            itemElements.forEach(el => items.push(el.value));
            formData[field.name] = items;
          } else {
            formData[field.name] = element.value;
          }
        }
      
        try {
          await Promise.all(base64Promises); // Aguarda leitura de imagens
      
          // Timestamps
          if (action === 'add') {
            formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          }
          formData.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      
          if (action === 'add') {
            await db.collection(collection).add(formData);
            showToast(`${config.singular} criado com sucesso!`, 'success');
          } else {
            await db.collection(collection).doc(itemId).update(formData);
            showToast(`${config.singular} atualizado com sucesso!`, 'success');
          }
      
          crudModal.hide();
          await loadPage(collection);
      
        } catch (error) {
          console.error('Erro ao salvar:', error);
          showToast(`Erro: ${error.message}`, 'danger');
        }
      };
    
      // Mostrar referências para campos do tipo reference
      await populateReferenceSelects(collection, config);
      
      // Mostrar itens existentes para arrays
      if (itemData.itens) {
        for (const itemId of itemData.itens) {
          await addArrayItem('itens', 'products', itemId);
        }
      }
    
      crudModal.show();
    };
    
    
    // Funções auxiliares
  // Obter contagem de documentos em uma coleção
  async function getCollectionCount(collectionName) {
      try {
        const snapshot = await db.collection(collectionName).get();
        return snapshot.size;
      } catch (error) {
        console.error(`Erro ao contar documentos em ${collectionName}:`, error);
        return 0;
      }
    }
    
    
    function getIconForCollection(collection) {
      switch(collection) {
        case 'products': return 'box-open';
        case 'employees': return 'users';
        case 'order': return 'shopping-cart';
        case 'clientes': return 'address-book';
        default: return 'file';
      }
    }
    
    function renderFieldValue(value, type) {
        if (value === undefined || value === null) return '-';
      
        switch (type) {
          case 'checkbox':
            return value ? 'Sim' : 'Não';
          case 'date':
          case 'datetime':
          case 'timestamp':
            return value.toDate ? value.toDate().toLocaleString() : new Date(value).toLocaleString();
          case 'reference':
            // Exibe o ID, mas pode buscar o nome
            return typeof value === 'string' ? value.split('/').pop() : (value.id || 'Referência');
          case 'map':
            return Object.entries(value).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('');
          case 'array':
            return Array.isArray(value) ? `${value.length} item(s)` : '-';
          default:
            return value.toString();
        }
    }
      
    
    function generateFormField(field, value = '') {
      switch(field.type) {
        case 'file':
          return `
            <input type="file" class="form-control" id="${field.name}" accept="image/*">
            ${value ? `<img src="${value}" class="img-thumbnail mt-2" style="max-height: 100px;">` : ''}
          `;
        case 'reference':
          return `
            <select class="form-select" id="${field.name}" ${field.required ? 'required' : ''}>
              <option value="">Selecione...</option>
              <!-- Opções serão preenchidas via JavaScript -->
            </select>
          `;
        case 'array':
          return `
            <div id="${field.name}_container">
              <button type="button" class="btn btn-sm btn-outline-primary mb-2" 
                onclick="addArrayItem('${field.name}', '${field.collection}')">
                Adicionar ${field.collection}
              </button>
              <div id="${field.name}_items"></div>
            </div>
          `;
        case 'map':
          return field.subfields.map(sub => `
            <div class="mb-2">
              <label for="${field.name}_${sub.name}" class="form-label">${sub.label}</label>
              <input type="${sub.type}" class="form-control" 
                id="${field.name}_${sub.name}" 
                value="${value?.[sub.name] || ''}" 
                ${sub.required ? 'required' : ''}>
            </div>
          `).join('');
        default:
          // Implementação padrão para tipos básicos
          if (field.type === 'checkbox') {
            return `
              <div class="form-check">
                <input class="form-check-input" type="checkbox" 
                  id="${field.name}" ${value ? 'checked' : ''}>
                <label class="form-check-label" for="${field.name}">
                  ${field.label}
                </label>
              </div>
            `;
          } else if (field.type === 'textarea') {
            return `
              <textarea class="form-control" id="${field.name}" 
                ${field.required ? 'required' : ''}>${value || ''}</textarea>
            `;
          } else {
            return `
              <input type="${field.type}" class="form-control" 
                id="${field.name}" value="${value || ''}" 
                ${field.required ? 'required' : ''}>
            `;
          }
      }
    }
    
    
    // Preencher selects de referência
  // Preencher selects de referência
  async function populateReferenceSelects(collection, config) {
      for (const field of config.fields) {
        if (field.type === 'reference') {
          const select = document.getElementById(field.name);
          const snapshot = await db.collection(field.collection).get();
          
          snapshot.docs.forEach(doc => {
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = doc.data()[field.displayField] || doc.id;
            select.appendChild(option);
          });
          
          // Selecionar valor atual se for edição
          if (selectedItemId && itemData[field.name]) {
            select.value = itemData[field.name];
          }
        }
      }
    }
    
    // Adicionar itens a arrays (versão atualizada)
    window.addArrayItem = async (fieldName, collection, itemId = null) => {
      const container = document.getElementById(`${fieldName}_items`);
      const select = document.createElement('select');
      select.className = 'form-select mb-2';
      
      const snapshot = await db.collection(collection).get();
      snapshot.docs.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = doc.data().name || doc.id;
        option.selected = doc.id === itemId;
        select.appendChild(option);
      });
    
      const div = document.createElement('div');
      div.className = 'd-flex align-items-center mb-2';
      div.appendChild(select);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn btn-sm btn-outline-danger ms-2';
      removeBtn.innerHTML = '<i class="fas fa-times"></i>';
      removeBtn.onclick = () => div.remove();
      
      div.appendChild(removeBtn);
      container.appendChild(div);
    };
    
    
    
    // Funções globais
    window.toggleSidebar = () => {
      document.querySelector('.sidebar').classList.toggle('show');
    };
    
    window.logout = () => {
      currentUser = null;
      document.getElementById('app').style.display = 'none';
      document.getElementById('login-page').style.display = 'flex';
      document.getElementById('email').value = '';
      document.getElementById('password').value = '';
    };
    
    window.deleteItem = async (collection, itemId) => {
      const config = collectionsConfig[collection];
      
      if (confirm(`Tem certeza que deseja excluir este ${config.name}?`)) {
        try {
          await db.collection(collection).doc(itemId).delete();
          showToast(`${config.name} excluído com sucesso!`, 'success');
          await loadPage(collection);
        } catch (error) {
          console.error(`Erro ao excluir ${config.name}:`, error);
          showToast(`Erro ao excluir ${config.name}`, 'danger');
        }
      }
    };
    
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `position-fixed bottom-0 end-0 p-3 toast-${type}`;
      toast.style.zIndex = '11';
      toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-header">
            <strong class="me-auto">Notificação</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">
            ${message}
          </div>
        </div>
      `;
      
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
    
    // Função para criar um novo item
  async function createItem(collection, data) {
      try {
        const docRef = await db.collection(collection).add(data);
        showToast(`${collectionsConfig[collection].singular} criado com sucesso!`, 'success');
        return docRef.id;
      } catch (error) {
        console.error(`Erro ao criar ${collectionsConfig[collection].singular}:`, error);
        showToast(`Erro ao criar: ${error.message}`, 'danger');
        throw error;
      }
    }
    
    // Função para atualizar um item
    async function updateItem(collection, id, data) {
      try {
        await db.collection(collection).doc(id).update(data);
        showToast(`${collectionsConfig[collection].singular} atualizado com sucesso!`, 'success');
      } catch (error) {
        console.error(`Erro ao atualizar ${collectionsConfig[collection].singular}:`, error);
        showToast(`Erro ao atualizar: ${error.message}`, 'danger');
        throw error;
      }
    }
    
    // Função para deletar um item
    async function deleteItem(collection, id) {
      if (!confirm(`Tem certeza que deseja excluir este ${collectionsConfig[collection].singular}?`)) {
        return;
      }
    
      try {
        await db.collection(collection).doc(id).delete();
        showToast(`${collectionsConfig[collection].singular} excluído com sucesso!`, 'success');
        await loadPage(collection); // Recarregar a página
      } catch (error) {
        console.error(`Erro ao excluir ${collectionsConfig[collection].singular}:`, error);
        showToast(`Erro ao excluir: ${error.message}`, 'danger');
      }
    }
    function validateForm(config) {
      let isValid = true;
      
      config.fields.forEach(field => {
        if (field.required) {
          const element = document.getElementById(field.name);
          if (!element.value && field.type !== 'checkbox') {
            element.classList.add('is-invalid');
            isValid = false;
          } else {
            element.classList.remove('is-invalid');
          }
        }
      });
      
      return isValid;
    }
    
    async function loadPaginatedData(collection, page = 1, limit = 10) {
      const offset = (page - 1) * limit;
      const snapshot = await db.collection(collection)
        .orderBy('createdAt')
        .limit(limit)
        .offset(offset)
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    async function uploadFile(file, path) {
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`${path}/${Date.now()}_${file.name}`);
      await fileRef.put(file);
      return await fileRef.getDownloadURL();
    }
    
    async function loadRecentActivity() {
      try {
        const activityBody = document.getElementById('recentActivityBody');
        if (!activityBody) return;
    
        // Obter as últimas 10 atividades de todas as coleções
        const recentActivities = [];
        
        for (const collection in collectionsConfig) {
          const snapshot = await db.collection(collection)
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
          
          snapshot.docs.forEach(doc => {
            recentActivities.push({
              type: collectionsConfig[collection].name,
              date: doc.data().createdAt?.toDate() || new Date(),
              description: `Registro ${doc.id.substring(0, 8)}...`,
              data: doc.data()
            });
          });
        }
    
        // Ordenar por data (mais recente primeiro)
        recentActivities.sort((a, b) => b.date - a.date);
        
        // Limitar a 10 atividades
        const limitedActivities = recentActivities.slice(0, 10);
    
        // Preencher a tabela
        activityBody.innerHTML = limitedActivities.map(activity => `
          <tr>
            <td>${activity.type}</td>
            <td>${activity.date.toLocaleString()}</td>
            <td>
              ${getActivityDescription(activity.type, activity.data)}
              <small class="text-muted">${activity.description}</small>
            </td>
          </tr>
        `).join('');
    
      } catch (error) {
        console.error('Erro ao carregar atividades recentes:', error);
        showToast('Erro ao carregar atividades recentes', 'danger');
      }
    }
    
    function getActivityDescription(type, data) {
      switch(type) {
        case 'Produtos':
          return `Produto: ${data.name || 'Sem nome'} (${data.price ? 'R$ ' + data.price.toFixed(2) : 'Sem preço'})`;
        case 'Funcionários':
          return `Funcionário: ${data.name || 'Sem nome'} (${data.position || 'Sem cargo'})`;
        default:
          return `Atividade em ${type}`;
      }
    }
    
