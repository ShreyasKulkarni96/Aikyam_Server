const path = require('path');
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

// const logFileName = join(__dirname, '../logs/server.log');

const logRotateTransport = new transports.DailyRotateFile({
  filename: '%DATE%-server.log',
  dirname: path.join(__dirname, '../logs/'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m', // 20MB
  maxFiles: '30d'
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'ASRS_Server' },
  //   transports: [new transports.File({ filename: logFileName })]
  transports: [logRotateTransport]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  );
}

module.exports = logger;
