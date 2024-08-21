export interface s3Interface {
  user_id: string;
  filepath: string;
  document_type: string;
  filesize: number;
  upload_date: string;
  mimetype: string;
 
}
export interface s3GetInterface {
  user_id: string;
  document_type?: string;
  document_id?: string;
  limit?: number;
  page?: number;
}
export interface s3DeleteInterface {
  user_id: string;
  document_id: string;
}
