# ⭐ Estrela Criativa — Prof. Ataíse (Vite + React + TypeScript)

Catálogo online e área administrativa da **Estrela Criativa — Papelaria Personalizada & Pedagógica**, estruturado com **Vite + React + TypeScript** e **React Router**.

## 🚀 Como Executar o Projeto

No terminal, dentro da pasta do projeto:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Checar tipagens TypeScript
npm run typecheck

# 4. Gerar build otimizado para produção (pasta dist/)
npm run build
```

> **Dica (Windows PowerShell):** Caso o PowerShell bloqueie scripts `npm.ps1`, utilize `npm.cmd run dev` ou `npm.cmd run build`.

---

## 🗂️ Estrutura de Pastas

```text
├── public/                       # Imagens oficiais, logos e dados-loja.js
├── src/
│   ├── types/
│   │   └── store.ts              # Interfaces e tipagens TypeScript da loja e admin
│   ├── components/               # Componentes reutilizáveis e interativos (.tsx)
│   │   ├── admin/                # Componentes exclusivos da Área Admin
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── AdminStats.tsx
│   │   │   ├── AdminProductForm.tsx
│   │   │   ├── AdminProductList.tsx
│   │   │   ├── AdminCategoryManager.tsx
│   │   │   └── AdminSettings.tsx
│   │   ├── layout/               # Topo, Cabeçalho e Rodapé
│   │   │   ├── Topbar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── store/                # Cards, Modal de Personalização, Sacola e Botão WhatsApp
│   │   │   ├── ProductCard.tsx
│   │   │   ├── CustomModal.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   └── FloatingWhatsApp.tsx
│   │   └── ui/                   # Feedback visual
│   │       └── Toast.tsx
│   ├── sections/                 # Seções da página principal (Loja)
│   │   ├── HeroSection.tsx
│   │   ├── TrustBar.tsx
│   │   ├── DepartmentsSection.tsx
│   │   ├── CatalogSection.tsx
│   │   ├── FinishesSection.tsx
│   │   ├── StepsSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── FaqSection.tsx
│   ├── pages/                    # Páginas roteadas
│   │   ├── StorePage.tsx         # Loja pública (rota "/")
│   │   └── AdminPage.tsx         # Área Administrativa (rota "/admin")
│   ├── context/
│   │   └── StoreContext.tsx      # Estado global tipado (produtos, categorias, carrinho, configs)
│   ├── data/
│   │   └── defaultStoreData.ts   # Catálogo inicial, categorias e textos das seções
│   ├── utils/
│   │   ├── formatters.ts         # Formatação de moeda (R$), telefone e slugs
│   │   └── imageUpload.ts        # Redimensionamento automático de fotos via Canvas
│   ├── styles/
│   │   ├── global.css            # Variáveis e estilos da vitrine
│   │   └── admin.css             # Estilos do painel administrativo
│   ├── App.tsx                   # Definição de rotas
│   ├── main.tsx                  # Ponto de entrada React
│   └── vite-env.d.ts             # Tipagens de ambiente Vite e Window
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🔒 Acesso à Área Administrativa

- **Rota:** `/admin` (ou clique em **🔒 Painel Administrativo** no rodapé da loja)
- **Senha padrão inicial:** `estrela2026` *(pode ser alterada na aba Configurações do painel)*
