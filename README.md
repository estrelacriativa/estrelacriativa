# ⭐ Estrela Criativa — Prof. Ataíse (Vite + React)

Catálogo online e área administrativa da **Estrela Criativa — Papelaria Personalizada & Pedagógica**, estruturado com **Vite + React** e **React Router**.

## 🚀 Como Executar o Projeto

No terminal, dentro da pasta do projeto:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Gerar build otimizado para produção (pasta dist/)
npm run build
```

> **Dica (Windows PowerShell):** Caso o PowerShell bloqueie scripts `npm.ps1`, utilize `npm.cmd run dev` ou `npm.cmd run build`.

---

## 🗂️ Estrutura de Pastas

```text
├── public/                       # Imagens oficiais, logos e dados-loja.js
├── src/
│   ├── components/               # Componentes reutilizáveis e interativos
│   │   ├── admin/                # Componentes exclusivos da Área Admin
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminHeader.jsx
│   │   │   ├── AdminStats.jsx
│   │   │   ├── AdminProductForm.jsx
│   │   │   ├── AdminProductList.jsx
│   │   │   ├── AdminCategoryManager.jsx
│   │   │   └── AdminSettings.jsx
│   │   ├── layout/               # Topo, Cabeçalho e Rodapé
│   │   │   ├── Topbar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── store/                # Cards, Modal de Personalização, Sacola e Botão WhatsApp
│   │   │   ├── ProductCard.jsx
│   │   │   ├── CustomModal.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   └── FloatingWhatsApp.jsx
│   │   └── ui/                   # Feedback visual
│   │       └── Toast.jsx
│   ├── sections/                 # Seções da página principal (Loja)
│   │   ├── HeroSection.jsx
│   │   ├── TrustBar.jsx
│   │   ├── DepartmentsSection.jsx
│   │   ├── CatalogSection.jsx
│   │   ├── FinishesSection.jsx
│   │   ├── StepsSection.jsx
│   │   ├── TestimonialsSection.jsx
│   │   └── FaqSection.jsx
│   ├── pages/                    # Páginas roteadas
│   │   ├── StorePage.jsx         # Loja pública (rota "/")
│   │   └── AdminPage.jsx         # Área Administrativa (rota "/admin")
│   ├── context/
│   │   └── StoreContext.jsx      # Estado global (produtos, categorias, carrinho, configs)
│   ├── data/
│   │   └── defaultStoreData.js   # Catálogo inicial, categorias e textos das seções
│   ├── utils/
│   │   ├── formatters.js         # Formatação de moeda (R$), telefone e slugs
│   │   └── imageUpload.js        # Redimensionamento automático de fotos via Canvas
│   ├── styles/
│   │   ├── global.css            # Variáveis e estilos da vitrine
│   │   └── admin.css             # Estilos do painel administrativo
│   ├── App.jsx                   # Definição de rotas
│   └── main.jsx                  # Ponto de entrada React
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔒 Acesso à Área Administrativa

- **Rota:** `/admin` (ou clique em **🔒 Painel Administrativo** no rodapé da loja)
- **Senha padrão inicial:** `estrela2026` *(pode ser alterada na aba Configurações do painel)*

