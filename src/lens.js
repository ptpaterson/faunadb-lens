const { query: q, Expr } = require('faunadb')
const { all, get, mod, set } = require('shades')

// Modify the Expr class to work be an iterator for shades
Expr.prototype.map = function (f) {
  return q.Map(this, f)
}

const compose = (...lenses) => ({
  get: get(...lenses),
  mod: mod(...lenses),
})

const documents = () => ({
  get: (collectionRef) => q.Paginate(q.Documents(collectionRef)),
  mod: (f) => (collectionRef, ...args) =>
    f(q.Paginate(q.Documents(collectionRef)), ...args),
})

const deref = () => ({
  get: (ref) => q.Get(ref),
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
        q.Update(q.Var('maybeRef'), q.Merge(obj, { [name]: f(q.Select(name, obj, def), ...args) }))
        q.Merge(obj, { [name]: f(q.Select(name, obj, def), ...args) })
      )
    ),
})

const path = (...names) => compose(...names.map((name) => prop(name)))

module.exports = {
  documents,
  deref,
  paginate,
  prop,
  path,
  compose,
  get,
  mod,
  set,
  all,
}
