
class Logger {
  constructor() {
    this.fs = require('fs');
    this.path = require('path');
    this.logDir = this.path.join(__dirname, '../../logs');
    
    // Garantir que o diretório de logs existe
    if (!this.fs.existsSync(this.logDir)) {
      this.fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    this.errorLogPath = this.path.join(this.logDir, 'error.log');
    this.combinedLogPath = this.path.join(this.logDir, 'combined.log');
  }
  
  formatarMensagem(level, mensagem, dados = {}) {
    const timestamp = new Date().toISOString();
    const dadosStr = Object.keys(dados).length > 0 ? JSON.stringify(dados) : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${mensagem} ${dadosStr}\n`;
  }
  
  escreverLog(arquivo, mensagem) {
    this.fs.appendFileSync(arquivo, mensagem);
  }
  
  registrarInfo(mensagem, dados = {}) {
    const mensagemFormatada = this.formatarMensagem('info', mensagem, dados);
    this.escreverLog(this.combinedLogPath, mensagemFormatada);
    console.log(`INFO: ${mensagem}`, dados);
  }
  
  registrarErro(mensagem, erro, contexto = {}) {
    const dados = {
      pilha: erro.stack,
      contexto
    };
    const mensagemFormatada = this.formatarMensagem('error', `${mensagem}: ${erro.message}`, dados);
    this.escreverLog(this.errorLogPath, mensagemFormatada);
    this.escreverLog(this.combinedLogPath, mensagemFormatada);
    console.error(`ERROR: ${mensagem}: ${erro.message}`, dados);
  }
  
  registrarAviso(mensagem, dados = {}) {
    const mensagemFormatada = this.formatarMensagem('warn', mensagem, dados);
    this.escreverLog(this.combinedLogPath, mensagemFormatada);
    console.warn(`WARN: ${mensagem}`, dados);
  }
  
  salvarLog() {

  }
}

module.exports = new Logger();
