<template>
  <div id="app">
    <VueSlideBar v-model="value1"/>
    <h2>Value: {{value1}}</h2>
    <button type="button" name="button" @click="value1 = 90">+</button>
    <button type="button" name="button" @click="value1 = 20">-</button>
    <br><br>

    <VueSlideBar
      v-model="slider.value"
      :allowedValues="slider.allowedValues"
      :range="slider.range"
      :labelStyles="{ 'color': '#777', 'font-family': 'Helvetica, sans-serif' }"
      :progressStyle="{ backgroundColor: '#d8d8d8' }"
      @callbackRange="callbackRange">
      <template slot="tooltip" slot-scope="tooltip">
        <img src="static/images/rectangle-slider.svg">
      </template>
    </VueSlideBar>
    <h2>Value: {{slider.value}}</h2>
    <h2>Label: {{rangeValue.label}}</h2>
    <br><br>

    <VueSlideBar
      v-model="value2"
      :min="1"
      :max="10"
      :progressStyle="slider.progressStyle"
      :lineHeight="slider.lineHeight"
      :tooltipStyles="{ backgroundColor: 'red', borderColor: 'red' }">
    </VueSlideBar>
    <h2>Value: {{value2}}</h2>
    <br><br>

    <VueSlideBar
      v-model="loading"
      :showTooltip="false"
      :lineHeight="20"
      :isDisabled="true"
      :range="100"/>
    <br>
    <button type="button" name="button" @click="startLoad()">
      Click to start load
    </button>
    <h2>Loading: {{loading}}%</h2>
    <br><br>

    <VueSlideBar
      v-model="multiHandle1"
      :debug="true"
      :allowedValues="[-12, -10, -5, 0, 5, 10, 12]"
      :progressStyle="slider.progressStyle"
      :tooltipStyles="{ backgroundColor: 'red', borderColor: 'red' }"
      :suffix="'s'"
      :range="7">
    </VueSlideBar>
    <h2>Value: {{multiHandle1}}</h2>
    <br><br>

    <VueSlideBar
      v-model="multiHandle2"
      :min="-10"
      :max="10"
      :interval="0.1"
      :prefix="String.fromCharCode(0x2668)"
      :suffix="String.fromCharCode(0x2654)"
      :lineHeight="10">
    </VueSlideBar>
    <h2>Value: {{multiHandle2}}</h2>
  </div>
</template>

<script>
// For test built file
// import VueSlideBar from '../dist/vue-slide-bar.min.js'

// For test local
import VueSlideBar from './components/VueSlideBar'

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
        allowedValues: [
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
        progressStyle: {
          backgroundColor: 'red'
        }
      },
      multiHandle1: [-5, 5],
      multiHandle2: [-5, -2.5, 0, 2.5, 5]
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
