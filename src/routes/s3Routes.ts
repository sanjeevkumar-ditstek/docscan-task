import proxy from '../services/appServiceProxy';
import { s3Routes } from '../helper/routes';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const s3Route = async (app: any) => {
  app.post(
    s3Routes.S3Route,
    proxy.auth.authenticate,
    upload.single('file'),
    proxy.s3.uploadFile
  ); // Upload a file
  app.get(s3Routes.S3Route, proxy.auth.authenticate, proxy.s3.getFiles); // Get all files
  app.delete(s3Routes.S3Route, proxy.auth.authenticate, proxy.s3.deleteFile); // Delete particular file by key
  app.get(s3Routes.S3GetFile, proxy.auth.authenticate, proxy.s3.getFileFromS3); // Get parsed file from s3
};

export default s3Route;
