const { env } = require('./env')
const UPLOAD_PATH = env === 'dev' ? 'D:\\development\\upload\\admin-upload-ebook' : '/root/upload/admin-upload/ebook'
const UPLOAD_URL = env === 'dev' ? 'https://localhost:8989/admin-upload-eboook' : 'https://domain.com/admin-upload-ebook'

module.exports = {
  MIME_TYPE_EPUB: 'application/epub+zip',
  UPLOAD_PATH,
  UPLOAD_URL,
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  CODE_TOKEN_EXPIRED: -2, // Token 过期
  debug: true,
  PWD_SALT: 'wovert_book',
  PRIVATE_KEY: '83e3d853cdb043103f5fe4d99eb0e273',
  JWT_EXPIRED: 60*60 // second
}