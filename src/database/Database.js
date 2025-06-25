class Database {
  constructor() {
    this.MongoClient = require('mongodb').MongoClient;
    this.ObjectId = require('mongodb').ObjectId;
    this.logger = require('../utils/Logger');
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
    this.dbName = 'agenda-eletronica';
  }

  async conectar() {
    try {
      if (this.isConnected) {
        this.logger.registrarInfo('Conexão com o banco de dados já estabelecida');
        return;
      }

      this.client = await this.MongoClient.connect(this.uri);
      
      this.db = this.client.db(this.dbName);
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

      await this.client.close();
      this.isConnected = false;
      this.logger.registrarInfo('Conexão com o banco de dados encerrada com sucesso');
    } catch (erro) {
      this.logger.registrarErro('Erro ao desconectar do banco de dados', erro);
      throw erro;
    }
  }

  getColecao(nomeColecao) {
    if (!this.isConnected) {
      throw new Error('Não há conexão ativa com o banco de dados');
    }
    return this.db.collection(nomeColecao);
  }

  converterParaObjectId(id) {
    try {
      return new this.ObjectId(id);
    } catch (erro) {
      throw new Error('ID inválido');
    }
  }

  async iniciarTransacao() {
    try {
      if (!this.isConnected) {
        await this.conectar();
      }

      const sessao = this.client.startSession();
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
