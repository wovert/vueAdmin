const mysql = require('mysql')
const config = require('./config')
const { debug } = require('../utils/constant')

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

module.exports = {
	querySql,
	queryOne
}