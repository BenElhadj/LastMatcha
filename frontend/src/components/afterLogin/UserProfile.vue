<template>
  <q-page class="page-container">
    <q-page-container v-if="loading">
      <div>
        <div class="profile__cover">
          <img :src="coverPhoto" alt="Cover Photo" class="cover__img" />
          <div style="margin-top: 10px">
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              @change="onCoverChange"
              style="display: none"
            />
            <q-btn
              label="Changer la cover"
              color="primary"
              @click="() => document.getElementById('cover-upload').click()"
            />
          </div>
        </div>
      </div>

      <div class="avatar">
        <q-avatar slot="offset" class="profile__avatar mx-auto" size="250px">
          <img :src="profileImage" />
          <div style="margin-top: 10px">
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              @change="onProfileChange"
              style="display: none"
            />
            <q-btn
              label="Changer la photo de profil"
              color="primary"
              @click="() => document.getElementById('profile-upload').click()"
            />
          </div>

          <div class="avatar-content">
            <q-chip outline small text-color="black" style="background: white !important">{{
              distance
            }}</q-chip>

            <q-separator style="margin: 3px"></q-separator>
            <q-item-section side>
              <q-tooltip bottom class="status_container">
                <span>{{ lastSeen }}</span>
              </q-tooltip>
              <q-badge
                small
                rounded
                :color="`${lastSeen == 'online' ? 'green' : 'grey-9'}`"
                style="border: 2px solid white !important; border-radius: 100%"
              ></q-badge>
            </q-item-section>
          </div>
        </q-avatar>
      </div>

      <q-separator spacing class="separator-margin"></q-separator>

      <div class="centered-tabs" style="max-width: 800px">
        <q-card>
          <q-tabs
            v-model="activeTab"
            class="bg-grey-2 text-grey q-tabs__content"
            active-color="primary"
            indicator-color="bg-grey-2"
          >
            <div class="row q-flex q-mb-md" style="flex: 1; justify-content: flex-end; width: 100%">
              <q-tab name="tab-profile" label="Profile"></q-tab>
              <q-tab name="tab-photo" label="Photos"></q-tab>
            </div>

            <div class="row q-mb-md" style="flex: 1; width: 100%">
              <q-separator style="margin-left: 50px"></q-separator>

              <q-btn flat @click="matchFunction">
                <img class="icon-size" :src="likeIcon" />
              </q-btn>

              <q-btn flat>
                <img
                  class="icon-size"
                  @click="goToChat"
                  :src="userCanChat ? chatFalse : chatTrue"
                />
              </q-btn>

              <div class="flex" style="center center">
                <q-tooltip top class="status_container">
                  <span>You can block or report</span>
                </q-tooltip>
                <q-fab
                  vertical-actions-align="right"
                  text-color="black"
                  direction="right"
                  icon="mdi-chevron-double-right"
                  active-icon="mdi-window-close"
                  flat
                  square
                  padding="md sm md lg"
                  label-position="left"
                  label="."
                  bg-color="red"
                  class="icon-banir"
                >
                  <q-fab-action
                    flat
                    square
                    external-label
                    color="warning"
                    @click="confirmAlert('Report')"
                    class="icon-report"
                  >
                    <q-tooltip bottom class="status_container">
                      <span>Report</span>
                    </q-tooltip>
                  </q-fab-action>
                  <q-fab-action
                    flat
                    square
                    external-label
                    color="red"
                    @click="confirmAlert('Block')"
                    class="icon-block"
                  >
                    <q-tooltip bottom class="status_container">
                      <span>Block</span>
                    </q-tooltip>
                  </q-fab-action>
                </q-fab>
              </div>
            </div>
          </q-tabs>

          <q-separator spacing class="separator-margin"></q-separator>

          <q-tab-panels v-model="activeTab" animated class="bg-grey-2 text-black">
            <q-tab-panel name="tab-profile">
              <profile-form :user="user" />
            </q-tab-panel>

            <q-tab-panel name="tab-photo">
              <profile-gallery :images="filteredImages" :userToto="user"></profile-gallery>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>

      <q-dialog v-model="dialogVisible" persistent transition-show="rotate" transition-hide="scale">
        <q-card :class="`bg-${confirmDialog.color} text-white`" style="width: 300px; bg-color: red">
          <q-card-section>
            <div class="text-h6">Alert</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            {{ confirmDialog.text }}
          </q-card-section>

          <q-card-actions align="right" class="bg-white text-teal">
            <q-btn flat :label="`${confirmDialog.no}`" color="green" v-close-popup></q-btn>
            <q-btn
              flat
              :label="`${confirmDialog.yes}`"
              color="red"
              @click="confirmDialog.block ? block() : reportUser()"
              v-close-popup
            ></q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <AlertView :alert="alert"></AlertView>
    </q-page-container>
    <LoaderView v-else />
  </q-page>
