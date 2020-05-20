const express = require('express')
const app = express()

app.get('/error', function(req, res) {
    throw new Error('error...')
  })
  

// 定义中间件
function myLogger(req, res, next) {
    console.log('myLogger')
    next() // 继续执行匹配路由
}



app.use(errorHandler)

// 中间件，注意：匹配路由之前使用
app.use(myLogger)

app.get('/', function(req, res) {
    res.send('hello node')
})

app.post('/user', function(req, res) {
    res.json('user...')
})


// 异常处理机制，必须后置
function errorHandler(err, req, res, next) {
//   console.log(err)
  res.status(400).json({
    error: -1,
    msg: err.toString()
  })
}
const server = app.listen(5000, function() {
  const { address, port } = server.address()
  console.log('Http Server is running http://%s:%s', address, port)
})