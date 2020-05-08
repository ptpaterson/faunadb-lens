const { query: q } = require('faunadb')
const { nanohash } = require('nanohash')
const { Query } = require('./Query')
const { fnToLet } = require('../utils')

class Database {
  constructor(name) {
    this.name = name
    this.ref = q.Database(name)
  }

  static fromHash() {
    const hasher = nanohash({ size: 9 })
    return new Database(hasher.generate())
  }

  createKey(role) {
    // return Query.from(q.CreateKey({ database: this.ref, role}))
    return Query.from(
      fnToLet((dbRef) => q.CreateKey({ database: dbRef, role }))(
        this.getOrCreate().prop('ref').get()
      )
    )
  }

  drop() {
    return Query.from(q.Delete(this.ref))
  }

  getOrCreate() {
    return Query.from(
      q.If(
        q.Exists(this.ref),
        q.Get(this.ref),
        q.CreateDatabase({ name: this.name })
      )
    )
  }

  query() {
    return Query.from(this.ref)
  }
}

module.exports = {
  Database,
}
