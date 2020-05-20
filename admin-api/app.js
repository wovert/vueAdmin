const express = require('express')
const router = require('./router')
const app = express()

app.use('/', router)

const server = app.listen(5000, function() {
  const { address, port } = server.address()
  console.log('Http Server is running http://%s:%s', address, port)
})