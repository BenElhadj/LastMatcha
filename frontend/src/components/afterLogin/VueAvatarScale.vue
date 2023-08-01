<template>
  <div class="editor">
    <canvas id="canvas__editor" ref="canvas" :width="canvasWidth" :height="canvasHeight" :class="cursor" @dragover.prevent @drop="onDrop" @mousedown="onDragStart" @mouseup="onDragEnd" @mousemove="onMouseMove" @click="clicked"></canvas>
    <q-file id="profileInput" style="display: none" accept="image/*" @update:model-value="fileSelected"></q-file>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive, watch } from 'vue'
// import { useQuasar } from 'quasar'

const drawRoundedRect = (context, x, y, width, height, borderRadius) => {
  if (borderRadius === 0) {
    context.rect(x, y, width, height)
  } else {
    const widthMinusRad = width - borderRadius
    const heightMinusRad = height - borderRadius
    context.translate(x, y)
    context.arc(borderRadius, borderRadius, borderRadius, Math.PI, Math.PI * 1.5)
    context.lineTo(widthMinusRad, 0)
    context.arc(widthMinusRad, borderRadius, borderRadius, Math.PI * 1.5, Math.PI * 2)
    context.lineTo(width, heightMinusRad)
    context.arc(widthMinusRad, heightMinusRad, borderRadius, Math.PI * 2, Math.PI * 0.5)
    context.lineTo(borderRadius, height)
    context.arc(borderRadius, heightMinusRad, borderRadius, Math.PI * 0.5, Math.PI)
    context.translate(-x, -y)
  }
}

