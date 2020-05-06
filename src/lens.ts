import { query as q, Expr, ExprArg } from 'faunadb'
import { get, mod } from 'shades'
export { get, mod, set, all } from 'shades'

import { FaunaLens, FaunaLensOrTraversal } from './types'

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

export const index = (name: string, ...moreTerms: ExprArg[]): FaunaLens => ({
  get: (obj) => q.Match(q.Index(name), [obj, ...moreTerms]),
  mod: (f) => (obj, ...args) =>
    f(q.Match(q.Index(name), [obj, ...moreTerms]), ...args),
})

export const paginate = (options?: object): FaunaLens => ({
  get: (set) => q.Paginate(set, options),
  mod: (f) => (set, ...args) => f(q.Paginate(set), ...args),
})

export const prop = (name: string, def: null | [] = null): FaunaLens => ({
  get: (obj) => q.Select(name, obj, def),
  mod: (f) => (obj, ...args) =>
    q.Merge(obj, { [name]: f(q.Select(name, obj, def), ...args) }),
})

export const compose = (...lenses: FaunaLensOrTraversal[]): FaunaLens => ({
  get: get(...lenses),
  mod: mod(...lenses),
})

export const path = (...names: string[]): FaunaLens =>
  compose(...names.map((name) => prop(name)))

export const push = (): FaunaLens => ({
  get: (arr) => arr,
  mod: (f) => (arr, ...args) => q.Append(arr, [f(arr, ...args)]),
})

export const update = (): FaunaLens => ({
  get: (obj) => obj,
  mod: (f) => (obj, ...args) =>
    q.If(
      q.IsRef(obj),
      q.Update(obj, f(obj, ...args)),
      q.Update(q.Select('ref', obj), f(obj, ...args))
    ),
})
