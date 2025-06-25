const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

const Database = require('./database/Database');
const Logger = require('./utils/Logger');
const ErrorHandler = require('./utils/ErrorHandler');

// Importar models
const Usuario = require('./models/Usuario');
const Evento = require('./models/Evento');
const Categoria = require('./models/Categoria');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar EJS como template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuração de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de sessões
app.use(session({
  secret: process.env.SESSION_SECRET || 'agenda-eletronica-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.mensagem = req.session.mensagem || null;
  res.locals.erro = req.session.erro || null;
  
  delete req.session.mensagem;
  delete req.session.erro;
  
  next();
});


app.get('/', (req, res) => {
  res.render('index', {
    titulo: 'Agenda Eletrônica',
    usuario: req.session.usuario
  });
});

app.get('/login', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/dashboard');
  }
  res.render('login', { titulo: 'Login' });
});

app.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      req.session.erro = 'Email e senha são obrigatórios';
      return res.redirect('/login');
    }

    // Buscar usuário
    const resultado = await Usuario.buscarPorEmail(email);
    if (!resultado.sucesso || !resultado.dados) {
      req.session.erro = 'Email ou senha incorretos';
      return res.redirect('/login');
    }

    const usuario = resultado.dados;
    
    // Verificar senha (simplificado - na versão real usaria bcrypt)
    if (usuario.senha !== senha) {
      req.session.erro = 'Email ou senha incorretos';
      return res.redirect('/login');
    }

    // Criar sessão
    req.session.usuario = {
      id: usuario._id.toString(),
      nome: usuario.nome,
      email: usuario.email
    };

    req.session.mensagem = `Bem-vindo, ${usuario.nome}!`;
    res.redirect('/dashboard');

  } catch (erro) {
    Logger.registrarErro('Erro no login', erro);
    req.session.erro = 'Erro interno do servidor';
    res.redirect('/login');
  }
});

app.get('/register', (req, res) => {
  if (req.session.usuario) {
    return res.redirect('/dashboard');
  }
  res.render('register', { titulo: 'Cadastro' });
});

app.post('/register', async (req, res) => {
  try {
    const { nome, email, senha, confirmarSenha } = req.body;
    
    // Validações básicas
    if (!nome || !email || !senha || !confirmarSenha) {
      req.session.erro = 'Todos os campos são obrigatórios';
      return res.redirect('/register');
    }
    
    if (senha !== confirmarSenha) {
      req.session.erro = 'As senhas não conferem';
      return res.redirect('/register');
    }
    
    if (senha.length < 6) {
      req.session.erro = 'A senha deve ter pelo menos 6 caracteres';
      return res.redirect('/register');
    }

    // Verificar se usuário já existe
    const usuarioExistente = await Usuario.buscarPorEmail(email);
    if (usuarioExistente.sucesso && usuarioExistente.dados) {
      req.session.erro = 'Usuário já cadastrado com este email';
      return res.redirect('/register');
    }

    // Criar usuário
    const resultado = await Usuario.criar({ nome, email, senha });
    
    if (!resultado.sucesso) {
      req.session.erro = resultado.erro.mensagem;
      return res.redirect('/register');
    }

    req.session.mensagem = 'Usuário cadastrado com sucesso! Faça login.';
    res.redirect('/login');

  } catch (erro) {
    Logger.registrarErro('Erro no registro', erro);
    req.session.erro = 'Erro interno do servidor';
    res.redirect('/register');
  }
});

function requireAuth(req, res, next) {
  if (!req.session.usuario) {
    req.session.erro = 'Você precisa fazer login para acessar esta página';
    return res.redirect('/login');
  }
  next();
}

app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;

    const resultadoEventos = await Evento.listarPorUsuario(usuarioId);
    const eventos = resultadoEventos.sucesso ? resultadoEventos.dados : [];

    const resultadoCategorias = await Categoria.listarPorUsuario(usuarioId);
    const categorias = resultadoCategorias.sucesso ? resultadoCategorias.dados : [];

    res.render('dashboard', {
      titulo: 'Dashboard',
      eventos: eventos,
      categorias: categorias
    });

  } catch (erro) {
    Logger.registrarErro('Erro no dashboard', erro);
    req.session.erro = 'Erro ao carregar dashboard';
    res.redirect('/login');
  }
});

