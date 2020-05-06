import { Expr, Lambda } from 'faunadb'

declare module 'faunadb' {
  interface Expr {
    map: (f: Lambda) => Expr
  }
}
