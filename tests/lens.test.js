const { query: q } = require('faunadb')
const { createTestDB } = require('./db')
const {
  all,
  documents,
  deref,
  paginate,
  path,
  prop,
  get,
  mod,
  set,
} = require('../src')

describe('Build and Test on a new DB', () => {
  let db

  beforeAll(async () => {
    db = await createTestDB()
  })

  afterAll(() => {
    if (db) {
      return db.drop()
    }
  })

  test('Fauna is on', async () => {
    const result = await db.client.query({
      result: true,
    })

    expect(result.result).toBe(true)
  })

  describe('prop(name)', () => {
    const tested = { foo: 'qux' }
    const lens = prop('foo')

    it('can be used with "get"', async () => {
      const expected = 'qux'
      const query = q.Let({ tested }, get(lens)(q.Var('tested')))
      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('can be used with "mod"', async () => {
      const expected = { foo: 'quxbar' }
      const query = q.Let(
        { tested },
        mod(lens)((x) => q.Concat([x, 'bar']))(q.Var('tested'))
      )
      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('can be used with "set"', async () => {
      const expected = { foo: 'bar' }
      const query = q.Let({ tested }, set(lens)('bar')(q.Var('tested')))
      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('obeys first law', async () => {
      const expected = 'bar'
      const query = q.Let(
        {
          tested,
        },
        get(lens)(set(lens)('bar')(q.Var('tested')))
      )
      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('obeys second law', async () => {
      const expected = { foo: 'bar' }
      const query = q.Let(
        {
          tested,
        },
        set(lens)('bar')(set(lens)('quux')(q.Var('tested')))
      )
      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('obeys third law', async () => {
      const query = q.Let(
        {
          tested,
        },
        set(lens)(get(lens)(q.Var('tested')))(q.Var('tested'))
      )
      const result = await db.client.query(query)
      expect(result).toEqual(tested)
    })
  })

  describe('documents()', () => {
    it('can be used with "get"', async () => {
      const query = get(
        documents(),
        all(),
        deref(),
        path('data', 'name')
      )(q.Collection('User'))
      const expected = {
        data: ['Jack Sparrow', 'Elizabeth Swan', 'Bill Turner'],
      }

      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it.skip('makes no sense with "mod', () => {})
    it.skip('makes no sense with "set', () => {})
  })
})
