const { query: q, Expr } = require('faunadb')
const { get } = require('shades')
const { prop } = require('../lens')
const { fnToLet, mergeNullable, objectKeys } = require('./fql')

const isProjectionFunction = (x) => typeof x === 'function'

const isFilling = (x) =>
  !(x instanceof Expr) &&
  typeof x === 'object' &&
  !Array.isArray(x) &&
  x !== null

const viewKeys = (proj) => (obj) =>
  Object.keys(proj).reduce((result, key) => {
    const value = proj[key]

    return {
      ...result,
      [key]: isProjectionFunction(value) ? value(obj) : value,
    }
  }, {})

const projection = (...proj) => (obj) =>
  new Expr(
    proj.reduce(
      (result, value) =>
        typeof value === 'string'
          ? {
              ...result,
              [value]: get(prop(value))(obj),
            }
          : { ...result, ...viewKeys(value)(obj) },
      {}
    )
  )

// const mergeFilling = (fillValue, objValue) => {
//   const fql = fnToLet((fillVar, objVar) =>
//     q.If(
//       q.Or(q.IsNull(objVar), q.Not(q.IsObject(objVar))),
//       fillVar,
//       isFilling(fillValue) ? fill(fillValue)(objVar) : fillVar
//     )
//   )

//   return fql(fillValue, objValue)
// }

const mergeFilling = (objValue, fillValue) => {
  const fql = fnToLet((objVar) =>
    q.If(
      q.Or(q.IsNull(objVar), q.Not(q.IsObject(objVar))),
      fillValue,
      fill(fillValue)(objVar)
    )
  )
  return !isFilling(fillValue) ? fillValue : fql(objValue)
}

const fill = (filling) => (obj) => {
  const toMerge = {}
  Object.entries(filling).forEach(([key, value]) => {
    console.log({ key, value })
    toMerge[key] = mergeFilling(q.Select(key, obj, null), value)
  })

  return mergeNullable(obj, toMerge)
}

const newFill = (object1) => (object2) => {
  return q.ToObject(
    q.Append(
      q.Map(objectKeys(object2), (key, value) =>
        q.If(
          q.And(
            q.IsObject(q.Select(key, object1, null)),
            q.IsObject(q.Select(key, object2))
          ),
          // [key, newFill(q.Select(key, object1), q.Select(key, object2))],
          [key, 'Deep!!!'],
          [key, value]
        )
      ),

      q.ToArray(object1)
    )
  )
}

// const map = (mapFn) => ({
//   name: 'get',
//   get: (obj) => mapFn(obj),
//   mod: (f) => (obj, ...args) => f(mapFn(obj), ...args),
// })

module.exports = {
  fill,
  newFill,
  projection,
}
