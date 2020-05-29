import request from '@/utils/request'

export function login(data) {
  return request({
    // url: '/vue-element-admin/user/login',
    url: '/user/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  return request({
    // url: '/vue-element-admin/user/info',
    url: '/user/info',
    method: 'get'
  })
}

export function logout() {
  return request({
    // url: '/vue-element-admin/user/logout',
    url: '/user/logout',
    method: 'post'
  })
}
