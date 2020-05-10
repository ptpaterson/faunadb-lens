const { Client, query: q } = require('faunadb')
const DATABASE_NAME = 'Test-Lens'

const admindSecret = process.env.FAUNADB_ADMIN_KEY
if (!admindSecret) process.exit(1)

const adminClient = new Client({ secret: admindSecret })

const users = [
  {
    name: 'Jack Sparrow',
    goldMember: false,
    posts: [
      {
        title:
          'Why is the rum always gone? An analysis of Carribean trade surplus',
        likes: 5,
      },
      {
        title: 'Sea Turtles - The Tortoise and the Hair',
        likes: 70,
      },
    ],
  },
  {
    name: 'Elizabeth Swan',
    goldMember: true,
    posts: [
      {
        title: 'Bloody Pirates - My Life Aboard the Black Pearl',
        likes: 10000,
      },
      {
        title:
          'Guidelines - When YOU need to be disinclined to acquiesce to their request',
        likes: 5000,
      },
    ],
  },
  {
    name: 'Bill Turner',
    goldMember: false,
    posts: [
      {
        title: 'Bootstraps Bootstraps - UEFI, GRUB and the Linux Kernel',
        likes: 3000,
      },
    ],
  },
]

const createTestDB = async () => {
  try {
    const { secret } = await adminClient.query(
      q.Let(
        {
          testDB: q.CreateDatabase({ name: DATABASE_NAME }),
          testDBRef: q.Select('ref', q.Var('testDB')),
        },
        q.CreateKey({
          name: `temp server key for ${DATABASE_NAME}`,
          database: q.Var('testDBRef'),
          role: 'server',
        })
      )
    )

    const client = new Client({ secret })
    await client.query(q.CreateCollection({ name: 'User' }))
    await client.query(
      q.Map(users, (user) => q.Create(q.Collection('User'), { data: user }))
    )

    return {
      client,
      drop: () =>
        adminClient.query(
          q.Do([
            q.Delete(q.Database(DATABASE_NAME)),
            q.Delete(q.Select('ref', q.KeyFromSecret(secret))),
          ])
        ),
    }
  } catch (e) {
    console.error(e)
    throw new Error()
  }
}

module.exports = {
  createTestDB,
}
