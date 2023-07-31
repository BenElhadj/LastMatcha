<template>
  <q-banner v-if="data.state" class="q-ma-md" :color="data.color">
    {{ data.text }}
    <template v-slot:action>
      <q-btn flat round dense icon="close" @click="data.state = false" />
    </template>
  </q-banner>
</template>

<script>
export default {
  name: 'AlertView',
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          state: false,
          color: '',
          text: ''
        };
      }
    }
  }
};
</script>

<style>
.v-snack__content {
padding: .75rem 1.5rem !important;
}
/* Vous pouvez ajuster le style ici si nécessaire */
</style>
