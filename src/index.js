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
const { Query } = require('./Query')
const { fill, fnToLet, projection } = require('./utils')

module.exports = {
  documents,
  deref,
  paginate,
  prop,
  path,
  compose,
  get,
  mod,
  set,
  all,

  Query,

  fill,
  fnToLet,
  projection,
}

require('dotenv').config()
const { Client, query: q } = require('faunadb')
const secret = process.env.FAUNADB_ADMIN_KEY
if (!secret) process.exit(1)
const client = new Client({ secret })

// const tested = [1, 2, 3]
// const expected = [1, 2, 3, 4]
// const setQuery = set(append())([4])(tested)
// client
//   .query(setQuery)
//   .then((res) => console.log(JSON.stringify(res, null, 2)))
//   .catch((e) => console.error(e))

// const getQuery = q.Let(
//   {
//     collection: q.CreateCollection({ name: 'documentsTest' }),
//     collectionRef: q.Select('ref', q.Var('collection')),
//     doc: q.Create(q.Var('collectionRef'), { data: { field: true } }),
//   },
//   q.Paginate(get(documents())(q.Var('collectionRef')))
// )
// client
//   .query(getQuery)
//   .then((res) => console.log(JSON.stringify(res, null, 2)))
//   .catch((e) => console.error(e))

// const getQuery = q.mod
//   (documents(), page(), data(), path(0, 'tags'))
//   (cons('cool peoples'))
//   (collection('User'))
// client
//   .query(getQuery)
//   .then((res) => console.log(JSON.stringify(res, null, 2)))
//   .catch((e) => console.error(e))

const query = get(
  documents(),
  all(),
  deref(),
  path('data', 'name')
)(q.Collection('User'))

client
  .query(query)
  .then((res) => console.log(JSON.stringify(res, null, 2)))
  .catch((e) => console.error(e))
