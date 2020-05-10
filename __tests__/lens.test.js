const { Client, query: q } = require('faunadb')

const secret = process.env.FAUNADB_ADMIN_KEY
if (!secret) process.exit(1)

describe('Build and Test on a new DB', () => {
  const adminClient = new Client({ secret })
  const DATABASE_NAME = 'Test-Lens'
  let childSecret = ''
  let childClient

  beforeAll(async () => {
    childSecret = (
      await adminClient.query(
        q.CreateKey({
          name: `temp server key for ${DATABASE_NAME}`,
          database: q.Database(DATABASE_NAME),
          role: 'server',
        })
      )
    ).secret
    console.log(childSecret)
    childClient = await new Client({ secret: childSecret })
  })

  afterAll(() => {
    if (childSecret) {
      return adminClient.query(
        q.Do([
          q.Delete(q.Database(DATABASE_NAME)),
          q.Delete(q.Select('ref', q.KeyFromSecret(childSecret))),
        ])
      )
    }
  })

  test('Fauna is on', () => {
    return childClient.query({
      result: true,
    })
  })
})
