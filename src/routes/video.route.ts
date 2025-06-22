import express, { Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
import { getAllVideos, getSignedCookies, testVideoAccess, uploadVideoController } from '../controller/video.contoller'
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
    const ext = path.extname(file.originalname); // e.g., '.mp4'
    // Create unique filename with timestamp + original extension
    const uniqueName = Date.now() + '-' + file.fieldname + ext;
    cb(null, uniqueName);
  }
});


const upload = multer({
  storage,
  limits: { fileSize: 100000000 }, // adjust size as needed
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp4|avi|mkv)$/i;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});




videoRouter.post('/video',attachUserId,allowAdminAndClient,upload.single('movie'),uploadVideoController)
videoRouter.get('/videos' , attachUserId , allowAllRoles , getAllVideos)
videoRouter.get('/get-signed-cookie' , attachUserId , allowAllRoles , getSignedCookies)
videoRouter.post('/test-video-url' , attachUserId , allowAllRoles , testVideoAccess)
export default videoRouter
