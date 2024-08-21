import mongoose, { model } from "mongoose";
import userInterface from "../utils/interface/store/user";
import Status from "../utils/enum/status";
import LoginSource from "../utils/enum/loginSource";

const schema = mongoose.Schema;
const userSchema = new schema<userInterface>({
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
        unique: true
    },
    password: {
        type: String,
        default: null,
        select: false
    },
    profile_pic: {
        type: String,
    },
    login_source: {
        type: String,
        enum: [LoginSource.EMAIL, LoginSource.APPLE, LoginSource.GOOGLE],
        default: LoginSource.GOOGLE
    },
    google_token: {
        type: String,
    },
    facebook_token: {
        type: String,
    },
    apple_token: {
        type: String,
    },
    status: {
        type: Number,
        default: Status.ACTIVE,
        enum: [Status.ACTIVE, Status.INACTIVE, Status.DELETED]
    }

}, {timestamps: true});

export const UserModel = model("users", userSchema);
