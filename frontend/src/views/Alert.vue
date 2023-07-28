<template>
  <q-banner v-if="message">
    <div>
      <q-icon
        :name="icon"
        class="q-mr-sm"
      />
      <div>{{ message }}</div>
    </div>
    <q-btn
      flat
      label="Close"
      @click="close"
    />
  </q-banner>
</template>

<script>
import { ref } from 'vue'

export default {
  // name: 'AlertView',
  props: {
    value: {
      type: Boolean,
      required: true
    },
    message: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: 'primary'
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const icon = ref('info')
    if (props.color === 'negative') {
      icon.value = 'error'
    } else if (props.color === 'warning') {
      icon.value = 'warning'
    }

    const close = () => {
      emit('update:modelValue', false)
    }

    return { close, icon }
  }
}
</script>

<style scoped>
</style>
