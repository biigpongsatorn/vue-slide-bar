<template>
  <div id="app">
    <VueSlideBar v-model="value"/>
  </div>
</template>

<script>
import VueSlideBar from './components/VueSlideBar'

export default {
  name: 'App',
  data () {
    return {
      value: 20
    }
  },
  components: {
    VueSlideBar
  }
}
</script>

<style>
</style>
