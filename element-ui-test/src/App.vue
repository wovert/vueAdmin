<template>
  <div id="app">
    <el-button @click="show">点我</el-button>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    // HelloWorld
  },
  methods: {
    show () {
      this.$message.success('element-ui提示')
    }
  },
}
</script>

<style>
</style>
