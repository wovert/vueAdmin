# vueAdmin

Vue Admin Management

## 技术架构

### Vue全家桶

- Vue
- Element-UI
- Vuex
- Vue-router
- Vue-element-admin
- Vue-cli 3.0
- Webpack

### 服务端

- jwt(登录认证)
- epub(电纸书解析)
- mysql
- multer(文件上传)
- xml2js(xml文件解析)
- admin-zip(自定义电子书解析)
- express
- node

## 基础阶段

### Vue进阶

- 事件绑定 $emit 和 $on
- 指令 directive
- 插件 Vue.use
- 组件化 Vue.component
- 组件通信 provide 和 inject
- 过滤器 filter
- 监听器 watch
- class 和 style 绑定的高级用法
- 2.6 新特性
  - Vue.observable
  - 插槽 slot

### element-ui 入门

- vue-cli 3 element插件
- element 按需加载
- 表单开发
- 列表开发
- el-form 源码解读

### vuex / vue-router

- vuex 实现原理解析
- vue-router 实现原理解析
- vue-router 路由守护
- vue-router 路由元信息
- vue-router 路由 API

### vue-element-admin 框架

- 登录逻辑
- 网络请求
- 页面框架
- 动态生成路由
- 图标使用
- 面包屑导航

## Node入门

- Node框架介绍
- 常用库
- 本地应用开发
- 网络应用开发
- 操作数据库

## Express入门

- 基础案例
- 路由中间件
- 异常处理

## 实战阶段

### 准备工作

- Nginx服务器
- MySQL 数据库
- 安装 Node和Vue

### 项目实战

- 实现功能
  - 登录
  - 文件上传
  - EPUB电子书解析
  - 新增/编辑电子书
  - 电子书列表
  - 删除电子书
- 涉及技术点
  - JWT 认证
  - EPUB 解析电子书
  - XML 解析
  - ZIP 解压
  - MULTER 文件上传
  - MySQL 数据库操作

### 项目发布

- CentOS 服务器
- 域名服务
- https 服务
- git 仓库



## element-ui安装

1. 初始化项目

```sh
# vue create element-test
```

2. 安装

```sh
# npm i element-ui -S
```

3. Vue 插件

```js
// src/main.js
import ElementUI from 'element-ui'
Vue.use(ElementUI)
```

4. 引入样式
- App.vue
```js
import 'element-ui-/lib/theme-chalk/index.css'

<div id="app">
  <el-button @click="show">按钮</el-button>
</div>

show() {
  this.$message.success('element-ui提示')
}
```

5. 按需加载

```sh
# npm install babel-plugin-component -D
# vim babel.config.js
  "plugins": [
      [
        "component",
        {
          "libraryName": "element-ui",
          "styleLibraryName": "theme-chalk"
        }
      ]
    ]
# src/main.js
import { Button, Message } from 'element-ui'
Vue.component(Button.name, Button)
Vue.prototype.$message = Message
```

6. 插件引用

```sh
# vue add element
```

## vue-element-admin

```sh
# git clone https://github.com/PanJiaChen/vue-element-admin.git
# cd vue-element-admin
# npm i
# npm run dev
```

### 项目精简

- 删除 src/view下的源码，保留
  - dashboard: 首页
  - error-page：异常页面
  - login: 登录
  - redirect: 重定向
- 对 src/router/index 修改
- 删除 src/router/modules 目录
- 删除 src/vendor 目录

生产环境项目，建议将 components 的内容也进行清理，以免影响访问速度，或者直接使用 vue-admin-template 构建项目，课程选择 vue-element-admin 初始化项目，是因为 vue-element-admin 实现了登录模块，包括token校验，网路请求等，可以简化开发工作

### 项目配置

- 源码调试 - vue.config.js

```js
config
.when(process.env.NODE_ENV === 'development',
config => config.devtool('cheap-source-map')
)

// 改成
config
  .when(process.env.NODE_ENV === 'development',
  config => config.devtool('source-map'))
  // config => config.devtool('eval'))
```

将cheap-source-map 改为 source-map，如果提升构建速度可以改为 eval

开发时保持eval配置，已增加构建速度，当出现需要源码调试排查问题时改为 source-map

## admin api

