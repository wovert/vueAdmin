import request from '@/utils/request'

export function createBook(data) {
  return request({
    url: '/book',
    method: 'post',
    data
  })
}

export function updateBook(data) {
  return request({
    url: '/book',
    method: 'put',
    data
  })
}
export function getBook(fileName) {
  return request({
    url: '/book',
    method: 'get',
    params: { fileName }
  })
}

export function listBook(params) {
  return request({
    url: '/book/list',
    method: 'get',
    params
  })
}

export function getCategories() {
  return request({
    url: '/book/categories',
    method: 'get'
  })
}

export function deleteBook(fileName) {
  return request({
    url: '/book',
    method: 'delete',
    params: { fileName }
  })
}
