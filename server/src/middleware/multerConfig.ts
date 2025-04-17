import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const ensureDirExists = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath: string | undefined;

    if (req.body.licensePhoto || file.fieldname === 'licensePhoto') {
      uploadPath = './public/assets/documents/license';
    } else if (req.body.citizenshipPhoto || file.fieldname === 'citizenshipPhoto') {
      uploadPath = './public/assets/documents/citizenship';
    } else if (req.body.vehiclePhoto || file.fieldname === 'vehiclePhoto') {
      uploadPath = './public/assets/documents/vehicle';
    } else if (req.body.vehicleNumberPlatePhoto || file.fieldname === 'vehicleNumberPlatePhoto') {
      uploadPath = './public/assets/documents/numberPlate';
    } else if (req.body.vehicleBlueBookPhoto || file.fieldname === 'vehicleBlueBookPhoto') {
      uploadPath = './public/assets/documents/blueBook';
    }

    if (uploadPath) {
      ensureDirExists(uploadPath); 
      cb(null, uploadPath);
    } else {
      cb(new Error('Unknown upload type'), '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

export default upload;
