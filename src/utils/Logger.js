
class Logger {
  constructor() {
    this.winston = require('winston');
    this.fs = require('fs');
    this.path = require('path');
    this.logDir = this.path.join(__dirname, '../../logs');
    
    // Garantir que o diretório de logs existe
    if (!this.fs.existsSync(this.logDir)) {
      this.fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // Configurar o logger
    this.logger = this.winston.createLogger({
      level: 'info',
      format: this.winston.format.combine(
        this.winston.format.timestamp(),
        this.winston.format.json()
      ),
      defaultMeta: { service: 'agenda-eletronica' },
      transports: [
        new this.winston.transports.File({ 
          filename: this.path.join(this.logDir, 'error.log'), 
          level: 'error' 
        }),
        new this.winston.transports.File({ 
          filename: this.path.join(this.logDir, 'combined.log') 
        })
      ]
    });
    
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new this.winston.transports.Console({
        format: this.winston.format.combine(
          this.winston.format.colorize(),
          this.winston.format.simple()
        )
      }));
    }
  }
  

  registrarInfo(mensagem, dados = {}) {
    this.logger.info(mensagem, { dados });
  }
  
  registrarErro(mensagem, erro, contexto = {}) {
    this.logger.error(`${mensagem}: ${erro.message}`, {
      pilha: erro.stack,
      contexto
    });
  }
  
  registrarAviso(mensagem, dados = {}) {
    this.logger.warn(mensagem, { dados });
  }
  
  
  salvarLog() {
    this.logger.end();
  }
}

module.exports = new Logger();
