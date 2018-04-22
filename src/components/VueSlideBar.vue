<template>
  <div
    ref="wrap"
    class="vue-slide-bar-component vue-slide-bar-horizontal"
    :style="calculateMinHeight"
    @click="wrapClick">
    <div ref="slideBar" class="vue-slide-bar" :style="{height: `${lineHeight}px`}">
      <div v-for="(handleValue, handleIndex) in handleValues" :key="handleIndex"
        class="vue-slide-bar-always vue-slide-bar-dot"
        :data-handle-index="handleIndex"
        :style="{'width': `${iconWidth}px`}"
        @mousedown="moveStart"
        @touchstart="moveStart">
        <span class="vue-slide-bar-tooltip-top vue-slide-bar-tooltip-wrap" v-if="showTooltip">
          <slot name="tooltip">
            <span class="vue-slide-bar-tooltip" :style="tooltipStyles">{{ renderHandleValue(handleValues[handleIndex]) }}</span>
          </slot>
        </span>
      </div>
      <div ref="progress" class="vue-slide-bar-progress" :style="progressStyle"></div>
    </div>
    <div v-if="range" class="vue-slide-bar-range">
      <div v-for="(r, index) in range" :key="index" class="vue-slide-bar-separate" :style="dataLabelStyles">
        <span v-if="!r.isHide" class="vue-slide-bar-separate-text">
          {{ r.label }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>

import Vue from 'vue'

export default {
  name: 'VueSlideBar',
  model: {
    prop: 'modelValues',
    event: 'updateModelValues'
  },
  data () {
    return {
      handleBeingDragged: undefined,
      /** initialized in this.setStaticData() */
      slideBarWidth: 0,
      handleValues: this.handleInboundValues(this.$props.modelValues),
      handlePositions: [],
      currentSlider: 0,
      isComponentExists: true,
      lazy: false,
      realTime: false,
      dataLabelStyles: {
        'color': '#4a4a4a',
        'font-family': 'Arial, sans-serif',
        'font-size': '12px',
        ...this.$props.labelStyles
      }
    }
  },
  props: {
    /** List of allowed values the handles snap to in the same order */
    allowedValues: {
      type: Array,
      default: null
    },
    /** Log to console about component internals */
    debug: {
      type: Boolean,
      default: undefined
    },
    /**
     * Labeling for the ruler under the slideBar. Shows the range of numbers or labels in order
     * :range is a list of objects
     *   [{
     *     label: '30 mins',
     *     isHide: true
     *   },
     *   ...],
     * Or a number
     *   31
     * To show that many dots under the sliderBar.
     */
    range: {
      type: [Array, Number],
      default: null
    },
    /** Speed of transition the sliderBar follow user actions */
    speed: {
      type: Number,
      default: 0.5
    },
    /** The height of the sliderBar in px */
    lineHeight: {
      type: Number,
      default: 5
    },
    iconWidth: {
      type: Number,
      default: 20
    },
    /** Interval where the handles will snap to. Only usable without the 'allowedValues'-prop */
    interval: {
      type: Number,
      default: 1
    },
    /* v-model -parameter of this component binds to this. */
    modelValues: {
      type: [Number, String, Array],
      default: () => [0, 0]
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 100
    },
    showTooltip: {
      type: Boolean,
      default: true
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    /** String to prepend to the rendered handle value */
    suffix: {
      type: String,
      default: ''
    },
    /** String to append to the rendered handle value, can be used to show the type of the value for ex, 's' for seconds */
    prefix: {
      type: String,
      default: ''
    },
    tooltipStyles: Object,
    labelStyles: Object,
    progressStyle: Object
  },
  computed: {

    minimum () {
      return this.allowedValues ? 0 : this.min
    },
    maximum () {
      return this.allowedValues ? (this.allowedValues.length - 1) : this.max
    },
    multiple () {
      let decimals = `${this.interval}`.split('.')[1]
      return decimals ? Math.pow(10, decimals.length) : 1
    },
    spacing () {
      return this.allowedValues ? 1 : this.interval
    },
    total () {
      if (this.allowedValues) {
        return this.allowedValues.length - 1
      } else if (Math.floor((this.maximum - this.minimum) * this.multiple) % (this.interval * this.multiple) !== 0) {
        this._printError('[VueSlider error]: Prop[interval] is illegal, Please make sure that the interval can be divisible')
      }
      return (this.maximum - this.minimum) / this.interval
    },
    gap () {
      return this.slideBarWidth / this.total
    },
    rangeLimit () {
      return [0, this.slideBarWidth]
    },
    valueLimit () {
      return [this.minimum, this.maximum]
    },
    calculateMinHeight () {
      return this.range ? { minHeight: '100px' } : {}
    }
  },
  watch: {
    // Listen for changes on the values passed from outside this component, and sync them to this.currentValues
    modelValues (newVal) {
      if (this.debug) console.log(`VueSliderBar.modelValues(${newVal})`)
      newVal = this.handleInboundValues(newVal)
      newVal.forEach((handleValue, handleIndex) => {
        this.setValue(handleValue, handleIndex, true, 0)
      })
    },
    max (val) {
      if (this.debug) console.log(`VueSliderBar.max(${val})`)
      if (val < this.min) {
        return this._printError('[VueSlider error]: The maximum value can not be less than the minimum value.')
      }
      // Update values as the allowed boundary changed
      this.handleValues.forEach((handleValue, handleIndex) => this.setValue(this.limitValue(handleValue)))
      this.refresh()
    },
    min (val) {
      if (this.debug) console.log(`VueSliderBar.min(${val})`)
      if (val > this.max) {
        return this._printError('[VueSlider error]: The minimum value can not be greater than the maximum value.')
      }
      // Update values as the allowed boundary changed
      this.handleValues.forEach((handleValue, handleIndex) => this.setValue(this.limitValue(handleValue)))
      this.refresh()
    }
  },
  methods: {
    bindEvents () {
      if (this.debug) console.log('VueSliderBar.bindEvents()')
      document.addEventListener('touchmove', this.moving, {passive: false})
      document.addEventListener('touchend', this.moveEnd, {passive: false})
      document.addEventListener('mousemove', this.moving)
      document.addEventListener('mouseup', this.moveEnd)
      document.addEventListener('mouseleave', this.moveEnd)
      window.addEventListener('resize', this.refresh)
    },
    unbindEvents () {
      if (this.debug) console.log('VueSliderBar.unbindEvents()')
      window.removeEventListener('resize', this.refresh)
      document.removeEventListener('touchmove', this.moving)
      document.removeEventListener('touchend', this.moveEnd)
      document.removeEventListener('mousemove', this.moving)
      document.removeEventListener('mouseup', this.moveEnd)
      document.removeEventListener('mouseleave', this.moveEnd)
    },
    /**
     * whenever the model/values are updated and passed to this component, we might have to tarnsform it if various features of vue-slider-bar are in use.
     * Alweays, when receiving the handle values from outside, pass them through this function to make sure the values are in consistent state regarding this module internals.
     */
    handleInboundValues (externalValues) {
      // Make sure the internal representation is always an array of handle values, to support multiple handles internally
      if (!Array.isArray(externalValues)) externalValues = [externalValues]
      // Is this needed? else externalValues = externalValues.slice() // Clone the array to avoid mutating the external data structure

      if (this.allowedValues) {
        // If we have a list of allowed values that the sliderBar handle can be in, then the handleValue is the index within the allowedValues-Array, not the real value itself.
        externalValues = this._translateAllowedValuesToAllowedValueIndexex(externalValues)
      } else {
        // Make sure the input fits between limits
        externalValues = this.limitValues(externalValues)
      }
      return externalValues
    },
    limitValue (handleValue) {
      if (this.debug) console.log(`VueSliderBar.limitValue(handleValue=${handleValue})`)
      const inRange = (v) => {
        if (v < this.min) {
          this._printError(`[VueSlider warn]: The value of the slider is ${handleValue}, the minimum value is ${this.min}, the value of this slider can not be less than the minimum value`)
          return this.min
        } else if (v > this.max) {
          this._printError(`[VueSlider warn]: The value of the slider is ${handleValue}, the maximum value is ${this.max}, the value of this slider can not be greater than the maximum value`)
          return this.max
        }
        return v
      }
      return inRange(handleValue)
    },
    /** Receives an Array of values and calls limitValue() on them, returns the resultant Array */
    limitValues (values) {
      for (let i = 0; i < values.length; i++) {
        values[i] = this.limitValue(values[i])
      }
      return values
    },
    setStaticData () {
      if (this.debug) console.log('VueSliderBar.setStaticData()')
      if (this.$refs.slideBar) {
        this.slideBarWidth = this.$refs.slideBar.offsetWidth
        this.offset = this.$refs.slideBar.getBoundingClientRect().left
      }
    },
    wrapClick (e) {
      if (this.isDisabled) return false
      if (this.debug) console.log('VueSliderBar.wrapClick(e=', e, ')')
      let pos = this._getEventPosition(e)
      const handleIndex = this._getHandleIndexClosestToPos(pos)
      this.setValueOnPos(pos, handleIndex)
      if (this.debug) console.log('\n\nVueSliderBar.wrapClick(e=', e, ') complete\n\n\n')
    },
    moveStart (e) {
      if (this.debug) console.log('VueSliderBar.moveStart(e=', e, ')')
      this.handleBeingDragged = e.currentTarget
      this.$emit('drag-start', this)
    },
    moving (e) {
      if (!this.handleBeingDragged) return false
      const handleIndex = this._getHandleIndex(e)
      e.preventDefault()
      if (e.targetTouches && e.targetTouches[0]) e = e.targetTouches[0]
      this.setValueOnPos(this._getEventPosition(e), handleIndex)
    },
    moveEnd (e) {
      if (this.handleBeingDragged) {
        if (this.debug) console.log('VueSliderBar.moveEnd(e=', e, ')')
        const handleIndex = this._getHandleIndex(e)
        this.$emit('drag-end', this)
        if (this.lazy && this._isDiff(this.handleValues[handleIndex], this.modelValues[handleIndex])) {
          this.syncValue()
        }

        this.handleBeingDragged = undefined
        this.setPosition(undefined, handleIndex)

        if (this.debug) console.log('\n\nVueSliderBar.moveEnd(e=', e, ') complete\n\n\n')
      } else {
        return false
      }
    },
    setValueOnPos (pos, handleIndex) {
      if (this.debug) console.log(`VueSliderBar.setValueOnPos(pos=${pos}, handleIndex=${handleIndex})`)
      let range = this.rangeLimit
      let valueRange = this.valueLimit
      if (pos >= range[0] && pos <= range[1]) {
        this.handlePositions[handleIndex] = pos
        const v = this._translateSliderPositionToValue(pos)
        this.setValue(v, handleIndex)
      } else if (pos < range[0]) {
        this.handlePositions[handleIndex] = range[0]
        this.setValue(valueRange[0], handleIndex)
      } else {
        this.handlePositions[handleIndex] = range[1]
        this.setValue(valueRange[1], handleIndex)
      }
    },
    setValue (handleValue, handleIndex, noCb, speed) {
      if (this.debug) console.log(`VueSliderBar.setValue(handleValue=${handleValue}, handleIndex=${handleIndex}, noCb=${noCb}, speed=${speed})`)
      if (this._isDiff(this.handleValues[handleIndex], handleValue)) {
        let resetVal = this.limitValue(handleValue)
        Vue.set(this.handleValues, handleIndex, resetVal)
        this.syncValue(noCb)

        this.$nextTick(() => this.setPosition(speed, handleIndex))
      }
    },
    setPosition (speed, handleIndex) {
      if (this.debug) console.log(`VueSliderBar.setPosition(speed=${speed}, handleIndex=${handleIndex})`)
      const pos = this._getHandlePosition(handleIndex)
      Vue.set(this.handlePositions, handleIndex, pos)
      if (!this.handleBeingDragged) this.setTransitionTime(this.speed, handleIndex)
      else this.setTransitionTime(this.speed, handleIndex)
      this.setTransform(pos, handleIndex)
    },
    setTransform (pos, handleIndex) {
      if (this.debug) console.log(`VueSliderBar.setTransform(pos=${pos}, handleIndex=${handleIndex})`)
      const handle = this._getHandleFromIndex(handleIndex)
      const position = pos - 8
      const translateValue = `translateX(${position}px)`
      handle.style.transform = translateValue
      handle.style.WebkitTransform = translateValue
      handle.style.msTransform = translateValue

      // Center the tooltip on the end of the progress bar. If user has entered a custom tooltip overload, silently mash it
      const vueSlideBarTooltip = handle.children[0] ? handle.children[0].children[0] ? handle.children[0].children[0] : undefined : undefined
      if (vueSlideBarTooltip) {
        const left = vueSlideBarTooltip.getBoundingClientRect().width / 2
        vueSlideBarTooltip.style.left = `-${left - 8}px`
      }
      const outerPoss = this._getOuterHandlePositions()
      const width = outerPoss[1] - outerPoss[0]
      this.$refs.progress.style.width = `${width}px`
      this.$refs.progress.style['left'] = `${outerPoss[0]}px`
    },
    setTransitionTime (time, handleIndex) {
      if (this.debug) console.log(`VueSliderBar.setTransitionTime(time=${time}, handleIndex=${handleIndex})`)
      const slideBar = this.$refs.slideBar
      slideBar.style.transitionDuration = `${time}s`
      slideBar.style.WebkitTransitionDuration = `${time}s`
      this.$refs.progress.style.transitionDuration = `${time}s`
      this.$refs.progress.style.WebkitTransitionDuration = `${time}s`
    },
    syncValue (noCb) {
      if (this.debug) console.log(`VueSliderBar.syncValue(noCb=${noCb})`)

      // Emit the slideBar handles values to the parent so it can safely update the v-model binding.
      let outboundValue
      if (this.allowedValues) {
        // Translate the allowedValues index to the corresponding value
        const translatedValues = []
        this.handleValues.forEach((allowedValuesIndex) => translatedValues.push(this.allowedValues[allowedValuesIndex]))
        outboundValue = Array.isArray(this.modelValues) ? translatedValues : translatedValues[0]
      } else {
        outboundValue = Array.isArray(this.modelValues) ? this.handleValues : this.handleValues[0]
      }
      this.$emit('updateModelValues', outboundValue)
      if (this.debug) console.log(`VueSliderBar.syncValue(noCb=${noCb}) emit 'updateModelValues', ${outboundValue}`)

      // Emit the ranges matching the slideBar's handles positions
      if (this.range) {
        let ranges = []
        if (this.allowedValues) {
          // Translate the allowedValues index to the corresponding range
          this.handleValues.forEach((allowedValuesIndex, handleIndex) => ranges.push(this._getRangeObject(undefined, allowedValuesIndex)))
        } else {
          this.handleValues.forEach((handleValue, handleIndex) => ranges.push(this._getRangeObject(handleValue, undefined)))
        }
        ranges = Array.isArray(this.modelValues) ? ranges : ranges[0]
        this.$emit('callbackRange', ranges)
        if (this.debug) console.log(`VueSliderBar.syncValue(noCb=${noCb}) emit 'callbackRange',`, ranges)
      }

      if (!noCb) {
        this.$emit('callback', outboundValue)
        if (this.debug) console.log(`VueSliderBar.syncValue(noCb=${noCb}) emit 'callback', ${outboundValue}`)
      }
    },
    refresh () {
      if (this.debug) console.log('VueSliderBar.refresh()')
      if (this.$refs.slideBar) {
        this.setStaticData()
        this.handleValues.forEach((handleValue, handleIndex) => this.setPosition(undefined, handleIndex))
      }
    },
    renderHandleValue (handleValue) {
      let v = handleValue
      if (this.allowedValues) v = this.allowedValues[handleValue]
      return `${this.prefix}${v}${this.suffix}`
    },
    /** Returns the position in the slider in px */
    _getEventPosition (e) {
      this.realTime && this.setStaticData()
      const pos = e.clientX - this.offset
      if (this.debug) console.log('VueSliderBar.getPos(', e, ') returns ', pos)
      return pos
    },
    _getHandleFromIndex (handleIndex) {
      return this.$refs.slideBar.children[handleIndex]
    },
    _getHandleIndex (e) {
      let dataHandleIndexAttr
      if (e.currentTarget instanceof Document) {
        dataHandleIndexAttr = this.handleBeingDragged.attributes.getNamedItem('data-handle-index')
      } else {
        dataHandleIndexAttr = e.currentTarget.attributes.getNamedItem('data-handle-index')
      }
      return Number.parseInt(dataHandleIndexAttr.value)
    },
    _getHandleIndexClosestToPos (pos) {
      const needle = this._translateSliderPositionToValue(pos) // We are looking at a handle which is closest to this value
      let bestHandleIndex = 0
      let shortestDistance = Number.MAX_SAFE_INTEGER
      for (let handleIndex = 0; handleIndex < this.handleValues.length; handleIndex++) {
        const handleValue = this.handleValues[handleIndex]
        let distance = handleValue - needle
        if (distance < 0) distance *= -1 // reverse negative distance
        if (distance < shortestDistance) {
          shortestDistance = distance
          bestHandleIndex = handleIndex
        }
      }
      if (this.debug) console.log(`VueSliderBar._getHandleIndexClosestToPos(pos=${pos}) return ${bestHandleIndex}`)
      return bestHandleIndex
    },
    _getHandlePosition (handleIndex) {
      const pos = ((this.handleValues[handleIndex] - this.minimum) / this.spacing * this.gap)
      if (this.debug) console.log(`VueSliderBar.position(${handleIndex}) returns ${pos}`)
      return pos
    },
    /**
     * Returns a tuple of the positions of the two most furthest away handles. In effect all other handles are somewhere in between those outermost handles.
     * If there is only one handle, returns [0, <handlePosition>]
     */
    _getOuterHandlePositions () {
      if (this.handleValues.length === 1) {
        return [0, this.handlePositions[0]]
      }
      if (this.handleValues.length === 2) {
        if (this.handlePositions[0] < this.handlePositions[1]) return [this.handlePositions[0], this.handlePositions[1]]
        else return [this.handlePositions[1], this.handlePositions[0]]
      }
      const outerPoss = [Number.MAX_SAFE_INTEGER, 0]
      for (let handleIndex = 0; handleIndex < this.handlePositions.length; handleIndex++) {
        const handlePos = this.handlePositions[handleIndex]
        if (handlePos < outerPoss[0]) { // If we found a position which is closer to the start than the previous one
          outerPoss[0] = handlePos
        }
        if (handlePos > outerPoss[1]) { // If we found a position which is closer to the end than the previous one
          outerPoss[1] = handlePos
        }
      }
      if (this.debug) console.log(`VueSliderBar._getOuterHandlePositions() return ${outerPoss}`)
      return outerPoss
    },
    /** Gets the label or the index of the range-element in the current handle's position */
    _getRangeObject (handleValue, rangeIndex) {
      let rangeObject
      if (!rangeIndex) rangeIndex = (handleValue - this.minimum) / this.spacing
      if (Array.isArray(this.range)) {
        rangeObject = this.range[rangeIndex]
        if (!rangeObject) return this._printError(`Missing rangeObject for handleValue=${handleValue}, rangeIndex=${rangeIndex}`)
      } // eslint-disable-line
      else {
        rangeObject = {label: rangeIndex}
      }
      console.log(`VueSliderBar._getRangeObject(${handleValue}) return `, rangeObject)
      return rangeObject
    },
    _isDiff (a, b) {
      let rv
      if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
        rv = true
      } else if (Array.isArray(a) && a.length === b.length) {
        rv = a.some((v, i) => v !== b[i])
      } else {
        rv = a !== b
      }
      if (this.debug) console.log('VueSliderBar._isDiff(', a, ', ', b, ') returns ', rv)
      return rv
    },
    _printError (msg) {
      console.error(msg)
    },
    /**
     * Turns a value into an allowed value index, if such a value is in the Array of allowed values. Else returns undefined and prints an error message.
     * Note that this.allowedValues might not have been initialized yet, and this is used to initialize it.
     */
    _translateAllowedValueToAllowedValueIndex (allowedValue) {
      const index = this.allowedValues.indexOf(allowedValue)
      if (this.debug) console.log(`VueSliderBar._translateAllowedValueToAllowedValueIndex(allowedValue=${allowedValue}) value matches allowedValues index=${index}`)
      if (index > -1) {
        return index
      } else {
        throw new RangeError(`VueSliderBar._translateAllowedValueToAllowedValueIndex(allowedValue=${allowedValue}) using :allowedValues but the given value is not a valid allowedValue. Current allowedValues=${this.allowedValues}`)
      }
    },
    _translateAllowedValuesToAllowedValueIndexex (allowedValues) {
      const newVals = []
      for (let i = 0; i < allowedValues.length; i++) {
        newVals[i] = this._translateAllowedValueToAllowedValueIndex(allowedValues[i])
      }
      return newVals
    },
    /** Translates pixels into a value within the given min and max boundaries */
    _translateSliderPositionToValue (pos) {
      const v = (Math.round(pos / this.gap) * (this.spacing * this.multiple) + (this.minimum * this.multiple)) / this.multiple
      if (this.debug) console.log(`VueSliderBar._translateSliderPositionToValue(pos=${pos}) return ${v}`)
      return v
    }
  },
  mounted () {
    if (this.debug) console.log('VueSliderBar.mounted()')
    this.isComponentExists = true
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return this._printError('[VueSlider error]: window or document is undefined, can not be initialization.')
    }
    this.$nextTick(() => {
      if (this.isComponentExists) {
        this.setStaticData()
        // Set handle positions
        this.handleValues.forEach((handleValue, handleIndex) => {
          this.setValue(handleValue, handleIndex, true, 0)
          this.setPosition(undefined, handleIndex)
        })
        this.bindEvents()
      }
    })
  },
  beforeDestroy () {
    this.isComponentExists = false
    this.unbindEvents()
  }
}
</script>

