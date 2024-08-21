enum ErrorMessageEnum {
  INVALID_REQUEST = 'Invalid Request Created',
  RECORD_NOT_FOUND = 'Record Not Found',
  INVALID_USER_ID = 'Invalid User Id',
  INVALID_EMAIL_OR_CODE = 'Invalid Email or Code!!',
  EMAIL_ALREADY_EXIST = 'Email Already Exist',
  ROLE_ALREADY_EXIST = 'Role Already Exist',
  INTERNAL_ERROR = 'Internal server Error',
  REQUEST_PARAMS_ERROR = 'Something Wrong In Req Params!',
  USER_NOT_EXIST = 'User Not Exists!',
  UNAUTHORIZED = 'Unauthorize user!',
  INVALID_TOKEN = 'Invalid Token!',
  MISSING_TOKEN = 'Missing Token!',
  S3_SIZE_EXCEEDED = 'Upload failed. You have exceeded your 1 GB storage limit. Please delete some files or upgrade your storage plan.',
  FILE_FORBIDDEN = 'You are not authorized to access this file',
  SOMETHING_WENT_WRONG = 'Something went wrong'
}

export default ErrorMessageEnum;
