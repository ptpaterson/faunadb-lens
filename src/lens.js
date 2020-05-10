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

const append = () => ({
  get: (arr) => arr,
  mod: (f) => (arr, ...args) => q.Append(arr, f(arr, ...args)),
})

const documents = () => ({
  get: (collectionRef) => q.Documents(collectionRef),
  mod: (f) => (collectionRef, ...args) =>
    f(q.Documents(collectionRef), ...args),
})

const deref = () => ({
  get: (ref) => q.Get(ref),
  mod: (f) => (ref, ...args) => f(q.Get(ref), ...args),
})

const paginate = (options) => ({
  get: (set) => q.Paginate(set, options),
  mod: (f) => (set, ...args) => f(q.Paginate(set), ...args),
})

const prop = (name, def) => ({
  get: (obj) => q.Select(name, obj, def),
  mod: (f) => (obj, ...args) =>
    q.Merge(obj, { [name]: f(q.Select(name, obj, def), ...args) }),
})

const path = (...names) => compose(...names.map((name) => prop(name)))

const push = () => ({
  get: (arr) => arr,
  mod: (f) => (arr, ...args) => q.Append(arr, [f(arr, ...args)]),
})

const update = () => ({
  get: (obj) => obj,
  mod: (f) => (obj, ...args) =>
    q.If(
      q.IsRef(obj),
      q.Update(obj, f(obj, ...args)),

      q.Update(q.Select('ref', obj), f(obj, ...args))
    ),
})

module.exports = {
  append,
  documents,
  deref,
  paginate,
  prop,
  path,
  compose,
  push,
  update,
  get,
  mod,
  set,
  all,
}