<style scoped>
.vue-slide-bar-component {
  position: relative;
  box-sizing: border-box;
  user-select: none;
  padding-top: 40px !important;
}
.vue-slide-bar {
  position: relative;
  display: block;
  border-radius: 15px;
  background-color: #d8d8d8;
  cursor: pointer;
}
.vue-slide-bar::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.vue-slide-bar-progress {
  position: absolute;
  border-radius: 15px;
  background-color: #1066FD;
  transition: all 0s;
  z-index: 1;
  width: 0;
  height: 100%;
  top: 0;
  left: 0;
  will-change: width;
}
.vue-slide-bar-dot {
  position: absolute;
  transition: all 0s;
  will-change: transform;
  cursor: pointer;
  z-index: 3;
  left: 0;
  top: -16px;
}
.vue-slide-bar-tooltip-wrap {
  /* display: none; */
  position: absolute;
  z-index: 9;
  width: 100%;
  height: 100%;
  display: block !important;
}
.vue-slide-bar-tooltip-top {
  top: -12px;
  left: 40%;
  transform: translate(-50%, -100%);
}
.vue-slide-bar-tooltip {
  position: relative;
  font-size: 14px;
  white-space: nowrap;
  padding: 2px 5px;
  min-width: 20px;
  text-align: center;
  color: #fff;
  border-radius: 5px;
  border: 1px solid #1066FD;
  background-color: #1066FD;
}
.vue-slide-bar-tooltip::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-top-color: inherit;
  transform: translate(-50%, 0);
}
.vue-slide-bar-range {
  display: flex;
  padding: 5px 0;
  justify-content: space-between;
}
.vue-slide-bar-separate {
  position: relative;
  width: 2px;
  background-color: #9e9e9e;
  height: 5px;
  cursor: pointer;
}
.vue-slide-bar-separate-text {
  text-align: center;
  position: absolute;
  white-space: nowrap;
  transform: translate(-50%, 0);
  top: 6px;
}
</style>
