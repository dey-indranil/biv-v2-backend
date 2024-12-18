const express = require('express');
const multer = require('multer');
const { uploadMedia, getMedia } = require('../controllers/galleryController');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadMedia);
router.get('/', getMedia);

module.exports = router;
