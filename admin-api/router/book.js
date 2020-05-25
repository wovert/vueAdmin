const express = require('express')
const multer = require('multer')
const boom = require('boom')
// const jwt = require('jsonwebtoken')

// const { body, validationResult } = require('express-validator')
const Result = require('../models/Result')
const Book = require('../models/Book')
// const { login, findUser } = require('../services/user')
// const { md5, jwtDecode } = require('../utils')
const { UPLOAD_PATH, PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
const router = express.Router()

router.post(
  '/upload',
  multer({ dest: `${UPLOAD_PATH}/book` }).single('file'),
  function(req, res, next) {
    if (!req.file || req.file.length == 0) {
      new Result('上传电子书失败').fail(res)
    } else {
      const book = new Book(req.file)
      console.log(book)
      book.parse()
        .then(book => {
          new Result('上传电子书成功').success(res)
        })
        .catch(err => {
          next(boom.badImplementation(err)) // return 500
        })
     
    }
  }
)

module.exports = router