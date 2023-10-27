<template>
  <q-page class="page-container">
    <q-page-container v-if="loaded">

      <div>
        <div class="profile__cover">
          <img :src="coverPhoto" alt="Cover Photo" class="cover__img">
        </div>
        <q-btn @click="openEditor" fab small outlined flat round lighten-3 class="update__img" style="top:85px;">
          <q-icon name="mdi-image"></q-icon>

          <q-tooltip left>
            <span>Changer votre photo de couverture</span>
          </q-tooltip>
        </q-btn>
      </div>

      <div class="avatar">
        <q-avatar slot="offset" class="profile__avatar mx-auto" size="250px">
          <img :src="profileImage">
        </q-avatar>

        <!-- <q-file
            @click="openEditor" fab small outlined flat round lighten-3 class="update__img" style="top:470px;left:190px;" accept=".jpg, image/*"
            v-model="filesImages"
          >
          <q-icon name="mdi-image"></q-icon>
          </q-file> -->

        <q-btn @click="openEditor" fab small outlined flat round lighten-3 class="update__img" style="top:470px;left:190px;">
          <q-icon name="mdi-image"></q-icon>
          <q-tooltip left>
            <span>Changer votre photo de profil</span>
          </q-tooltip>
        </q-btn>
      </div>

      <q-separator spacing class="separator-margin"></q-separator>
      <div class=" centered-tabs" style="max-width: 800px;">  
        <q-card>

          <q-tabs v-model="activeTab" class="bg-grey-2 text-grey q-tabs__content" active-color="primary" indicator-color="bg-grey-2">
            <q-tab name="tab-profile" label="Profile"></q-tab>
            <q-tab  name="tab-photo" label="Photos"></q-tab>
            <q-tab  name="tab-history" label="History"></q-tab>
            <q-tab name="tab-setting" label="Setting"></q-tab>
          </q-tabs>

          <q-separator spacing class="separator-margin"></q-separator>

          <q-tab-panels v-model="activeTab" animated class="bg-grey-2 text-black">
            <q-tab-panel name="tab-profile">
              <profile-form ref="form" :user="user" @sync-user="syncUser" @update-user="updateUser"></profile-form>
            </q-tab-panel>

            <q-tab-panel  name="tab-photo">
              <profile-gallery :images="filteredImages"></profile-gallery>
            </q-tab-panel>

            <q-tab-panel  name="tab-history">
              <profile-history></profile-history>
            </q-tab-panel>

            <q-tab-panel name="tab-setting">
              <profile-settings></profile-settings>
            </q-tab-panel>
          </q-tab-panels>

        </q-card>
      </div>

      <AlertView :alert="alert"></AlertView>
      <!-- <profile-editor @file_error="error = true" @file_succes="error = false" @update-image="updateImage" ref="profile_editor"></profile-editor> -->
    </q-page-container>
    <LoaderView v-else />
  </q-page>
</template>

<script setup>
import AlertView from '@/views/AlertView.vue'
import LoaderView from '@/views/LoaderView.vue'
import utility from '@/utility.js'
import ProfileEditor from '@/components/afterLogin/ProfileEditor.vue'
import ProfileBadge from '@/components/afterLogin/ProfileBadge.vue'
import ProfileTabs from '@/components/afterLogin/ProfileTabs.vue'
import ProfileForm from '@/components/afterLogin/ProfileForm.vue'
import ProfileSettings from '@/components/afterLogin/ProfileSettings.vue'
import ProfileGallery from '@/components/afterLogin/ProfileGallery.vue'
import ProfileHistory from '@/components/afterLogin/ProfileHistory.vue'


import axios from 'axios'
import { useStore } from 'vuex'
import { ref, computed, onMounted, watch } from 'vue'

const store = useStore()
const user = ref(store.getters.user)
const error = ref(null)
const loaded = ref(false)
const activeTab = ref('tab-profile')
const coverPhoto = ref(store.getters.coverPhoto)
const profileImage = ref(store.getters.profileImage)
const alert = ref({
  state: false,
  color: '',
  text: ''
})

// const ProfileEditor = ref(null)
const props = defineProps({
  pickFile: Function,
  ProfileEditor: Object,
})

const filesImages = ref([])

const onRejected = (rejectedEntries)  => {
  // Notify plugin needs to be installed
  // https://quasar.dev/quasar-plugins/notify#Installation
  notify({
    type: 'negative',
    message: `${rejectedEntries.length} file(s) did not pass validation constraints`
  })
}


const changeTab = (tab) => {
  activeTab.value = tab
}



const openEditor = () => {
  console.log('openEditor', ProfileEditor.profile_editor)
  ProfileEditor.profile_editor.pickFile()
}

const pickFile = () => {
  console.log('pickFile', ProfileEditor.image.value)
  
  filesImages.value = []
  ProfileEditor.image.value = null
  ProfileEditor.image.value.click()
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
}

