const { createUser, findUserByEmail } = require("../models/userModel");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcryptjs");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    //console.log(email, password);
    if (!email || !password ) return res.status(400).send("All fields are required");
    
    const existingUser = await findUserByEmail(email);
    console.log(email, password, existingUser);
    if (existingUser) return res.status(400).send("User already exists");

    const newUser = await createUser({ email, password });
    res.status(201).json({ email: newUser.email });
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
