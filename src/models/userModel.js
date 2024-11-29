const container = require("../utils/db");
const bcrypt = require("bcryptjs");

const createUser = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  const { resource } = await container.items.create(user);
  //console.log("MyUser:"+user)
  return resource;
};

const findUserByEmail = async (email) => {
  console.log(email);
  const query = {
    query: "SELECT * FROM c WHERE c.email = @email",
    parameters: [{ name: "@email", value: email }],
  };
  const { resources } = await container.items.query(query).fetchAll();
  //console.log(resources);
  return resources[0];
};

module.exports = { createUser, findUserByEmail };
