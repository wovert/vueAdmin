const express = require('express')
const router = require('./router')
const fs = require('fs')
const https = require('https')
const bodyParser = require('body-parser')
const cors = require('cors')

// 创建 express 应用
const app = express()

app.use(cors()) // 解决跨域问题
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json()) // json形式body

app.use('/', router)

// const privateKey = fs.readFileSync('./https/domain.key') // 读取秘钥
// const pem = fs.readFileSync('./https/domain.pem') // 读取证书
// const credentials = {
//   key: privateKey,
//   cert: pem
// }
// const httpsServer = https.createServer(credentials, app)

const portSSL = 18080

const server = app.listen(portSSL, function() {
  const { address, port } = server.address()
  console.log('Http Server is running http://%s:%s', address, port)
})

// httpsServer.listen(portSSL, function() {
//   console.log('Https Server is running http://localhost:%s', portSSL)
// })