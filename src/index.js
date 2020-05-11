const {
  documents,
  getRef,
  paginate,
  prop,
  path,
  compose,
  get,
  mod,
  set,
  all,
} = require('./lens')
const { Query } = require('./Query')
const { concatMapped, fill, fnToLet, projection } = require('./utils')

module.exports = {
  documents,
  getRef,
  paginate,
  prop,
  path,
  compose,
  get,
  mod,
  set,
  all,

  Query,

  concatMapped,
  fill,
  fnToLet,
  projection,
}

require('dotenv').config()
const { Client, query: q } = require('faunadb')
const secret = process.env.FAUNADB_ADMIN_KEY
if (!secret) process.exit(1)
const client = new Client({ secret })

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

// const query = get(
//   documents(),
//   all(),
//   getRef(),
//   path('data', 'traits', 'hair')
// )(q.Collection('User'))
// console.log(JSON.stringify(query, null, 2))

// client
//   .query(query)
//   .then((res) => console.log(JSON.stringify(res, null, 2)))
//   .catch((e) => console.error(e))

// const query = q.Map([1, 2, 3], (x) => q.Add(x, 10))

// const newQuery = concatMapped((x) => q.Multiply(x, 10))(query)
// console.log(JSON.stringify(q.Format('%@', newQuery), null, 2))
// client
//   .query(newQuery)
//   .then((res) => console.log(JSON.stringify(res, null, 2)))
//   .catch((e) => console.error(e))
