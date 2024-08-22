import mongoose, { Schema } from 'mongoose';
import Status from '../utils/enum/status';

export default interface IUSERDOCUMENT extends Document {
  _id?: string;
  user_id?: Schema.Types.ObjectId;
  filepath?: string;
  upload_date?: string;
  filesize?: string;
  document_type?: string;
  mimetype?: string;
  status?: number;
}
const UserDocumentSchema: Schema<IUSERDOCUMENT> = new Schema<IUSERDOCUMENT>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'users'
    },
    filepath: {
      type: String
    },
    upload_date: {
      type: String
    },
    filesize: {
      type: String
    },
    document_type: {
      type: String
    },
    mimetype: {
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

export const UserDocumentModel = (mongoose.models.userDocuments as mongoose.Model<IUSERDOCUMENT>) ||
mongoose.model<IUSERDOCUMENT>('userDocuments', UserDocumentSchema);
