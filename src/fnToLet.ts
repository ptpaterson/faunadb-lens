import { query as q, Expr } from 'faunadb'
import annotate from 'fn-annotate'

/* *****************************************************************************
 * Higher Order Function Types from
 * https://spin.atomicobject.com/2019/01/11/typescript-higher-order-functions/
 */
type Parameters<T extends (...args: any[]) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never
/* ****************************************************************************/

// a very important utility!!
// converts a function into a faunaDB Let expression, but allows it to be used,
// as a regular function.  This allows functions to be composed in JS land and
// turn out correctly in Fauna land.
const fnToLet = <T extends (...args: any[]) => any>(fn: T) => (
  ...args: Parameters<T>
): Expr => {
  const params = annotate(fn)
  const arity = params.length
  const bindings = args.reduce(
    (result, arg, index) =>
      index < arity
        ? [
            ...result,
            {
              [params[index]]: arg,
            },
          ]
        : result,
    []
  )

  return q.Let(bindings, fn(...params.map((param) => q.Var(param))))
}

export default fnToLet
