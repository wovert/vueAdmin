const express = require('express')
const boom = require('boom')
const userRouter = require('./user')
const bookRouter = require('./book')
const jwtAuth = require('./jwt')
const Result = require('../models/Result')

// 注册路由
const router = express.Router()

router.use(jwtAuth)

router.get('/', function(req, res) {
  res.send('Welcome to my home')
})

router.use('/user', userRouter)
router.use('/book', bookRouter)

/**
 * 404 middleware
 * notice: 该中间件必须放在正常处理流程之后，否则会拦截正常请求
 */
router.use((req, res, next) => {
  // 继续抛给异常处理中间件
  next(boom.notFound('interface not exists'))
})

/**
 * 自定义路由异常处理中间件
 * 方法的参数不能减少
 * 方法的必须放在路由最后
 */
router.use((err, req, res, next) => {
//   console.log(err)
  if (err.name && err.name === 'UnauthorizedError') {
    const { status = 401, message } = err
    new Result(null, 'Token 验证失败', {
      error: status,
      errMsg: message
    }).jwtError(res.status(status))
  } else {
    const msg = (err && err.message) || '系统错误'
    const statusCode = (err.output && err.output.statusCode) || 500
    const errorMsg = (err.output && err.output.payload && err.output.payload.error) || err.message
    new Result(null, msg, {
      error: statusCode,
      errorMsg
    }).fail(res.status(statusCode))
    // res.status(statusCode).json({
    //   code: CODE_ERROR,
    //   msg,
    //   error: statusCode,
    //   errorMsg
    // })
  }

})

module.exports = router