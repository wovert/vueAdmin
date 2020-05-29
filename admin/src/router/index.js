import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements(没有权限要求的基页)
 * all roles can be accessed(可以访问所有角色)
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard', // 重定向到 dashboard
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles(需要根据用户角色动态加载的路由)
 */
export const asyncRoutes = [
  // 图书管理员才能访问到指定的路由
  {
    path: '/book', // 路由地址
    name: 'book',
    component: Layout, // 对应布局
    redirect: '/book/create', // 重定向，访问/book重定向到/book/create
    meta: { title: '图书管理', icon: 'documentation', roles: ['admin', 'editor'] }, // 标签标题，菜单图标，哪些管理权限可以访问
    children: [
      {
        path: '/book/create',
        name: 'bookCreate',
        component: () => import('@/views/book/create'),
        meta: {
          title: '上传图书',
          icon: 'edit',
          // affix: true, // 标签不可关闭
          roles: ['admin'] // 哪些角色可以访问这个菜单
        }
      },
      {
        path: '/book/edit/:fileName',
        name: 'bookEdit',
        component: () => import('@/views/book/edit'),
        hidden: true, // 菜单中不显示
        meta: {
          title: '编辑图书',
          icon: 'edit',
          roles: ['admin'], // 哪些角色可以访问这个菜单
          activeMenu: '/book/list' // 列表高亮
        }
      },
      {
        path: '/book/list',
        name: 'bookList',
        component: () => import('@/views/book/list'),
        meta: {
          title: '图书列表',
          icon: 'list',
          roles: ['admin'] // 哪些角色可以访问这个菜单
        }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
