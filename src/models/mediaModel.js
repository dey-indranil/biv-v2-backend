const {mediaMetadataContainer} = require("../utils/db");
// Add a new media item to Cosmos DB
const addMediaItem = async (mediaItem) => {
    const { resource } = await mediaMetadataContainer.items.create(mediaItem);
    return resource;
  };
  
  // Get all media items from Cosmos DB
  const getMediaItems = async () => {
    const query = "SELECT * FROM c";
    const { resources } = await mediaMetadataContainer.items.query(query).fetchAll();
    return resources;
  };
  
  module.exports = { addMediaItem, getMediaItems };
  