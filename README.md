# 🎢  Vye Slide Bar

> Vue Component Slider Bar

## Install
```sh
npm install vue-slide-bar --save
```

## Run example
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9000
npm run dev
```

# Usage

## Simple
<center><img src="static/images/exam1.png"/></center>

```html
<template>
  <div>
    <VueSlideBar v-model="value"/>
    <h2>Value: {{value}}</h2>
  </div>
</template>

<script>
import VueSlideBar from './components/VueSlideBar'

export default {
  data () {
    return {
      value: 50
    }
  },
  components: {
    VueSlideBar
  }
}
</script>
```

## With Label
<center><img src="static/images/exam2.png"/></center>

```html
<template>
  <div>
    <VueSlideBar v-model="slider.value" :data="slider.data" :range="slider.range" :processStyle="{ backgroundColor: '#d8d8d8' }" @callbackRange="callbackRange">
      <template slot="tooltip" slot-scope="tooltip">
        <img src="static/images/rectangle-slider.svg">
      </template>
    </VueSlideBar>
    <h2>Value: {{slider.value}}</h2>
    <h2>Label: {{rangeValue.label}}</h2>
  </div>
</template>

<script>
import VueSlideBar from './components/VueSlideBar'

export default {
  data () {
    return {
      rangeValue: {},
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
        ]
      }
    }
  },
  methods: {
    callbackRange (val) {
      this.rangeValue = val
    }
  },
  components: {
    VueSlideBar
  }
}
</script>
```

## Custom Style && Min-Max
<center><img src="static/images/exam3.png"/></center>

```html
<template>
  <div>
    <VueSlideBar 
      v-model="value2"
      :min="1"
      :max="10"
      :processStyle="slider.processStyle"
      :lineHeight="slider.lineHeight"
      :tooltipStyles="{ backgroundColor: 'red', borderColor: 'red' }">
    </VueSlideBar>
    <h2>Value: {{value2}}</h2>
  </div>
</template>

<script>
import VueSlideBar from './components/VueSlideBar'

export default {
  data () {
    return {
      value2: 8,
      slider: {
        lineHeight: 10,
        processStyle: {
          backgroundColor: 'red'
        }
      }
    }
  },
  components: {
    VueSlideBar
  }
}
</script>
```

## Loading
<center><img src="static/images/exam4.png"/></center>

```html
<template>
  <div>
    <VueSlideBar v-model="loading" :showTooltip="false"/>
    <h2>
      <button type="button" name="button" @click="startLoad()">
        Click to start load
      </button>
    </h2>
    <h2>Value: {{loading}}</h2>
  </div>
</template>

<script>
import VueSlideBar from './components/VueSlideBar'

export default {
  data () {
    return {
      loading: 0,
    }
  },
  methods: {
    startLoad () {
      this.loader = setInterval(() => {
        this.loading++
        if (this.loading === 100) {
          console.log('clear', this.loading)
          clearInterval(this.loader)
        }
      }, 100)
    }
  }
  components: {
    VueSlideBar
  }
}
</script>
```

## Options

### Props
| Props       | Type          | Default  | Description  |
| ----------- |:--------------| ---------|--------------|
| min         | Number        | 0        | the minimum value   |
| max         | Number        | 100      | the maximum value   |
| process-style*    | Object | null  | The style of the process bar. |
| tooltip-style*    | Object[,Array(in range model), Function<Value, Index>] | null  | The style of the tooltip. |
| value       | Number,Array  | 0        | initial value (if the value for the array open range model) |
| data        | Array         | null     | the custom data. |
| showTooltip      | Boolean       | true     | display of tooltip |
| iconWidth       | Number | 20 | width of the icon |
| lineHeight      | Number | 5        | height of the line |
| speed       | Number        | 0.5      | transition time |

| direction   | String        | horizontal | set the direction of the component, optional value: ['horizontal', 'vertical'] |
| event-type  | String        | auto   | the event type, optional value: ['auto', 'none'] |

### Events
| Name          | Type          | Description  |
| --------------|:--------------|--------------|
| callbackRange | Params: function(range)  | when values change return range data. |

### Slot
| Name          | Description  |
| --------------|--------------|
| tooltip       | Customize the tooltip slot.|

[#](https://vuejs.org/v2/guide/components.html#Scoped-Slots) When using the template element as a slot, can add special properties `scope` or `slot-scope` to get the value.


## License

[MIT](LICENSE)
