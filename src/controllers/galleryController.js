const { uploadFileToBlob } = require("../services/azureBlobService");
const { addMediaItem, getMediaItems } = require("../models/mediaModel");

exports.uploadMedia = async (req, res) => {
  try {
    const file = req.file;
    const blobUrl = await uploadFileToBlob(file);
    const { title, type } = req.body;

    const createdAt = new Date().toISOString();

    // Generate partition key
    const yearMonth = createdAt.slice(0, 7); // e.g., "2024-12"
    const partitionKey = `${type}-${yearMonth}`; // e.g., "image-2024-12"

    const mediaItem = {
      title,
      type,
      url: blobUrl, // Blob storage URL
      createdAt,
      partitionKey, // Add partition key
    };
    const savedItem = await addMediaItem(mediaItem);

    res.status(201).json({ success: true, data: savedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMedia = async (req, res) => {
  try {
    console.log("getMedia: "+req.body);
    const mediaItems = await getMediaItems();
    res.status(200).json({ success: true, data: mediaItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
