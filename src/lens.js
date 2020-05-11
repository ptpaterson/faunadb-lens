const { query: q, Expr } = require('faunadb')
const { all, get, mod, set } = require('shades')

const { concatMapped } = require('./utils')

// Modify the Expr class to work be an iterator for shades
Expr.prototype.map = function (f) {
  return this.raw && this.raw.map ? concatMapped(f)(this) : q.Map(this, f)
}

const compose = (...lenses) => ({
  get: get(...lenses),
  mod: mod(...lenses),
})

const documents = () => ({
  get: (collectionRef) => {
    return q.Let(
      { maybeCollectionRef: collectionRef },
      q.If(
        q.IsRef(q.Var('maybeCollectionRef')),
        q.Paginate(q.Documents(q.Var('maybeCollectionRef'))),
        q.Select('data', q.Var('maybeCollectionRef'), null) // when viewing the result of a mod
      )
    )
  },
  mod: (f) => (collectionRef, ...args) =>
    f(q.Paginate(q.Documents(collectionRef)), ...args),
})

const getRef = () => ({
  get: (ref) =>
    q.Let(
      { maybeRef: ref },
      q.If(q.IsRef(q.Var('maybeRef')), q.Get(ref), q.Var('maybeRef'))
    ),
  mod: (f) => (ref, ...args) => f(q.Get(ref), ...args),
})

const paginate = (options) => ({
  get: (set) => q.Paginate(set, options),
  mod: (f) => (set, ...args) => f(q.Paginate(set), ...args),
})

const prop = (name, def = null) => ({
  get: (obj) => q.Select(name, obj, def),
  mod: (f) => (obj, ...args) =>
    q.Let(
      {
        maybeRef: obj,
      },
      q.If(
        q.IsRef(q.Var('maybeRef')),
        q.Update(q.Var('maybeRef'), f(obj)),
        q.Merge(obj, { [name]: f(q.Select(name, obj, def), ...args) })
      )
    ),
})

const path = (...names) => compose(...names.map((name) => prop(name)))

module.exports = {
  documents,
  getRef,
  paginate,
  prop,
  path,
  compose,
  get,
  mod,
  set,
  all,
}
