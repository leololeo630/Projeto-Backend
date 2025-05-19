
class ErrorHandler {
  constructor() {
    this.logger = require('./Logger');
  }

  tratarErro(erro, contexto = 'Operação') {
    // Registrar o erro no log
    this.logger.registrarErro(`Erro em ${contexto}`, erro);

    // Determinar o tipo de erro
    let mensagem = 'Ocorreu um erro interno';
    let codigo = 500;

    if (erro.message.includes('validação')) {
      mensagem = 'Erro de validação de dados';
      codigo = 400;
    } else if (erro.message.includes('ID inválido')) {
      mensagem = 'Formato de ID inválido';
      codigo = 400;
    } else if (erro.message.includes('duplicate key') || erro.code === 11000) {
      mensagem = 'Registro duplicado';
      codigo = 409;
    } else if (erro.message.includes('obrigatório')) {
      mensagem = erro.message;
      codigo = 400;
    }

    // Retornar resposta padronizada
    return {
      sucesso: false,
      erro: {
        codigo,
        mensagem,
        detalhes: process.env.NODE_ENV !== 'production' ? erro.message : undefined
      }
    };
  }

  validarCamposObrigatorios(dados, campos) {
    for (const campo of campos) {
      if (dados[campo] === undefined || dados[campo] === null || dados[campo] === '') {
        throw new Error(`O campo '${campo}' é obrigatório`);
      }
    }
  }

  validarTiposDados(dados, tipos) {
    for (const [campo, tipo] of Object.entries(tipos)) {
      if (dados[campo] !== undefined && dados[campo] !== null) {
        let tipoValido = true;

        switch (tipo) {
          case 'string':
            tipoValido = typeof dados[campo] === 'string';
            break;
          case 'number':
            tipoValido = typeof dados[campo] === 'number' && !isNaN(dados[campo]);
            break;
          case 'boolean':
            tipoValido = typeof dados[campo] === 'boolean';
            break;
          case 'date':
            tipoValido = dados[campo] instanceof Date || !isNaN(new Date(dados[campo]).getTime());
            break;
          case 'array':
            tipoValido = Array.isArray(dados[campo]);
            break;
          case 'object':
            tipoValido = typeof dados[campo] === 'object' && !Array.isArray(dados[campo]) && dados[campo] !== null;
            break;
        }

        if (!tipoValido) {
          throw new Error(`O campo '${campo}' deve ser do tipo '${tipo}'`);
        }
      }
    }
  }
}

module.exports = new ErrorHandler();
