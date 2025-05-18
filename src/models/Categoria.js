const mongoose = require('mongoose');
const database = require('../database/Database');
const errorHandler = require('../utils/ErrorHandler');
const logger = require('../utils/Logger');


const categoriaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome da categoria é obrigatório']
  },
  cor: {
    type: String,
    default: '#3498db'
  },
  descricao: {
    type: String
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O ID do usuário é obrigatório']
  }
}, {
  timestamps: {
    createdAt: 'dataCriacao',
    updatedAt: 'dataAtualizacao'
  }
});


const CategoriaModel = mongoose.model('Categoria', categoriaSchema);

class Categoria {

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
      
      // Criar a categoria
      const categoria = await CategoriaModel.create(dados);
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
      const categoria = await CategoriaModel.findById(id);
      
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
      const categorias = await CategoriaModel.find({ usuarioId });
      
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
      
      // Atualizar a categoria
      const categoria = await CategoriaModel.findByIdAndUpdate(
        id,
        dados,
        { new: true, runValidators: true }
      );
      
      if (!categoria) {
        throw new Error('Categoria não encontrada');
      }
      
      logger.registrarInfo('Categoria atualizada com sucesso', { id });
      
      return {
        sucesso: true,
        dados: categoria
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Atualização de categoria');
    }
  }
  
  async excluir(id) {
    try {
      const categoria = await CategoriaModel.findByIdAndDelete(id);
      
      if (!categoria) {
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
