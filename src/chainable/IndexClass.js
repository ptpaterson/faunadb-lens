const { query: q } = require('faunadb')
const { Query } = require('./Query')

class Index {
  constructor(name) {
    this.name = name
    this.ref = q.Index(this.name)
  }

  query(...terms) {
    return Query.from(q.Match(this.ref, ...terms))
  }
}

module.exports = { Index }
