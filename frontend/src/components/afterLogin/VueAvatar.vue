<template>
  <div class="editor">
    <canvas id="canvas__editor" ref="canvas" :width="canvasWidth" :height="canvasHeight" :class="cursor" @dragover.prevent @drop="onDrop" @mousedown="onDragStart" @mouseup="onDragEnd" @mousemove="onMouseMove" @click="clicked"></canvas>
    <input id="profileInput" type="file" accept="image/*" class="d-none" @change="fileSelected">
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'

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
  name: 'VueAvatar',
  props: {
    image: { type: String, default: '' },
    border: { type: Number, default: 25 },
    borderRadius: { type: Number, default: 0 },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 200 },
    color: { type: Array, default: function () { return [0, 0, 0, 0.5] } }
  },
  emits: ['vue-avatar-editor:image-ready', 'file_error', 'file_success'],
  setup (props) {
    // Refactored your data properties to use Vue 3's reactive refs
    const cursor = ref('cursorPointer')
    const scale = ref(1)
    const canvas = ref(null)
    const context = ref(null)
    const dragged = ref(false)
    const imageLoaded = ref(false)
    const changed = ref(false)
    const state = ref({
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

    onMounted(() => {
      init()
    })

    // Watchers can be replaced with watch or watchEffect in Vue 3
    watch(state, () => {
      // Watch state and redraw if imageLoaded is true
      if (imageLoaded.value) {
        redraw()
      }
    })

    watch(scale, () => {
      // Watch scale and redraw if imageLoaded is true
      if (imageLoaded.value) {
        redraw()
      }
    })

    // Replaced your methods with functions inside setup()
    const init = () => {
      this.canvas = this.$refs.canvas
      this.context = this.canvas.getContext('2d')
      this.paint()
      this.clearCanvas()
      if (!this.image) {
        const placeHolder = this.svgToImage(this.context, '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 65 65"><defs><style>.cls-1{fill:#999;}</style></defs><title>Upload_Upload</title><path class="cls-1" d="M32.5,1A31.5,31.5,0,1,1,1,32.5,31.54,31.54,0,0,1,32.5,1m0-1A32.5,32.5,0,1,0,65,32.5,32.5,32.5,0,0,0,32.5,0h0Z"/><polygon class="cls-1" points="41.91 28.2 32.59 18.65 23.09 28.39 24.17 29.44 31.87 21.54 31.87 40.05 33.37 40.05 33.37 21.59 40.83 29.25 41.91 28.2"/><polygon class="cls-1" points="40.66 40.35 40.66 44.35 24.34 44.35 24.34 40.35 22.34 40.35 22.34 44.35 22.34 46.35 24.34 46.35 40.66 46.35 42.66 46.35 42.66 44.35 42.66 40.35 40.66 40.35"/></svg>')
        const self = this
        placeHolder.onload = function () {
        //   const dim = self.getDimensions()
          const x = self.canvasWidth / 2 - this.width / 2
          const y = self.canvasHeight / 2 - this.height / 2
          self.context.drawImage(placeHolder, x, y, this.width, this.height)
        }
      } else {
        this.loadImage(this.image)
      }
    }

    // Continue replacing your methods with functions inside setup()
    const clearCanvas = () => {
      this.context.clearRect(0, 0, this.width, this.height)
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
      this.state = state1
      this.state.cnt = 'HELLO' + Math.floor(Math.random() * (max - min)) + min
    }

    const paint = () => {
      this.context.save()
      this.context.translate(0, 0)
      this.context.fillStyle = 'rgba(' + this.color.slice(0, 4).join(',') + ')'
      let borderRadius = this.borderRadius
      const dimensions = this.getDimensions()
      const borderSize = dimensions.border
      const height = dimensions.canvas.height
      const width = dimensions.canvas.width
      // clamp border radius between zero (perfect rectangle) and half the size without borders (perfect circle or "pill")
      borderRadius = Math.max(borderRadius, 0)
      borderRadius = Math.min(borderRadius, width / 2 - borderSize, height / 2 - borderSize)
      this.context.beginPath()
      // inner rect, possibly rounded
      drawRoundedRect(this.context, borderSize, borderSize, width - borderSize * 2, height - borderSize * 2, borderRadius)
      this.context.rect(width, 0, -width, height) // outer rect, drawn "counterclockwise"
      this.context.fill('evenodd')
      this.context.restore()
    }

    const getDimensions = () => {
      return {
        width: this.width,
        height: this.height,
        border: this.border,
        canvas: {
          width: this.width + (this.border * 2),
          height: this.height + (this.border * 2)
        }
      }
    }

    const onDrop = (e) => {
      e = e || window.event
      e.stopPropagation()
      e.preventDefault()
      if (e.dataTransfer && e.dataTransfer.files.length) {
        // this.props.onDropFile(e)
        const reader = new FileReader()
        const file = e.dataTransfer.files[0]
        this.changed = true
        reader.onload = (e) => this.loadImage(e.target.result)
        reader.readAsDataURL(file)
      }
    }

    const onDragStart = (e) => {
      e = e || window.event
      e.preventDefault()
      this.state.drag = true

      this.state.mx = null
      this.state.my = null
      this.cursor = 'cursorGrabbing'
    }

    const onDragEnd = (e) => {
      if (this.state.drag) {
        this.state.drag = false
        this.cursor = 'cursorPointer'
      }
    }

    const onMouseMove = (e) => {
      e = e || window.event
      if (this.state.drag === false) {
        return
      }
      this.dragged = true
      this.changed = true
      const imageState = this.state.image
      const lastX = imageState.x
      const lastY = imageState.y
      const mousePositionX = e.targetTouches ? e.targetTouches[0].pageX : e.clientX
      const mousePositionY = e.targetTouches ? e.targetTouches[0].pageY : e.clientY
      const newState = { mx: mousePositionX, my: mousePositionY, image: imageState }
      if (this.state.mx && this.state.my) {
        const xDiff = (this.state.mx - mousePositionX) / this.scale
        const yDiff = (this.state.my - mousePositionY) / this.scale
        imageState.y = this.getBoundedY(lastY - yDiff, this.scale)
        imageState.x = this.getBoundedX(lastX - xDiff, this.scale)
      }
      this.state.mx = newState.mx
      this.state.my = newState.my
      this.state.image = imageState
      // this.setState(newState)
    }

    const loadImage = (imageURL) => {
      const imageObj = new Image()
      const self = this
      imageObj.onload = function () {
        self.handleImageReady(imageObj)
      }
      // imageObj.onerror = this.props.onLoadFailure
      if (!this.isDataURL(imageURL)) imageObj.crossOrigin = 'anonymous'
      imageObj.src = imageURL
    }

    const handleImageReady = (image) => {
      const imageState = this.getInitialSize(image.width, image.height)
      imageState.resource = image
      imageState.x = 0
      imageState.y = 0
      const oldState = this.state
      oldState.drag = false
      oldState.image = imageState
      this.state.image.x = 0
      this.state.image.y = 0
      this.state.image.resource = image
      this.state.image.width = imageState.width
      this.state.image.height = imageState.height
      this.state.drag = false
      this.scale = 1
      this.$emit('vue-avatar-editor:image-ready', this.scale)
      this.imageLoaded = true
      this.cursor = 'cursorGrab'
    }

    const getInitialSize = (width, height) => {
      let newHeight
      let newWidth
      const dimensions = this.getDimensions()
      const canvasRatio = dimensions.height / dimensions.width
      const imageRatio = height / width
      if (canvasRatio > imageRatio) {
        newHeight = (this.getDimensions().height)
        newWidth = (width * (newHeight / height))
      } else {
        newWidth = (this.getDimensions().width)
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
      const image = this.state.image
      const dimensions = this.getDimensions()
      let widthDiff = Math.floor((image.width - dimensions.width / scale) / 2)
      widthDiff = Math.max(0, widthDiff)
      return Math.max(-widthDiff, Math.min(x, widthDiff))
    }

    const getBoundedY = (y, scale) => {
      const image = this.state.image
      const dimensions = this.getDimensions()
      let heightDiff = Math.floor((image.height - dimensions.height / scale) / 2)
      heightDiff = Math.max(0, heightDiff)
      return Math.max(-heightDiff, Math.min(y, heightDiff))
    }

    const paintImage = (context, image, border) => {
      if (image.resource) {
        const position = this.calculatePosition(image, border)
        context.save()
        context.globalCompositeOperation = 'destination-over'
        context.drawImage(image.resource, position.x, position.y, position.width, position.height)
        context.restore()
      }
    }

    const calculatePosition = (imag, border) => {
      const image = imag || this.state.image
      const dimensions = this.getDimensions()
      const width = image.width * this.scale
      const height = image.height * this.scale
      const widthDiff = (width - dimensions.width) / 2
      const heightDiff = (height - dimensions.height) / 2
      const x = image.x * this.scale - widthDiff + border
      const y = image.y * this.scale - heightDiff + border
      return { x, y, height, width }
    }

    const changeScale = (sc) => {
      this.changed = true
      this.scale = sc
    }

    const redraw = () => {
      this.context.clearRect(0, 0, this.getDimensions().canvas.width, this.getDimensions().canvas.height)
      this.paint()
      this.paintImage(this.context, this.state.image, this.border)
    }

    const getImage = () => {
      const cropRect = this.getCroppingRect()
      const image = this.state.image
      // get actual pixel coordinates
      cropRect.x *= image.resource.width
      cropRect.y *= image.resource.height
      cropRect.width *= image.resource.width
      cropRect.height *= image.resource.height
      // create a canvas with the correct dimensions
      const canvas = document.createElement('canvas')
      canvas.width = cropRect.width
      canvas.height = cropRect.height
      // draw the full-size image at the correct position,
      // the image gets truncated to the size of the canvas.
      canvas.getContext('2d').drawImage(image.resource, -cropRect.x, -cropRect.y)
      return canvas
    }

    const getImageScaled = () => {
      const localImage = ref(props.image)
      const { width, height } = this.getDimensions()
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      // don't paint a border here, as it is the resulting image
      this.paintImage(canvas.getContext('2d'), this.state.image, 0)
      localImage.value = ''
      this.init()
      return canvas
    }

    const imageChanged = () => {
      return this.changed
    }

    const getCroppingRect = () => {
      const dim = this.getDimensions()
      const frameRect = { x: dim.border, y: dim.border, width: dim.width, height: dim.height }
      const imageRect = this.calculatePosition(this.state.image, dim.border)
      return {
        x: (frameRect.x - imageRect.x) / imageRect.width,
        y: (frameRect.y - imageRect.y) / imageRect.height,
        width: frameRect.width / imageRect.width,
        height: frameRect.height / imageRect.height
      }
    }

    const clicked = (e) => {
      if (this.dragged === true) {
        this.dragged = false
      } else {
        document.getElementById('profileInput').click()
      }
    }

    const fileSelected = (e) => {
      const files = e.target.files || e.dataTransfer.files
      if (!files.length || files[0].type.split('/')[0] !== 'image') {
        this.$emit('file_error')
        return
      }
      this.$emit('file_success')
      const reader = new FileReader()
      this.changed = true
      reader.onload = e => this.loadImage(e.target.result)
      reader.readAsDataURL(files[0])
    }

    // Export your reactive refs and methods so they can be used in the template
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
      init,
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
