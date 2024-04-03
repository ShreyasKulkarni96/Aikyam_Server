const http = require('http');
const config = require('config');
const colors = require('colors');
const app = require('./app.js');
const DB = require('./db/connection');
const logger = require('./utils/logger');

process.on('uncaughtException', err => {
  logger.error(`${err.name} : ${err.message}`);
  logger.error(colors.bgRed('UNHANDLED EXCEPTION : Shutting down ..'));
  logger.error('CRITICAL_ERR'.bgMagenta.bold, err);
  process.exit(1);
});

const server = http.createServer(app);

const initializeDb = async () => {
  try {
    await DB.sync({});
  } catch (err) {
    console.log(err);
    logger.error('DB_CONNECT_ERR:'.bgMagenta.bold, err);
    process.exit(1);
  }
};

initializeDb();

const port = config.get('PORT') || 7000;
server.listen(port, () => {
  console.log(`App is ready at - http://localhost:${port}`.blue);
});

process.on('unhandledRejection', err => {
  logger.error(`${err.name} : ${err.message}`);
  logger.error(colors.bgRed('UNHANDLED REJECTION : Shutting down ..'));
  logger.error('CRITICAL_ERR'.bgMagenta.bold, err);
  server.close(() => {
    process.exit(1);
  });
});
