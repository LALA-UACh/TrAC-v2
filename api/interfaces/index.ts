import type { PromiseType } from "utility-types";

import type { buildContext } from "../core/buildContext";

export type IContext = PromiseType<ReturnType<typeof buildContext>>;

/**
 * If B implements A, it gives A, otherwise, it gives never
 */
export type IfImplements<A, B> = B extends A ? A : never;
