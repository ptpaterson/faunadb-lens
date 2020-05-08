const {
  append,
  documents,
  deref,
  paginate,
  prop,
  path,
  compose,
  push,
  update,
  get,
  mod,
  set,
  all,
} = require('./lens')
const { Collection, Index, Query } = require('./chainable')
const { fill, newFill, fnToLet, projection } = require('./utils')

module.exports = {
  append,
  documents,
  deref,
  paginate,
  prop,
  path,
  compose,
  push,
  update,
  get,
  mod,
  set,
  all,

  Query,
  Collection,
  Index,

  fill,
  newFill,
  fnToLet,
  projection,
}

require('dotenv').config()
const { Client, query: q } = require('faunadb')
const secret = process.env.FAUNADB_ADMIN_KEY
if (!secret) process.exit(1)
const client = new Client({ secret })

const query = q.Update(q.Collection('User'), {
  data: newFill(q.Select('data', q.Get(q.Collection('User'))))({
    traits: {
      eyes: 'blue',
    },
  }),
})

console.log(JSON.stringify(query, null, 2))
client
  .query(query)
  .then((res) => console.log(JSON.stringify(res, null, 2)))
  .catch((e) => console.error(e))
