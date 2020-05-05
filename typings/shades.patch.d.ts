import { get, set, Lens, Traversal } from 'shades'
import { Expr, ExprArg, Lambda } from 'faunadb'

type FaunaLens = Lens<ExprArg, ExprArg>
type FaunaTraversal = Traversal<ExprArg>
type FaunaLensOrTraversal = FaunaLens | FaunaTraversal

declare module 'shades' {
  export function get(
    ...lenses: FaunaLensOrTraversal[]
  ): (s: ExprArg) => ExprArg

  export function set(
    ...lenses: FaunaLensOrTraversal[]
  ): (v: ExprArg) => (s: ExprArg) => ExprArg

  export function mod(
    ...lenses: FaunaLensOrTraversal[]
  ): (f: (...args: any[]) => any) => (s: ExprArg) => ExprArg
}
