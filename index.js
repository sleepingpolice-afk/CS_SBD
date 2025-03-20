const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const rute = require("./src/routes/routes");
const user_route = require("./src/routes/userroute");
const item_route = require("./src/routes/itemroute");
const transaction_route = require("./src/routes/transactionroute");

const cors = require("cors");
dotenv.config();

const port = process.env.PORT || 5433; // Isi nomor port di sini;
const app = express();

var corsOption = {
  //origin: 'http://localhost:5433/',
  origin: 'http://os.netlab.com/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}

app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use("/store", cors(corsOption), rute);
app.use("/user", cors(corsOption), user_route);
app.use("/item", cors(corsOption), item_route);
app.use("/transaction", cors(corsOption), transaction_route);

app.listen(port, () => {
  console.log(`Running on port ${port}!`);
});