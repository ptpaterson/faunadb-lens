const { query: q } = require('faunadb')
const annotate = require('fn-annotate')

/* converts a function into a faunaDB Let expression, but allows it to be used,
 * as a regular function.  This allows functions to be composed in JS land and
 * turn out correctly in Fauna land.
 */

const fnToLet = (fn) => (...args) => {
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

const mergeNullable = (obj1, obj2) =>
  q.ToObject(q.Append(q.ToArray(obj2), q.ToArray(obj1)))

const objectKeys = (obj) => q.Map(q.ToArray(obj), (key, _) => key)
const objectValues = (obj) => q.Map(q.ToArray(obj), (_, value) => value)

const refOrAbort = (message) =>
  fnToLet((ref) => q.If(q.Exists(ref), ref, q.Abort(message)))

module.exports = {
  fnToLet,
  mergeNullable,
  objectKeys,
  objectValues,
  refOrAbort,
}
