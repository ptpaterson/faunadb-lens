const { query: q } = require('faunadb')

const append = (x) => (xs) => q.Append(x, xs)
const documents = (collectionRef) => q.Documents(collectionRef)
const update = (obj) => (ref) => q.Update(ref, obj)

module.exports = { append, documents, update }
