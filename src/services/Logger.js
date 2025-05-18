const { createLogger, transports, format } = require('winston');

const logger = createLogger({
    level: 'error',
    format: format.combine(
        format.timestamp(),
        format.printf(({ timestamp, message }) => `[${timestamp}] ${message}`)
    ),
    transports: [
        new transports.File({ filename: 'error.log' })
    ]
});

module.exports = logger;
