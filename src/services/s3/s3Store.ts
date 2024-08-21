import {
  s3Interface,
  s3GetInterface,
  s3DeleteInterface
} from '../../utils/interface/s3/IS3';
import { UserDocumentModel } from '../../models/userDocuments';
export default class S3Store {
  public static OPERATION_UNSUCCESSFUL = class extends Error {
    constructor() {
      super('An error occured while processing the request.');
    }
  };

  public async uploadFile(s3Input: s3Interface): Promise<s3Interface> {
    try {
      const data: any = await UserDocumentModel.create(s3Input);
      return data;
    } catch (error) {
      return error;
    }
  }

  public async getFiles(data: s3GetInterface): Promise<s3Interface[]> {
    const { document_type, user_id } = data;
    try {
      const queryObj: any = { user_id };
      if (document_type) {
        queryObj.document_type = document_type;
      }
      return await UserDocumentModel.find(queryObj);
    } catch (error) {
      return error;
    }
  }

  public async getById(data: s3GetInterface): Promise<s3Interface> {
    const { document_id, user_id } = data;
    try {
      const queryObj: any = { user_id, _id: document_id };
      return await UserDocumentModel.findOne(queryObj);
    } catch (error) {
      return error;
    }
  }

  public async delete(data: s3DeleteInterface): Promise<s3Interface> {
    const { document_id, user_id } = data;
    try {
      const queryObj: any = { user_id, _id: document_id };
      const updateObj: any = { status: 2 };

      return await UserDocumentModel.findOneAndUpdate(queryObj, updateObj, {
        new: true
      });
    } catch (error) {
      return error;
    }
  }
}
