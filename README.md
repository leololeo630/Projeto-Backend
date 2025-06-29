# 📅 Agenda Eletrônica - Projeto 2

**Integrantes:**
- 👨‍💻 Igor Gustavo Mainardes Ra:2389495
- 👨‍💻 Leonardo Rodrigues de Oliveira Ra:2349779

## 🌟 Visão Geral

Este projeto implementa uma aplicação web utilizando as classes do Projeto 1 da disciplina, juntamente com o framework Express.js. A aplicação permite o gerenciamento de uma agenda eletrônica (similar ao Google Calendar) através de uma **interface web completa** usando templates EJS.

## ⚠️ Importante: 

Este projeto foi desenvolvido utilizando as seguintes tecnologias:
- ✅ Node.js
- ✅ Express.js
- ✅ MongoDB
- ✅ Sistema de sessões para autenticação
- ✅ EJS (Templates) para interface web
- ✅ Bootstrap 5 para UI moderna

## 📂 Estrutura do Projeto

O projeto está organizado da seguinte forma:

```
Projeto-Backend/
├── src/
│   ├── app.js              # Aplicação Express principal
│   ├── models/
│   │   ├── Usuario.js      # Classe para gerenciamento de usuários
│   │   ├── Evento.js       # Classe para gerenciamento de eventos
│   │   └── Categoria.js    # Classe para gerenciamento de categorias
│   ├── database/
│   │   └── Database.js     # Classe para conexão com o banco de dados
│   ├── middlewares/
│   │   ├── auth.js         # Middleware de autenticação
│   │   └── error.js        # Middleware de tratamento de erros
│   ├── utils/
│   │   ├── ErrorHandler.js # Classe para tratamento de erros
│   │   └── Logger.js       # Classe para registro de logs
│   └── views/              # Templates EJS para interface web
│       ├── layout.ejs      # Layout base
│       ├── index.ejs       # Página inicial
│       ├── login.ejs       # Página de login
│       ├── register.ejs    # Página de cadastro
│       ├── dashboard.ejs   # Dashboard principal
│       ├── evento-form.ejs # Formulário de eventos
│       └── categoria-form.ejs # Formulário de categorias
├── logs/                   # Diretório para armazenamento de logs
├── package.json            # Dependências do projeto
└── README.md               # Documentação
```

## 🚀 Funcionalidades Implementadas

### 🌐 Interface Web Completa
- **Página Inicial** - Apresentação do sistema
- **Sistema de Autenticação** - Login, cadastro e logout
- **Dashboard Interativo** - Visão geral com estatísticas
- **Gerenciamento de Eventos** - Criar, editar, excluir e visualizar
- **Gerenciamento de Categorias** - Organização com cores personalizadas
- **Design Responsivo** - Interface moderna com Bootstrap 5

### 🔐 Sistema de Autenticação
- Registro de usuários com validação
- Login e logout com sessões
- Controle de acesso às páginas protegidas
- Mensagens de feedback visuais

### 🎨 Interface Moderna
- **Bootstrap 5** para design responsivo
- **Font Awesome** para ícones
- **Gradientes CSS** para visual atrativo
- **Alertas dinâmicos** para feedback do usuário
- **Navegação intuitiva** entre páginas

### Segurança
- Validação de campos obrigatórios
- Middleware de autenticação
- Headers de segurança

## 💻 Requisitos

- Node.js 14.x ou superior
- MongoDB 4.x ou superior

## 🚀 Como Usar

### Instalação

1. Clone o repositório

2. Instale as dependências:
```bash
npm install
```

3. Certifique-se de que o MongoDB está em execução na sua máquina

4. Execute a aplicação:
```bash
npm start
```

A aplicação estará disponível em: `http://localhost:3000`

### 🌐 Páginas Principais

- **GET** `/` - Página inicial
- **GET** `/login` - Página de login
- **GET** `/register` - Página de cadastro
- **GET** `/dashboard` - Dashboard principal (requer login)
- **GET** `/eventos/novo` - Criar novo evento
- **GET** `/categorias/nova` - Criar nova categoria

## 🛡️ Tratamento de Erros e Validação

O projeto implementa:

1. ✅ **Validação de Campos Obrigatórios**: Verificação de todos os campos necessários
2. ✅ **Validação de Tipos de Dados**: Garantia da integridade dos dados
3. ✅ **Tratamento de Exceções**: Captura e tratamento de erros
4. ✅ **Logs de Sistema**: Registro de operações e erros
5. ✅ **Respostas Padronizadas**: Formato consistente de retorno

## 🎓 Considerações Finais

Esta aplicação web foi desenvolvida como parte do Projeto 2 da disciplina de Programação Web Back-End, implementando uma interface web completa para gerenciamento de agenda eletrônica, utilizando as classes desenvolvidas no Projeto 1, o framework Express.js e templates EJS para renderização server-side.

---

### 👨‍💻 Desenvolvedores
- Igor Gustavo Mainardes
- Leonardo Rodrigues de Oliveira
