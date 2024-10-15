const { join } = require("path");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const apiRouter = require("./routes/api.routes");
const {
  expressErrorHandler,
} = require("./controllers/middleware/errorHandler");
const AppError = require("./utils/AppError");
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: 'http://3.110.118.76:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.options("*", cors());

app.use(express.static(join(__dirname, "./public")));

app.use("/api", apiRouter);



app.get("/", (req, res, next) => res.send("WELCOME TO SSMS SERVER"));

app.all("*", (req, res, next) => {
  throw new AppError(404, "Requested endpoint does not exist");
});

app.use(expressErrorHandler);

module.exports = app;
