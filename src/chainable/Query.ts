import { ExprArg, Lambda } from 'faunadb'
import { get, mod, set, all } from 'shades'

import { FaunaLens, FaunaLensOrTraversal } from '../types'
import {
  append,
  deref,
  documents,
  index,
  paginate,
  path,
  prop,
  push,
  update,
} from '../lens'

export const Query = (expr: ExprArg, lenses: FaunaLensOrTraversal[]) => ({
  expr,
  lenses,
  all: () => Query(expr, [...lenses, all()]),
  append: () => Query(expr, [...lenses, append()]),
  deref: () => Query(expr, [...lenses, deref()]),
  documents: () => Query(expr, [...lenses, documents()]),
  index: (name: string, ...terms: ExprArg[]) =>
    Query(expr, [...lenses, index(name, terms)]),
  paginate: (options?: object) => Query(expr, [...lenses, paginate(options)]),
  path: (names: string[]) => Query(expr, [...lenses, path(...names)]),
  // projection: (...proj: (string | Projection)[]) =>
  //   Query(expr, [...lenses, projection(...proj)]),
  prop: (name: string) => Query(expr, [...lenses, prop(name)]),
  push: () => Query(expr, [...lenses, push()]),
  update: () => Query(expr, [...lenses, update()]),
  use: (lens: FaunaLens) => Query(expr, [...lenses, lens]),
  get: () => get(...lenses)(expr),
  mod: (f: Lambda) => mod(...lenses)(f)(expr),
  set: (value: any) => set(...lenses)(value)(expr),
})

Query.from = (expr: ExprArg) => Query(expr, [])