export default {
  name: 'VueAvatarScale',
  props: {
    image: { type: String, default: '' },
    border: { type: Number, default: 25 },
    borderRadius: { type: Number, default: 0 },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 200 },
    color: { type: Array, default: () => { return [0, 0, 0, 0.5] } }
  },
  setup (props) {
    const cursor = ref('cursorPointer')
    const scale = ref(1)
    const canvas = ref(null)
    const context = ref(null)
    const dragged = ref(false)
    const imageLoaded = ref(false)
    const changed = ref(false)
    const state = reactive({
      drag: false,
      my: null,
      mx: null,
      xxx: 'ab',
      image: {
        x: 0,
        y: 0,
        resource: null
      }
    })
    const canvasWidth = computed(() => getDimensions().canvas.width)
    const canvasHeight = computed(() => getDimensions().canvas.height)
    // },
    // move all methods and life cycle hooks here
    // remember to replace `this` with `ref.value` for refs and `reactiveProp.property` for reactives
    // also, replace `mounted()` with `onMounted()`

    // methods: {
    const clearCanvas = () => {
      ref.value.context.clearRect(0, 0, ref.value.width, ref.value.height)
    }
    const init = () => {
      ref.value.canvas = ref.value.$refs.canvas
      ref.value.context = ref.value.canvas.getContext('2d')
      ref.value.paint()
      ref.value.clearCanvas()
      if (!ref.value.image) {
        const placeHolder = ref.value.svgToImage(ref.value.context, '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65"><defs><style>.cls-1{fill:#999;}</style></defs><title>Upload_Upload</title><path class="cls-1" d="M32.5,1A31.5,31.5,0,1,1,1,32.5,31.54,31.54,0,0,1,32.5,1m0-1A32.5,32.5,0,1,0,65,32.5,32.5,32.5,0,0,0,32.5,0h0Z"/><polygon class="cls-1" points="41.91 28.2 32.59 18.65 23.09 28.39 24.17 29.44 31.87 21.54 31.87 40.05 33.37 40.05 33.37 21.59 40.83 29.25 41.91 28.2"/><polygon class="cls-1" points="40.66 40.35 40.66 44.35 24.34 44.35 24.34 40.35 22.34 40.35 22.34 44.35 22.34 46.35 24.34 46.35 40.66 46.35 42.66 46.35 42.66 44.35 42.66 40.35 40.66 40.35"/></svg>')
        const self = this
        placeHolder.onload = function () {
          // const dim = self.getDimensions()
          const x = self.canvasWidth / 2 - ref.value.width / 2
          const y = self.canvasHeight / 2 - ref.value.height / 2
          self.context.drawImage(placeHolder, x, y, ref.value.width, ref.value.height)
        }
      } else {
        ref.value.loadImage(ref.value.image)
      }
    }
    const svgToImage = (ctx, rawSVG) => {
      const svg = new Blob([rawSVG], { type: 'image/svg+xml;charset=utf-8' })
      const domURL = self.URL || self.webkitURL || self
      const url = domURL.createObjectURL(svg)
      const img = new Image()
      img.src = url
      return img
    }
    const setState = (state1) => {
      const min = Math.ceil(1)
      const max = Math.floor(10000)
      ref.value.state = state1
      ref.value.state.cnt = 'HELLO' + Math.floor(Math.random() * (max - min)) + min
    }
    const paint = () => {
      ref.value.context.save()
      ref.value.context.translate(0, 0)
      ref.value.context.fillStyle = 'rgba(' + ref.value.color.slice(0, 4).join(',') + ')'
      let borderRadius = ref.value.borderRadius
      const dimensions = ref.value.getDimensions()
      const borderSize = dimensions.border
      const height = dimensions.canvas.height
      const width = dimensions.canvas.width
      borderRadius = Math.max(borderRadius, 0)
      borderRadius = Math.min(borderRadius, width / 2 - borderSize, height / 2 - borderSize)
      ref.value.context.beginPath()
      drawRoundedRect(ref.value.context, borderSize, borderSize, width - borderSize * 2, height - borderSize * 2, borderRadius)
      ref.value.context.rect(width, 0, -width, height)
      ref.value.context.fill('evenodd')
      ref.value.context.restore()
    }
    const getDimensions = () => {
      return {
        width: ref.value.width,
        height: ref.value.height,
        border: ref.value.border,
        canvas: {
          width: ref.value.width + (ref.value.border * 2),
          height: ref.value.height + (ref.value.border * 2)
        }
      }
    }
    const onDrop = (e) => {
      e = e || window.event
      e.stopPropagation()
      e.preventDefault()
      if (e.dataTransfer && e.dataTransfer.files.length) {
        // ref.value.props.onDropFile(e)
        const reader = new FileReader()
        const file = e.dataTransfer.files[0]
        ref.value.changed = true
        reader.onload = (e) => ref.value.loadImage(e.target.result)
        reader.readAsDataURL(file)
      }
    }
    const onDragStart = (e) => {
      e = e || window.event
      e.preventDefault()
      ref.value.state.drag = true

      ref.value.state.mx = null
      ref.value.state.my = null
      ref.value.cursor = 'cursorGrabbing'
    }
    const onDragEnd = (e) => {
      if (ref.value.state.drag) {
        ref.value.state.drag = false
        ref.value.cursor = 'cursorPointer'
      }
    }
    const onMouseMove = (e) => {
      e = e || window.event
      if (ref.value.state.drag === false) {
        return
      }
      ref.value.dragged = true
      ref.value.changed = true
      const imageState = ref.value.state.image
      const lastX = imageState.x
      const lastY = imageState.y
      const mousePositionX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX
      const mousePositionY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY
      const newState = { mx: mousePositionX, my: mousePositionY, image: imageState }
      if (ref.value.state.mx && ref.value.state.my) {
        const xDiff = (ref.value.state.mx - mousePositionX) / ref.value.scale
        const yDiff = (ref.value.state.my - mousePositionY) / ref.value.scale
        imageState.y = ref.value.getBoundedY(lastY - yDiff, ref.value.scale)
        imageState.x = ref.value.getBoundedX(lastX - xDiff, ref.value.scale)
      }
      ref.value.state.mx = newState.mx
      ref.value.state.my = newState.my
      ref.value.state.image = imageState
      // ref.value.setState(newState)
    }
    const loadImage = (imageURL) => {
      const imageObj = new Image()
      const self = this
      imageObj.onload = function () {
        self.handleImageReady(imageObj)
      }
      // imageObj.onerror = ref.value.props.onLoadFailure
      if (!ref.value.isDataURL(imageURL)) imageObj.crossOrigin = 'anonymous'
      imageObj.src = imageURL
    }
    const handleImageReady = (image) => {
      const imageState = ref.value.getInitialSize(image.width, image.height)
      imageState.resource = image
      imageState.x = 0
      imageState.y = 0
      const oldState = ref.value.state
      oldState.drag = false
      oldState.image = imageState
      ref.value.state.image.x = 0
      ref.value.state.image.y = 0
      ref.value.state.image.resource = image
      ref.value.state.image.width = imageState.width
      ref.value.state.image.height = imageState.height
      ref.value.state.drag = false
      ref.value.scale = 1
      ref.value.$emit('vue-avatar-editor:image-ready', ref.value.scale)
      ref.value.imageLoaded = true
      ref.value.cursor = 'cursorGrab'
    }
    const getInitialSize = (width, height) => {
      let newHeight
      let newWidth
      const dimensions = ref.value.getDimensions()
      const canvasRatio = dimensions.height / dimensions.width
      const imageRatio = height / width
      if (canvasRatio > imageRatio) {
        newHeight = (ref.value.getDimensions().height)
        newWidth = (width * (newHeight / height))
      } else {
        newWidth = (ref.value.getDimensions().width)
        newHeight = (height * (newWidth / width))
      }
      return {
        height: newHeight,
        width: newWidth
      }
    }
    const isDataURL = (str) => {
      if (str === null) return false
      return !!str.match(/^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i)
    }
    const getBoundedX = (x, scale) => {
      const image = ref.value.state.image
      const dimensions = ref.value.getDimensions()
      let widthDiff = Math.floor((image.width - dimensions.width / scale) / 2)
      widthDiff = Math.max(0, widthDiff)
      return Math.max(-widthDiff, Math.min(x, widthDiff))
    }
    const getBoundedY = (y, scale) => {
      const image = ref.value.state.image
      const dimensions = ref.value.getDimensions()
      let heightDiff = Math.floor((image.height - dimensions.height / scale) / 2)
      heightDiff = Math.max(0, heightDiff)
      return Math.max(-heightDiff, Math.min(y, heightDiff))
    }
    const paintImage = (context, image, border) => {
      if (image.resource) {
        const position = ref.value.calculatePosition(image, border)
        context.save()
        context.globalCompositeOperation = 'destination-over'
        context.drawImage(image.resource, position.x, position.y, position.width, position.height)
        context.restore()
      }
    }
    const calculatePosition = (image, border) => {
      // var image = image || ref.value.state.image
      const dimensions = ref.value.getDimensions()
      const width = image.width * ref.value.scale
      const height = image.height * ref.value.scale
      const widthDiff = (width - dimensions.width) / 2
      const heightDiff = (height - dimensions.height) / 2
      const x = image.x * ref.value.scale - widthDiff + border
      const y = image.y * ref.value.scale - heightDiff + border
      return { x, y, height, width }
    }
    const changeScale = (sc) => {
      ref.value.changed = true
      ref.value.scale = sc
    }
    const redraw = () => {
      ref.value.context.clearRect(0, 0, ref.value.getDimensions().canvas.width, ref.value.getDimensions().canvas.height)
      ref.value.paint()
      ref.value.paintImage(ref.value.context, ref.value.state.image, ref.value.border)
    }
    const getImage = () => {
      const cropRect = ref.value.getCroppingRect()
      const image = ref.value.state.image
      cropRect.x *= image.resource.width
      cropRect.y *= image.resource.height
      cropRect.width *= image.resource.width
      cropRect.height *= image.resource.height
      const canvas = document.createElement('canvas')
      canvas.width = cropRect.width
      canvas.height = cropRect.height
      canvas.getContext('2d').drawImage(image.resource, -cropRect.x, -cropRect.y)
      return canvas
    }
    const getImageScaled = () => {
      const { width, height } = ref.value.getDimensions()
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      ref.value.paintImage(canvas.getContext('2d'), ref.value.state.image, 0)
      ref.value.image = ''
      ref.value.init()
      return canvas
    }
    const imageChanged = () => {
      return ref.value.changed
    }
    const getCroppingRect = () => {
      const dim = ref.value.getDimensions()
      const frameRect = { x: dim.border, y: dim.border, width: dim.width, height: dim.height }
      const imageRect = ref.value.calculatePosition(ref.value.state.image, dim.border)
      return {
        x: (frameRect.x - imageRect.x) / imageRect.width,
        y: (frameRect.y - imageRect.y) / imageRect.height,
        width: frameRect.width / imageRect.width,
        height: frameRect.height / imageRect.height
      }
    }
    const clicked = (e) => {
      if (ref.value.dragged === true) {
        ref.value.dragged = false
      } else {
        document.getElementById('profileInput').click()
      }
    }
    const fileSelected = (e) => {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length || files[0].type.split('/')[0] !== 'image') {
        ref.value.$emit('file_error')
        return
      }
      ref.value.$emit('file_success')
      // const image = new Image()
      const reader = new FileReader()
      ref.value.changed = true
      reader.onload = e => ref.value.loadImage(e.target.result)
      reader.readAsDataURL(files[0])
    }

    watch(() => state, () => {
      if (imageLoaded.value === true) { redraw() }
    }, { deep: true })

    scale.value = () => {
      if (ref.value.imageLoaded === true) { ref.value.redraw() }
    }

    onMounted(() => {
      init()
    })

    return {
      cursor,
      scale,
      canvas,
      context,
      dragged,
      imageLoaded,
      changed,
      state,
      canvasWidth,
      canvasHeight,
      clearCanvas,
      svgToImage,
      setState,
      paint,
      getDimensions,
      onDrop,
      onDragStart,
      onDragEnd,
      onMouseMove,
      loadImage,
      handleImageReady,
      getInitialSize,
      isDataURL,
      getBoundedX,
      getBoundedY,
      paintImage,
      calculatePosition,
      changeScale,
      redraw,
      getImage,
      getImageScaled,
      imageChanged,
      getCroppingRect,
      clicked,
      fileSelected
    }
  }
}
</script>

<style>
.editor {
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cursorPointer{
  cursor: pointer;
}
.cursorGrab{
  cursor: grab;
  cursor: -webkit-grab;
  cursor: -moz-grab;
}
.cursorGrabbing{
  cursor: grabbing;
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
}
</style>

<style>
.editor {
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cursorPointer{
  cursor: pointer;
}
.cursorGrab{
  cursor: grab;
  cursor: -webkit-grab;
  cursor: -moz-grab;
}
.cursorGrabbing{
  cursor: grabbing;
  cursor: -webkit-grabbing;
  cursor: -moz-grabbing;
}
</style>
