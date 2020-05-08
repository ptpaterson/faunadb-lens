const { query: q } = require('faunadb')
const { Query } = require('./Query')
const { fnToLet } = require('../utils')

class Collection {
  constructor(name) {
    this.name = name
    this.ref = q.Collection(name)
  }

  addUniqueField(fieldName) {
    return Query.from(
      fnToLet((collectionRef) =>
        q.CreateIndex({
          name: `unique_${this.name}_${fieldName}`,
          source: collectionRef,
          unique: true,
          terms: [{ field: ['data', fieldName] }],
        })
      )(this.ref)
    )
  }

  documents() {
    return Query.from(q.Documents(this.ref))
  }

  drop() {
    return Query.from(q.Delete(this.ref))
  }

  findById(id) {
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

module.exports = {
  Collection,
}

// const User = new Collection('User')

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
