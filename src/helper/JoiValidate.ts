export const JoiValidate = (schema: any, values: any) => {
  const { value, error } = schema.validate(values);
  return { value, error };
};
