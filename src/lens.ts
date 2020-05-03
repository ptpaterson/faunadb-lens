import { query as q, Expr, ExprArg } from 'faunadb'
import * as shades from 'shades'
export { get, mod, set, all } from 'shades'

// import fn from './fnToLet'

// Modify the Expr class to work be an iterator for shades
// eslint-disable-next-line
// @ts-ignore
Expr.prototype.map = function (f: (o: Expr) => Expr) {
  return q.Map(this, f)
}

type FaunaLensFunction = <T extends (...a: any[]) => shades.Lens<Expr, Expr>>(...args) 

export const append = ()  => ({
  get: (arr) => arr,
  mod: (f) => (arr, ...args) => q.Append(arr, f(arr, ...args)),
})

export const documents = () => ({
  name: 'documents',
  get: (collectionRef) => q.Documents(collectionRef),
  mod: (f) => (collectionRef, ...args) => f(q.Documents(collectionRef)),
})

export const deref = () => ({
  name: 'get',
  get: (ref) => q.Get(ref),
  mod: (f) => (ref, ...args) => f(q.Get(ref), ...args),
})

// const map = (mapFn) => ({
//   name: 'get',
//   get: (obj) => mapFn(obj),
//   mod: (f) => (obj, ...args) => f(mapFn(obj), ...args),
// })

export const index = (name, ...moreTerms) => ({
  name: 'index',
  get: (obj) => q.Match(q.Index(name), [obj, ...moreTerms]),
  mod: (f) => (obj, ...args) => f(q.Match(q.Index(name), [obj, ...moreTerms])),
})

export const paginate = (options) => ({
  name: 'page',
  get: (set) => q.Paginate(set, options),
  mod: (f) => (set, ...args) => f(q.Paginate(set)),
})

export const prop = (name) => ({
  name: 'prop',
  get: (obj) => q.Select(name, obj, null),
  mod: (f) => (obj, ...args) =>
    q.Merge(obj, { [name]: f(q.Select(name, obj, null), ...args) }),
})

export const compose = (...lenses) => ({
  get: shades.get(...lenses),
  mod: shades.mod(...lenses),
})

export const path = (...names) => compose(...names.map((name) => prop(name)))

export const push = () => ({
  name: 'push',
  get: (arr) => arr,
  mod: (f) => (arr, ...args) => q.Append(arr, [f(arr, ...args)]),
})

export const update = () => ({
  name: 'update',
  get: (ref) => ref,
  mod: (f) => (ref, ...args) => q.Update(ref, f(ref, ...args)),
})

const isObject = (o) => !!o && o.constructor === Object

const viewKeys = (proj) => (obj) =>
  Object.keys(proj).reduce(
    (result, key) => ({
      ...result,
      [key]: shades.get(...proj[key])(obj),
    }),
    {}
  )

export const projection = (...proj) => ({
  name: 'projection',
  get: (obj) =>
    proj.reduce(
      (result, value) =>
        isObject(value)
          ? { ...result, ...viewKeys(value)(obj) }
          : typeof value === 'string'
          ? {
              ...result,
              [value]: shades.get(prop(value))(obj),
            }
          : result,
      {}
    ),
  // traversal: true,
})

export const Query = (obj, lenses) => ({
  obj,
  // type,
  lenses,
  all: () => Query(obj, [...lenses, shades.all()]),
  append: () => Query(obj, [...lenses, append()]),
  deref: () => Query(obj, [...lenses, deref()]),
  documents: () => Query(obj, [...lenses, documents()]),
  index: (...args) => Query(obj, [...lenses, index(...args)]),
  // into: (...args) => Query(obj, [...lenses, shades.into(...args)]),
  paginate: (...args) => Query(obj, [...lenses, paginate(...args)]),
  path: (...args) => Query(obj, [...lenses, path(...args)]),
  projection: (...args) => Query(obj, [...lenses, projection(...args)]),
  prop: (...args) => Query(obj, [...lenses, prop(...args)]),
  push: () => Query(obj, [...lenses, push()]),
  update: () => Query(obj, [...lenses, update()]),
  use: (lens) => Query(obj, [...lenses, lens]),
  get: () => shades.get(...lenses)(obj),
  mod: (f) => shades.mod(...lenses)(f)(obj),
  set: (value) => shades.set(...lenses)(value)(obj),
})

Query.from = (obj) => Query(obj, [])
