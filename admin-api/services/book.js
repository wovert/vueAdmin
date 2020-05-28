const _ = require('lodash')
const Book = require('../models/Book')
const db = require('../db')
const { debug } = require('../utils/constant')

/**
 * 是否存在电子书
 * @param {Book} book 
 */
function exists(book) {
  const { title, author, publisher } = book
  const sql = `select * from book where title='${title}' and author='${author}' and publisher='${publisher}'`
  return db.queryOne(sql)
}

/**
 * 移除电子书
 * @param {Book} book 
 */
async function removeBook(book) {
  if (book) {
    book.reset()
    if (book.fileName) {
      const removeBookSql = `delete from book where fileName='${book.fileName}'`
      const removeContentSql = `delete from contents where fileName='${book.fileName}'`
      await db.querySql(removeBookSql)
      await db.querySql(removeContentSql)
    }
  }
}

/**
 * 电子书目录
 * @param {Book} book 
 */
async function insertContents(book) {
  const contents = book.getContents()
  console.log('contents:', contents)
  if (contents && contents.length > 0) {
    for (let i=0; i<contents.length; i++) {
      const content = contents[i]
      const _content = _.pick(content, [
        'fileName',
        'id',
        'href',
        'order',
        'text',
        'level',
        'label',
        'pid',
        'navId'
      ])
      // console.log('_content:', _content)
      await db.insert(_content, 'contents')
    }
  }
}

function insertBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await exists(book)
        if (result) {
          await removeBook(book)
          reject(new Error('电子书已存在'))
        } else {
          // 电子书不存在
          await db.insert(book.toDb(), 'book')
          await insertContents(book)
          resolve()
        }
      } else {
        reject(new Error('添加的图书对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

function updatetBook(book) {
  return new Promise(async (resolve, reject) => {
    try {
      if (book instanceof Book) {
        const result = await getBook(book.fileName)
        if (result) {
          const model = book.toDb()
          if (+result.updatetBook === 0) {
            reject(new Error('内置图书不能编辑'))
          } else {
            await db.update(model, 'book', `where fileName='${book.fileName}'`)
            resolve()
          }
        }
      } else {
        reject(new Error('更新的图书对象不合法'))
      }
    } catch (e) {
      reject(e)
    }
  })
}

function getBook(fileName) {
  return new Promise(async (resolve, reject) => {
    const bookSql = `select * from book where fileName='${fileName}'`
    const contentSql = `select * from contents where fileName='${fileName}' order by \`order\` asc`
    const book = await db.queryOne(bookSql)
    const contents = await db.querySql(contentSql)
    if (book) {
      book.cover = Book.genCoverUrl(book)
      book.contentsTree = Book.getContentsTree(contents)
      resolve(book)
    } else {
      reject(new Error('电子书不存在'))
    }
  })
}

async function getCategories() {
  const sql = `select *from category order by category asc`
  const result = await db.querySql(sql)
  const categoryList = []
  result.forEach(item => {
    categoryList.push({
      label: item.categoryText,
      value: item.category,
      num: item.num
    })
  })
  return categoryList
}

async function getListBook(query) {
  debug && console.log('查询条件===：', query)
  const {
    category,
    author,
    title,
    sort,
    page = 1,
    pageSize = 20
  } = query
  const offset = (page - 1) * pageSize
  let bookSql = 'select * from book'
  let where = 'where'
  category && (where = db.and(where, 'categoryText', category))
  title && (where = db.andLike(where, 'title', title))
  author && (where = db.andLike(where, 'author', author))
  if (where !== 'where') {
    bookSql = `${bookSql} ${where}`
  }
  if (sort) {
    const symbol = sort[0]
    const column = sort.slice(1, sort.length)
    const order = symbol === '+' ? 'asc' : 'desc'
    bookSql = `${bookSql} order by \`${column}\` ${order}`
  }
  let countSql = `select count(*) as count from book`
  countSql = where !== 'where' ? `${countSql} ${where}` : countSql
  const countResult = await db.queryOne(countSql)
  const total = countResult.count
  bookSql = `${bookSql} limit ${pageSize} offset ${offset}`
  const list = await db.querySql(bookSql)
  list.forEach(book => book.cover = Book.genCoverUrl(book))
  return { list, total, page, pageSize } // 自动转换成 Promise
}

function deleteBook(fileName) {
  return new Promise(async (resolve, reject) => {
    let book = await getBook(fileName)
    if (book) {
      if (+book.updateType === 0) {
        reject(new Error('内置电子书不能删除'))
      } else {
        const bookObj = new Book(null, book)
        const sql = `delete from book where fileName='${fileName}'`
        db.querySql(sql).then(() => {
          bookObj.reset()
          resolve()
        })
      }
    } else {
      reject(new Error('电子书不存在'))
    }
  })
}

module.exports = {
  insertBook,
  updatetBook,
  getBook,
  getListBook,
  getCategories,
  deleteBook
}