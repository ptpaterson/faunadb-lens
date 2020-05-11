const { query: q } = require('faunadb')
const { createTestDB, store } = require('./db')
const {
  all,
  compose,
  documents,
  getRef,
  paginate,
  path,
  prop,
  get,
  mod,
  set,
} = require('../src')

const concatBar = (x) => q.Concat([x, 'bar'])

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

  // **************************************************************************
  // **************************************************************************
  // **************************************************************************

  describe('prop(name)', () => {
    // note this does not update the database, only creates a working copy
    const tested = q.Get(q.Documents(q.Collection('User')))
    const lens = path('data', 'name') // path = prop, prop, prop...

    it('can "get" the focus', async () => {
      const expected = 'Jack Sparrow'
      const query = get(lens)(tested)
      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('obeys first law', async () => {
      const expected = 'bar'
      const query = get(lens)(set(lens)('bar')(tested))

      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('obeys first law with "mod"', async () => {
      const expected = 'Jack Sparrowbar'
      const query = get(lens)(mod(lens)(concatBar)(tested))

      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('obeys second law', async () => {
      const expected = 'bar'
      const query = set(lens)('bar')(set(lens)('quux')(tested))

      const result = await db.client.query(query)
      expect(result.data.name).toEqual(expected)
    })

    it('obeys third law', async () => {
      const expected = 'Jack Sparrow'
      const query = q.Let(
        {
          tested,
        },
        set(lens)(get(lens)(tested))(tested)
      )
      const result = await db.client.query(query)
      expect(result.data.name).toEqual(expected)
    })
  })

  // **************************************************************************
  // **************************************************************************
  // **************************************************************************

  describe('documents, all, dref, and compose', () => {
    const tested = q.Collection('User')
    const lens = compose(documents(), all(), getRef(), path('data', 'name'))

    it('can "get" the focus', async () => {
      const query = get(lens)(tested)
      const expected = {
        data: ['Jack Sparrow', 'Elizabeth Swan', 'Bill Turner'],
      }

      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('obeys the first law', async () => {
      const query = get(lens)(set(lens)('bar')(tested))
      const expected = ['bar', 'bar', 'bar']

      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('obeys the first law with "mod"', async () => {
      const query = get(lens)(mod(lens)(concatBar)(tested))
      const expected = [
        'Jack Sparrowbar',
        'Elizabeth Swanbar',
        'Bill Turnerbar',
      ]

      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it('disobeys second law, predictably', async () => {
      const expected = 'bar'
      const query = set(lens)('bar')(set(lens)('quux')(tested))

      const result = await db.client.query(query)
      expect(result).toEqual(expected)
    })

    it.only('disobeys third law, predictably', async () => {
      const expected = [
        ['Jack Sparrow', 'Elizabeth Swan', 'Bill Turner'],
        ['Jack Sparrow', 'Elizabeth Swan', 'Bill Turner'],
        ['Jack Sparrow', 'Elizabeth Swan', 'Bill Turner'],
      ]
      const query = set(lens)(get(lens)(tested))(tested)

      const result = await db.client.query(query)
      expect(get('data', all(), 'data', 'name', 'data')(result)).toEqual(
        expected
      )
    })
  })
})
