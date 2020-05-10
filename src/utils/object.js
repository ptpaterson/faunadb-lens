const { query: q, Expr } = require('faunadb')
const { get } = require('shades')
const { prop } = require('../lens')
const { fnToLet, mergeNullable } = require('./fql')

// private helpers

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

// public functions

const fill = (filling) => (obj) => {
  const toMerge = {}
  Object.entries(filling).forEach(([key, value]) => {
    console.log({ key, value })
    toMerge[key] = mergeFilling(q.Select(key, obj, null), value)
  })

  return mergeNullable(obj, toMerge)
}

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

module.exports = {
  fill,
  projection,
}
