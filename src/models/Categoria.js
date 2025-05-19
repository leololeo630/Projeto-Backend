const database = require('../database/Database');
const errorHandler = require('../utils/ErrorHandler');
const logger = require('../utils/Logger');


class Categoria {
  constructor() {
    this.colecao = 'categorias';
  }

  async criar(dados) {
    try {
      // Validar campos obrigatórios
      errorHandler.validarCamposObrigatorios(dados, ['nome', 'usuarioId']);
      
      // Validar tipos de dados
      errorHandler.validarTiposDados(dados, {
        nome: 'string',
        cor: 'string',
        descricao: 'string',
        usuarioId: 'string'
      });
      

      if (!database.isConnected) {
        await database.conectar();
      }

      const categoriaParaInserir = { ...dados };
      if (dados.usuarioId) {
        categoriaParaInserir.usuarioId = database.converterParaObjectId(dados.usuarioId);
      }
      

      if (!categoriaParaInserir.cor) {
        categoriaParaInserir.cor = '#3498db'; // Azul padrão
      }
      

      const agora = new Date();
      categoriaParaInserir.dataCriacao = agora;
      categoriaParaInserir.dataAtualizacao = agora;
      
      // Inserir a categoria
      const colecao = database.getColecao(this.colecao);
      const resultado = await colecao.insertOne(categoriaParaInserir);
      
      // Buscar a categoria inserida para retornar
      const categoria = await colecao.findOne({ _id: resultado.insertedId });
      
      logger.registrarInfo('Categoria criada com sucesso', { id: categoria._id });
      
      return {
        sucesso: true,
        dados: categoria
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Criação de categoria');
    }
  }
  
  async buscarPorId(id) {
    try {

      if (!database.isConnected) {
        await database.conectar();
      }

      const objectId = database.converterParaObjectId(id);
      
      // Buscar a categoria
      const colecao = database.getColecao(this.colecao);
      const categoria = await colecao.findOne({ _id: objectId });
      
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }
      
      return {
        sucesso: true,
        dados: categoria
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Busca de categoria por ID');
    }
  }
  
  async listarPorUsuario(usuarioId) {
    try {

      if (!database.isConnected) {
        await database.conectar();
      }
      
      const objectId = database.converterParaObjectId(usuarioId);
      
      // Buscar as categorias
      const colecao = database.getColecao(this.colecao);
      const categorias = await colecao.find({ usuarioId: objectId }).toArray();
      
      return {
        sucesso: true,
        dados: categorias
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Listagem de categorias por usuário');
    }
  }
  
  async atualizar(id, dados) {
    try {
      // Validar tipos de dados
      if (Object.keys(dados).length > 0) {
        const tipos = {};
        if (dados.nome !== undefined) tipos.nome = 'string';
        if (dados.cor !== undefined) tipos.cor = 'string';
        if (dados.descricao !== undefined) tipos.descricao = 'string';
        
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
      
      // Atualizar a categoria
      const colecao = database.getColecao(this.colecao);
      const resultado = await colecao.findOneAndUpdate(
        { _id: objectId },
        { $set: dadosAtualizados },
        { returnDocument: 'after' }
      );
      
      if (!resultado) {
        throw new Error('Categoria não encontrada');
      }
      
      logger.registrarInfo('Categoria atualizada com sucesso', { id });
      
      return {
        sucesso: true,
        dados: resultado
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Atualização de categoria');
    }
  }
  
  async excluir(id) {
    try {

      if (!database.isConnected) {
        await database.conectar();
      }
      
  
      const objectId = database.converterParaObjectId(id);
      
      // Excluir a categoria
      const colecao = database.getColecao(this.colecao);
      const resultado = await colecao.findOneAndDelete({ _id: objectId });
      
      if (!resultado) {
        throw new Error('Categoria não encontrada');
      }
      
      logger.registrarInfo('Categoria excluída com sucesso', { id });
      
      return {
        sucesso: true,
        mensagem: 'Categoria excluída com sucesso'
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Exclusão de categoria');
    }
  }
}

module.exports = new Categoria();
