import proxy from '../services/appServiceProxy';
import { storageRoutes } from '../helper/routes';
import multer from 'multer';
import { Application } from 'express';
const upload = multer({ storage: multer.memoryStorage() });

const storageRoute = async (app: Application) => {
  app.post(
    storageRoutes.Storage,
    proxy.auth.authenticate,
    upload.single('file'),
    proxy.uploadService.uploadFile
  ); // Upload a file
  app.get(
    storageRoutes.Storage,
    proxy.auth.authenticate,
    proxy.uploadService.getFiles
  ); // Get all files
  app.delete(
    storageRoutes.Storage,
    proxy.auth.authenticate,
    proxy.uploadService.deleteFile
  ); // Delete particular file by key
  app.get(
    storageRoutes.GetStorageFile,
    proxy.auth.authenticate,
    proxy.uploadService.getFile
  ); // Get parsed file from bucket
};

export default storageRoute;
