import { get, set } from 'shades'
import { ExprArg } from 'faunadb'

import { FaunaLensOrTraversal } from '../types'

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
