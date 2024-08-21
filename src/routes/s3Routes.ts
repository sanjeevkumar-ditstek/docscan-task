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
  );
  app.get(s3Routes.S3Route, proxy.auth.authenticate, proxy.s3.getFiles);
  app.delete(s3Routes.S3Route, proxy.auth.authenticate, proxy.s3.deleteFile);
  app.get(s3Routes.S3GetFile, proxy.auth.authenticate, proxy.s3.getFileFromS3);
};

export default s3Route;
