import Vue from 'vue'

// 完整引入
// import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'

// 按需引入
import { Button, Message } from 'element-ui';

import App from './App.vue'

Vue.config.productionTip = false

// 完整引入
// Vue.use(ElementUI)


Vue.component(Button.name, Button)
Vue.prototype.$message = Message
/* 或写为
 * Vue.use(Button)
 */

new Vue({
  render: h => h(App),
}).$mount('#app')