app.get('/eventos/novo', requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const resultadoCategorias = await Categoria.listarPorUsuario(usuarioId);
    const categorias = resultadoCategorias.sucesso ? resultadoCategorias.dados : [];

    res.render('evento-form', {
      titulo: 'Criar Evento',
      evento: null,
      categorias: categorias,
      acao: 'criar'
    });
  } catch (erro) {
    Logger.registrarErro('Erro ao carregar formulário de evento', erro);
    req.session.erro = 'Erro ao carregar página';
    res.redirect('/dashboard');
  }
});

app.post('/eventos', requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const { titulo, descricao, dataInicio, dataFim, local, categoriaId } = req.body;

    if (!titulo || !dataInicio) {
      req.session.erro = 'Título e data de início são obrigatórios';
      return res.redirect('/eventos/novo');
    }

    const dadosEvento = {
      titulo,
      descricao,
      dataInicio: new Date(dataInicio),
      local,
      usuarioId
    };

    if (dataFim) {
      dadosEvento.dataFim = new Date(dataFim);
    }

    if (categoriaId) {
      dadosEvento.categoriaId = categoriaId;
    }

    const resultado = await Evento.criar(dadosEvento);

    if (!resultado.sucesso) {
      req.session.erro = resultado.erro.mensagem;
      return res.redirect('/eventos/novo');
    }

    req.session.mensagem = 'Evento criado com sucesso!';
    res.redirect('/dashboard');

  } catch (erro) {
    Logger.registrarErro('Erro ao criar evento', erro);
    req.session.erro = 'Erro ao criar evento';
    res.redirect('/eventos/novo');
  }
});

app.get('/categorias/nova', requireAuth, (req, res) => {
  res.render('categoria-form', {
    titulo: 'Criar Categoria',
    categoria: null,
    acao: 'criar'
  });
});

app.post('/categorias', requireAuth, async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id;
    const { nome, cor, descricao } = req.body;

    if (!nome) {
      req.session.erro = 'Nome da categoria é obrigatório';
      return res.redirect('/categorias/nova');
    }

    const dadosCategoria = {
      nome,
      cor: cor || '#3498db',
      descricao,
      usuarioId
    };

    const resultado = await Categoria.criar(dadosCategoria);

    if (!resultado.sucesso) {
      req.session.erro = resultado.erro.mensagem;
      return res.redirect('/categorias/nova');
    }

    req.session.mensagem = 'Categoria criada com sucesso!';
    res.redirect('/dashboard');

  } catch (erro) {
    Logger.registrarErro('Erro ao criar categoria', erro);
    req.session.erro = 'Erro ao criar categoria';
    res.redirect('/categorias/nova');
  }
});

app.get('/eventos/:id/editar', requireAuth, async (req, res) => {
  try {
    const eventoId = req.params.id;
    const usuarioId = req.session.usuario.id;

    const resultadoEvento = await Evento.buscarPorId(eventoId);
    if (!resultadoEvento.sucesso || !resultadoEvento.dados) {
      req.session.erro = 'Evento não encontrado';
      return res.redirect('/dashboard');
    }

    const evento = resultadoEvento.dados;
    
    if (evento.usuarioId !== usuarioId) {
      req.session.erro = 'Você não tem permissão para editar este evento';
      return res.redirect('/dashboard');
    }

    const resultadoCategorias = await Categoria.listarPorUsuario(usuarioId);
    const categorias = resultadoCategorias.sucesso ? resultadoCategorias.dados : [];

    res.render('evento-form', {
      titulo: 'Editar Evento',
      evento: evento,
      categorias: categorias,
      acao: 'editar'
    });

  } catch (erro) {
    Logger.registrarErro('Erro ao carregar evento para edição', erro);
    req.session.erro = 'Erro ao carregar evento';
    res.redirect('/dashboard');
  }
});

