import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure 'uploads/' exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split("/")[1];
    const newFileName = `${Date.now()}-${file.originalname}`;
    cb(null, newFileName); 
  },
});

const upload = multer({ storage });

export default upload;
