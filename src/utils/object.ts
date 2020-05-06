import { query as q, Expr, ExprArg } from 'faunadb'
import { get, mod } from 'shades'
export { get, mod, set, all } from 'shades'

import { prop } from '../lens'

type ProjectionFunction = (obj: ExprArg) => ExprArg

export type Projection = {
  [key: string]: ProjectionFunction | ExprArg
}

export type Filling = {
  [key: string]: ExprArg
}

const isProjectionFunction = (x: ExprArg): x is ProjectionFunction =>
  typeof x === 'function'

const isFilling = (x: ExprArg): x is Filling =>
  !(x instanceof Expr) &&
  typeof x === 'object' &&
  !Array.isArray(x) &&
  x !== null

const viewKeys = (proj: Projection) => (obj: ExprArg) =>
  Object.keys(proj).reduce((result, key) => {
    const value = proj[key]

    return {
      ...result,
      [key]: isProjectionFunction(value) ? value(obj) : value,
    }
  }, {})

export const projection = (...proj: (string | Projection)[]) => (
  obj: ExprArg
) =>
  new Expr(
    proj.reduce(
      (result, value) =>
        typeof value === 'string'
          ? {
              ...result,
              [value]: get(prop(value))(obj),
            }
          : { ...result, ...viewKeys(value)(obj) },
      {} as object
    )
  )

export const fill = (filling: Filling) => (obj: ExprArg) => {
  const toMerge = {} as Filling
  Object.entries(filling).forEach(([key, value]) => {
    toMerge[key] = q.If(
      q.Or(
        q.IsNull(q.Select(key, obj, null)),
        q.Not(q.IsObject(q.Select(key, obj)))
      ),
      value,
      isFilling(value) ? fill(value)(q.Select(key, obj)) : value
    )
  })

  return q.Merge(obj, toMerge)
}

// const map = (mapFn) => ({
//   name: 'get',
//   get: (obj) => mapFn(obj),
//   mod: (f) => (obj, ...args) => f(mapFn(obj), ...args),
// })
