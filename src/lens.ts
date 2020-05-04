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

type FaunaLens = shades.Lens<Expr, Expr>

export const append = (): FaunaLens => ({
  get: (arr) => arr,
  mod: (f) => (arr, ...args) => q.Append(arr, f(arr, ...args)),
})

export const documents = (): FaunaLens => ({
  get: (collectionRef) => q.Documents(collectionRef),
  mod: (f) => (collectionRef, ...args) =>
    f(q.Documents(collectionRef), ...args),
})

export const deref = (): FaunaLens => ({
  get: (ref) => q.Get(ref),
  mod: (f) => (ref, ...args) => f(q.Get(ref), ...args),
})

// const map = (mapFn) => ({
//   name: 'get',
//   get: (obj) => mapFn(obj),
//   mod: (f) => (obj, ...args) => f(mapFn(obj), ...args),
// })

export const index = (name: string, ...moreTerms: ExprArg[]): FaunaLens => ({
  get: (obj) => q.Match(q.Index(name), [obj, ...moreTerms]),
  mod: (f) => (obj, ...args) =>
    f(q.Match(q.Index(name), [obj, ...moreTerms]), ...args),
})

export const paginate = (options?: object): FaunaLens => ({
  get: (set) => q.Paginate(set, options),
  mod: (f) => (set, ...args) => f(q.Paginate(set), ...args),
})

export const prop = (name: string, missing: null | [] = null): FaunaLens => ({
  get: (obj) => q.Select(name, obj, missing),
  mod: (f) => (obj, ...args) =>
    q.Merge(obj, { [name]: f(q.Select(name, obj, missing), ...args) }),
})

type FaunaLensOrTraversal = shades.Lens<Expr, Expr> | shades.Traversal<Expr>

export const compose = (...lenses: FaunaLensOrTraversal[]): FaunaLens => ({
  get: shades.get(...lenses),
  mod: shades.mod(...lenses),
})

export const path = (...names: string[]): FaunaLens =>
  compose(...names.map((name) => prop(name)))

export const push = (): FaunaLens => ({
  get: (arr) => arr,
  mod: (f) => (arr, ...args) => q.Append(arr, [f(arr, ...args)]),
})

export const update = (): FaunaLens => ({
  get: (ref) => ref,
  mod: (f) => (ref, ...args) => q.Update(ref, f(ref, ...args)),
})

// const isProjection = (o: string | object) => !!o && o.constructor === Object

type Projection = {
  [key: string]: FaunaLensOrTraversal[]
}

const viewKeys = (proj: Projection) => (obj: object) =>
  Object.keys(proj).reduce(
    (result, key) => ({
      ...result,
      // eslint-disable-next-line
      // @ts-ignore
      [key]: shades.get(...proj[key])(obj),
    }),
    {}
  )

export const projection = (...proj: (string | Projection)[]): FaunaLens => ({
  get: (obj) =>
    proj.reduce(
      (result, value) =>
        typeof value === 'string'
          ? {
              ...result,
              [value]: shades.get(prop(value))(obj),
            }
          : { ...result, ...viewKeys(value)(obj) },
      {} as object
    ),
  mod: (f) => (obj) => f(obj),
})

export const Query = (obj: Expr, lenses: FaunaLensOrTraversal[]) => ({
  obj,
  // type,
  lenses,
  all: () => Query(obj, [...lenses, shades.all()]),
  append: () => Query(obj, [...lenses, append()]),
  deref: () => Query(obj, [...lenses, deref()]),
  documents: () => Query(obj, [...lenses, documents()]),
  index: (name: string, ...terms: ExprArg[]) =>
    Query(obj, [...lenses, index(name, terms)]),
  // into: (...args) => Query(obj, [...lenses, shades.into(...args)]),
  paginate: (options?: object) => Query(obj, [...lenses, paginate(options)]),
  path: (names: string[]) => Query(obj, [...lenses, path(...names)]),
  projection: (...proj: (string | Projection)[]) =>
    Query(obj, [...lenses, projection(...proj)]),
  prop: (name: string) => Query(obj, [...lenses, prop(name)]),
  push: () => Query(obj, [...lenses, push()]),
  update: () => Query(obj, [...lenses, update()]),
  use: (lens: FaunaLens) => Query(obj, [...lenses, lens]),
  get: () => shades.get(...lenses)(obj),
  mod: (f: Function) => shades.mod(...lenses)(f)(obj),
  set: (value: any) => shades.set<Expr, Expr>(...lenses)(value)(obj),
})

Query.from = (obj) => Query(obj, [])
