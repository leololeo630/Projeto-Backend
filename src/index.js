const Usuario = require('./models/Usuario');
const Evento = require('./models/Evento');
const Categoria = require('./models/Categoria');

const Database = require('./database/Database');
const ErrorHandler = require('./utils/ErrorHandler');
const Logger = require('./utils/Logger');

// Biblioteca de agenda eletrônica
const agendaEletronica = {

  Usuario,
  Evento,
  Categoria,
  

  Database,
  ErrorHandler,
  Logger,
  

  async inicializar() {
    try {
      await Database.conectar();
      Logger.registrarInfo('Biblioteca de agenda eletrônica inicializada com sucesso');
      return true;
    } catch (erro) {
      Logger.registrarErro('Erro ao inicializar a biblioteca de agenda eletrônica', erro);
      return false;
    }
  },
  

  async encerrar() {
    try {
      await Database.desconectar();
      Logger.registrarInfo('Biblioteca de agenda eletrônica encerrada com sucesso');
      return true;
    } catch (erro) {
      Logger.registrarErro('Erro ao encerrar a biblioteca de agenda eletrônica', erro);
      return false;
    }
  }
};


module.exports = agendaEletronica;

// Função de exemplo de uso
async function exemploDeUso() {
  try {

    console.log('Inicializando a biblioteca de agenda eletrônica...');
    await agendaEletronica.inicializar();
    
    // Criar um usuário
    console.log('\n1. Criando um usuário...');
    const resultadoUsuario = await agendaEletronica.Usuario.criar({
      nome: 'Igor Gustavo Mainardes',
      email: `leos@exemplo.com`,
      senha: 'senha123'
    });
    
    if (!resultadoUsuario.sucesso) {
      throw new Error(`Erro ao criar usuário: ${resultadoUsuario.erro.mensagem}`);
    }
    
    const usuario = resultadoUsuario.dados;
    console.log(`Usuário criado com sucesso: ${usuario.nome} (ID: ${usuario._id})`);
    
    // Criar uma categoria
    console.log('\n2. Criando uma categoria...');
    const resultadoCategoria = await agendaEletronica.Categoria.criar({
      nome: 'Trabalho',
      cor: '#e74c3c',
      descricao: 'Eventos relacionados ao trabalho',
      usuarioId: usuario._id.toString()
    });
    
    if (!resultadoCategoria.sucesso) {
      throw new Error(`Erro ao criar categoria: ${resultadoCategoria.erro.mensagem}`);
    }
    
    const categoria = resultadoCategoria.dados;
    console.log(`Categoria criada com sucesso: ${categoria.nome} (ID: ${categoria._id})`);
    
    // Criar um evento
    console.log('\n3. Criando um evento...');
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() + 1);
    
    const dataFim = new Date(dataInicio);
    dataFim.setHours(dataFim.getHours() + 2);
    
    const resultadoEvento = await agendaEletronica.Evento.criar({
      titulo: 'Reunião de Projeto',
      descricao: 'Discussão sobre o andamento do projeto',
      dataInicio,
      dataFim,
      local: 'Sala de Reuniões',
      usuarioId: usuario._id.toString(),
      categoriaId: categoria._id.toString(),
      recorrencia: 'semanal',
      lembrete: 30
    });
    
    if (!resultadoEvento.sucesso) {
      throw new Error(`Erro ao criar evento: ${resultadoEvento.erro.mensagem}`);
    }
    
    const evento = resultadoEvento.dados;
    console.log(`Evento criado com sucesso: ${evento.titulo} (ID: ${evento._id})`);
    
    // Buscar eventos do usuário
    console.log('\n4. Buscando eventos do usuário...');
    const resultadoEventosUsuario = await agendaEletronica.Evento.listarPorUsuario(usuario._id);
    
    if (!resultadoEventosUsuario.sucesso) {
      throw new Error(`Erro ao buscar eventos: ${resultadoEventosUsuario.erro.mensagem}`);
    }
    
    console.log(`Encontrados ${resultadoEventosUsuario.dados.length} eventos para o usuário`);
    
    // Atualizar um evento
    console.log('\n5. Atualizando um evento...');
    const resultadoAtualizacao = await agendaEletronica.Evento.atualizar(evento._id, {
      titulo: 'Reunião de Projeto (Atualizado)',
      descricao: 'Discussão sobre o andamento do projeto e novas tarefas'
    });
    
    if (!resultadoAtualizacao.sucesso) {
      throw new Error(`Erro ao atualizar evento: ${resultadoAtualizacao.erro.mensagem}`);
    }
    
    console.log(`Evento atualizado com sucesso: ${resultadoAtualizacao.dados.titulo}`);
    
    // Buscar evento por ID
    console.log('\n6. Buscando evento por ID...');
    const resultadoBusca = await agendaEletronica.Evento.buscarPorId(evento._id);
    
    if (!resultadoBusca.sucesso) {
      throw new Error(`Erro ao buscar evento: ${resultadoBusca.erro.mensagem}`);
    }
    
    console.log(`Evento encontrado: ${resultadoBusca.dados.titulo}`);
    console.log(`Descrição: ${resultadoBusca.dados.descricao}`);
    
    // Exemplo de tratamento de erro (campo obrigatório ausente)
    console.log('\n7. Exemplo de tratamento de erro (campo obrigatório ausente)...');
    try {
      const resultadoErro = await agendaEletronica.Evento.criar({
        // Título ausente (campo obrigatório)
        descricao: 'Este evento não tem título',
        dataInicio: new Date(),
        usuarioId: usuario._id
      });
      
      if (!resultadoErro.sucesso) {
        console.log(`Erro capturado: ${resultadoErro.erro.mensagem}`);
      }
    } catch (erro) {
      console.log(`Exceção capturada: ${erro.message}`);
    }
    
    // Excluir o evento
    console.log('\n8. Excluindo o evento...');
    const resultadoExclusao = await agendaEletronica.Evento.excluir(evento._id);
    
    if (!resultadoExclusao.sucesso) {
      throw new Error(`Erro ao excluir evento: ${resultadoExclusao.erro.mensagem}`);
    }
    
    console.log(resultadoExclusao.mensagem);

    //excluindo usuario
    console.log('\n9. Excluindo o usuario...');
    const usuarioExclusao = await agendaEletronica.Usuario.excluir(usuario._id);

    if (!usuarioExclusao.sucesso) {
      throw new Error(`Erro ao excluir usuario: ${usuarioExclusao.erro.mensagem}`);
    }
    console.log(usuarioExclusao.mensagem);

    //excluindo categoria
    console.log('\n10. Excluindo a categoria...');
    const categoriaExclusao = await agendaEletronica.Categoria.excluir(categoria._id);

    if (!categoriaExclusao.sucesso) {
      throw new Error(`Erro ao excluir categoria: ${categoriaExclusao.erro.mensagem}`);
    }
    console.log(categoriaExclusao.mensagem);

    // Encerrar a biblioteca
    console.log('\nEncerrando a biblioteca de agenda eletrônica...');
    await agendaEletronica.encerrar();
    
    console.log('\nExemplo concluído com sucesso!');
  } catch (erro) {
    console.error('Erro no exemplo:', erro);
    
    // Garantir que a biblioteca seja encerrada mesmo em caso de erro
    try {
      await agendaEletronica.encerrar();
    } catch (erroEncerramento) {
      console.error('Erro ao encerrar a biblioteca:', erroEncerramento);
    }
  }
}
if (require.main === module) {
  console.log('Executando exemplo de uso da biblioteca de agenda eletrônica...');
  exemploDeUso();
}
