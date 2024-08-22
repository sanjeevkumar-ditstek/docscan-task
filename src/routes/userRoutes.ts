import proxy from '../services/appServiceProxy';
import { userRoutes } from '../helper/routes';

const userRoute = async (app: any) => {
  app.get(userRoutes.UsersRoute, proxy.user.getUsers); // Get all users
  app.post(userRoutes.UsersRoute, proxy.user.create); // Add new user
  app.get(
    userRoutes.UserProfileByTokenRoute,
    proxy.auth.authenticate,
    proxy.user.getUserByToken
  ); //Get user by Token
  app.get(userRoutes.UserByIdRoute, proxy.user.getUserById); // Get user by ID
  app.put(userRoutes.UserByIdRoute, proxy.user.update); // Update user by ID
  app.delete(userRoutes.UserByIdRoute, proxy.user.delete); // Delete user by ID

  app.post(userRoutes.UserLoginRoute, proxy.user.loginUser); // Login user
};

export default userRoute;
