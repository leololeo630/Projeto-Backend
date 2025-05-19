
const database = require('../database/Database');
const errorHandler = require('../utils/ErrorHandler');
const logger = require('../utils/Logger');
class Evento {
  constructor() {
    this.colecao = 'eventos';
  }

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
      
      if (!database.isConnected) {
        await database.conectar();
      }
      
      const eventoParaInserir = { ...dados };
      if (dados.usuarioId) {
        eventoParaInserir.usuarioId = database.converterParaObjectId(dados.usuarioId);
      }
      if (dados.categoriaId) {
        eventoParaInserir.categoriaId = database.converterParaObjectId(dados.categoriaId);
      }
      
      const agora = new Date();
      eventoParaInserir.dataCriacao = agora;
      eventoParaInserir.dataAtualizacao = agora;
      
      // Inserir o evento
      const colecao = database.getColecao(this.colecao);
      const resultado = await colecao.insertOne(eventoParaInserir);
      
      // Buscar o evento inserido para retornar
      const evento = await colecao.findOne({ _id: resultado.insertedId });
      
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

      if (!database.isConnected) {
        await database.conectar();
      }
      
      const objectId = database.converterParaObjectId(id);
      
      // Buscar o evento
      const colecao = database.getColecao(this.colecao);
      const evento = await colecao.findOne({ _id: objectId });
      
      if (!evento) {
        throw new Error('Evento não encontrado');
      }
      
      // Buscar informações relacionadas (usuário e categoria)
      if (evento.usuarioId) {
        const usuariosColecao = database.getColecao('usuarios');
        const usuario = await usuariosColecao.findOne({ _id: evento.usuarioId });
        if (usuario) {
          evento.usuario = {
            _id: usuario._id,
            nome: usuario.nome,
            email: usuario.email
          };
        }
      }
      
      if (evento.categoriaId) {
        const categoriasColecao = database.getColecao('categorias');
        const categoria = await categoriasColecao.findOne({ _id: evento.categoriaId });
        if (categoria) {
          evento.categoria = {
            _id: categoria._id,
            nome: categoria.nome,
            cor: categoria.cor
          };
        }
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

      if (!database.isConnected) {
        await database.conectar();
      }
      
      const objectId = database.converterParaObjectId(usuarioId);
      
      // Buscar os eventos
      const colecao = database.getColecao(this.colecao);
      const eventos = await colecao.find({ usuarioId: objectId })
        .sort({ dataInicio: 1 })
        .toArray();
      
      // Buscar informações das categorias
      const categoriasColecao = database.getColecao('categorias');
      for (const evento of eventos) {
        if (evento.categoriaId) {
          const categoria = await categoriasColecao.findOne({ _id: evento.categoriaId });
          if (categoria) {
            evento.categoria = {
              _id: categoria._id,
              nome: categoria.nome,
              cor: categoria.cor
            };
          }
        }
      }
      
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
      
      if (!database.isConnected) {
        await database.conectar();
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
        filtro.usuarioId = database.converterParaObjectId(usuarioId);
      }
      
      // Buscar os eventos
      const colecao = database.getColecao(this.colecao);
      const eventos = await colecao.find(filtro)
        .sort({ dataInicio: 1 })
        .toArray();
      
      // Buscar informações relacionadas (usuário e categoria)
      const usuariosColecao = database.getColecao('usuarios');
      const categoriasColecao = database.getColecao('categorias');
      
      for (const evento of eventos) {
        if (evento.usuarioId) {
          const usuario = await usuariosColecao.findOne({ _id: evento.usuarioId });
          if (usuario) {
            evento.usuario = {
              _id: usuario._id,
              nome: usuario.nome,
              email: usuario.email
            };
          }
        }
        
        if (evento.categoriaId) {
          const categoria = await categoriasColecao.findOne({ _id: evento.categoriaId });
          if (categoria) {
            evento.categoria = {
              _id: categoria._id,
              nome: categoria.nome,
              cor: categoria.cor
            };
          }
        }
      }
      
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

      if (!database.isConnected) {
        await database.conectar();
      }
      
      // Construir filtro
      const filtro = {
        categoriaId: database.converterParaObjectId(categoriaId)
      };
      
      // Adicionar filtro de usuário se fornecido
      if (usuarioId) {
        filtro.usuarioId = database.converterParaObjectId(usuarioId);
      }
      
      // Buscar os eventos
      const colecao = database.getColecao(this.colecao);
      const eventos = await colecao.find(filtro)
        .sort({ dataInicio: 1 })
        .toArray();
      
      // Buscar informações dos usuários
      const usuariosColecao = database.getColecao('usuarios');
      for (const evento of eventos) {
        if (evento.usuarioId) {
          const usuario = await usuariosColecao.findOne({ _id: evento.usuarioId });
          if (usuario) {
            evento.usuario = {
              _id: usuario._id,
              nome: usuario.nome,
              email: usuario.email
            };
          }
        }
      }
      
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
      

      if (!database.isConnected) {
        await database.conectar();
      }
      

      const objectId = database.converterParaObjectId(id);
      
      // Verificar se o evento existe
      const colecao = database.getColecao(this.colecao);
      const eventoExistente = await colecao.findOne({ _id: objectId });
      
      if (!eventoExistente) {
        throw new Error('Evento não encontrado');
      }
      
      // Validar data de fim posterior à data de início
      const dataInicio = dados.dataInicio || eventoExistente.dataInicio;
      const dataFim = dados.dataFim || eventoExistente.dataFim;
      
      if (dataFim && new Date(dataFim) < new Date(dataInicio)) {
        throw new Error('A data de fim deve ser posterior à data de início');
      }
      

      const dadosAtualizados = { ...dados };
      
      if (dados.categoriaId) {
        dadosAtualizados.categoriaId = database.converterParaObjectId(dados.categoriaId);
      }
      
      dadosAtualizados.dataAtualizacao = new Date();
      
      // Atualizar o evento
      const resultado = await colecao.findOneAndUpdate(
        { _id: objectId },
        { $set: dadosAtualizados },
        { returnDocument: 'after' }
      );
      
      if (!resultado) {
        throw new Error('Evento não encontrado');
      }
      
      logger.registrarInfo('Evento atualizado com sucesso', { id });
      
      return {
        sucesso: true,
        dados: resultado
      };
    } catch (erro) {
      return errorHandler.tratarErro(erro, 'Atualização de evento');
    }
  }
  
  async excluir(id) {
    try {

      if (!database.isConnected) {
        await database.conectar();
      }
      
      const objectId = database.converterParaObjectId(id);
      
      // Excluir o evento
      const colecao = database.getColecao(this.colecao);
      const resultado = await colecao.findOneAndDelete({ _id: objectId });
      
      if (!resultado) {
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
