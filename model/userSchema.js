const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  lastname: String,
  email: String,
  username: String,
  typeblood: String,
  password: String
})

module.exports = mongoose.model('users', userSchema)
