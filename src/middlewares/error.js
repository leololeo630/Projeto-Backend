const Logger = require('../utils/Logger');

function errorMiddleware(err, req, res, next) {

  Logger.registrarErro('Erro capturado pelo middleware global', err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    usuario: req.usuario ? req.usuario.nome : 'Não autenticado'
  });


  if (err.type === 'validation') {
    return res.status(400).json({
      sucesso: false,
      erro: {
        codigo: 'ERRO_VALIDACAO',
        mensagem: 'Dados inválidos fornecidos',
        detalhes: err.errors || 'Verifique os dados enviados'
      }
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      sucesso: false,
      erro: {
        codigo: 'JSON_INVALIDO',
        mensagem: 'Formato JSON inválido',
        detalhes: 'Verifique a sintaxe do JSON enviado'
      }
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    let mensagem = 'Erro no banco de dados';
    let codigo = 'ERRO_BANCO_DADOS';

    if (err.code === 11000) {
      mensagem = 'Dados duplicados encontrados';
      codigo = 'DADOS_DUPLICADOS';
      
      return res.status(409).json({
        sucesso: false,
        erro: {
          codigo,
          mensagem,
          detalhes: 'Um registro com esses dados já existe'
        }
      });
    }

    return res.status(500).json({
      sucesso: false,
      erro: {
        codigo,
        mensagem,
        detalhes: 'Erro interno do servidor'
      }
    });
  }

  if (err.codigo) {
    const statusCode = err.statusCode || 500;
    return res.status(statusCode).json({
      sucesso: false,
      erro: {
        codigo: err.codigo,
        mensagem: err.mensagem || 'Erro interno do servidor',
        detalhes: err.detalhes || 'Tente novamente em alguns instantes'
      }
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const mensagem = statusCode === 500 ? 'Erro interno do servidor' : err.message;

  res.status(statusCode).json({
    sucesso: false,
    erro: {
      codigo: 'ERRO_INTERNO',
      mensagem,
      detalhes: statusCode === 500 
        ? 'Ocorreu um erro inesperado. Tente novamente em alguns instantes.' 
        : err.message
    }
  });
}

module.exports = errorMiddleware;
