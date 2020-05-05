import { Expr, ExprArg, Lambda } from 'faunadb'

declare module 'faunadb' {
  interface Expr {
    map: (f: Lambda) => Expr
  }
}
