import { query as q, Expr } from 'faunadb'
import { Query } from './Query'
import { fnToLet } from '../utils/fql'

export class Collection {
  name: string
  ref: Expr

  constructor(name: string) {
    this.name = name
    this.ref = q.Collection(name)
  }

  addUniqueField(fieldName: string) {
    return fnToLet((collectionRef) =>
      Query.from(
        q.CreateIndex({
          name: `unique_${this.name}_${fieldName}`,
          source: collectionRef,
          unique: true,
          terms: [{ field: ['data', fieldName] }],
        })
      ).get()
    )(this.ref)
  }

  documents() {
    return Query.from(q.Documents(this.ref))
  }

  findById(id: string) {
    return Query.from(q.Ref(this.ref, id))
  }

  getOrCreate() {
    return Query.from(
      q.If(
        q.Exists(this.ref),
        q.Get(this.ref),
        q.CreateCollection({ name: this.name })
      )
    )
  }

  query() {
    return Query.from(this.ref)
  }
}

export const Index = (name: string) => ({
  name,
  query: (...terms: Expr[]) => Query.from(q.Match(q.Index(name, terms))),
})

// export const Collection = ''
// export const Index = ''

const User = new Collection('User')

// const do = [
//   User.getOrCreate().update().
// ]

// const result = Task(User.addUniqueField('email'))

// const results = fn((collectionRef) => {
//   return {
//     one: Query.from(
//       q.CreateIndex({
//         name: `abadname`,
//         source: collectionRef,
//         unique: true,
//         terms: [{ field: ['data', 'noName'] }],
//       })
//     ).get(),
//     two: Query.from(
//       q.CreateIndex({
//         name: `abadname`,
//         source: collectionRef,
//         unique: true,
//         terms: [{ field: ['data', 'noName'] }],
//       })
//     ).get(),
//   }
// })
