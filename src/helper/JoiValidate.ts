export const JoiValidate = (schema: any, values: any) => {

  let { value, error } = schema.validate(values)
  return { value, error }
}
