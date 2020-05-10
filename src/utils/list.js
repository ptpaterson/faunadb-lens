const { query: q } = require('faunadb')

const cons = (x) => (xs) => q.Append(x, xs)

module.exports = { cons }
