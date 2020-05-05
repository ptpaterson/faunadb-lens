import { query as q, Expr, ExprArg, Lambda } from 'faunadb'
import * as shades from 'shades'
import { Lens } from 'shades'
export { get, mod, set, all } from 'shades'

type FaunaLens = Lens<ExprArg, ExprArg>
type FaunaTraversal = shades.Traversal<ExprArg>
type FaunaLensOrTraversal = FaunaLens | FaunaTraversal
type Projection = {
  [key: string]: FaunaLensOrTraversal[]
}

// Modify the Expr class to work be an iterator for shades
Expr.prototype.map = function (f: (o: Expr) => Expr) {
  return q.Map(this, f)
}

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

const viewKeys = (proj: Projection) => (obj: ExprArg) =>
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
    new Expr(
      proj.reduce(
        (result, value) =>
          typeof value === 'string'
            ? {
                ...result,
                [value]: shades.get(prop(value))(obj),
              }
            : { ...result, ...viewKeys(value)(obj) },
        {} as object
      )
    ),
  mod: (f) => (obj) => f(obj),
})

export const Query = (expr: ExprArg, lenses: FaunaLensOrTraversal[]) => ({
  expr,
  lenses,
  all: () => Query(expr, [...lenses, shades.all()]),
  append: () => Query(expr, [...lenses, append()]),
  deref: () => Query(expr, [...lenses, deref()]),
  documents: () => Query(expr, [...lenses, documents()]),
  index: (name: string, ...terms: ExprArg[]) =>
    Query(expr, [...lenses, index(name, terms)]),
  paginate: (options?: object) => Query(expr, [...lenses, paginate(options)]),
  path: (names: string[]) => Query(expr, [...lenses, path(...names)]),
  projection: (...proj: (string | Projection)[]) =>
    Query(expr, [...lenses, projection(...proj)]),
  prop: (name: string) => Query(expr, [...lenses, prop(name)]),
  push: () => Query(expr, [...lenses, push()]),
  update: () => Query(expr, [...lenses, update()]),
  use: (lens: FaunaLens) => Query(expr, [...lenses, lens]),
  get: () => shades.get(...lenses)(expr),
  mod: (f: Lambda) => shades.mod(...lenses)(f)(expr),
  set: (value: any) => shades.set(...lenses)(value)(expr),
})

Query.from = (expr: ExprArg) => Query(expr, [])
