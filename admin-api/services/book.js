const _ = require('lodash')
const Book = require('../models/Book')
const db = require('../db')

/**
 * 是否存在电子书
 * @param {Book} book 
 */
function exists(book) {
  return false
}

/**
 * 移除电子书
 * @param {Book} book 
 */
function removeBook(book) {

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
    // return querySql(sql)
  })
}


module.exports = {
  insertBook
}