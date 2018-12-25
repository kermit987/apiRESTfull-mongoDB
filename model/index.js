const mongoose = require('mongoose')
const user = require('./userSchema.js')

mongoose.connect('mongodb://forInterview:poss3id0n@ds153003.mlab.com:53003/apirestfull')

const db = mongoose.connection
db.on('error', () => {
  throw new Error('Connection to database failed')
})

const getUser = function(username, email) {
  return new Promise((resolve, reject) => {
    user.find({
      $or:
      [{email: email},
        {username: username}]
    }, (err, result) => {
      if (err)
        reject(err)
      resolve(result)
    })
  })
}

const createUser = function(name, lastname, typeblood, username, email, password) {
  return new Promise((resolve, reject) => {
    const newUser = new user({
      name: name,
      lastname: lastname,
      email: email,
      username: username,
      typeblood: typeblood,
      password: password
    })
    newUser.save(function (err) {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}

const getUserInformation = function(username) {
  return new Promise((resolve, reject) => {
    user.findOne(
      {username: username},
      'password',
      (err, result) => {
        if (err)
          reject(err)
        resolve(result)
      }
    )
  })
}

const getUserUsingEmail = function(email) {
  return new Promise((resolve, reject) => {
    user.findOne(
      {email: email},
      'email',
      (err, result) => {
        if (err)
          reject(err)
        resolve(result)
      }
    )
  })
}

const updateUsingEmail = function(email, password) {
  return new Promise((resolve, reject) => {
    user.findOneAndUpdate(
      {email: email},
      {password: password},
      (err, result) => {
        if (err)
          reject(err)
        resolve(result)
      }
    )
  })
}

module.exports = {
  getUser,
  createUser,
  getUserInformation,
  getUserUsingEmail,
  updateUsingEmail
}