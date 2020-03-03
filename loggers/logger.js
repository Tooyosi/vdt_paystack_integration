const { createLogger, transports, format } = require('winston');

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.File({
      filename: `./logs/logfile.log`,
      json: false,
      maxsize: 5242880,
      maxFiles: 2,
    }),
    new transports.Console(),
  ]
});

module.exports = {
    logger,
  };;