```sh
# mkdir admin-api
# npm init -y
# npm i -S express body-parser cors mysql crypto jsonwebtoken express-validator express-jwt multer xml2js adm-zip lodash
# npm i -g nodemon
# npm i -S boom 快速生成依赖信息
# vim app.js
const express = require('express')
```

## 项目需求分析

### 项目技术架构

- 三个应用
  - 管理后台(管理电子书)
  - 小程序(查阅电子书)
  - H5(阅读器)

### 项目目标

- 完全在本地搭建开发环境
- 贴近企业真实应用场景

> 依赖别人提供的 API 将无法真正理解项目的运作逻辑

### 技术难点分析

#### 登录

- 用户名密码校验
- token 生成、校验和路由过滤（哪些借口需要 token）
- 前段 token 校验和重定向

#### 电子书上传

- 文件上传
- 静态资源服务器

#### 电子书解析

- epub 原理
- zip 解压
- xml 解析

#### 电子书增删改

- mysql 数据库应用
- 前后端异常处理

### epub 电子书

> epub 是一种电子书格式，本质是一个 zip 压缩包

demo.epub 文件名改成 demo.zip 并解压 demo.zip文件

- META-INF：
- content.opf: 配置文件
  - metadata
  - spine: 阅读顺序
  - guide: 摘要
  - toc.ncx: 目录

### 静态资源服务器 nginx 配置

- mac: brew install nginx
  - /usr/local/Cellar/nginx/VERSION/bin
  - which nginx

- /usr/local 无法写入问题
  - 解决 MacOS operation not permitted
    - macOS 从 EI Capitan(10.11) 后加入了 Rootless 机制，很多系统目录不再能够随心所欲的读写了，即使设置 root 权限也不行。
    - 重启按住 Command + R，进入恢复模式，打开 Terminal
    - `csrutil disable`
    - 之后再次进入系统就可以获取修改 /usr 的写入权限了，打开 csrutil 方法是进入恢复模式，在 Terminal中
    - `csrutil enable`

- 配置 nginx.conf
  - 添加当前登录用户为：user sam owner;
  - 在结尾大括号之前添加：`incldue /Users/sam/upload/upload.conf`
    - /Users/sam/upload 资源文件路径
    - upload.conf 额外的配置文件

  - Windows 路径配置错误启动出现 500 异常
    - windows 中不允许在 Nginx 配置文件中出现转义字符，比如 \resource 这样的路径会被编译为：esrouce，从而导致 Nginx 启动异常，可以更换目录名称来解决这个问题。

```conf
server {
  charset utf-8;
  listen 8089;
  root /Users/sam/upload/;
  autoindex on;
  add_header Cache-Control "no-cache, must-revalidate";
  location / {
    add_header Access-Control-Allow-Origin *;
  }  
}

server {
  listen 443 default ssl;
  server_name https_host;
  root /Users/sam/upload/;
  autoindex on;
  add_header Cache-Control "no-cache, must-revalidate";
  location / {
    add_header Access-Control-Allow-Origin *;
  }
  ssl_certificate /Uses/sam/Desktop/https/book_youbaobao_xyz.pem;
  ssl_certificate_key /Usrs/sam/Desktop/https/book_youbaobao_xyz.key;
  ssl_session_timeout 5m;
  ssl_protocols SSLv3 TLSv1;
  ssl_ciphers ALL:!ADH:!EXPORT56:RC4+RSA:...
  ssl_prefer_server_ciphers on;
}
```

```sh
# sudo nginx -t
# sudo nginx
# sudo nginx -s reload
# sudo nginx -s stop
```

- 将 epub 和 epub2 目录放入 /Users/sam/upload/

### MySQL

- mac
  - 启动
    - cd /usr/local/mysql-VERSION/bin
    - ./mysqld
  - 初始化数据库

## 登录

- 逻辑简化
  - 删除 SocialSign 组件
  - 删除 src/views/login/components 目录
  - 删除 afterQRScn
  - 删除 created 和 destroyed

### webstorm scripts 格式化问题

- command + option + L 格式化代码后，script可能会出现 index 的警告
  - 关闭 eslint 中的 indent检查
  - 修改 webstorm 中的 indent 设置
    - Webstorm => Preferences => Editor => Code Style => HTMLM => Other => do not indent of children 中增加 script 即可

### 路由和权限

- views/book/create.vue

#### 路由和权限校验

- router

#### 侧边栏

- sidebar

