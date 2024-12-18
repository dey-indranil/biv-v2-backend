const azure = require('azure-storage');
const blobService = azure.createBlobService(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

const uploadFileToBlob = (file) => {
  return new Promise((resolve, reject) => {
    const blobName = `${Date.now()}-${file.originalname}`;
    const stream = file.buffer;
    blobService.createBlockBlobFromText(
      containerName,
      blobName,
      stream,
      (err, result) => {
        if (err) return reject(err);
        resolve(blobService.getUrl(containerName, blobName));
      }
    );
  });
};

module.exports = { uploadFileToBlob };
