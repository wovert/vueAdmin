const expressJwt = require('express-jwt')
const { PRIVATE_KEY } = require('../utils/constant')

// JWT 认证
const jwtAuth = expressJwt({
	secret: PRIVATE_KEY,
	credentialsRequired: true // 设置false就不进行校验，游客也可以访问
}).unless({
	// jwt 认证白名单
	path: [
			'/',
			'/user/login',
	]
})

module.exports = jwtAuth