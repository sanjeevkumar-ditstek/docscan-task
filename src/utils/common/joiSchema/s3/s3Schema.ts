import Joi from 'joi';

export const createSchema = Joi.object().keys({
  document_type: Joi.string().required()
});
export const getSchema = Joi.object().keys({
  document_type: Joi.string().optional(),
  page: Joi.number().optional().min(1),
  limit: Joi.number().optional().min(1)
});
export const deleteSchema = Joi.object().keys({
  document_id: Joi.string().required()
});
export const getParsedFileSchema = Joi.object().keys({
  filepath: Joi.string().optional()
});
