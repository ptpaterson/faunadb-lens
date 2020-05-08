const {
  append,
  deref,
  documents,
  index,
  paginate,
  path,
  prop,
  push,
  update,
  get,
  mod,
  set,
  all,
} = require('../lens')

const Query = (expr, lenses) => ({
  expr,
  lenses,
  all: () => Query(expr, [...lenses, all()]),
  append: () => Query(expr, [...lenses, append()]),
  deref: () => Query(expr, [...lenses, deref()]),
  documents: () => Query(expr, [...lenses, documents()]),
  index: (name, ...terms) => Query(expr, [...lenses, index(name, terms)]),
  paginate: (options) => Query(expr, [...lenses, paginate(options)]),
  path: (names) => Query(expr, [...lenses, path(...names)]),
  prop: (name) => Query(expr, [...lenses, prop(name)]),
  push: () => Query(expr, [...lenses, push()]),
  update: () => Query(expr, [...lenses, update()]),
  use: (lens) => Query(expr, [...lenses, lens]),
  get: () => get(...lenses)(expr),
  mod: (f) => mod(...lenses)(f)(expr),
  set: (value) => set(...lenses)(value)(expr),
})

Query.from = (expr) => Query(expr, [])

module.exports = { Query }
