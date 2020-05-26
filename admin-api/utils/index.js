const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const  { PRIVATE_KEY } = require('./constant')  

function isObject(o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function md5(s) {
  return crypto.createHash('md5').update(String(s)).digest('hex')
}

function jwtDecode(req) {
  const authorization = req.get('Authorization')
	let tokne = ''
	if (authorization.indexOf('Bearer') >= 0) {
		token = authorization.replace('Bearer ', '')
	} else {
		token = authorization
	}
	return jwt.verify(token, PRIVATE_KEY)
}

module.exports = {
    isObject,
	md5,
	jwtDecode
}