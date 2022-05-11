const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

require("dotenv").config();

const userAuth = require("../Models/userModel");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.json({ error: "You don't have permission." });
  }

  const token = authorization.replace("Bearer ", "");

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.json({ error: "You don't have permission." });
    } else {
      const { _id } = payload;
      userAuth.findById(_id).then((userData) => {
        req.user = userData;
        next();
      });
    }
  });
};
