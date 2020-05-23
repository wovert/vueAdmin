const express = require('express')
const multer = require('multer')
// const boom = require('boom')
// const jwt = require('jsonwebtoken')

// const { body, validationResult } = require('express-validator')
const Result = require('../models/Result')
// const { login, findUser } = require('../services/user')
// const { md5, jwtDecode } = require('../utils')
const { UPLOAD_PATH, PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
const router = express.Router()

router.post(
  '/upload',
  multer({ dest: `${UPLOAD_PATH}/book` }).single('file'),
  function(req, res) {
    if (!req.file || req.file.length == 0) {
      new Result('上传电子书失败').fail(res)
    } else {
      new Result('上传电子书成功').success(res)
    }
  }
)

module.exports = router