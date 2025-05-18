# Agenda Eletrônica
Integrantes: 
Igor Gustavo Mainardes Ra: 2389495
Leonardo Rodrigues de Oliveira Ra:2389495

## Visão Geral

Este projeto implementa um conjunto de classes para acesso a SGDBs utilizando Node.js, focada na temática de agenda eletrônica (similar ao Google Calendar). A biblioteca permite o armazenamento e busca de eventos em um calendário, com funcionalidades de gerenciamento de usuários, eventos e categorias.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

```
Projeto-Backend/
├── src/
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Evento.js
│   │   └── Categoria.js
│   ├── database/
│   │   └── Database.js
│   ├── utils/
│   │   ├── ErrorHandler.js
│   │   └── Logger.js
│   └── index.js
├── logs/
│   └── error.log
├── package.json
└── README.md
```

## Classes Implementadas

### 1. Classe Usuario

Representa os usuários da agenda eletrônica.

#### Atributos:
- `id`: Identificador único do usuário (gerado automaticamente)
- `nome`: Nome completo do usuário (obrigatório)
- `email`: Email do usuário (obrigatório, único)
- `senha`: Senha do usuário (obrigatório)
- `dataCriacao`: Data de criação do registro (gerado automaticamente)
- `dataAtualizacao`: Data da última atualização (gerado automaticamente)

#### Métodos:
- `criar(dados)`: Insere um novo usuário no banco de dados
- `buscarPorId(id)`: Busca um usuário pelo ID
- `buscarPorEmail(email)`: Busca um usuário pelo email
- `listarTodos()`: Lista todos os usuários cadastrados
- `atualizar(id, dados)`: Atualiza os dados de um usuário
- `excluir(id)`: Remove um usuário do banco de dados

### 2. Classe Evento

Representa os eventos na agenda eletrônica.

#### Atributos:
- `id`: Identificador único do evento (gerado automaticamente)
- `titulo`: Título do evento (obrigatório)
- `descricao`: Descrição detalhada do evento
- `dataInicio`: Data e hora de início do evento (obrigatório)
- `dataFim`: Data e hora de término do evento
- `local`: Local do evento
- `usuarioId`: ID do usuário proprietário do evento (obrigatório)
- `categoriaId`: ID da categoria do evento
- `recorrencia`: Padrão de recorrência do evento (diário, semanal, mensal, etc.)
- `lembrete`: Tempo de antecedência para notificação
- `dataCriacao`: Data de criação do registro (gerado automaticamente)
- `dataAtualizacao`: Data da última atualização (gerado automaticamente)

#### Métodos:
- `criar(dados)`: Insere um novo evento no banco de dados
- `buscarPorId(id)`: Busca um evento pelo ID
- `listarPorUsuario(usuarioId)`: Lista todos os eventos de um usuário
- `listarPorPeriodo(dataInicio, dataFim)`: Lista eventos em um período específico
- `listarPorCategoria(categoriaId)`: Lista eventos de uma categoria específica
- `atualizar(id, dados)`: Atualiza os dados de um evento
- `excluir(id)`: Remove um evento do banco de dados

### 3. Classe Categoria

Representa as categorias para classificação dos eventos.

#### Atributos:
- `id`: Identificador único da categoria (gerado automaticamente)
- `nome`: Nome da categoria (obrigatório)
- `cor`: Cor associada à categoria (para visualização no calendário)
- `descricao`: Descrição da categoria
- `usuarioId`: ID do usuário proprietário da categoria (obrigatório)
- `dataCriacao`: Data de criação do registro (gerado automaticamente)
- `dataAtualizacao`: Data da última atualização (gerado automaticamente)

#### Métodos:
- `criar(dados)`: Insere uma nova categoria no banco de dados
- `buscarPorId(id)`: Busca uma categoria pelo ID
- `listarPorUsuario(usuarioId)`: Lista todas as categorias de um usuário
- `atualizar(id, dados)`: Atualiza os dados de uma categoria
- `excluir(id)`: Remove uma categoria do banco de dados

### 4. Classe Database

Responsável pela conexão e operações com o banco de dados.

#### Métodos:
- `conectar()`: Estabelece conexão com o banco de dados
- `desconectar()`: Encerra a conexão com o banco de dados
- `executarQuery(model, operacao, parametros)`: Executa uma query no banco de dados
- `iniciarTransacao()`: Inicia uma transação no banco de dados
- `confirmarTransacao(sessao)`: Confirma uma transação no banco de dados
- `reverterTransacao(sessao)`: Reverte uma transação no banco de dados

### 5. Classe ErrorHandler

Responsável pelo tratamento centralizado de erros.

#### Métodos:
- `tratarErro(erro, contexto)`: Processa o erro, registra no log e retorna uma resposta padronizada
- `validarCamposObrigatorios(dados, campos)`: Valida se todos os campos obrigatórios estão preenchidos
- `validarTiposDados(dados, tipos)`: Valida se os tipos de dados estão corretos

### 6. Classe Logger

Responsável pelo registro de logs do sistema.

#### Métodos:
- `registrarInfo(mensagem, dados)`: Registra informações no log
- `registrarErro(mensagem, erro, contexto)`: Registra erros no log
- `registrarAviso(mensagem, dados)`: Registra avisos no log
- `salvarLog()`: Salva os logs em arquivo

## Tratamento de Erros e Logs

O Projeto implementa um sistema robusto de tratamento de erros e logs:

1. **Validação de Campos Obrigatórios**: Todos os métodos de criação e atualização verificam se os campos obrigatórios estão preenchidos.

2. **Validação de Tipos de Dados**: Os tipos de dados são validados para garantir a integridade das informações.

3. **Tratamento de Exceções**: Todas as operações são envolvidas em blocos try/catch para capturar e tratar exceções.

4. **Logs de Erros**: Todos os erros são registrados em arquivos de log para posterior análise.

5. **Respostas Padronizadas**: Todas as operações retornam respostas padronizadas, facilitando o tratamento pelo cliente.

## Como Usar

### Instalação

```bash
npm install 
```
## Requisitos

- Node.js 14.x ou superior
- MongoDB 4.x ou superior

## Dependências

- mongoose: Para conexão e operações com o MongoDB

## Considerações Finais

Esta biblioteca foi desenvolvida como parte do Projeto 1 da disciplina de Programação Web Back-End, seguindo os requisitos especificados. Ela implementa as funcionalidades básicas de uma agenda eletrônica, com foco no armazenamento e busca de eventos em um calendário.
