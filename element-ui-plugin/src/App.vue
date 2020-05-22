<template>
  <div id="app">
    <img src="./assets/logo.png">
    <div>
      <p>
        If Element is successfully added to this project, you'll see an
        <code v-text="'<el-button>'"></code>
        below
      </p>
      <el-button>el-button</el-button>
    </div>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import axios from 'axios'
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  created() {
    // const url = 'https://test.youbaobao.xyz:18081/book/home/v2?openId=1234'
    // const url = 'https://test.youbaobao.xyz:18081/book/home/v2'
    // axios.get(url, {
    //   params: {
    //     openId: 1234
    //   },
    //   headers: {
    //     token: 'afcdef'
    //   }
    // }).then(response => {
    //   console.log(response)
    // }).catch(err => {
    //   console.log(err)
    // })

    // 白名单地址
    const whiteUrl = ['/login', '/book/home/v2']
    const url = '/book/home/v2'
    const request = axios.create({
      baseURL: 'https://test.youbaobao.xyz:18081',
      timeout: 5000
    })

    // 请求拦截器
    request.interceptors.request.use(
      // 拦截方法
      config => {
        const url = config.url.replace(config.baseURL, '')
        // 是否为白名单地址，直接返回，不需要设置token
        if (whiteUrl.some(wl => url === wl)) {
          return config
        }
        config.headers['token'] = 'abcdef'
        return config
      },
      // 异常处理方法
      error => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    request.interceptors.response.use(
      response => {
        if (response.data && response.data.error_code === 0) {
          return response.data
        } else {
          Promise.reject(response.data.msg)
        }
      },
      error => {
        Promise.reject(error)
      }
    )

    request({
      url,
      method:'get',
      params: {
        // openId: '123',
        // token: 'abcdef'
      }
    }).then(response => {
      console.log(response)
    }).catch(err => {
      console.log(err)
    })
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