watch(user, (newValue) => {
  if (newValue.id) {
    syncHistory(newValue.id)
    syncMatches(newValue.id)
  }
})

const filteredImages = computed(() => {
  if (!user.value.images) return []
  return user.value.images.filter(cur => !cur.cover)
})


const updateUser = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/updateprofile`
    const headers = { 'x-auth-token': user.token }
    const res = await axios.post(url, user.value, { headers })

    if (res && res.data && !res.data.msg) {
      console.log('Alert, green, Your account has been updated successfully')
      alert.value = { state: true, color: 'green', text: 'Your account has been updated successfully'}
      store.dispatch('updateUser', user.value)
      ProfileEditor.form.toggleEdit()
    } else {
      console.log('Alert, red, Oops... something went wrong!')
      alert.value = { state: true, color: 'red', text: res.data.msg ? res.data.msg : 'Oops... something went wrong!'}
    }
  } catch (err) {
    console.error('err updateUser in frontend/SettingsView.vue ===> ', err)
  }
}



const updateImage = async (data) => {
  if (!error.value) {
    try {
      const fd = new FormData()
      fd.append('image', data)
      const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image`
      const headers = { 'x-auth-token': user.token }
      const res = await axios.post(url, fd, { headers })
      if (res && res.data && !res.data.msg) {
        console.log('Alert, green, Your profile image has been updated successfully')
        alert.value = { state: true, color: 'green', text: 'Your profile image has been updated successfully'}
        store.commit('updateProfileImage', res.data)
      } else {
        console.log('Alert, red, Something went wrong!')
        alert.value = { state: true, color: 'red', text: 'Something went wrong!'}
      }
    } catch (err) {
      console.error('err updateImage in frontend/SettingsView.vue ===> ', err)
    }
  }
}

onMounted(async () => {
  const token = user.token || localStorage.getItem('token')
  if (token) {
    try {
      
     // store.dispatch('syncHistory', user.id)
      //store.commit('syncMatches', user.id)
      // syncMatches(user.id)
      const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/isloggedin`
      const headers = { 'x-auth-token': token }
      const res = await axios.get(url, { headers })
      if (!res.data.msg) {
        loaded.value = true
        return
      }
    } catch (err) {
      console.log('Got error here --> ', err)
    }
  }
  // logout(user.value.id) // Remplacez cette ligne par votre propre logique de déconnexion
 // router.push('/login')
})

const syncUser = (updatedUser) => {
  store.commit('updateUser', updatedUser)
}

const onFilePicked = async (e) => {
  const files = e.target.files
  if (files[0]) {
    const imageFile = files[0]
    const imageName = imageFile.name
    if (imageName.lastIndexOf('.') <= 0) {
      alert.value = { state: true, color: 'red', text: 'The selected file is not an image!' }
    } else if (imageFile.size > 1024 * 1024) {
      alert.value = { state: true, color: 'red', text: 'Image is too large..' }
    } else {
      try {
        let msg
        const fd = new FormData()
        fd.append('image', imageFile)
        const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image/cover`
        const headers = { 'x-auth-token': user.token }
        const res = await axios.post(url, fd, { headers })
        if (res && !res.data.msg && !res.data.msg) {
          alert.value = { state: true, color: 'green', text: 'Your cover image has been updated successfully' }
          store.commit('updateCoverImage', res.data)
        } else {
          alert.value = { state: true, color: 'red', text: res.data.msg ? res.data.msg : 'Oops, something went wrong!' }
        }
      } catch (err) {
        console.error('err onFilePicked in frontend/SettingsView.vue ===> ', err)
      }
    }
  }
}
</script>

<style scoped>
.q-tabs__content {
  align: "justify";
  align-items: "justify-center";
  justify-content: "justify-center";
  padding: 0;
}
.separator-margin {
  margin-left: -2000px;
  margin-right: -2000px;
  z-index: 1;
}
.page-container {
  font-family: 'Elliane' !important;
  color: black;
  margin-top: -87px !important;
  margin-bottom: 0px !important;
}
.container {
  width: 100%;
}
.profile__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2em;
}
.profile__cover {
  width: 100%;
  height: 450px;
  top: 0;
  margin-top: 0;
  overflow: hidden;
  position: relative;
}
.cover__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-repeat: no-repeat;
}
.profile__avatar {
  position: absolute;
  size: 170px;
  top: 470px;
  left: 3%;
  z-index: 7;
}
.update__img {
  z-index: 10;
  color: black;
  position: absolute;
  transform: translate(50%, 50%) scale(1);
  background: rgba(211, 211, 211, 0.3); /* Arrière-plan gris clair */
}
.centered-tabs {
  max-width: 800px; /* Largeur personnalisée */
  margin: 0 auto; /* Centrage horizontal */
}
</style>
