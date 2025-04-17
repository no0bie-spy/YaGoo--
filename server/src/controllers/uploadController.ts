import { Request, Response } from 'express';

export const handleProfileUpload = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  res.json({
    message: 'File uploaded successfully.',
    filePath: req.file.path,
    fileName: req.file.filename,
  });
};
