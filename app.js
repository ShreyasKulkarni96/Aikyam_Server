const { join } = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const apiRouter = require('./routes/api.routes.js');
const { expressErrorHandler } = require('./controllers/middlewares/errorHandler.js');
const AppError = require('./utils/AppError.js');
const app = express();

// console.log({ NODE_ENV: process.env.NODE_ENV });

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.options('*', cors());

app.use(express.static(join(__dirname, './public')));

app.use('/api', apiRouter);

app.get('/', (req, res, next) => res.send('WELCOME TO SSMS SERVER'));

app.all('*', (req, res, next) => {
  throw new AppError(404, 'Requested endpoint does not exist');
});

app.use(expressErrorHandler);

module.exports = app;
