// import { Response } from "express";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

import { IApiResponse } from "src/utils/interface/common";

export const apiResponse = (response: IApiResponse) => {
    response.response.status(response.statusCode).json({
        message:
            response.message, data: response.data,
        status:
            response.status,
        error: response.error,
    });
}
