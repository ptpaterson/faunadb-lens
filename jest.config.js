const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '/.env.test') })

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.js'],
}