</template>

<script setup>
const onProfileChange = async (e) => {
  const token = localStorage.getItem('token')
  console.log('Token utilisé pour upload profil:', token)
  const file = e.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('image', file)
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image`
    await axios.post(url, formData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data'
      }
    })
    alert.value = { state: true, color: 'green', text: 'Photo de profil mise à jour !' }
    setTimeout(() => window.location.reload(), 1000)
  } catch (err) {
    alert.value = { state: true, color: 'red', text: 'Erreur upload photo de profil' }
  }
}

const onCoverChange = async (e) => {
  const token = localStorage.getItem('token')
  console.log('Token utilisé pour upload cover:', token)
  const file = e.target.files[0]
  if (!file) return
  const formData = new FormData()
  formData.append('image', file)
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image/cover`
    await axios.post(url, formData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data'
      }
    })
    alert.value = { state: true, color: 'green', text: 'Cover mise à jour !' }
    setTimeout(() => window.location.reload(), 1000)
  } catch (err) {
    alert.value = { state: true, color: 'red', text: 'Erreur upload cover' }
  }
}
onMounted(() => {
  socket.on('user-status-changed', () => {
    updateConnectedUsers()
  })
})

onBeforeUnmount(() => {
  socket.off('user-status-changed')
})
import AlertView from '@/views/AlertView.vue'
import LoaderView from '@/views/LoaderView.vue'
import utility from '@/utility.js'
import ProfileEditor from '@/components/afterLogin/ProfileEditor.vue'
import ProfileTabs from '@/components/afterLogin/ProfileTabs.vue'
import ProfileForm from '@/components/afterLogin/ProfileForm.vue'
import ProfileSettings from '@/components/afterLogin/ProfileSettings.vue'
import ProfileGallery from '@/components/afterLogin/ProfileGallery.vue'
import ProfileHistory from '@/components/afterLogin/ProfileHistory.vue'
import chatTrue from '@/assets/chat/chatUnavailable.png'
import chatFalse from '@/assets/chat/chat.png'
import banir from '@/assets/blocked.png'

import { ref, onMounted, computed, watch, toRefs, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import moment from 'moment'

import io from 'socket.io-client'
const socket = io(`${import.meta.env.VITE_APP_API_URL}`, {
  transports: ['websocket'],
  auth: { token: localStorage.getItem('token') }
})
const calculateDistance = utility.calculateDistance
const getLikeIcon = utility.getLikeIcon
const getFullPath = utility.getFullPath
const getLikeValue = utility.getLikeValue

const store = useStore()
const route = useRoute()
const router = useRouter()
const loading = ref(true)
const fab = ref(false)
const updateTimer = ref(null)
const reportDialog = ref(false)
const dialogVisible = ref(false)
const user = ref({})
const data = ref(null)
const lastSeen = ref('Unavailable')
const activeTab = ref('tab-profile')
const userCanChat = ref(false)

const loggedIn = store.state.loggedIn
const followers = store.state.followers
const convos = store.state.convos
const blockDialog = ref(false)

let likeIcon = ref('')
let likedAlert = ref('')
let lastHistory = ref('')
let allHistory = ref([])
let liked = ref(false)

const profileImage = computed(() => {
  return getFullPath(getProfileImage())
    ? getFullPath(getProfileImage())
    : 'default/defaut_profile.png'
})

const confirmDialog = ref({
  state: false,
  color: '',
  text: '',
  yes: '',
  no: '',
  block: false
})

const alert = ref({
  state: false,
  color: '',
  text: ''
})

const confirmAlert = (action) => {
  if (action === 'Block') {
    dialogVisible.value = true
    confirmDialog.value = {
      state: true,
      color: 'red',
      text: `Are you sure you want to block ${user.username}?`,
      yes: 'Block it',
      no: "Don't block",
      block: true
    }
  } else {
    dialogVisible.value = true
    confirmDialog.value = {
      state: true,
      color: 'warning',
      text: `Are you sure you want to report ${user.username}?`,
      yes: 'Report it',
      no: "Don't report",
      block: false
    }
  }
}

const getHistory = async () => {
  try {
    const token = user.value.token || localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/browse/allhistory`
    const headers = { 'x-auth-token': token }
    const userId = route.params.id
    const typesToFilter = [
      'he_like',
      'you_like',
      'he_like_back',
      'you_like_back',
      'he_unlike',
      'you_unlike'
    ]
    const result = await axios.get(url, { headers })

    if (Array.isArray(result.data)) {
      const filteredByType = result.data.filter((item) => typesToFilter.includes(item.type))
      const filteredByHisId = filteredByType.filter((item) => userId.includes(item.his_id))
      filteredByHisId.sort((a, b) => new Date(a.match_date) - new Date(b.match_date))

      likeIcon.value = getLikeIcon(filteredByHisId[0] ? filteredByHisId[0].type : 'default')
      userCanChat.value = filteredByHisId[0]
        ? filteredByHisId[0].type === 'he_like_back' || filteredByHisId[0].type === 'you_like_back'
        : false
      likedAlert.value = filteredByHisId[0] ? filteredByHisId[0].type.toString() : 'default'
      return filteredByHisId[0] ? filteredByHisId[0].type : 'default'
    } else {
      if (result.data && result.data.msg) {
        alert.value = { state: true, color: 'red', text: result.data.msg }
      }
      if (!getHistory.logged) {
        console.error('getHistory: result.data is not an array', result.data)
        getHistory.logged = true
      }
      likeIcon.value = getLikeIcon('default')
      userCanChat.value = false
      likedAlert.value = 'default'
      return 'default'
    }
  } catch (err) {
    console.error('err history in frontend/ProfileHistory.vue ===> ', err)
  }
}

watch(
  user,
  async (newUser) => {
    const token = newUser.token || localStorage.getItem('token')
    if (token) {
      try {
        const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/isloggedin`
        const headers = { 'x-auth-token': token }
        const res = await axios.get(url, { headers })
        data.value = res.data
        if (!res.data.msg) {
          loading.value = true
          return
        } else {
          loading.value = false
        }
      } catch (err) {
        console.error('err watch user in frontend/MessengerView.vue ===> ', err)
      }
    }
  },
  { immediate: true }
)

