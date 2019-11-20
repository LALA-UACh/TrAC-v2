import { $ElementType, $PropertyType } from "utility-types";

/**
 * If B implements A, it gives A, otherwise, it gives never
 */
export type IfImplements<A, B> = B extends A ? A : never;

/**
 * Extract the property type from an array inside the field of an object
 */
export type ArrayPropertyType<O extends object, F extends keyof O> = $ElementType<
  $PropertyType<O, F>,
  number
>;
