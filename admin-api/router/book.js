const express = require('express')
const multer = require('multer')
const boom = require('boom')
// const { body, validationResult } = require('express-validator')
const Result = require('../models/Result')
const Book = require('../models/Book')
const BookService = require('../services/book')
const { jwtDecode } = require('../utils')
const { UPLOAD_PATH } = require('../utils/constant')

const router = express.Router()

router.post(
  '/upload',
  multer({ dest: `${UPLOAD_PATH}/book` }).single('file'),
  function(req, res, next) {
    if (!req.file || req.file.length == 0) {
      new Result('上传电子书失败').fail(res)
    } else {
      const book = new Book(req.file)
      book.parse()
        .then(data => {
          console.log('bookData:', data)
          new Result(data, '上传电子书成功').success(res)
        })
        .catch(err => {
          next(boom.badImplementation(err)) // return 500
        })
    }
  }
)

/**
 * create book
 */
router.post('/', (req, res, next) => {
  const decode = jwtDecode(req) // 解析 jwt
  // console.log(decode)
  if (decode && decode.username) {
    req.body.username = decode.username
  }
  const book = new Book(null, req.body)
  // console.log(book)
  BookService.insertBook(book).then(() => {
    new Result('添加电子书成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err)) // return 500
  })
})

/**
 * get book
 */
router.get('/', (req, res, next) => {
  const { fileName } = req.query
  if (!fileName) {
    next(boom.badRequest(new Error('参数fileName不能为空')))
  } else {
    BookService.getBook(fileName).then(book => {
      new Result(book, '获取图书信息成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
})

/**
 * Update book
 */
router.put('/', (req, res, next) => {
  const decode = jwtDecode(req) // 解析 jwt
  if (decode && decode.username) {
    req.body.username = decode.username
  }
  const book = new Book(null, req.body)
  BookService.updatetBook(book).then(() => {
    new Result('更新电子书成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})

module.exports = router