<template>
  <q-layout v-if="loaded" view="hHh LpR lff" class="settings">
    <div>{{ user }}</div>
    <div class="parallax" :style="`background-image: url(${coverPhoto});`">
    </div>
    <q-btn class="cover__btn"
      color="blue"
      round
      dense
      icon="mdi-image"
      flat
      @click.stop="pickFile"
    >
      <q-tooltip
        anchor="bottom middle"
        self="top middle"
      >
        Change cover photo
      </q-tooltip>
    </q-btn>
    <input
      ref="imageRef"
      type="file"
      style="display: none"
      accept="image/*"
      @change="onFilePicked"
    >
    <div class="q-py-sm strap grey-3">
      <q-card class="q-py-sm">
        <q-card-section>
          <div class="row items-center">
            <div class="col-12 col-sm-8 col-md-4">
              <div class="avatar">
                <q-avatar
                  class="mx-auto d-block"
                  size="200px"
                >
                  <img
                    :src="profileImage"
                    class="avatar__img"
                  >
                  <q-btn
                    class="avatar__btn"
                    color="grey-5"
                    round
                    dense
                    icon="mdi-image"
                    flat
                    @click.stop="openEditor"
                  ></q-btn>
                </q-avatar>
              </div>
            </div>
            <profile-tabs
              settings
              :active="activeTab"
              @change-tab="changeTab"
            ></profile-tabs>
          </div>
        </q-card-section>
      </q-card>
    </div>
    <q-card
      class="profile"
      style="height: calc(100vh - 60px);"
    >
      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-12 col-sm-8 col-md-4">
            <profile-badge
              :user="user"
              settings
            ></profile-badge>
          </div>
          <div class="col-12 col-sm-10 col-md-8 main grey--text">
            <profile-tabs
              settings
              :active="activeTab"
              mobile
              @change-tab="changeTab"
            ></profile-tabs>
            <q-tab-panels
              v-model="activeTab"
              animated
            >
              <q-tab-panel name="tab-profile">
                <profile-form
                  ref="form"
                  :user="user"
                  @sync-user="syncUser"
                  @update-user="updateUser"
                ></profile-form>
              </q-tab-panel>
              <q-tab-panel name="tab-photo">
                <profile-gallery :images="filteredImages"></profile-gallery>
              </q-tab-panel>
              <q-tab-panel name="tab-history">
                <profile-history></profile-history>
              </q-tab-panel>
              <q-tab-panel name="tab-setting">
                <profile-settings></profile-settings>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </q-card-section>
    </q-card>
    <alert :data="alert"></alert>
    <profile-editor
      ref="profileEditor"
      @file_error="error = true"
      @file_succes="error = false"
      @update-image="updateImage"
    ></profile-editor>
  </q-layout>
  <loader v-else />
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Alert from '@/views/AlertView.vue'
import loader from '@/views/LoaderView.vue'
import utility from '@/utility.js'
import ProfileEditor from '@/components/afterLogin/ProfileEditor.vue'
import ProfileBadge from '@/components/afterLogin/ProfileBadge.vue'
import ProfileTabs from '@/components/afterLogin/ProfileTabs.vue'
import ProfileForm from '@/components/afterLogin/ProfileForm.vue'
import ProfileSettings from '@/components/afterLogin/ProfileSettings.vue'
import ProfileGallery from '@/components/afterLogin/ProfileGallery.vue'
import ProfileHistory from '@/components/afterLogin/ProfileHistory.vue'

