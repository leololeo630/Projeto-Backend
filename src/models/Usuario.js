const connect = require('../db/connection');

class Usuario {
  // Criar novo usuário
  static async criar(usuario) {
    if (!usuario.nome || !usuario.email) {
      throw new Error('Campos obrigatórios: nome e email.');
    }

    try {
      const db = await connect();
      const resultado = await db.collection('usuarios').insertOne(usuario);
      return resultado;
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      throw err;
    }
  }

  // Buscar usuário pelo email
  static async buscarPorEmail(email) {
    try {
      const db = await connect();
      const usuario = await db.collection('usuarios').findOne({ email });
      return usuario;
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      throw err;
    }
  }

  // Deletar usuário pelo email
  static async deletarPorEmail(email) {
    try {
      const db = await connect();
      const resultado = await db.collection('usuarios').deleteOne({ email });
      return resultado;
    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      throw err;
    }
  }
}

module.exports = Usuario;