const distance = computed(() => {
  const from = store.state.location
  const to = {
    lat: user.value.lat,
    lng: user.value.lng
  }
  const dist = calculateDistance(from, to)
  return `${Math.round(dist)} kms away`
})

const coverPhoto = computed(() => {
  const cover = 'default/defaut_couverture.jpg'
  if (!user.value || !user.value.images) return getFullPath(cover)
  const image = user.value.images.find((cur) => cur.cover)
  return getFullPath(image ? image.name : cover)
})

const filteredImages = computed(() => {
  return user.value.images.filter((cur) => !cur.cover)
})

const userTags = computed(() => {
  const tags = user.value.tags
  if (!tags) return []
  return tags.split(',')
})

const getProfileImage = () => {
  if (!user.value || !user.value.images) return 'default/defaut_profile.png'
  const image = user.value.images.find((cur) => cur.profile === 1)
  return image ? image.name : 'defaut_profile.png'
}

const matchFunction = async () => {
  const url = `${import.meta.env.VITE_APP_API_URL}/api/match`
  const data = {
    id: route.params.id,
    liked: liked
  }
  const token = store.state.user.token || localStorage.getItem('token')
  const headers = { 'x-auth-token': token }

  try {
    liked = !liked
    const res = await axios.post(url, data, { headers })
    if (!res.data.msg) {
      switch (likedAlert.value) {
        case 'default':
        case 'he_unlike':
        case 'you_unlike':
          alert.value = {
            state: true,
            color: 'green',
            text: `Your friendship request has been sent to ${user.value.first_name} ${user.value.last_name} successfully`
          }
          break
        case 'he_like':
          alert.value = {
            state: true,
            color: 'green',
            text: `You just added ${user.value.first_name} ${user.value.last_name} to your friends list`
          }
          break
        case 'he_like':
          alert.value = {
            state: true,
            color: 'green',
            text: `You have just accepted the friend request from ${user.value.first_name} ${user.value.last_name}`
          }
          break
        case 'you_like':
          alert.value = {
            state: true,
            color: 'red',
            text: `You have just canceled your friend request to ${user.value.first_name} ${user.value.last_name}`
          }
          break
        case 'he_like_back':
        case 'you_like_back':
          alert.value = {
            state: true,
            color: 'red',
            text: `You just removed ${user.value.first_name} ${user.value.last_name} from your friend list`
          }
          break
      }
      socket.emit('match', data)
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      alert.value = {
        state: true,
        color: 'red',
        text: "Erreur : la route /api/match n'existe pas sur le serveur. Veuillez contacter l'administrateur."
      }
    } else {
      alert.value = {
        state: true,
        color: 'red',
        text: "Une erreur s'est produite : " + (error.message || 'Erreur inconnue')
      }
    }
    console.error("Une erreur s'est produite :", error)
  }
}