export default {
  name: 'SettingsView',
  components: {
    Alert,
    loader,
    ProfileTabs,
    ProfileForm,
    ProfileBadge,
    ProfileHistory,
    ProfileEditor,
    ProfileGallery,
    ProfileSettings
  },
  setup () {
    const store = useStore()
    const router = useRouter()
    const profileEditor = ref(null)
    const user = computed(() => store.state.user)
    const status = computed(() => store.state.status)
    const coverPhoto = computed(() => store.state.coverPhoto)
    const profileImage = computed(() => store.state.profileImage)
    const error = ref(null)
    const formRef = ref(null)
    const loaded = ref(false)
    const activeTab = ref('tab-profile')
    const imageRef = ref(null)
    const alert = ref({
      state: false,
      color: '',
      text: ''
    })
    const filteredImages = computed(() => {
      if (!user.value.images) return []
      return user.value.images.filter(cur => !cur.cover)
    })

    watch(user, async (newValue, oldValue) => {
      const token = user.value.token || localStorage.getItem('token')
      if (token) {
        try {
          const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/isloggedin`
          const headers = { 'x-auth-token': token }
          const res = await axios.get(url, { headers })
          console.log('res ===========> ', res)
          if (!res.data.msg) {
            loaded.value = true
            return
          }
        } catch (err) {
          console.error('Setting.js watch.user error ===> ', err)
        }
      }
      store.dispatch('logout', newValue.id)
      router.push('/login')
    }, { immediate: true })

    onMounted(() => {
      if (user.value.id) {
        store.dispatch('syncHistory', user.value.id)
        store.dispatch('syncMatches', user.value.id)
      }
    })

    const updateUser = async () => {
      try {
        let msg
        const url = `${import.meta.env.VITE_APP_API_URL}/api/users/updateprofile`
        const headers = { 'x-auth-token': user.value.token }
        const res = await axios.post(url, user.value, { headers })
        if (res && res.data && !res.data.msg) {
          msg = 'Your account has been updated successfuly'
          utility.showAlert('green', msg, this)
          store.dispatch('updateUser', user.value)
          formRef.value.toggleEdit()
        } else {
          msg = res.data.msg ? res.data.msg : 'Ouups something went wrong!'
          utility.showAlert('red', msg, this)
        }
      } catch (err) {
        console.error('Setting.js updateUser error ===> ', err)
      }
    }

    const updateImage = async (data) => {
      if (!error.value) {
        try {
          let msg
          const fd = new FormData()
          fd.append('image', data)
          const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image`
          const headers = { 'x-auth-token': user.value.token }
          const res = await axios.post(url, fd, { headers })
          if (res && res.data && !res.data.msg) {
            msg = 'You profile image has been updated successfully'
            store.commit('updateProfileImage', res.data)
          } else {
            msg = 'Something went wrong!'
          }
          alert.value = {
            state: true,
            color: res && res.data && !res.data.msg ? 'success' : 'error',
            text: msg
          }
        } catch (err) {
          console.error('Setting.js updateImage error ===> ', err)
        }
      }
    }

    const syncUser = (updatedUser) => {
      store.commit('updateUser', updatedUser)
    }

    const changeTab = (tab) => {
      activeTab.value = tab
    }

    const openEditor = () => {
      profileEditor.value.pickFile()
    }

    const pickFile = () => {
      imageRef.value.click()
    }

    const onFilePicked = async (e) => {
      const files = e.target.files
      if (files[0]) {
        const imageFile = files[0]
        const imageName = imageFile.name
        if (imageName.lastIndexOf('.') <= 0) return
        if (imageFile.size > 1024 * 1024) {
          alert.value = {
            state: true,
            color: 'red',
            text: 'Image is too large..'
          }
        } else {
          try {
            let msg
            const fd = new FormData()
            fd.append('image', imageFile)
            const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image/cover`
            const headers = { 'x-auth-token': user.value.token }
            const res = await axios.post(url, fd, { headers })
            if (res && res.body && !res.body.msg) {
              msg = 'You cover image has been updated successfully'
              alert.value = {
                state: true,
                color: 'success',
                text: msg
              }
              store.commit('updateCoverImage', res.body)
            } else {
              msg = res.body.msg ? res.body.msg : 'Oops something went wrong!'
              alert.value = {
                state: true,
                color: 'red',
                text: msg
              }
            }
          } catch (err) {
            console.error('Setting.js onFilePicked error ===> ', err)
          }
        }
      }
    }

    return {
      error,
      loaded,
      activeTab,
      alert,
      user,
      status,
      coverPhoto,
      profileImage,
      filteredImages,
      updateUser,
      updateImage,
      syncUser,
      changeTab,
      openEditor,
      pickFile,
      onFilePicked
    }
  }
}
</script>

<style scoped>
.container {
    width: 100%;
    padding: 4em;
}
</style>
