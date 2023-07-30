<template>
  <q-banner v-if="message.state">
    <div>
      <q-icon
        :name="icon"
        class="q-mr-sm"
      />
      <div>{{ message.text }}</div>
    </div>
    <q-btn
      flat
      label="Close"
      @click="close"
    />
  </q-banner>
</template>

<script >
export default {
  props: ['message']
}
</script>
<style scoped>
</style>
