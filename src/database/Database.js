
class Database {
  constructor() {
    this.mongoose = require('mongoose');
    this.logger = require('../utils/Logger');
    this.isConnected = false;
    this.uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agenda-eletronica';

  }

  async conectar() {
    try {
      if (this.isConnected) {
        this.logger.registrarInfo('Conexão com o banco de dados já estabelecida');
        return;
      }

      await this.mongoose.connect(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      this.isConnected = true;
      this.logger.registrarInfo('Conexão com o banco de dados estabelecida com sucesso');
    } catch (erro) {
      this.logger.registrarErro('Erro ao conectar ao banco de dados', erro);
      throw erro;
    }
  }

  async desconectar() {
    try {
      if (!this.isConnected) {
        this.logger.registrarInfo('Não há conexão ativa para desconectar');
        return;
      }

      await this.mongoose.disconnect();
      this.isConnected = false;
      this.logger.registrarInfo('Conexão com o banco de dados encerrada com sucesso');
    } catch (erro) {
      this.logger.registrarErro('Erro ao desconectar do banco de dados', erro);
      throw erro;
    }
  }

  async executarQuery(model, operacao, parametros) {
    try {
      if (!this.isConnected) {
        await this.conectar();
      }

      const resultado = await model[operacao](parametros);
      return resultado;
    } catch (erro) {
      this.logger.registrarErro(`Erro ao executar query ${operacao}`, erro);
      throw erro;
    }
  }

  async iniciarTransacao() {
    try {
      if (!this.isConnected) {
        await this.conectar();
      }

      const sessao = await this.mongoose.startSession();
      sessao.startTransaction();
      this.logger.registrarInfo('Transação iniciada com sucesso');
      return sessao;
    } catch (erro) {
      this.logger.registrarErro('Erro ao iniciar transação', erro);
      throw erro;
    }
  }

  async confirmarTransacao(sessao) {
    try {
      await sessao.commitTransaction();
      sessao.endSession();
      this.logger.registrarInfo('Transação confirmada com sucesso');
    } catch (erro) {
      this.logger.registrarErro('Erro ao confirmar transação', erro);
      throw erro;
    }
  }

  async reverterTransacao(sessao) {
    try {
      await sessao.abortTransaction();
      sessao.endSession();
      this.logger.registrarInfo('Transação revertida com sucesso');
    } catch (erro) {
      this.logger.registrarErro('Erro ao reverter transação', erro);
      throw erro;
    }
  }
}

module.exports = new Database();
