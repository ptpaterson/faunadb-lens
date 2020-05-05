const path = require('path')
require('dotenv').config({ path: path.join(__dirname, './env') })
const { Client, query: q } = require('faunadb')

const { get, set, mod, Query, prop } = require('../dist/lens')

const client = new Client({
  secret: process.env.FAUNADB_ADMIN_KEY,
})

const runAndPrint = (query) =>
  client
    .query(query)
    .then((res) => console.log(JSON.stringify(res, null, 2)))
    .catch((e) => console.error(e))

// converted example from https://github.com/jamesmcnamara/shades#cons

/* Lenses are not magic. They are just objects with a get and a mod field. You
 * can create easily create your own; in fact, this is how folds are
 * implemented.
 *  For example, let's say that your data represents temperature in Celsius, but
 * being an American, you only understand Fahrenheit. We just need to create a
 * get function that takes a temperature in Celsius transforms it to Fahrenheit,
 * and then a function mod that takes a function from Fahrenheit to Fahrenheit,
 * and produces a Celsius to Celsius function.
 *
 * let's start with some conversion functions:
 */

const ftoc = (f) => q.Divide(q.Subtract(f, 32), 1.8)
const ctof = (c) => q.Add(q.Multiply(c, 1.8), 32)

/* our get function is just ctof (by definition it is a Celsius to Fahrenheit
 * function), but our mod function is more complicated. We will get an updater
 * that works on Fahrenheit, but we need to produce a Celsius updater. So we
 * will create a function that takes the temperature in Celsius, converts it to
 * Fahrenheit, runs it through the updater, and converts the result back to
 * Celsius:
 */

const inF = {
  get: ctof,
  mod: (modF) => (c) => ftoc(modF(ctof(c))),
}

/* Now we have a lens that will let us view and update temperatures in Celsius
 * as if they are in Fahrenheit
 */

const weather = { temp: 35 }
const weatherChained = Query.from(weather)

const basicQuery = get(prop('temp'))(weather)
const basicQueryChained = weatherChained.prop('temp').get()
runAndPrint({ basicQuery, basicQueryChained })
// 35

const getQuery = get(prop('temp'), inF)(weather)
const getQueryChained = weatherChained.prop('temp').use(inF).get()
runAndPrint({ getQuery, getQueryChained })
// 95

const modQuery = mod(prop('temp'), inF)((x) => q.Add(x, 1))(weather)
const modQueryChained = weatherChained
  .prop('temp')
  .use(inF)
  .mod((x) => q.Add(x, 1))
runAndPrint({ modQuery, modQueryChained })
// 35.5555555555

const setQuery = set(prop('temp'), inF)(23)(weather)
const setQueryChained = weatherChained.prop('temp').use(inF).set(23)
runAndPrint({ setQuery, setQueryChained })
// -5