const block = async () => {
  const url = `${import.meta.env.VITE_APP_API_URL}/api/users/block`
  let data = { id: route.params.id }
  const token = user.value.token || localStorage.getItem('token')
  const headers = { 'x-auth-token': token }
  const res = await axios.post(url, data, { headers })
  if (!res.data.msg) {
    alert.value = {
      state: true,
      color: 'green',
      text: `you have blocked ${user.username}, you can no longer access his profile, you will be redirected to the home page`
    }
    data = {
      id_from: store.getters.user.id,
      id_to: route.params.id
    }
    socket.emit('block', data)
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!alert.value.state) {
          clearInterval(interval)
          resolve()
        }
      }, 2000)
    })
    router.push('/')
  } else {
    alert.value = { state: true, color: 'red', text: res.data.msg }
  }
}

const reportUser = async () => {
  const url = `${import.meta.env.VITE_APP_API_URL}/api/users/report`
  const data = { id: route.params.id }
  const token = user.value.token || localStorage.getItem('token')
  const headers = { 'x-auth-token': token }
  const res = await axios.post(url, data, { headers })
  if (!res.data.msg) {
    alert.value = { state: true, color: 'green', text: 'User reported successfuly' }
  } else {
    alert.value = { state: true, color: 'red', text: res.data.msg }
  }
}

const syncConvo = async (convo) => {
  try {
    store.dispatch('syncConvo', convo[0])
    router.push('/chat').catch((err) => {
      console.error('err syncConvo router.push in frontend/NavbarView.view ===> ', err)
    })
  } catch (err) {
    console.error('err syncConvo in frontend/NavbarView.view ===> ', err)
  }
}

const goToChat = async () => {
  if (!userCanChat.value)
    return (alert.value = {
      state: true,
      color: 'red',
      text: `You will need to add ${user.value.first_name} ${user.value.last_name} to your friends list to be able to chat with him`
    })

  const conversation = store.getters.convos.filter((obj) => obj.user_id == route.params.id)

  if (conversation) {
    syncConvo(conversation)
  }
}

const fetchUser = async (id) => {
  if (id && loading.value) {
    if (user.id === id) {
      router.push('/settings')
    } else {
      try {
        const token = user.token || localStorage.getItem('token')
        const headers = { 'x-auth-token': token }
        const url = `${import.meta.env.VITE_APP_API_URL}/api/users/show/${id}`
        const res = await axios.get(url, { headers })
        if (res.data.msg) {
          router.push('/404')
        }
        loading.value = false
        user.value = { ...res.data, rating: Number(res.data.rating) }
        const profileImg = res.data.images.find((cur) => cur.profile === 1)

        const data = {
          date: new Date(),
          id_from: store.state.user.id,
          username: store.state.user.username,
          profile_image: profileImg ? profileImg.name : 'default/defaut_profile.png',
          id_to: id,
          type: 'visit'
        }
        socket.emit('visit', data)
        loading.value = false
      } catch (err) {
        console.error(err)
      }
    }
  }
}

function updateConnectedUsers() {
  if (user.value && route.params.id) {
    utility
      .getConnectedUsers()
      .then((data) => {
        const connectedUserIds = data
        const userId = route.params.id ? route.params.id.toString() : ''
        if (userId && connectedUserIds.includes(userId)) {
          lastSeen.value = 'online'
        } else {
          lastSeen.value = user.value.status
            ? moment(user.value.status).utc().fromNow()
            : 'Unavailable'
        }
      })
      .catch((error) => {
        console.error('Erreur lors de la récupération des données :', error)
      })

    getHistory()
  }
}

onMounted(() => {
  const fetchUserPromise = new Promise((resolve) => {
    fetchUser(route.params.id).then(() => {
      resolve()
    })
  })

  liked.value = getLikeValue(lastHistory) ? true : false
  if (isNaN(route.params.id) || !route.params.id) router.push('/404')

  if (user.value && route.params.id) {
    fetchUser(route.params.id)
  }
})

function refreshMethods() {
  updateConnectedUsers()
}

const refreshInterval = setInterval(refreshMethods, 1000)

onBeforeUnmount(() => {
  clearInterval(refreshInterval)
})
</script>

<style scoped>
.icon-banir {
  background-image: url('@/assets/Block/banir.png');
  background-size: 40px !important;
  background-position: center bottom;
  background-repeat: no-repeat;
}
.icon-block {
  background-image: url('@/assets/Block/block.png');
  background-size: 25px;
  background-repeat: no-repeat;
}
.icon-report {
  background-image: url('@/assets/Block/report.png');
  background-size: 25px;
  background-repeat: no-repeat;
}
.icon-size {
  width: 42px;
}
.q-tabs__content {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
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
  background: rgba(211, 211, 211, 0.3);
}
.centered-tabs {
  max-width: 800px;
  margin: 0 auto;
}
.avatar-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
