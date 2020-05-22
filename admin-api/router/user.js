const express = require('express')
const boom = require('boom')
const jwt = require('jsonwebtoken')

const { body, validationResult } = require('express-validator')
const Result = require('../models/Result')
const { login, findUser } = require('../services/user')
const { md5, jwtDecode } = require('../utils')
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
const router = express.Router()


/**
 * login api
 * @param username String
 * @param password String
 */
router.post(
  '/login',
  [
    body('username').isString().withMessage('用户名必须为字符'),
    // body('password').isNumeric().withMessage('密码必须为数字'),
    body('password').isString().withMessage('密码必须为字符'),
  ],
  function(req, res, next) {
    // 表单验证结果
    const error = validationResult(req)
    
    if (!error.isEmpty()) {
      const [{ msg }] = error.errors
      next(boom.badRequest(msg)) // 交给自定义异常
    } else {
      let { username, password } = req.body
      password = md5(`${password}${PWD_SALT}`)

      login(username, password).then(user => {
        if (!user || user.length === 0) {
          new Result('登录失败').fail(res)
        } else {

          // 生成 token
          // const [_user] = user
          const token = jwt.sign(
            { username },
            PRIVATE_KEY,
            { expiresIn: JWT_EXPIRED }
          )
          new Result({ token }, '登录成功').success(res)
        }
      }) 
    }
  }
)

router.get('/info', function(req, res, next) {

  const decode = jwtDecode(req)
  if (decode && decode.username) {
    findUser(decode.username).then(user => {
      if (user) {
        user.roles = [user.role]
        new Result(user, '用户信息查询成功').success(res)
      } else {
        new Result('用户信息查询失败').fail(res)
      }
    })
  } else {
    new Result('用户信息查询失败').fail(res)
  }

})

module.exports = router