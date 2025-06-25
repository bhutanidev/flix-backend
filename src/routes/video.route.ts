import express, { Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { getAllVideos, getSignedCookies, searchVideo, uploadVideoController } from '../controller/video.contoller'
import path from 'path';
import fs from 'fs';
import { allowAdminAndClient, allowAllRoles, attachUserId } from '../middleware/auth.middleware';

const videoRouter = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const outputBaseDir = path.resolve('uploads');
    if (!fs.existsSync(outputBaseDir)) {
      fs.mkdirSync(outputBaseDir, { recursive: true });
    }
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Extract original extension
    const ext = path.extname(file.originalname);
    // Create unique filename with timestamp + fieldname + original extension
    const uniqueName = Date.now() + '-' + file.fieldname + ext;
    cb(null, uniqueName);
  }
});

// ✅ Updated multer configuration for multiple file types
const upload = multer({
  storage,
  limits: { 
    fileSize: 100000000, // 100MB for videos
    files: 2 // Maximum 2 files (video + thumbnail)
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'movie') {
      // ✅ Video file validation
      const allowedVideoTypes = /\.(mp4|avi|mkv)$/i;
      const isValidVideo = allowedVideoTypes.test(path.extname(file.originalname).toLowerCase());
      if (isValidVideo) {
        cb(null, true);
      } else {
        cb(new Error('Only video files (mp4, avi, mkv) are allowed for movie field'));
      }
    } else if (file.fieldname === 'thumbnail') {
      // ✅ Thumbnail image validation
      const allowedImageTypes = /\.(jpg|jpeg|png|webp)$/i;
      const isValidImage = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
      if (isValidImage) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed for thumbnail field'));
      }
    } else {
      // ✅ Reject unexpected fields
      cb(new Error(`Unexpected field: ${file.fieldname}. Only 'movie' and 'thumbnail' fields are allowed.`));
    }
  }
});

// ✅ Updated route to handle multiple files
videoRouter.post('/video', 
  attachUserId, 
  allowAdminAndClient, 
  upload.fields([
    { name: 'movie', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), 
  uploadVideoController
);

videoRouter.get('/videos', attachUserId, allowAllRoles, getAllVideos);
videoRouter.get('/get-signed-cookie', attachUserId, allowAllRoles, getSignedCookies);
videoRouter.get('/search', attachUserId, allowAllRoles, searchVideo);

export default videoRouter