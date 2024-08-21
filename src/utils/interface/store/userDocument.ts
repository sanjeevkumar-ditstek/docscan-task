import { Types } from 'mongoose';

export default interface userDocumentInterface {
  _id?: string;
  user_id?: Types.ObjectId;
  filepath?: string;
  upload_date?: string;
  filesize?: string;
  document_type?: string;
  mimetype?: string;
  status?: number;
}
