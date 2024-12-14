const {userContainer} = require("../utils/db");
const bcrypt = require("bcryptjs");

const createUser = async (user) => {
  console.log("MyUser1:"+user)
  const hashedPassword = await bcrypt.hash(user.password, 10);
  user.password = hashedPassword;
  const { resource } = await userContainer.items.create(user);
  console.log("MyUser:"+user)
  return resource;
};

const updateUserVerification = async (user) => {
  // Replace with your database logic (e.g., MongoDB, PostgreSQL, etc.)
    //console.log(user);
    const updatedUser = await userContainer.items.upsert(user);
    return updatedUser; // Returns the updated user
};


const findUserByEmail = async (email) => {
  //console.log(email);
  const query = {
    query: "SELECT * FROM c WHERE c.email = @email",
    parameters: [{ name: "@email", value: email }],
  };
  const { resources } = await userContainer.items.query(query).fetchAll();
  //console.log(resources);
  return resources[0];
};

module.exports = { createUser, findUserByEmail, updateUserVerification };
