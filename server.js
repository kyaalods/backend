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
const PORT = process.env.PORT || 4000;

const uri = process.env.DATABASE;
mongoose.connect(
  uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      res.send(err);
    } else {
      app.listen(PORT, () => {
        console.log(
          "Sever is running at " + PORT + " and connected to the database"
        );
      });
    }
  }
);