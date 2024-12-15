const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "https://agreeable-meadow-03b389710.4.azurestaticapps.net",
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




app.use(bodyParser.json());
app.use("/auth", authRoutes);

module.exports = app;
