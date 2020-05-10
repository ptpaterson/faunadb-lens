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

  fill,
  fnToLet,
  projection,
}
