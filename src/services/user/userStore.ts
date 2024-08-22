import IUSER from '../../utils/interface/user/IUser';
import { UserModel } from '../../models/users';
import Status from '../../utils/enum/status';
import LoginSource from '../../utils/enum/loginSource';
import logger from '../../utils/logger/winston';
import mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;
export default class UserStore {
  // Custom error class for handling operation failures
  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occurred in user Store while processing the request.');
    }
  };

  /**
   * Creates a new user and saves it in the database.
   *
   * @param userInput - The user data to be saved, including fields like email, password, etc.
   * @returns The saved user data, excluding the password, or an error if the operation fails.
   */
  public async createUser(userInput: IUSER): Promise<IUSER> {
    try {
      const savedUser = await UserModel.create(userInput);
      const { password, ...rest } = savedUser.toObject(); // Remove password from the response
      return rest;
    } catch (e) {
      logger.error(e);
      return e;
    }
  }

  /**
   * Retrieves a user by their email.
   *
   * @param email - The email of the user to be retrieved.
   * @returns The user data, including the password, or an error if the operation fails.
   */
  public async getByEmail(email: string): Promise<IUSER> {
    try {
      const user = await UserModel.findOne(
        { email, status: { $ne: Status.DELETED } },
        { password: 1, firstname: 1, lastname: 1, email: 1 }
      ).lean(); // Fetch the user with specified fields
      return user;
    } catch (e) {
      logger.error(e);
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
  }

  /**
   * Retrieves a user by their social login token.
   *
   * @param data - The data containing the social login source and other identifiers.
   * @returns The user data or an error if the operation fails.
   */
  public async getBySocialToken(data): Promise<IUSER> {
    try {
      const query = {
        login_source: data.loginSource,
        status: { $ne: Status.DELETED }
      };

      // Adjust the query based on the login source
      if (data.loginSource === LoginSource.GOOGLE) {
        query.login_source = LoginSource.GOOGLE;
      } else {
        query.login_source = LoginSource.APPLE;
      }

      const user = await UserModel.findOne(query);
      return user;
    } catch (e) {
      logger.error(e);
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param id - The ID of the user to be retrieved.
   * @returns The user data or an error if the operation fails.
   */
  public async getById(id: string): Promise<IUSER> {
    try {
      const pipeline = [
        {
          $match: {
            _id: new ObjectId(id),
            status: { $ne: Status.DELETED }
          },
        },
        {
          $lookup: {
            from: "userdocuments",
            localField: "_id",
            foreignField: "user_id",
            as: "userdocuments",
          },
        },
        {
          $unwind:{ path:"$userdocuments", preserveNullAndEmptyArrays: true } ,  // Unwind the userdocuments array
        },
        {
          $group: {
            _id: "$_id",
            totalDocuments: { $sum: 1 },  // Count the number of documents
            totalFileSize: { $sum: { $toDouble: "$userdocuments.filesize" } },
            firstname: { $first: "$firstname" },  // Convert filesize to double and sum it up
            lastname: { $first: "$lastname" },
            email: { $first: "$email" },
            status: { $first: "$status" },
            login_source: { $first: "$login_source" }


          },
        },
      ]
      const user = await UserModel.aggregate(pipeline)
      if(user.length) user[0].maxStorageLimit = Number(process.env.S3_STORAGE_LIMIT) || 1073741824;
      return user?.[0];
    } catch (e) {
      logger.error(e);
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
  }

  /**
   * Retrieves all users, excluding those marked as deleted.
   *
   * @returns An array of user data or an error if the operation fails.
   */
  public async getAll(data): Promise<unknown> {
    try {
      const { page, limit = 10 } = data;
      const totalCount = await UserModel.countDocuments({ status: { $ne: 2 } });
      const totalPages = Math.ceil(totalCount / limit);
      const users = await UserModel.find({
        status: { $ne: Status.DELETED }
      })
        .skip((page - 1) * limit)
        .limit(limit);
      const result = {
        list: users,
        metadata: {
          totalCount,
          totalPages
        }
      };
      return result;
    } catch (e) {
      logger.error(e);
      return Promise.reject(new UserStore.OPERATION_UNSUCCESSFUL());
    }
  }

  /**
   * Updates a user by their ID with the provided payload.
   *
   * @param id - The ID of the user to be updated.
   * @param payload - The data to update the user with.
   * @returns The updated user data or an error if the operation fails.
   */
  public async update(id: string, payload: IUSER): Promise<IUSER> {
    try {
      const user: IUSER = await UserModel.findOneAndUpdate(
        { _id: id },
        payload,
        { new: true } // Return the updated document
      );
      return user;
    } catch (e) {
      logger.error(e);
      return e;
    }
  }

  /**
   * Marks a user as deleted by updating their status.
   *
   * @param id - The ID of the user to be deleted.
   * @returns The updated user data with the deleted status or an error if the operation fails.
   */
  public async delete(id: string): Promise<IUSER> {
    try {
      const user = await UserModel.findOneAndUpdate(
        { _id: id },
        { status: Status.DELETED },
        { new: true } // Return the updated document
      );
      return user;
    } catch (e) {
      logger.error(e);
      return e;
    }
  }
}
