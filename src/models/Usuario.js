
const database = require('../database/Database');
const errorHandler = require('../utils/ErrorHandler');
const logger = require('../utils/Logger');

class Usuario {
  constructor() {
    this.colecao = 'usuarios';
  }

  async criar(dados) {
    try {
      // Validar campos obrigatórios
      errorHandler.validarCamposObrigatorios(dados, ['nome', 'email', 'senha']);
      
      // Validar tipos de dados
      errorHandler.validarTiposDados(dados, {
        nome: 'string',
        email: 'string',
        senha: 'string'
      });
      
      if (!database.isConnected) {
        await database.conectar();
      }
      
      const agora = new Date();
      const usuarioParaInserir = {
        ...dados,
        dataCriacao: agora,
        dataAtualizacao: agora
      };
      
      // Inserir o usuário
      const colecao = database.getColecao(this.colecao);
      const resultado = await colecao.insertOne(usuarioParaInserir);
      
      // Buscar o usuário inserido para retornar
      const usuario = await colecao.findOne({ _id: resultado.insertedId });
      
      logger.registrarInfo('Usuário criado com sucesso', { id: usuario._id });
      
      return {
        sucesso: true,
        dados: usuario
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Criação de usuário');
    }
  }
  
  async buscarPorId(id) {
    try {

      if (!database.isConnected) {
        await database.conectar();
      }
      
      const objectId = database.converterParaObjectId(id);
      
      // Buscar o usuário
      const colecao = database.getColecao(this.colecao);
      const usuario = await colecao.findOne({ _id: objectId });
      
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      
      return {
        sucesso: true,
        dados: usuario
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Busca de usuário por ID');
    }
  }
  
  async buscarPorEmail(email) {
    try {

      if (!database.isConnected) {
        await database.conectar();
      }
      
      // Buscar o usuário
      const colecao = database.getColecao(this.colecao);
      const usuario = await colecao.findOne({ email });
      
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      
      return {
        sucesso: true,
        dados: usuario
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Busca de usuário por email');
    }
  }

  async listarTodos() {
    try {

      if (!database.isConnected) {
        await database.conectar();
      }
      
      // Buscar todos os usuários
      const colecao = database.getColecao(this.colecao);
      const usuarios = await colecao.find().toArray();
      
      return {
        sucesso: true,
        dados: usuarios
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Listagem de usuários');
    }
  }
  
  async atualizar(id, dados) {
    try {
      // Validar tipos de dados
      if (Object.keys(dados).length > 0) {
        const tipos = {};
        if (dados.nome !== undefined) tipos.nome = 'string';
        if (dados.email !== undefined) tipos.email = 'string';
        if (dados.senha !== undefined) tipos.senha = 'string';
        
        errorHandler.validarTiposDados(dados, tipos);
      }
      

      if (!database.isConnected) {
        await database.conectar();
      }
      

      const objectId = database.converterParaObjectId(id);
      

      const dadosAtualizados = {
        ...dados,
        dataAtualizacao: new Date()
      };
      
      // Atualizar o usuário
      const colecao = database.getColecao(this.colecao);
      const resultado = await colecao.findOneAndUpdate(
        { _id: objectId },
        { $set: dadosAtualizados },
        { returnDocument: 'after' }
      );
      
      if (!resultado) {
        throw new Error('Usuário não encontrado');
      }
      
      logger.registrarInfo('Usuário atualizado com sucesso', { id });
      
      return {
        sucesso: true,
        dados: resultado
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Atualização de usuário');
    }
  }
  
  async excluir(id) {
    try {

      if (!database.isConnected) {
        await database.conectar();
      }
      
      const objectId = database.converterParaObjectId(id);
      
      // Excluir o usuário
      const colecao = database.getColecao(this.colecao);
      const resultado = await colecao.findOneAndDelete({ _id: objectId });
      
      if (!resultado) {
        throw new Error('Usuário não encontrado');
      }
      
      logger.registrarInfo('Usuário excluído com sucesso', { id });
      
      return {
        sucesso: true,
        mensagem: 'Usuário excluído com sucesso'
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Exclusão de usuário');
    }
  }
}

module.exports = new Usuario();
