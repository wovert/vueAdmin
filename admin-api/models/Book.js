const fs = require('fs')
const Epub = require('../utils/epub')
const { MIME_TYPE_EPUB, UPLOAD_URL, UPLOAD_PATH } = require('../utils/constant')

class Book {
  constructor(file, data) {
    if (file) {
      this.createBookFromFile(file)
    } else {
      this.createBookFromData(data)
    }
  }

  /**
   * 从电子书文件中解析出 Book 对象
   * @param {*} file 
   */
  createBookFromFile(file) {
    console.log('file:', file)
    const {
      originalname,
      destination,
      filename,
      path,
      mimetype = MIME_TYPE_EPUB
    } = file
    const suffix = mimetype === MIME_TYPE_EPUB ? '.epub' : '' // 电子书文件后缀名
    const oldBookPath = path // 电子书原有路径
    const newBookPath = `${destination}/${filename}${suffix}` // 电子书的新路径
    const url = `${UPLOAD_URL}/book/${filename}${suffix}` // 电子书的下载 URL
    const unzipPath = `${UPLOAD_PATH}/unzip/${filename}` // 电子书解压后的目录路径
    const unzipUrl = `${UPLOAD_URL}/unzip/${filename}` // 电子书解压后的目录URL

    console.log(fs.existsSync(unzipPath))
    if (!fs.existsSync(unzipPath)) { // 判断是否存在电子书的解压目录
      fs.mkdirSync(unzipPath, { recursive: true })
    }

    if (fs.existsSync(oldBookPath) && !fs.existsSync(newBookPath)) {
      fs.renameSync(oldBookPath, newBookPath) // 文件重命名
    }

    this.fileName = file.filename // 不带后缀的源文件名
    this.path = `/book/${filename}${suffix}` // epub 文件相对路径
    this.filePath = this.path
    this.unzipPath = `/unzip/${filename}` // epub解压后相对路径
    this.url = url // epub 文件下载链接
    this.title = '' // 书名
    this.author = '' // 作者
    this.publisher = '' // 出版社
    this.contents = [] // 目录
    this.cover = '' // 封面图片URL
    this.category = -1 // 分类ID
    this.categoryText = '' // 分类名称
    this.language = '' // 语种
    this.unzipUrl = unzipUrl // 解压后目录链接
    this.originalname = originalname // 电子书文件的原名
  }

  /**
   * data 对象中生成 Book 对象
   * @param {*} data 
   */
  createBookFromData(data) {
    console.log('data:', data)
  }

  /**
   * 电子书解析
   */
  parse() {
    return new Promise((resolve, reject) => {
      const bookPath = `${UPLOAD_PATH}${this.filepath}/`
      if (!fs.existsSync(bookPath)) {
        reject(new Error('电子书不存在'))      
      }
      
      const epub = new Epub(bookPath)
      epub.on('error', err => {
        reject(err)
      })
      epub.on('end', err => {
        if (err) {
          reject(err)
        } else {
          console.log(epub.metadata)
          resolve()
        }
      })

      epub.parse()
      
    })
  }
}

module.exports = Book