app.put('/eventos/:id', requireAuth, async (req, res) => {
  try {
    const eventoId = req.params.id;
    const usuarioId = req.session.usuario.id;
    const { titulo, descricao, dataInicio, dataFim, local, categoriaId } = req.body;

    const resultadoEvento = await Evento.buscarPorId(eventoId);
    if (!resultadoEvento.sucesso || !resultadoEvento.dados) {
      req.session.erro = 'Evento não encontrado';
      return res.redirect('/dashboard');
    }

    if (resultadoEvento.dados.usuarioId !== usuarioId) {
      req.session.erro = 'Você não tem permissão para editar este evento';
      return res.redirect('/dashboard');
    }

    if (!titulo || !dataInicio) {
      req.session.erro = 'Título e data de início são obrigatórios';
      return res.redirect(`/eventos/${eventoId}/editar`);
    }

    const dadosEvento = {
      titulo,
      descricao,
      dataInicio: new Date(dataInicio),
      local
    };

    if (dataFim) {
      dadosEvento.dataFim = new Date(dataFim);
    }

    if (categoriaId) {
      dadosEvento.categoriaId = categoriaId;
    }

    const resultado = await Evento.atualizar(eventoId, dadosEvento);

    if (!resultado.sucesso) {
      req.session.erro = resultado.erro.mensagem;
      return res.redirect(`/eventos/${eventoId}/editar`);
    }

    req.session.mensagem = 'Evento atualizado com sucesso!';
    res.redirect('/dashboard');

  } catch (erro) {
    Logger.registrarErro('Erro ao atualizar evento', erro);
    req.session.erro = 'Erro ao atualizar evento';
    res.redirect('/dashboard');
  }
});

app.post('/eventos/:id/excluir', requireAuth, async (req, res) => {
  try {
    const eventoId = req.params.id;
    const usuarioId = req.session.usuario.id;

    const resultadoEvento = await Evento.buscarPorId(eventoId);
    if (!resultadoEvento.sucesso || !resultadoEvento.dados) {
      req.session.erro = 'Evento não encontrado';
      return res.redirect('/dashboard');
    }

    if (resultadoEvento.dados.usuarioId !== usuarioId) {
      req.session.erro = 'Você não tem permissão para excluir este evento';
      return res.redirect('/dashboard');
    }

    const resultado = await Evento.excluir(eventoId);

    if (!resultado.sucesso) {
      req.session.erro = resultado.erro.mensagem;
    } else {
      req.session.mensagem = 'Evento excluído com sucesso!';
    }

    res.redirect('/dashboard');

  } catch (erro) {
    Logger.registrarErro('Erro ao excluir evento', erro);
    req.session.erro = 'Erro ao excluir evento';
    res.redirect('/dashboard');
  }
});

app.use('/eventos/:id', (req, res, next) => {
  if (req.body && req.body._method === 'PUT') {
    req.method = 'PUT';
    delete req.body._method;
  }
  next();
});

app.use('/categorias/:id', (req, res, next) => {
  if (req.body && req.body._method === 'PUT') {
    req.method = 'PUT';
    delete req.body._method;
  }
  next();
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      Logger.registrarErro('Erro ao fazer logout', err);
    }
    res.redirect('/');
  });
});

// Função para inicializar o servidor
async function iniciarServidor() {
  try {
    await Database.conectar();
    Logger.registrarInfo('Conectado ao banco de dados MongoDB');

    app.listen(PORT, () => {
      Logger.registrarInfo(`Servidor iniciado na porta ${PORT}`);
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📱 Acesse: http://localhost:${PORT}`);
    });

  } catch (erro) {
    Logger.registrarErro('Erro ao iniciar o servidor', erro);
    console.error('❌ Erro ao iniciar o servidor:', erro.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  Logger.registrarInfo('Encerrando servidor...');
  console.log('\n🛑 Encerrando servidor...');
  
  try {
    await Database.desconectar();
    Logger.registrarInfo('Desconectado do banco de dados');
    console.log('✅ Servidor encerrado com sucesso');
    process.exit(0);
  } catch (erro) {
    Logger.registrarErro('Erro ao encerrar servidor', erro);
    process.exit(1);
  }
});

iniciarServidor();

module.exports = app;