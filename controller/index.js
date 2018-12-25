const path = require('path')
const bcrypt = require('bcrypt')
const randomString = require('randomstring')
const jwt = require('jsonwebtoken')
const saltRounds = bcrypt.genSaltSync(10)
const {
  getUser,
  createUser,
  getUserInformation,
  getUserUsingEmail,
  updateUsingEmail
} = require('../model/')

const rootGet = (req, res) => {
  return res.status(200).send('INSIDE THE /')
}

const subscriptionGet = (req, res) => {
  return res.status(200).sendFile(path.join(__dirname , '../views/', 'subscription.html'))
}

const subscriptionPost = async (req, res) => {
  const {
    body: {
      name, lastname, typeblood, username, email, password, confirmationPassword
    }
  } = req
  try {

    const result = await getUser(username, email)
    if (result.length == 0) {
      if (password != confirmationPassword)
        return res.status(401).sendFile(path.join(__dirname, '../views/', 'wrongPassword.html'))
      var encryptPassword = bcrypt.hashSync(password, saltRounds)
      try {
        await createUser(name, lastname, typeblood, username, email, encryptPassword)
      } catch(e) {
        return res.status(501).send('[ERROR] ' + e)
      }
      return res.status(200).render('../views/successSubscription.ejs', {name:name, lastname:lastname, typeblood:typeblood, username:username, password:password})
    }
    return res.status(409).render('../views/failureSubscription.ejs', {object: 'email'})
  } catch(e) {
    return res.status(501).send('[ERROR] ' + e)
  }
}

const loginGet = function(req, res) {
  return res.status(200).sendFile(path.join(__dirname, '../views/', 'login.html'))
}

const loginPost = async function(req, res) {
  var username = req.body.username
  var password = req.body.password

  try {
    const result = await getUserInformation(username)
    if (result == null)
    // if (result.length == 0)
      return res.status(403).sendFile(path.join(__dirname, '../views/', 'failureLogin.html'))
    var bddPassword = result.password
    bcrypt.compare(password, bddPassword)
      .then((same) => {
        if (same == false)
          return res.status(403).sendFile(path.join(__dirname, '../views/', 'failureLogin.html'))
        jwt.sign({username: username}, 'secret', (error, token) => {
          if (error)
            return res.status(500).send('[ERROR WHILE CREATING TOKEN] ' + error)
          return res.status(200).render('../views/successLogin.ejs', {username: username, password: token})
        })
      })
      .catch((error) => {
        return res.status(500).send('[ERROR] ' + error)
      })
  } catch(e) {
    res.status(501)
  }
}

const forgetPasswordGet = function(request, response) {
  response.status(200).sendFile(path.join(__dirname, '../views/', 'forgetPassword.html'))
}

const forgetPasswordPost = async function(req, res) {
  var email = req.body.email
  try {
    const userEmail = await getUserUsingEmail(email)
    if (userEmail == null)
      return res.status(403).sendFile(path.join(__dirname, '../views/', 'noEmailFound.html'))
    var newPassword = randomString.generate(10)
    var hashNewPassword = bcrypt.hashSync(newPassword, saltRounds)
    try {
      await updateUsingEmail(email, hashNewPassword)
      return res.status(200).send('Email has been sent to ' + email)
    } catch (err) {
      return res.status(500).send('[ERROR] ' + err)
    }
  } catch(err) {
    return res.status(500).send('[ERROR] ', err)
  }
}

const checkTokenValidity = function(req, res, next) {
  var token = req.headers['x-access-token']
  if (!token) {
    req.checkTokenValidity = 0
    next()
  }
  jwt.verify(token, 'secret', function(error, decoded) {
    if (error) {
      req.checkTokenValidity = -1
      next()
    }
    if (decoded != undefined)
      req.checkTokenValidity = decoded.username
    next()
  })
}

const apiAuthenticatedGet = async function(req, res) {
  if (req.checkTokenValidity === 0)
    return res.status(400).send('No token provided')
  if (req.checkTokenValidity === -1)
    return res.status(501).send('[ERROR] Problem occurs while decrypting the token')
  try {
    let result = await getUserInformation(req.checkTokenValidity)
    if (result == null)
      return res.status(501).send('[ERROR] no user found')
    var string = 'Hello you\'re authenticated as ' + req.checkTokenValidity
    return res.status(200).send(string)
  } catch(err) {
    return res.status(501).send('[ERROR] ', err)
  }
}

module.exports = {
  rootGet,
  subscriptionGet,
  subscriptionPost,
  loginGet,
  loginPost,
  forgetPasswordGet,
  forgetPasswordPost,
  checkTokenValidity,
  apiAuthenticatedGet
}
