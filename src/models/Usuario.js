const mongoose = require('mongoose');
const database = require('../database/Database');
const errorHandler = require('../utils/ErrorHandler');
const logger = require('../utils/Logger');

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome do usuário é obrigatório']
  },
  email: {
    type: String,
    required: [true, 'O email do usuário é obrigatório'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  senha: {
    type: String,
    required: [true, 'A senha do usuário é obrigatória'],
    minlength: [6, 'A senha deve ter pelo menos 6 caracteres']
  }
}, {
  timestamps: {
    createdAt: 'dataCriacao',
    updatedAt: 'dataAtualizacao'
  }
});


const UsuarioModel = mongoose.model('Usuario', usuarioSchema);


class Usuario {

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
      
      // Criar o usuário
      const usuario = await UsuarioModel.create(dados);
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
      const usuario = await UsuarioModel.findById(id);
      
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
      const usuario = await UsuarioModel.findOne({ email });
      
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
      const usuarios = await UsuarioModel.find();
      
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
      
      // Atualizar o usuário
      const usuario = await UsuarioModel.findByIdAndUpdate(
        id,
        dados,
        { new: true, runValidators: true }
      );
      
      if (!usuario) {
        throw new Error('Usuário não encontrado');
      }
      
      logger.registrarInfo('Usuário atualizado com sucesso', { id });
      
      return {
        sucesso: true,
        dados: usuario
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Atualização de usuário');
    }
  }
  
  async excluir(id) {
    try {
      const usuario = await UsuarioModel.findByIdAndDelete(id);
      
      if (!usuario) {
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
