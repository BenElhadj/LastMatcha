<template>
  <div>
    <q-dialog v-model="alert.state" persistent transition-show="flip-down" transition-hide="flip-up">
      <q-card :class="`bg-${alert.color} text-white`" style="width: 300px">
        <q-card-section>
          <div class="text-h6">Alert</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          {{ alert.text }}
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="OK" @click="alert.state = false"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const { alert } = defineProps(['alert'])

</script>