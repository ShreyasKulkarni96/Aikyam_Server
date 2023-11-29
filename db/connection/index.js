const { Sequelize } = require('sequelize');
const config = require('config');
const { HOST, NAME, USER, PASS, PORT } = config.get('DB');

const DB = new Sequelize(NAME, USER, PASS, {
  host: HOST,
  dialect: 'mysql',
  port: PORT,
  logging: console.log,
  dialectOptions: {}
});

module.exports = DB;
