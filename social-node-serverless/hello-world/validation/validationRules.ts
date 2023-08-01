//Available Validation Rules
// https://www.simple-body-validator.com/available-validation-rules

import { InitialRules } from "simple-body-validator";


export const userValidationRules: InitialRules = {
  name: "required|string",
  email: "required|email"
};