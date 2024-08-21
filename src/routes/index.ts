import userRoute from "../routes/userRoutes";
import s3Route from "./s3Routes";

const routes = async (app: any) => {
	userRoute(app);
	s3Route(app)
};
export default routes;
