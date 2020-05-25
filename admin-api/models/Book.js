const fs = require('fs')
const xml2js = require('xml2js').parseString
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
    // console.log('file:', file)
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

    // console.log(fs.existsSync(unzipPath))
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
    this.coverPath = '' // 封面图片路径
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
    // console.log('data:', data)
  }

  unzip() {
    const AdmZip = require('adm-zip')
    const zip = new AdmZip(Book.genPath(this.path))
    zip.extractAllTo(Book.genPath(this.unzipPath), true) // 解压: 目录，是否覆盖

  }

  static genPath(path) {
    if (path.startsWith('/')) {
      path = `/${path}`
    }
    return `${UPLOAD_PATH}${path}`
  }

  /**
   * 解析目录
   * @param {*} epub 
   */
  parseContents(epub) {
    function getNcxFilePath() {
      const spine = epub && epub.spine
      const manifest = epub && epub.manifest
      const ncx = spine.toc && spine.toc.href
      const id = spine.toc && spine.toc.id
      // console.log('spine====', spine.toc, ncx, id, manifest[id].href)
      if (ncx) {
        return ncx
      } else {
        return manifest[id].href
      }
    }

    function findParent(array, level=0, pid='') {
      return array.map(item => {
        item.level = level
        item.pid = pid
        if ((item.navPoint) && item.navPoint.length > 0) {
          item.navPoint = findParent(item.navPoint, level + 1, item['$'].id)
        } else if (item.navPoint) {
          item.navPoint.level = level + 1
          item.navPoint.pid = item['$'].id
        }
        return item
      })
    }

    function flatten(array) {
      return [].concat(...array.map(item => {
        if (item.navPoint && item.navPoint.length > 0) {
          return [].concat(item, ...flatten(item.navPoint))
        } else if (item.navPoint) {
          return [].concat(item, item.navPoint)
        }
        return item
      }))
    }

    const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`)
    // console.log(ncxFilePath)
    if (fs.existsSync(ncxFilePath)) {
      return new Promise((resolve, reject) => {
        const xml = fs.readFileSync(ncxFilePath, 'utf-8')
        const fileName = this.fileName
        xml2js(xml, {
          explicitArray: false,
          ignoreAttrs: false
        }, function(err, json) {
          if (err) {
            reject(err)
          } else {
            const navMap = json.ncx.navMap
            // console.log(JSON.stringify(navMap))
            if (navMap.navPoint && navMap.navPoint.length > 0) {
              navMap.navPoint = findParent(navMap.navPoint)
              const newNavMap = flatten(navMap.navPoint)
              
              const chapters = []
              // console.log(epub.flow)
              epub.flow.forEach((chapter, index) => {
                if (index + 1 > newNavMap.length) {
                  return
                }
                const nav = newNavMap[index]
                chapter.text = `${UPLOAD_URL}/unzip/${fileName}/${chapter.href}`
                // console.log(chapter.text)

                chapter.label = nav && nav.navLabel ? nav.navLabel.text : ''

                chapter.level = nav.level
                chapter.pid = nav.pid
                chapter.navId = nav['$'].id
                chapter.fileName = fileName
                chapter.order = index + 1
                chapters.push(chapter)
              })
              resolve(chapters)
              // console.log(chapters)
            } else {
              reject(new Error('目录解析失败，目录数为0'))
            }
          }
        })
      })
    } else {
      throw new Error('目录对应的资源文件不存在')
    }
  }

  /**
   * 电子书解析
   */
  parse() {
    return new Promise((resolve, reject) => {
      const bookPath = `${UPLOAD_PATH}${this.filePath}/`
      // console.log('bookPath:', bookPath)
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
          // console.log(epub)
          const {
            language,
            creator,
            creatorFileAs,
            title,
            cover,
            publisher
          }  = epub.metadata
          if (!title) {
            reject(new Error('图书标题为空'))
          } else {
            this.title = title
            this.language = language || 'en'
            this.author = creator || creatorFileAs || 'unknown'
            this.publisher = publisher || 'unknown'
            this.rootFile = epub.rootFile
            this.contents = []
            
            // 获取封面图回调函数， file还在内存中
            const handleGetImage = (err, file, mimeType) => {
              // console.log(err, file, mimeType)
              if (err) {
                reject(err)
              } else {
                const suffix = mimeType.split('/')[1]
                const coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                const coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}`

                // console.log('coverPath:', coverPath)
                // file写入磁盘当中
                fs.writeFileSync(coverPath, file, 'binary', 'ignored')
                this.coverPath = `/img/${this.fileName}.${suffix}`
                this.cover = coverUrl
                resolve(this)
              }
            }

            try {
              this.unzip() // 解压
              this.parseContents(epub).then((chapters) => {
                // console.log(chapters)
                this.contents = chapters
                epub.getImage(cover, handleGetImage)
              })
            } catch (e) {
              reject(e)
            }
          }
        }
      })
      epub.parse()
    })
  }
}

module.exports = Book