#### 重定向

- redirect

#### 面包屑导航

- breadcrumb

### 总结

- 路由处理
  - vue-element-admin 对所有访问的路由进行拦截
  - 访问路由时会从 Cookie 中获取 Token，判断 Token 是否存在
    - 如果 Token 存在，将根据用户角色生成动态路由，然后访问路由，生成对应的页面组件。这里有一个特例，即用户访问 `/login` 时会重定向至 `/` 路由；
    - 如果 Token 不存在，则会判断路由是否在白名当中，如果在白名单中将直接访问，否则说明该路由需要登录才能访问，此时会将路由生成一个 `redirect` 参数传入 login 组件，实际访问的路由为：`/login?redirect=/xxx`
- 动态路由和权限校验
  - vue-element-admin 将路由分为：`constantRoutes` 和 `asyncRoutes`
  - 用户登录系统时，会动态生成路由，其中 `constantRoute`必然包含，`asyncRoutes`会进行过滤；
  - asyncRoutes 过滤的逻辑是看路由下是否包含 `meta` 和 `meta.roles`属性，如果没有改属性，所以这是一个通用路由，不需要进行权限校验；如果包含 `roles` 属性则会判断用户的角色是否命中路由中的任意一个权限，如果命中，则将路由保存下来，如果未命中，则直接将该路由舍弃；
  - asyncRoutes 处理完毕后，会和 constantRoutes 合并为一个新的路由对象，并保存到 vuex 的 `permission/routes` 中； 
  - 用户登录系统后，侧边栏会从 vuex 中获取 `state.permission.routes`，根据该路由动态渲染用户菜单
- 侧边栏总结
  - sidebar: sidebar 主要包含 `el-menu` 容器组件，`el-menu` 中遍历 `vuex` 中的 `routes`，生成 `sidebar-item`组件。sidebar主要配置如下
    - `activeMenu`: 根据当前路由的 `meta.activeMenu` 属性控制侧边栏中**高亮菜单**
    - `isCollapse`: 根据 Cookie 的 `sidebarStatus` 控制侧边栏是否**折叠**
    - `variables`：通过 `@/styles/variables.scss` 填充 el-emu 的基本样式
  - sidebar-item: 分为两部分
    - 第一部分是当只需要展示一个 `children` 或者没有 `children` 时进行展示，展示的组件包括：
      - `app-link`: 动态组件，`path`为链接时，显示为 `a`标签，`path` 为路径时，显示为 `router-link` 组件
      - `el-menu-item`：菜单项，当 `sidebar-item` 为非 nest 组件时，`el-menu-item` 会增加 `submenu-title-noDropdown` 的 class
      - `item`：`el-menu-item` 里的内容，主要是 `icon` 和 `title`，当`title`为空时，整个菜单项将不会展示
    - 第二部分是当 `children` 超过两项时进行展示，展示的组件包括：
      - `el-submenu`：子菜单组件容器，用于嵌套子菜单组件
      - `sidebar-item`: `el-submenu` 迭代嵌套了 `sidebar-item` 组件，在 `sidebar-item` 组件中有两点变化：
        - 设置 `is-nest` 属性为 `true`
        - 根据 `child.path` 生成了 `base-path` 属性传入 `sidebar-item` 组件


## 接口开发

`curl http://localhost:18080/usr/login -X POST -d "username=admin&password=123456"`


### JWT

[jwt.io](https://jwt.io)

## 电子书解析

### 构建函数

Book对象分为两种场景，第一种是直接从电子书文件中解析出 Book 对象，第二种是从 data 对象中生成 Book 对象

```js
constructor(file, data) {
  if (file) {
    // 从电子书文件中解析出 Book 对象
    this.createBookFromFile(file)
  } else if (data) {
    // data 对象中生成 Book 对象
    this.createBookFromData(data)
  }
}
```

### 电子书解析

初始化后，可以调用 Book 实例的 parse 方法解析电子书，这里使用了 epub 库，直接将 epub 库源码集成到项目中：

- epub 库集成：[epub库](https://github.com/julien-c/epub)，将 epub.js 复制到 /utils/epub.js

## 自动远程登录

```sh
$ ssh-keygen -t rsa
$ ssh-copy-id -i ~/.ssh/id_rsa.pub root@远程IP地址
$ ssh root@远程IP地址
```
