const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
require("dotenv").config();

const app = express();
const listEndpoints = require('express-list-endpoints');

const allowedOrigins = [
    "http://localhost:3000",
    process.env.FE_URL
  ];
  
app.use(cors({
    origin: (origin, callback) => {
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }));


console.log(listEndpoints(app));
  
app.get('/debug/endpoints', (req, res) => {
    const endpoints = require('express-list-endpoints')(app);
    res.json(endpoints);
  });
  

app.use(bodyParser.json());
app.use("/auth", authRoutes);

module.exports = app;
