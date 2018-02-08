/*!
 * vue-slide-bar v1.0.0
 * (c) 2018-present biig_pongsatorn <biig_pongsatorn@hotmail.com>
 */
var VueSlideBar = { render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { ref: "wrap", staticClass: "vue-slide-bar-component vue-slide-bar-horizontal", staticStyle: { "width": "auto", "padding": "0px 10px" }, on: { "click": _vm.wrapClick } }, [_c('div', { ref: "elem", staticClass: "vue-slide-bar", style: { height: ((_vm.lineHeight) + "px") } }, [[_c('div', { ref: "dot", staticClass: "vue-slide-bar-always vue-slide-bar-dot", style: { 'width': ((_vm.iconWidth) + "px") }, on: { "mousedown": _vm.moveStart, "touchstart": _vm.moveStart } }, [_vm.showTooltip ? _c('span', { staticClass: "vue-slide-bar-tooltip-top vue-slide-bar-tooltip-wrap" }, [_vm._t("tooltip", [_c('span', { staticClass: "vue-slide-bar-tooltip", style: _vm.tooltipStyles }, [_vm._v(_vm._s(_vm.val))])])], 2) : _vm._e()])], _vm._v(" "), _c('div', { ref: "process", staticClass: "vue-slide-bar-process", style: _vm.processStyle })], 2), _vm._v(" "), _vm.range ? _c('div', { staticClass: "vue-slide-bar-range" }, _vm._l(_vm.range, function (r, index) {
      return _c('div', { key: index, staticClass: "vue-slide-bar-separate" }, [!r.isHide ? _c('span', { staticClass: "vue-slide-bar-separate-text" }, [_vm._v(" " + _vm._s(r.label) + " ")]) : _vm._e()]);
    })) : _vm._e()]);
  }, staticRenderFns: [], _scopeId: 'data-v-68863e48',
  name: 'VueSlideBar',
  data: function data() {
    return {
      flag: false,
      size: 0,
      currentValue: 0,
      currentSlider: 0,
      isComponentExists: true,
      interval: 1,
      lazy: false,
      realTime: false
    };
  },
  props: {
    data: {
      type: Array,
      default: null
    },
    range: {
      type: Array,
      default: null
    },
    speed: {
      type: Number,
      default: 0.5
    },
    lineHeight: {
      type: Number,
      default: 5
    },
    iconWidth: {
      type: Number,
      default: 20
    },
    value: {
      type: [String, Number, Array],
      default: 0
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
    tooltipStyles: Object,
    processStyle: Object
  },
  computed: {
    isRange: function isRange() {
      return Array.isArray(this.value);
    },
    slider: function slider() {
      return this.isRange ? [this.$refs.dot0, this.$refs.dot1] : this.$refs.dot;
    },
    val: {
      get: function get() {
        return this.data ? this.isRange ? [this.data[this.currentValue[0]], this.data[this.currentValue[1]]] : this.data[this.currentValue] : this.currentValue;
      },
      set: function set(val) {
        if (this.data) {
          if (this.isRange) {
            var index0 = this.data.indexOf(val[0]);
            var index1 = this.data.indexOf(val[1]);
            if (index0 > -1 && index1 > -1) {
              this.currentValue = [index0, index1];
            }
          } else {
            var index = this.data.indexOf(val);
            if (index > -1) {
              this.currentValue = index;
            }
          }
        } else {
          this.currentValue = val;
        }
      }
    },
    currentIndex: function currentIndex() {
      if (this.isRange) {
        return this.data ? this.currentValue : [(this.currentValue[0] - this.minimum) / this.spacing, (this.currentValue[1] - this.minimum) / this.spacing];
      } else {
        return (this.currentValue - this.minimum) / this.spacing;
      }
    },
    indexRange: function indexRange() {
      if (this.isRange) {
        return this.currentIndex;
      } else {
        return [0, this.currentIndex];
      }
    },
    minimum: function minimum() {
      return this.data ? 0 : this.min;
    },
    maximum: function maximum() {
      return this.data ? this.data.length - 1 : this.max;
    },
    multiple: function multiple() {
      var decimals = ("" + (this.interval)).split('.')[1];
      return decimals ? Math.pow(10, decimals.length) : 1;
    },
    spacing: function spacing() {
      return this.data ? 1 : this.interval;
    },
    total: function total() {
      if (this.data) {
        return this.data.length - 1;
      } else if (Math.floor((this.maximum - this.minimum) * this.multiple) % (this.interval * this.multiple) !== 0) {
        this.printError('[VueSlider error]: Prop[interval] is illegal, Please make sure that the interval can be divisible');
      }
      return (this.maximum - this.minimum) / this.interval;
    },
    gap: function gap() {
      return this.size / this.total;
    },
    position: function position() {
      return this.isRange ? [(this.currentValue[0] - this.minimum) / this.spacing * this.gap, (this.currentValue[1] - this.minimum) / this.spacing * this.gap] : (this.currentValue - this.minimum) / this.spacing * this.gap;
    },
    limit: function limit() {
      return this.isRange ? [[0, this.position[1]], [this.position[0], this.size]] : [0, this.size];
    },
    valueLimit: function valueLimit() {
      return this.isRange ? [[this.minimum, this.currentValue[1]], [this.currentValue[0], this.maximum]] : [this.minimum, this.maximum];
    }
  },
  watch: {
    value: function value(val) {
      this.flag || this.setValue(val, true);
    },
    max: function max(val) {
      if (val < this.min) {
        return this.printError('[VueSlider error]: The maximum value can not be less than the minimum value.');
      }
      var resetVal = this.limitValue(this.val);
      this.setValue(resetVal);
      this.refresh();
    },
    min: function min(val) {
      if (val > this.max) {
        return this.printError('[VueSlider error]: The minimum value can not be greater than the maximum value.');
      }
      var resetVal = this.limitValue(this.val);
      this.setValue(resetVal);
      this.refresh();
    }
  },
  methods: {
    bindEvents: function bindEvents() {
      document.addEventListener('touchmove', this.moving, { passive: false });
      document.addEventListener('touchend', this.moveEnd, { passive: false });
      document.addEventListener('mousemove', this.moving);
      document.addEventListener('mouseup', this.moveEnd);
      document.addEventListener('mouseleave', this.moveEnd);
      window.addEventListener('resize', this.refresh);
    },
    unbindEvents: function unbindEvents() {
      window.removeEventListener('resize', this.refresh);
      document.removeEventListener('touchmove', this.moving);
      document.removeEventListener('touchend', this.moveEnd);
      document.removeEventListener('mousemove', this.moving);
      document.removeEventListener('mouseup', this.moveEnd);
      document.removeEventListener('mouseleave', this.moveEnd);
    },
    getPos: function getPos(e) {
      this.realTime && this.getStaticData();
      return e.clientX - this.offset;
    },
    wrapClick: function wrapClick(e) {
      var pos = this.getPos(e);
      if (this.isRange) {
        this.currentSlider = pos > (this.position[1] - this.position[0]) / 2 + this.position[0] ? 1 : 0;
      }
      this.setValueOnPos(pos);
    },
    moveStart: function moveStart(e, index) {
      if (this.isRange) {
        this.currentSlider = index;
      }
      this.flag = true;
      this.$emit('drag-start', this);
    },
    moving: function moving(e) {
      if (!this.flag) { return false; }
      e.preventDefault();
      if (e.targetTouches && e.targetTouches[0]) { e = e.targetTouches[0]; }
      this.setValueOnPos(this.getPos(e), true);
    },
    moveEnd: function moveEnd(e) {
      if (this.flag) {
        this.$emit('drag-end', this);
        if (this.lazy && this.isDiff(this.val, this.value)) {
          this.syncValue();
        }
      } else {
        return false;
      }
      this.flag = false;
      this.setPosition();
    },
    setValueOnPos: function setValueOnPos(pos, isDrag) {
      var range = this.isRange ? this.limit[this.currentSlider] : this.limit;
      var valueRange = this.isRange ? this.valueLimit[this.currentSlider] : this.valueLimit;
      if (pos >= range[0] && pos <= range[1]) {
        this.setTransform(pos);
        var v = (Math.round(pos / this.gap) * (this.spacing * this.multiple) + this.minimum * this.multiple) / this.multiple;
        this.setCurrentValue(v, isDrag);
      } else if (pos < range[0]) {
        this.setTransform(range[0]);
        this.setCurrentValue(valueRange[0]);
        if (this.currentSlider === 1) { this.currentSlider = 0; }
      } else {
        this.setTransform(range[1]);
        this.setCurrentValue(valueRange[1]);
        if (this.currentSlider === 0) { this.currentSlider = 1; }
      }
    },
    isDiff: function isDiff(a, b) {
      if (Object.prototype.toString.call(a) !== Object.prototype.toString.call(b)) {
        return true;
      } else if (Array.isArray(a) && a.length === b.length) {
        return a.some(function (v, i) { return v !== b[i]; });
      }
      return a !== b;
    },
    setCurrentValue: function setCurrentValue(val, bool) {
      if (val < this.minimum || val > this.maximum) { return false; }
      if (this.isRange) {
        if (this.isDiff(this.currentValue[this.currentSlider], val)) {
          this.currentValue.splice(this.currentSlider, 1, val);
          if (!this.lazy || !this.flag) {
            this.syncValue();
          }
        }
      } else if (this.isDiff(this.currentValue, val)) {
        this.currentValue = val;
        if (!this.lazy || !this.flag) {
          this.syncValue();
        }
      }
      bool || this.setPosition();
    },
    setIndex: function setIndex(val) {
      if (Array.isArray(val) && this.isRange) {
        var value;
        if (this.data) {
          value = [this.data[val[0]], this.data[val[1]]];
        } else {
          value = [this.spacing * val[0] + this.minimum, this.spacing * val[1] + this.minimum];
        }
        this.setValue(value);
      } else {
        val = this.spacing * val + this.minimum;
        if (this.isRange) {
          this.currentSlider = val > (this.currentValue[1] - this.currentValue[0]) / 2 + this.currentValue[0] ? 1 : 0;
        }
        this.setCurrentValue(val);
      }
    },
    setValue: function setValue(val, noCb, speed) {
      var this$1 = this;

      if (this.isDiff(this.val, val)) {
        var resetVal = this.limitValue(val);
        this.val = this.isRange ? resetVal.concat() : resetVal;
        this.syncValue(noCb);
      }
      this.$nextTick(function () { return this$1.setPosition(speed); });
    },
    setPosition: function setPosition(speed) {
      this.flag || this.setTransitionTime(speed === undefined ? this.speed : speed);
      if (this.isRange) {
        this.currentSlider = 0;
        this.setTransform(this.position[this.currentSlider]);
        this.currentSlider = 1;
        this.setTransform(this.position[this.currentSlider]);
      } else {
        this.setTransform(this.position);
      }
      this.flag || this.setTransitionTime(0);
    },
    setTransform: function setTransform(val) {
      var value = val - 8;
      var translateValue = "translateX(" + value + "px)";
      var processSize = (this.currentSlider === 0 ? this.position[1] - val : val - this.position[0]) + "px";
      var processPos = (this.currentSlider === 0 ? val : this.position[0]) + "px";
      if (this.isRange) {
        this.slider[this.currentSlider].style.transform = translateValue;
        this.slider[this.currentSlider].style.WebkitTransform = translateValue;
        this.slider[this.currentSlider].style.msTransform = translateValue;
        this.$refs.process.style.width = processSize;
        this.$refs.process.style['left'] = processPos;
      } else {
        this.slider.style.transform = translateValue;
        this.slider.style.WebkitTransform = translateValue;
        this.slider.style.msTransform = translateValue;
        this.$refs.process.style.width = val + "px";
        this.$refs.process.style['left'] = 0;
      }
    },
    setTransitionTime: function setTransitionTime(time) {
      var this$1 = this;

      // In order to avoid browser merge style and modify together
      // time || this.$refs.process.offsetWidth
      if (this.isRange) {
        for (var i = 0; i < this.slider.length; i++) {
          this$1.slider[i].style.transitionDuration = time + "s";
          this$1.slider[i].style.WebkitTransitionDuration = time + "s";
        }
        this.$refs.process.style.transitionDuration = time + "s";
        this.$refs.process.style.WebkitTransitionDuration = time + "s";
      } else {
        this.slider.style.transitionDuration = time + "s";
        this.slider.style.WebkitTransitionDuration = time + "s";
        this.$refs.process.style.transitionDuration = time + "s";
        this.$refs.process.style.WebkitTransitionDuration = time + "s";
      }
    },
    limitValue: function limitValue(val) {
      var this$1 = this;

      if (this.data) {
        return val;
      }
      var inRange = function (v) {
        if (v < this$1.min) {
          this$1.printError(("[VueSlider warn]: The value of the slider is " + val + ", the minimum value is " + (this$1.min) + ", the value of this slider can not be less than the minimum value"));
          return this$1.min;
        } else if (v > this$1.max) {
          this$1.printError(("[VueSlider warn]: The value of the slider is " + val + ", the maximum value is " + (this$1.max) + ", the value of this slider can not be greater than the maximum value"));
          return this$1.max;
        }
        return v;
      };
      if (this.isRange) {
        return val.map(function (v) { return inRange(v); });
      } else {
        return inRange(val);
      }
    },
    syncValue: function syncValue(noCb) {
      var val = this.isRange ? this.val.concat() : this.val;
      if (this.range) {
        this.$emit('callbackRange', this.range[this.currentIndex]);
      }
      this.$emit('input', val);
      noCb || this.$emit('callback', val);
    },
    getValue: function getValue() {
      return this.val;
    },
    getIndex: function getIndex() {
      return this.currentIndex;
    },
    getStaticData: function getStaticData() {
      if (this.$refs.elem) {
        this.size = this.$refs.elem.offsetWidth;
        this.offset = this.$refs.elem.getBoundingClientRect().left;
      }
    },
    refresh: function refresh() {
      if (this.$refs.elem) {
        this.getStaticData();
        this.setPosition();
      }
    },
    printError: function printError(msg) {
      console.error(msg);
    }
  },
  mounted: function mounted() {
    var this$1 = this;

    this.isComponentExists = true;
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return this.printError('[VueSlider error]: window or document is undefined, can not be initialization.');
    }
    this.$nextTick(function () {
      if (this$1.isComponentExists) {
        this$1.getStaticData();
        this$1.setValue(this$1.limitValue(this$1.value), true, 0);
        this$1.bindEvents();
      }
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.isComponentExists = false;
    this.unbindEvents();
  }
};

export default VueSlideBar;
