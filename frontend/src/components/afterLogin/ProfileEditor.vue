<template>
  <div>
    <q-dialog v-model="dialog" maximized persistent>
      <q-card class="q-pa-md">
        <q-card-section class="q-pt-5">
          <q-avatar
            :width="280"
            :height="280"
            :border="0"
            @file_error="error = true"
            @file_success="error = false"
            class="q-mb-md"
          ></q-avatar>
          <q-avatar
            :width="250"
            :min="1"
            :max="3"
            :step="0.02"
          ></q-avatar>
        </q-card-section>
        <q-card-actions>
          <q-btn text color="primary" @click="closeEditor">Annuler</q-btn>
          <q-btn text color="primary" @click="saveClicked" :disable="error">Enregistrer</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <AlertView :alert="alert"></AlertView>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { mapGetters } from 'vuex';
import axios from 'axios';
import AlertView from '@/views/AlertView.vue'

const error = ref(null);
const dialog = ref(false);
const alert = ref({
  state: false,
  color: '',
  text: '',
});
const { user } = useStore();

const closeEditor = () => {
  dialog.value = false;
  $refs.vueavatar.init();
};

const pickFile = () => {
  if (user.images.length < 5) {
    dialog.value = true;
  } else {
    alert.value = { state: true, color: 'red', text: 'The maximum number of photos is five, you must delete one to be able to add another' }
  }
};

const onChangeScale = (scale) => {
  $refs.vueavatar.changeScale(scale);
};

const saveClicked = () => {
  $emit('update-image', $refs.vueavatar.getImageScaled().toDataURL());
  $refs.vueavatarscale.reset();
  dialog.value = false;
};

const onImageReady = (scale) => {
  $refs.vueavatarscale.setScale(scale);
};

</script>
