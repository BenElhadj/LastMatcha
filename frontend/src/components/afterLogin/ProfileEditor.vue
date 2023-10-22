<template>
  <div>
    <q-dialog v-model="dialog.value" max-width="450px">
      <q-card class="q-pa-md">
        <div class="row justify-center q-pt-lg">
          <vue-avatar ref="vueavatar" :width="280" :height="280" :border="0" class="mb-3" @vue-avatar-editor:image-ready="onImageReady" @file_error="error.value = true" @file_success="error.value = false"></vue-avatar>
          <vue-avatar-scale ref="vueavatarscale" :width="250" :min="1" :max="3" :step="0.02" @vue-avatar-editor-scale:change-scale="onChangeScale"></vue-avatar-scale>
        </div>
        <q-card-actions align="right">
          <q-btn flat @click="closeEditor">
            Annuler
          </q-btn>
          <q-btn flat :disabled="error.value" @click="saveClicked">
            Enregistrer
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <AlertView v-if="alert.state" :data="alert"></AlertView>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import utility from '@/utility.js'
import AlertView from '@/views/AlertView.vue'
import VueAvatar from '@/components/afterLogin/VueAvatar.vue'
import VueAvatarScale from '@/components/afterLogin/VueAvatarScale.vue'

export default {
  name: 'ProfileEditor',
  components: {
    AlertView,
    VueAvatar,
    VueAvatarScale
  },
  setup () {
    const store = useStore()
    const dialog = ref(false)
    const error = ref(null)
    const alert = ref({
      state: false,
      color: '',
      text: ''
    })
    const user = computed(() => store.state.user)
    const { showAlert } = utility
    const vueavatar = ref(null)
    const vueavatarscale = ref(null)

    const closeEditor = () => {
      dialog.value = false
      vueavatar.value.init()
    }

    const pickFile = () => {
      if (user.value.images.length < 5) {
        dialog.value = true
      } else {
        showAlert('red', 'Le nombre maximum de photos est de cinq, vous devez en supprimer un pour pouvoir en ajouter', this)
      }
    }

    const onChangeScale = (scale) => {
      vueavatar.value.changeScale(scale)
    }

    const saveClicked = () => {
      vueavatar.value.$emit('update-image', vueavatar.value.getImageScaled().toDataURL())
      vueavatarscale.value.reset()
      dialog.value = false
    }

    const onImageReady = (scale) => {
      vueavatarscale.value.setScale(scale)
    }

    return {
      dialog,
      error,
      alert,
      user,
      closeEditor,
      pickFile,
      onChangeScale,
      saveClicked,
      onImageReady,
      vueavatar,
      vueavatarscale
    }
  }
}
</script>
