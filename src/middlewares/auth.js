const Logger = require('../utils/Logger');

function authMiddleware(req, res, next) {
  try {
    // Verificar se existe uma sessão e se o usuário está logado
    if (!req.session || !req.session.usuario) {
      Logger.registrarAviso('Tentativa de acesso não autorizado', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        sessionId: req.sessionID
      });

      return res.status(401).json({
        sucesso: false,
        erro: {
          codigo: 'NAO_AUTORIZADO',
          mensagem: 'Acesso negado. Faça login para continuar.',
          detalhes: 'Sessão não encontrada ou expirada'
        }
      });
    }

    // Verificar se a sessão não expirou
    const agora = new Date();
    const ultimaAtividade = new Date(req.session.ultimaAtividade || req.session.cookie.expires);
    
    if (agora > ultimaAtividade) {
      // Sessão expirou
      req.session.destroy((err) => {
        if (err) {
          Logger.registrarErro('Erro ao destruir sessão expirada', err);
        }
      });

      return res.status(401).json({
        sucesso: false,
        erro: {
          codigo: 'SESSAO_EXPIRADA',
          mensagem: 'Sua sessão expirou. Faça login novamente.',
          detalhes: 'Sessão expirada por inatividade'
        }
      });
    }

    // Atualizar última atividade
    req.session.ultimaAtividade = agora;

    req.usuario = req.session.usuario;

    Logger.registrarInfo('Acesso autorizado', {
      usuarioId: req.usuario.id,
      usuarioNome: req.usuario.nome,
      url: req.url,
      method: req.method
    });

    next();

  } catch (erro) {
    Logger.registrarErro('Erro no middleware de autenticação', erro);
    
    return res.status(500).json({
      sucesso: false,
      erro: {
        codigo: 'ERRO_AUTENTICACAO',
        mensagem: 'Erro interno no sistema de autenticação',
        detalhes: 'Tente novamente em alguns instantes'
      }
    });
  }
}

function authOptionalMiddleware(req, res, next) {
  try {
    if (req.session && req.session.usuario) {
      req.usuario = req.session.usuario;
      req.session.ultimaAtividade = new Date();
    }
    next();
  } catch (erro) {
    Logger.registrarErro('Erro no middleware de autenticação opcional', erro);
    next(); 
  }
}

module.exports = {
  authMiddleware,
  authOptionalMiddleware
};
