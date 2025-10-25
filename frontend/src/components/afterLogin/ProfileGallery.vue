<template>
  <q-page>
    <q-page-container>
      <!-- Bouton d'upload positionné en haut à droite, au-dessus de tout -->
      <div class="upload-btn-container">
        <input
          type="file"
          id="photo-upload"
          ref="photoInputRef"
          accept="image/*"
          @change="onPhotoChange"
          style="display: none"
        />
        <q-btn round color="primary" icon="mdi-camera-plus" @click="onUploadClick" />
      </div>
      <h1 class="q-pb-md" style="margin-top: -10px; text-align: center">Gallery</h1>
      <h3 style="margin-top: -70px; margin-bottom: 100px; text-align: center">
        {{ username }}
      </h3>
      <div class="row q-gutter-md mt-4">
        <div
          v-for="image in props.images"
          :key="image.id"
          class="col-xs-12 col-sm-6 col-md-4 img_container"
        >
          <q-btn
            v-if="user.id == image.user_id"
            icon="mdi-delete-forever"
            size="lg"
            color="negative"
            round
            flat
            class="del_img"
            @click="deleteImg(image)"
          >
          </q-btn>
          <img :src="profileImage(image.name)" class="image full-width" />
        </div>
      </div>
      <AlertView :alert="alert" />
    </q-page-container>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import utility from '@/utility.js'
import AlertView from '@/views/AlertView.vue'
import axios from 'axios'

const store = useStore()
const props = defineProps({ images: Array, userToto: Object })
const getFullPath = utility.getFullPath
const user = computed(() => store.getters.user)
const alert = ref({ state: false, color: '', text: '' })
const profileImage = (image) => getFullPath(image)
const username = ref('')
const photoInputRef = ref(null)
if (props.userToto?.username ?? false) {
  username.value = props.userToto.username
} else {
  username.value = user.value.username
}

// Par défaut, upload galerie
const onPhotoChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('image', file)
  const token = user.value.token || localStorage.getItem('token')
  // Utiliser la bonne route backend pour galerie
  const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image`
  try {
    await axios.post(url, formData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data'
      }
    })
    alert.value = { state: true, color: 'green', text: 'Photo upload réussie !' }
    await store.dispatch('fetchUserImages')
  } catch (err) {
    alert.value = { state: true, color: 'red', text: 'Erreur upload photo' }
  }
}

const onUploadClick = () => {
  if (photoInputRef.value) photoInputRef.value.click()
}

const deleteImg = async (image) => {
  try {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image/del`
    const headers = { 'x-auth-token': user.value.token }
    const data = {
      id: image.id,
      profile: image.profile
    }
    const res = await axios.post(url, data, { headers })
    if (res.data.ok) {
      await store.dispatch('delImg', image.id)
      alert.value = { state: true, color: 'green', text: 'Photo has been removed' }
    } else {
      alert.value = { state: true, color: 'red', text: 'Oups.. something went wrong' }
    }
  } catch (err) {
    console.error('err deleteImg in frontend/ProfileGallery.vue ===> ', err)
  }
}
</script>

<style scoped>
.upload-btn-container {
  position: absolute;
  top: 16px;
  right: 32px;
  z-index: 10;
}
.img_container {
  position: relative;
}
.del_img,
.del_img:hover {
  position: absolute !important;
  top: 0;
  right: 0;
  transform: translate(25%, -25%) scale(0.8);
}
</style>
