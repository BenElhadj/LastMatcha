<template>
  <q-page>
    <q-page-container>
      <h1  class="q-pb-md" style="margin-top: -10px; text-align: center;">Gallery</h1>
      <div class="row q-gutter-md mt-4">
        <div v-for="image in images" :key="image.id" class="col-xs-12 col-sm-6 col-md-4 img_container">
          <q-btn v-if="user.id == image.user_id" icon="mdi-delete-forever" size="lg" color="negative" round flat class="del_img" @click="deleteImg(image)">
          </q-btn>
          <img :src="profileImage(image.name)" class="image full-width">
        </div>
      </div>
      <AlertView :alert="alert"/>
    </q-page-container>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import utility from '@/utility.js';
import AlertView from '@/views/AlertView.vue';
import axios from 'axios';

const props = defineProps({
  images: Array
})
const store = useStore()
const getFullPath = utility.getFullPath
const user = computed(() => store.state.user)
const alert = ref({
  state: false,
  color: '',
  text: ''
})

const profileImage = (image) => getFullPath(image)

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
      alert
    } else {
      alert.value = { state: true, color: 'red', text: 'Oups.. something went wrong' }
    }
  } catch (err) {
    console.error('err deleteImg in frontend/ProfileGallery.vue ===> ', err)
  }
}
</script>

<style scoped>
.img_container {
  position: relative;
}

.del_img,
.del_img:hover {
  position: absolute !important;
  top: 0;
  right: 0;
  transform: translate(25%, -25%) scale(.8);
}
</style>
