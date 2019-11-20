import { DocumentNode } from "graphql-tag-ts";
import { useCallback, useEffect, useRef } from "react";

import { OperationVariables, QueryResult } from "@apollo/react-common";
import { LazyQueryHookOptions, QueryLazyOptions, useLazyQuery } from "@apollo/react-hooks";

/**
 * Due to useLazyQuery still not giving a promise, this is a workaround, please check https://github.com/apollographql/react-apollo/issues/3499
 * @param query GraphQL Query Tag
 * @param options Standard Apollo GraphQL query options
 */
export function usePromiseLazyQuery<TData = any, TVariables = OperationVariables>(
  query: DocumentNode<TData, TVariables>,
  options?: LazyQueryHookOptions<TData, TVariables>
): [
  (options: QueryLazyOptions<TVariables>) => Promise<QueryResult<TData, TVariables>>,
  QueryResult<TData, TVariables>
] {
  const [execute, result] = useLazyQuery<TData, TVariables>(query, options);

  const resolveRef = useRef<
    (
      value?:
        | QueryResult<TData, TVariables>
        | PromiseLike<QueryResult<TData, TVariables>>
        | undefined
    ) => void
  >();

  useEffect(() => {
    if (result.called && !result.loading && resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = undefined;
    }
  }, [result.loading, result.called]);

  const promiseExecute = useCallback(
    (options: QueryLazyOptions<TVariables>) => {
      execute(options);
      return new Promise<QueryResult<TData, TVariables>>(resolve => {
        resolveRef.current = resolve;
      });
    },
    [execute]
  );

  return [promiseExecute, result];
}
