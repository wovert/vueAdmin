import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration(false:右侧刷新图标隐藏)

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist(白名单)

// 全局守卫(beforeCreate之前)：所有路由经过这个方法处理
router.beforeEach(async(to, from, next) => {
  // start progress bar(显示进度条)
  // debugger
  NProgress.start()

  // set page title(设置目标路由标签标题)
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in(获取令牌)
  const hasToken = getToken()

  if (hasToken) {
    // 登录路由
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo(获取角色值)
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor'](获取用户权限值)
          const { roles } = await store.dispatch('user/getInfo')

          // generate accessible routes map based on roles(生成动态路由)
          const accessRoutes = await store.dispatch('permission/generateRoutes', roles)

          // dynamically add accessible routes(合并动态路由)
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record(替换路由)
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login(重新获取令牌)
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error') // 打印错误日志
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/
    // 目标路由在白名单
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.(没有权限访问)
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar(结束进度条)
  NProgress.done()
})
