import { ExprArg } from 'faunadb'
import { Lens, Traversal } from 'shades'

export type FaunaLens = Lens<ExprArg, ExprArg>
export type FaunaTraversal = Traversal<ExprArg>
export type FaunaLensOrTraversal = FaunaLens | FaunaTraversal
