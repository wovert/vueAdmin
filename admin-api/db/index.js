const mysql = require('mysql')
const config = require('./config')
const { debug } = require('../utils/constant')
const { isObject } = require('../utils')
function connect() {
  return mysql.createConnection({
		host: config.host,
		user: config.user,
		password: config.password,
		database: config.database,
		multipleStatements: true // 是否允许在一个query中传递多个查询语句, Default: false
	})
}

function querySql(sql) {
	const conn = connect()
	debug && console.log('====查询SQL：' + sql)
	return new Promise((resolve, reject) => {
		try {
			conn.query(sql, (err, results) => {
				if (err) {
					debug && console.log('====查询失败，原因：' + JSON.stringify(err))
					reject(err)
				} else {
					debug && console.log('====查询成功，原因：' + JSON.stringify(results))
					resolve(results)
				}
			})
		} catch (e) {
			reject(e)
		} finally {
			conn.end()
		}
	})
	conn.end() // 释放连接(一直存在内存中，容器内存泄漏)
}

function queryOne(sql) {
	return new Promise((resolve, reject) => {
		querySql(sql).then(results => {
			if (results && results.length === 1) {
				resolve(results[0])
			} else {
				resolve(null)
			}
		}).catch(error => {
			reject(error)
		})
	})
}

function insert(model, tableName) {
	return new Promise((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error('插入数据库失败，插入数据非对象'))
    } else {
      const keys = []
      const values = []
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          keys.push(`\`${key}\``) // 避免sql关键词
          values.push(`'${model[key]}'`)
        }
      })
      if (keys.length > 0 && values.length > 0) {
        let sql = `INSERT INTO \`${tableName}\` (`
        const keysString = keys.join(',')
        const valuesString = values.join(',')
        sql += `${keysString}) VALUES (${valuesString})`
        debug && console.log('====插入数据：' + sql)
        const conn = connect()
        try {
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      } else {
        reject(new Error('插入数据库失败，对象中没有任何属性'))
      }
    }
		// querySql(sql).then(results => {
		// 	if (results && results.length === 1) {
		// 		resolve(results[0])
		// 	} else {
		// 		resolve(null)
		// 	}
		// }).catch(error => {
		// 	reject(error)
		// })
	})
}

function update(model, tableName, where) {
	return new Promise((resolve, reject) => {
    if (!isObject(model)) {
      reject(new Error('插入数据库失败，插入数据非对象'))
    } else {
      const entry = []
      Object.keys(model).forEach(key => {
        if (model.hasOwnProperty(key)) {
          entry.push(`\`${key}\`='${model[key]}'`)
        }
      })
      if (entry.length > 0) {
        let sql = `UPDATE \`${tableName}\` SET`
        sql = `${sql} ${entry.join(',')} ${where}`
        const conn = connect()
        try {
          debug && console.log('====更新数据：' + sql)
          conn.query(sql, (err, result) => {
            if (err) {
              reject(err)
            } else {
              resolve(result)
            }
          })
        } catch (e) {
          reject(e)
        } finally {
          conn.end()
        }
      }
    }
	})
}

function and(where, k, v) {
  if (where === 'where') {
    return `${where} \`${k}\`='${v}'`
  } else {
    return `${where} and \`${k}\`='${v}'`
  }
}

function andLike(where, k, v) {
  if (where === 'where') {
    return `${where} \`${k}\` like '%${v}%'`
  } else {
    return `${where} and \`${k}\` like '%${v}%'`
  }
}

module.exports = {
  querySql,
  queryOne,
  insert,
  update,
  and,
  andLike
}