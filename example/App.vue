<template>
  <div id="app">
    <div>
      <h1>See example code <a href="https://github.com/biigpongsatorn/vue-slide-bar/blob/master/src/App.vue" target="_blank">here</a></h1>
    </div>
    <VueSlideBar v-model="value1" :draggable="false"/>
    <h2>Value: {{value1}}</h2>
    <button type="button" name="button" @click="value1 = 90">+</button>
    <button type="button" name="button" @click="value1 = 20">-</button>
    <br><br>

    <div>
      <VueSlideBar
        v-model="slider.value"
        :data="slider.data"
        :range="slider.range"
        :labelStyles="{ 'color': '#777', 'font-family': 'Helvetica, sans-serif' }"
        :processStyle="{ backgroundColor: '#d8d8d8' }"
        paddingless
        @callbackRange="callbackRange">
        <template slot="tooltip">
          <img src="/static/images/rectangle-slider.svg">
        </template>
      </VueSlideBar>
      <h2>Value: {{slider.value}}</h2>
      <h2>Label: {{rangeValue.label}}</h2>
    </div>

    <VueSlideBar
      v-model="value2"
      :min="1"
      :max="1000"
      :processStyle="slider.processStyle"
      :lineHeight="slider.lineHeight"
      :tooltipStyles="{ backgroundColor: 'red', borderColor: 'red' }"
      @dragStart="dragStart"
      @dragEnd="dragEnd"
      @input="inputEvent">
    </VueSlideBar>
    <h2>Value: {{value2}}</h2>

    <VueSlideBar
      v-model="loading"
      :showTooltip="false"
      :lineHeight="20"
      :isDisabled="true"/>
    <br>
    <button type="button" name="button" @click="startLoad()">
      Click to start load
    </button>
    <h2>Loading: {{loading}}%</h2>
  </div>
</template>

<script>
// For test built file
// import VueSlideBar from '../lib/vue-slide-bar.min.js'

// For test local
import VueSlideBar from '../src/index'

export default {
  name: 'App',
  data () {
    return {
      value1: 50,
      loader: null,
      rangeValue: {},
      value2: 8,
      loading: 0,
      switchReassign: false,
      slider: {
        value: 45,
        data: [
          15,
          30,
          45,
          60,
          75,
          90,
          120
        ],
        range: [
          {
            label: '15 mins'
          },
          {
            label: '30 mins',
            isHide: true
          },
          {
            label: '45 mins'
          },
          {
            label: '1 hr',
            isHide: true
          },
          {
            label: '1 hr 15 mins'
          },
          {
            label: '1 hr 30 mins',
            isHide: true
          },
          {
            label: '2 hrs'
          }
        ],
        lineHeight: 10,
        processStyle: {
          backgroundColor: 'red'
        }
      }
    }
  },
  methods: {
    callbackRange (val) {
      this.rangeValue = val
    },
    startLoad () {
      this.loader = setInterval(() => {
        ++this.loading
        if (this.loading === 100) {
          clearInterval(this.loader)
        }
      }, 100)
    },
    dragStart () {
      console.log('dragStart')
    },
    dragEnd () {
      console.log('dragEnd')
    },
    inputEvent () {
      console.log('inputEvent')
    }
  },
  components: {
    VueSlideBar
  }
}
</script>

<style scoped>
  #app {
    margin: 20px;
  }
</style>
