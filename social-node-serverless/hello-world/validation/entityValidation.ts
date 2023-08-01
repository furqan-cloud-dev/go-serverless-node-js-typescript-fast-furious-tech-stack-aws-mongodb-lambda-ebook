// Entity Validation
import { InitialRules, make } from "simple-body-validator";
import { userValidationRules } from "./validationRules.js";


export function entityValidation(entity: string, bodyJson: object): { validated: boolean, error: object }  {
  if (entity === "users") {
    return validateRules(bodyJson, userValidationRules);
  }

  return { validated: true, error: null };
}


function validateRules(bodyJson: object, rules: InitialRules): { validated: boolean, error: object }  {
  const validator = make(bodyJson, rules);
  if (! validator.validate()) {
    return { validated: false, error: validator.errors().all() };
  }
  else {
    return { validated: true, error: null };
  }
}