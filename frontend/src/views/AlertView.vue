<template>
  <v-snackbar v-model="state" :color="color" :timeout="4000" top right>
    {{ text }}
    <v-btn text @click="close">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
export default {
  name: 'Alert',
  props: {
    data: {
      type: Object,
      default: () => ({
        state: false,
        color: '',
        text: ''
      })
    }
  },
  computed: {
    state() {
      return this.data.state
    },
    color() {
      return this.data.color
    },
    text() {
      return this.data.text
    }
  },
  methods: {
    close() {
      this.data.state = false
    }
  }
}
</script>

<style>
.v-snack__content {
  padding: 0.75rem 1.5rem !important;
}
</style>
