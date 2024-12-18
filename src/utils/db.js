const { CosmosClient } = require("@azure/cosmos");
require("dotenv").config();

const client = new CosmosClient({
  endpoint: process.env.COSMOS_DB_URI,
  key: process.env.COSMOS_DB_KEY,
});

const database = client.database(process.env.COSMOS_DB_NAME);
const userContainer = database.container("Users");
const otpContainer = database.container("OTPs");
const mediaMetadataContainer = database.container("MediaMetadata");

module.exports = {userContainer, otpContainer, mediaMetadataContainer};
