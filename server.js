const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')


require('dotenv').config()
const app = express()

/* Middleware */
app.use(express.json());
app.use(cors())

/* Routes */

const userData = require('./Route/User')
app.use('/api/auth', userData)

/* PORT */
let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}

const uri = process.env.DATABASE;
mongoose.connect(
  uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      res.send(err);
    } else {
      app.listen(port, () => {
        console.log(
          "Sever is running at " + port + " and connected to the database"
        );
      });
    }
  }
);