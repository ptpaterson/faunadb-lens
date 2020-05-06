export * from './types'

export * from './lens'
export * from './chainable'
export * from './utils'

require('dotenv').config()
import { Client, query as q } from 'faunadb'
import { fill, fnToLet } from './utils'

const secret = process.env.FAUNADB_ADMIN_KEY
if (!secret) process.exit(1)

const client = new Client({ secret })

const fn = fnToLet((ref) =>
  fill({
    traits: {
      hair: 'brown',
    },
    other: 'cool beans',
  })(q.Select('data', q.Get(ref)))
)

const query = q.Update(q.Collection('User'), fn(q.Collection('User')))

console.log(JSON.stringify(query, null, 2))

client
  .query(query)
  .then((res) => console.log(res))
  .catch((e) => console.error(e))
