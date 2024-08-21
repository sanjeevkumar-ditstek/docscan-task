import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from "./routes/index";


dotenv.config();
export class Server {
  private app: Application;
  private port: number;
  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.configureRoutes();
    this.configureMiddleWare();
  }

  private configureRoutes(): void {
    this.app.get('/', (req: Request, res: Response) => {
      res.send("Basic Crud Application!")
    })
  }

  private configureMiddleWare(): void {
    this.app.use(cors({
      credentials: true
    }))
    this.app.use(express.json());
    this.app.use(express.static('public'))
    routes(this.app)
  }

  public addMiddleware(middleware: any): void {
    this.app.use(middleware)
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`Server listening on port ${this.port}`);
    });
  }

  public getApp() {
    return this.app
  }

}

