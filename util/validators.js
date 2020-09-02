const { admin, db } = require('../util/admin')
const validator = require("validator")

exports.signupValidation = form => {
  let errors = {};
  // email is will be validated by firebase
  // username validation
  console.log("handle", form.handle.length)
  if (!validator.isEmpty(form.handle)) {
    if (!validator.isAlphanumeric(form.handle))
      errors.handle = "no special characters please"
    if (!validator.isLength(form.handle, { min: 3, max: 15 }))
      errors.handle = "min 3, max 15 characters"
  } else {
    errors.handle = "username is required"
  }
  if (!validator.isEmail(form.email) || validator.isEmpty(form.email))
    errors.email = "invalid email"

  if (form.password != form.confirm) {
    errors.confirm = "passwords don't match"
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

const isEmail = email => {
  const regEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (email.match(regEx)) return true
  else return false
}
exports.isEmail = email => {
  const regEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (email.match(regEx)) return true
  else return false
}

const isEmpty = string => {
  if (string.trim() === '') return true
  else return false
}

const tooShort = string => {
  if (string.trim().length <= 2) return true
  else return false
}

exports.validateSignupData = async data => {
  let errors = {}
  if (tooShort(data.handle)) errors.handle = 'Username too short'
  if (isEmpty(data.handle)) errors.handle = 'Must not be empty'
  if (!isEmpty(data.email))
    if (!isEmail(data.email)) errors.email = 'Invalid Email Address'
  if (isEmpty(data.password)) errors.password = 'Must not be empty'
  if (data.password !== data.confirm)
    errors.confirm = 'Passwords must match'
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.validateLoginData = async data => {
  let errors = {}
  if (isEmpty(data.email)) errors.email = 'Must not be empty'
  if (isEmpty(data.password)) errors.password = 'Must not be empty'
  if (!isEmail(data.email)) errors.email = "invalid email"
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.validateLoginWithUsername = data => {
  let errors = {}
  if (isEmpty(data.email)) errors.email = 'Must not be empty'
  if (isEmpty(data.password)) errors.password = 'Must not be empty'
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  }
}

exports.reduceUserDetails = data => {
  let userDetails = {}

  if (!isEmpty(data.bio.trim())) userDetails.bio = data.bio
  if (!isEmpty(data.website.trim())) {
    // https://website.com
    if (data.website.trim().substring(0, 4) !== 'http') {
      userDetails.website = `http://${data.website.trim()}`
    } else userDetails.website = data.website
  }
  if (!isEmpty(data.location.trim())) userDetails.location = data.location

  return userDetails
}

exports.validateInvite = async (uid, inv) => {
  if (isEmpty(inv)) return "Member"
  try {
    const document = await db.doc(`/workshops/${inv}`).get();
    if (document.exists) {
      const claim = await admin.auth().setCustomUserClaims(uid, { fcc: true })
      console.log(`user ${uid} made fcc successfully`)
      document.delete()
      console.log(claim)
      return "First Class Citizen"
    } else {
      return "Member"
    }
  }
  catch (error) {
    console.error("validateInvite failed", err)
    return "Member"
  }
}

