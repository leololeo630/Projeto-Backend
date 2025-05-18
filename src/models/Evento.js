const mongoose = require('mongoose');
const database = require('../database/Database');
const errorHandler = require('../utils/ErrorHandler');
const logger = require('../utils/Logger');

const eventoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'O título do evento é obrigatório']
  },
  descricao: {
    type: String
  },
  dataInicio: {
    type: Date,
    required: [true, 'A data de início do evento é obrigatória']
  },
  dataFim: {
    type: Date
  },
  local: {
    type: String
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'O ID do usuário é obrigatório']
  },
  categoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria'
  },
  recorrencia: {
    type: String,
    enum: ['nenhuma', 'diaria', 'semanal', 'mensal', 'anual'],
    default: 'nenhuma'
  },
  lembrete: {
    type: Number,
    default: 0
  }
}, {
  timestamps: {
    createdAt: 'dataCriacao',
    updatedAt: 'dataAtualizacao'
  }
});


const EventoModel = mongoose.model('Evento', eventoSchema);


class Evento {
  async criar(dados) {
    try {
      // Validar campos obrigatórios
      errorHandler.validarCamposObrigatorios(dados, ['titulo', 'dataInicio', 'usuarioId']);
      
      // Validar tipos de dados
      errorHandler.validarTiposDados(dados, {
        titulo: 'string',
        descricao: 'string',
        dataInicio: 'date',
        dataFim: 'date',
        local: 'string',
        usuarioId: 'string',
        categoriaId: 'string',
        recorrencia: 'string',
        lembrete: 'number'
      });
      
      // Validar data de fim posterior à data de início
      if (dados.dataFim && new Date(dados.dataFim) < new Date(dados.dataInicio)) {
        throw new Error('A data de fim deve ser posterior à data de início');
      }
      
      // Criar o evento
      const evento = await EventoModel.create(dados);
      logger.registrarInfo('Evento criado com sucesso', { id: evento._id });
      
      return {
        sucesso: true,
        dados: evento
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Criação de evento');
    }
  }
  
  async buscarPorId(id) {
    try {
      const evento = await EventoModel.findById(id)
        .populate('usuarioId', 'nome email')
        .populate('categoriaId', 'nome cor');
      
      if (!evento) {
        throw new Error('Evento não encontrado');
      }
      
      return {
        sucesso: true,
        dados: evento
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Busca de evento por ID');
    }
  }
  
  async listarPorUsuario(usuarioId) {
    try {
      const eventos = await EventoModel.find({ usuarioId })
        .populate('categoriaId', 'nome cor')
        .sort({ dataInicio: 1 });
      
      return {
        sucesso: true,
        dados: eventos
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Listagem de eventos por usuário');
    }
  }
  
  async listarPorPeriodo(dataInicio, dataFim, usuarioId = null) {
    try {
      // Validar datas
      if (!dataInicio || !dataFim) {
        throw new Error('As datas de início e fim são obrigatórias');
      }
      
      // Construir filtro
      const filtro = {
        $or: [
          // Eventos que começam dentro do período
          {
            dataInicio: { $gte: new Date(dataInicio), $lte: new Date(dataFim) }
          },
          // Eventos que terminam dentro do período
          {
            dataFim: { $gte: new Date(dataInicio), $lte: new Date(dataFim) }
          },
          // Eventos que começam antes e terminam depois do período
          {
            dataInicio: { $lte: new Date(dataInicio) },
            dataFim: { $gte: new Date(dataFim) }
          }
        ]
      };
      
      // Adicionar filtro de usuário se fornecido
      if (usuarioId) {
        filtro.usuarioId = usuarioId;
      }
      
      const eventos = await EventoModel.find(filtro)
        .populate('usuarioId', 'nome email')
        .populate('categoriaId', 'nome cor')
        .sort({ dataInicio: 1 });
      
      return {
        sucesso: true,
        dados: eventos
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Listagem de eventos por período');
    }
  }
  

  async listarPorCategoria(categoriaId, usuarioId = null) {
    try {
      // Construir filtro
      const filtro = { categoriaId };
      
      // Adicionar filtro de usuário se fornecido
      if (usuarioId) {
        filtro.usuarioId = usuarioId;
      }
      
      const eventos = await EventoModel.find(filtro)
        .populate('usuarioId', 'nome email')
        .sort({ dataInicio: 1 });
      
      return {
        sucesso: true,
        dados: eventos
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Listagem de eventos por categoria');
    }
  }
  
  async atualizar(id, dados) {
    try {
      // Validar tipos de dados
      if (Object.keys(dados).length > 0) {
        const tipos = {};
        if (dados.titulo !== undefined) tipos.titulo = 'string';
        if (dados.descricao !== undefined) tipos.descricao = 'string';
        if (dados.dataInicio !== undefined) tipos.dataInicio = 'date';
        if (dados.dataFim !== undefined) tipos.dataFim = 'date';
        if (dados.local !== undefined) tipos.local = 'string';
        if (dados.categoriaId !== undefined) tipos.categoriaId = 'string';
        if (dados.recorrencia !== undefined) tipos.recorrencia = 'string';
        if (dados.lembrete !== undefined) tipos.lembrete = 'number';
        
        errorHandler.validarTiposDados(dados, tipos);
      }
      
      // Verificar se o evento existe
      const eventoExistente = await EventoModel.findById(id);
      if (!eventoExistente) {
        throw new Error('Evento não encontrado');
      }
      
      // Validar data de fim posterior à data de início
      const dataInicio = dados.dataInicio || eventoExistente.dataInicio;
      const dataFim = dados.dataFim || eventoExistente.dataFim;
      
      if (dataFim && new Date(dataFim) < new Date(dataInicio)) {
        throw new Error('A data de fim deve ser posterior à data de início');
      }
      
      // Atualizar o evento
      const evento = await EventoModel.findByIdAndUpdate(
        id,
        dados,
        { new: true, runValidators: true }
      );
      
      logger.registrarInfo('Evento atualizado com sucesso', { id });
      
      return {
        sucesso: true,
        dados: evento
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Atualização de evento');
    }
  }
  
  async excluir(id) {
    try {
      const evento = await EventoModel.findByIdAndDelete(id);
      
      if (!evento) {
        throw new Error('Evento não encontrado');
      }
      
      logger.registrarInfo('Evento excluído com sucesso', { id });
      
      return {
        sucesso: true,
        mensagem: 'Evento excluído com sucesso'
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Exclusão de evento');
    }
  }
}

module.exports = new Evento();
