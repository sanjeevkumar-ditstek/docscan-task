import mongoose, { Schema } from 'mongoose';
import Status from '../utils/enum/status';
import LoginSource from '../utils/enum/loginSource';
export interface userSchema extends Document {
  name: string;
}
export default interface IUSER extends Document {
  _id?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  password?: string;
  role?: string;
  profile_pic?: string;
  login_source?: string;
  google_token?: string;
  apple_token?: string;
  facebook_token?: string;
  status?: number;
}

const UserSchema: Schema<IUSER> = new Schema<IUSER>(
  {
    firstname: {
      type: String,
      required: true,
      default: null
    },
    lastname: {
      type: String,
      required: true,
      default: null
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      default: null,
      select: false
    },
    profile_pic: {
      type: String
    },
    login_source: {
      type: String,
      enum: [LoginSource.EMAIL, LoginSource.APPLE, LoginSource.GOOGLE],
      default: LoginSource.EMAIL
    },
    google_token: {
      type: String
    },
    facebook_token: {
      type: String
    },
    apple_token: {
      type: String
    },
    status: {
      type: Number,
      default: Status.ACTIVE,
      enum: [Status.ACTIVE, Status.INACTIVE, Status.DELETED]
    }
  },
  { timestamps: true }
);
export const UserModel =
  (mongoose.models.User as mongoose.Model<IUSER>) ||
  mongoose.model<IUSER>('users', UserSchema);
