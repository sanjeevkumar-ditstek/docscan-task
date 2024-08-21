import mongoose, { model } from 'mongoose';
import userDocumentInterface from '../utils/interface/store/userDocument';
import Status from '../utils/enum/status';
const schema = mongoose.Schema;
const userDocumentSchema = new schema<userDocumentInterface>(
  {
    user_id: {
      type: schema.Types.ObjectId,
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

export const UserDocumentModel = model('userDocuments', userDocumentSchema);
