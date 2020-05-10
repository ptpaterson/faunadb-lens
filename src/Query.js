const {
  append,
  deref,
  documents,
  paginate,
  path,
  prop,
  push,
  update,
  get,
  mod,
  set,
  all,
} = require('./lens')

class Query {
  constructor(expr, lenses) {
    this.expr = expr
    this.lenses = lenses
  }

  static from(expr) {
    return new Query(expr, [])
  }

  all() {
    return new Query(this.expr, [...this.lenses, all()])
  }

  append() {
    return new Query(this.expr, [...this.lenses, append()])
  }

  deref() {
    return new Query(this.expr, [...this.lenses, deref()])
  }

  documents() {
    return new Query(this.expr, [...this.lenses, documents()])
  }

  paginate(options) {
    return new Query(this.expr, [...this.lenses, paginate(options)])
  }

  path(names) {
    return new Query(this.expr, [...this.lenses, path(...names)])
  }

  prop(name) {
    return new Query(this.expr, [...this.lenses, prop(name)])
  }

  push() {
    return new Query(this.expr, [...this.lenses, push()])
  }

  update() {
    return new Query(this.expr, [...this.lenses, update()])
  }

  use(lens) {
    return new Query(this.expr, [...this.lenses, lens])
  }

  get() {
    get(...this.lenses)(this.expr)
  }

  mod(f) {
    mod(...this.lenses)(f)(this.expr)
  }

  set(value) {
    set(...this.lenses)(value)(this.expr)
  }
}

module.exports = { Query }
