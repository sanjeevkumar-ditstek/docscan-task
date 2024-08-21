import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();


export default function authenticate(req: any, res: any, next: any): any {
    let token = req.headers.authorization;
    jwt.verify(token, process.env.JWT_SECRET, (error, data) => {
        if (error) {
            console.error(error);
          
            return error
        } else if (data) {
            let user = data;
            req.user = user;
        }
        next();
    });
}
