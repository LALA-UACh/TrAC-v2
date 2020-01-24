import { toNumber, toString } from "lodash";
import { isBoolean, isJSON, isNumeric } from "validator";

export const configValueToString = (value: any) => {
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch (err) {}
  }
  return toString(value);
};

export const configStringToValue = (valueStr: string) => {
  if (isNumeric(valueStr)) {
    return toNumber(valueStr);
  }
  if (isBoolean(valueStr)) {
    return valueStr.toLowerCase() === "true";
  }
  if (isJSON(valueStr)) {
    return JSON.parse(valueStr);
  }
  return toString(valueStr);
};
