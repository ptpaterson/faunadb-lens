// const daggy = require('daggy')
// const { Client, query: q } = require('faunadb')
// const flens = require('./faunaLens')
// const fn = require('./fnToLet')

// const Collection = (name) => ({
//   name,
//   query: () => Query.from(q.Collection(name)),
//   getOrCreate: () =>
//     Query.from(
//       q.If(
//         q.Exists(q.Collection(name)),
//         q.Get(q.Collection(name)),
//         q.CreateCollection({ name })
//       )
//     ),
//   addUniqueField: (fieldName) =>
//     fn((collectionRef) =>
//       Query.from(
//         q.CreateIndex({
//           name: `unique_${name}_${fieldName}`,
//           source: collectionRef,
//           unique: true,
//           terms: [{ field: ['data', name] }],
//         })
//       )
//     ),
// })

// const Index = (name) => ({
//   name,
//   query: (...terms) => Query.from(q.Match(q.Index(name, terms))),
// })

export const Collection = ''
export const Index = ''
