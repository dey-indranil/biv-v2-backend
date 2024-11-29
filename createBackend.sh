#!/bin/bash

# Define base directory
BASE_DIR="backend"
SRC_DIR="$BASE_DIR/src"
DIRS=(
  "$SRC_DIR/controllers"
  "$SRC_DIR/models"
  "$SRC_DIR/routes"
  "$SRC_DIR/utils"
)

# Create directories
echo "Creating directories..."
for DIR in "${DIRS[@]}"; do
  mkdir -p "$DIR"
done

# Create files and populate with content

# package.json
cat <<EOL > $BASE_DIR/package.json
{
  "name": "nonprofit-backend",
  "version": "1.0.0",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "body-parser": "^1.20.1",
    "azure-cosmos": "^3.15.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}
EOL

# .env
cat <<EOL > $BASE_DIR/.env
PORT=4000
COSMOS_DB_URI=<Your Azure Cosmos DB URI>
COSMOS_DB_KEY=<Your Azure Cosmos DB Key>
COSMOS_DB_NAME=NonProfitDB
JWT_SECRET=<YourSecretKey>
EOL

# .gitignore
cat <<EOL > $BASE_DIR/.gitignore
node_modules
.env
EOL

# db.js
cat <<EOL > $SRC_DIR/utils/db.js
const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();

const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_URI,
  key: process.env.COSMOS_DB_KEY,
});

const database = client.database(process.env.COSMOS_DB_NAME);
const container = database.container("Users");

module.exports = container;
EOL

# jwt.js
cat <<EOL > $SRC_DIR/utils/jwt.js
const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { generateToken, verifyToken };
EOL

# userModel.js
cat <<EOL > $SRC_DIR/models/userModel.js
const container = require("../utils/db");
const bcrypt = require("bcryptjs");

const createUser = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  const { resource } = await container.items.create(user);
  return resource;
};

const findUserByEmail = async (email) => {
  const query = {
    query: "SELECT * FROM c WHERE c.email = @email",
    parameters: [{ name: "@email", value: email }],
  };
  const { resources } = await container.items.query(query).fetchAll();
  return resources[0];
};

module.exports = { createUser, findUserByEmail };
EOL

# authController.js
cat <<EOL > $SRC_DIR/controllers/authController.js
const { createUser, findUserByEmail } = require("../models/userModel");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).send("All fields are required");

    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).send("User already exists");

    const newUser = await createUser({ email, password, name });
    res.status(201).json({ id: newUser.id, email: newUser.email });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send("All fields are required");

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).send("User not found");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).send("Invalid credentials");

    const token = generateToken(user.id);
    res.json({ token });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = { register, login };
EOL

# authRoutes.js
cat <<EOL > $SRC_DIR/routes/authRoutes.js
const express = require("express");
const { register, login } = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;
EOL

# app.js
cat <<EOL > $SRC_DIR/app.js
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(bodyParser.json());
app.use("/auth", authRoutes);

module.exports = app;
EOL

# server.js
cat <<EOL > $SRC_DIR/server.js
const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
EOL

# Finish
echo "Backend setup completed successfully."
