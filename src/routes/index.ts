import { Application } from 'express';
import userRoute from '../routes/userRoutes';
import s3Route from './uploadRoutes';

const routes = async (app: Application) => {
  userRoute(app);
  s3Route(app);
};
export default routes;
