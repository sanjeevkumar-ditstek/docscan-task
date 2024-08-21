import {
  s3Interface,
  s3GetInterface,
  s3DeleteInterface
} from '../../utils/interface/s3/IS3';
import { UserDocumentModel } from '../../models/userDocuments';

export default class S3Store {
  // A custom error class that represents an unsuccessful operation
  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occurred while processing the request.');
    }
  };

  /**
   * Uploads a file metadata to the database.
   * 
   * @param s3Input - The file metadata to be stored, including document type, user ID, file path, etc.
   * @returns A promise that resolves to the stored file metadata or an error if the operation fails.
   */
  public async uploadFile(s3Input: s3Interface): Promise<s3Interface> {
    try {
      // Creates a new document in the UserDocumentModel collection with the provided metadata
      const data: any = await UserDocumentModel.create(s3Input);
      return data;
    } catch (error) {
      return error;
    }
  }

  /**
   * Retrieves file metadata from the database based on the user ID and document type.
   * 
   * @param data - The data containing the user ID and optional document type.
   * @returns A promise that resolves to an array of file metadata or an error if the operation fails.
   */
  public async getFiles(data: s3GetInterface): Promise<unknown> {
    const { document_type, user_id, page, limit } = data;
    try {
      // Constructs a query object based on the user ID and document type
      const queryObj: any = { user_id };
      if (document_type) {
        queryObj.document_type = document_type;
      }
      const totalCount = await UserDocumentModel.countDocuments(queryObj);
      const totalPages = Math.ceil(totalCount / limit);
      // Queries the UserDocumentModel collection and returns matching documents
      const documents =  await UserDocumentModel.find(queryObj).skip((page - 1) * limit).limit(limit);
      const result = {
        list:documents,
        metadata:{
          totalCount,
          totalPages
        }
       
      }
      return result
      
    } catch (error) {
      return error;
    }
  }

  /**
   * Retrieves a single file metadata from the database by document ID and user ID.
   * 
   * @param data - The data containing the document ID and user ID.
   * @returns A promise that resolves to the file metadata or an error if the operation fails.
   */
  public async getById(data: s3GetInterface): Promise<s3Interface> {
    const { document_id, user_id } = data;
    try {
      // Constructs a query object based on the user ID and document ID
      const queryObj: any = { user_id, _id: document_id };
      // Queries the UserDocumentModel collection and returns the matching document
      return await UserDocumentModel.findOne(queryObj);
    } catch (error) {
      return error;
    }
  }

  /**
   * Marks a file as deleted in the database by updating its status.
   * 
   * @param data - The data containing the document ID and user ID.
   * @returns A promise that resolves to the updated file metadata or an error if the operation fails.
   */
  public async delete(data: s3DeleteInterface): Promise<s3Interface> {
    const { document_id, user_id } = data;
    try {
      // Constructs a query object based on the user ID and document ID
      const queryObj: any = { user_id, _id: document_id };
      // Update object to mark the document as deleted by setting its status to 2
      const updateObj: any = { status: 2 };

      // Finds the document and updates its status, returning the updated document
      return await UserDocumentModel.findOneAndUpdate(queryObj, updateObj, {
        new: true // Returns the modified document rather than the original
      });
    } catch (error) {
      return error;
    }
  }
}
