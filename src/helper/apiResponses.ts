// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { IApiResponse } from '../utils/interface/common';
import STATUS_CODES from '../utils/enum/statusCodes';
import ErrorMessageEnum from '../utils/enum/errorMessage';

export const apiResponse = (response: IApiResponse) => {
  response.response.status(response.statusCode).json({
    message: response.message || ErrorMessageEnum.INVALID_REQUEST,
    data: response.data,
    status: response.status || STATUS_CODES.BAD_REQUEST,
    error: response.error
  });
};
