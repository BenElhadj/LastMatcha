<template>
  <q-header class="black-text">
    <q-toolbar>
      <div v-if="connected" @click="drawer = true">
        <q-item>
          <q-btn flat round dense>
            <q-avatar size="60px">
              <q-img :src="image" alt="Photo de profil" />
            </q-avatar>
          </q-btn>
          <q-toolbar-title>
            <q-item-label>{{ user.username }}</q-item-label>
          </q-toolbar-title>
        </q-item>
      </div>

      <div v-else>
        <q-toolbar-title>
          <span>MATCHA </span>
        </q-toolbar-title>
      </div>

      <q-space></q-space>

      <div v-if="connected" justify-end class="search-notif-msg">
        <div>
          <q-btn ripple flat round dense class="icon-size">
            <img
              src="@/assets/Navbar/notification.png"
              :nudge-width="250"
              alt="notifMenu"
              class="icon-size"
            />
            <q-badge v-if="notifNum" :value="!!notifNum" color="primary" floating>
              <span>{{ notifNum }}</span>
            </q-badge>
          </q-btn>
          <q-menu
            v-model="notifMenu"
            style="font-family: 'Elliane' !important; font-size: 16px !important"
          >
            <q-list padding class="notif-msg">
              <q-item
                v-for="(item, i) in notifs"
                :key="i"
                clickable
                @click="toUserProfile(item.id_from)"
                style="align-items: initial !important"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="getFullPath(item.profile_image)" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="notif_msg">
                    <strong class="notif_username" style="font-size: 16px !important">{{
                      item.username
                    }}</strong
                    >&nbsp;
                    <span class="ml-auto chat_time" style="font-size: 16px !important">{{
                      getNotifMsg(item)
                    }}</span>
                  </q-item-label>
                  <q-item-label>
                    <q-icon small style="font-size: 16px !important" class="mr-2 q-ml-xl">
                      <span :class="getNotifIcon(item.type)"></span>&nbsp;
                    </q-icon>
                    &nbsp;<span class="ml-auto chat_time" style="font-size: 16px !important">{{
                      formatNotifDate(item.last_update)
                    }}</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item class="flex justify-center" clickable @click="$router.push('/notifications')">
                <q-item-label class="see_all" style="font-size: 24px !important">
                  Show all notifications
                </q-item-label>
              </q-item>
            </q-list>
          </q-menu>
        </div>

        <div>
          <q-btn ripple flat round dense class="icon-size">
            <img
              src="@/assets/Navbar/chat.png"
              :nudge-width="250"
              alt="Messages"
              class="icon-size"
            />
            <q-badge v-if="newMsgNum" :value="!!newMsgNum" color="primary" floating>
              <span>{{ newMsgNum }}</span>
            </q-badge>
          </q-btn>
          <q-menu
            v-model="msgMenu"
            style="font-family: 'Elliane' !important; font-size: 16px !important"
          >
            <q-list padding class="notif-msg">
              <q-item
                v-for="(item, i) in menuConvos"
                :key="i"
                clickable
                @click="toUserChat(item)"
                style="align-items: initial !important"
              >
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="getFullPath(item.profile_image)" />
                  </q-avatar>
                </q-item-section>
                <div>
                  <q-badge small :color="item.is_read == 0 ? 'blue' : 'grey'" />
                </div>
                <q-item-section>
                  <q-item-label class="notif_msg">
                    <strong class="notif_username" style="font-size: 16px !important"
                      >{{ item.first_name }} {{ item.last_name }}</strong
                    >&nbsp;
                    <span class="ml-auto chat_time" style="font-size: 16px !important">{{
                      formatNotifDate(item.last_update)
                    }}</span>
                  </q-item-label>
                  <q-item-label>
                    <span
                      v-if="item.message_from === user.id"
                      class="notif_username"
                      style="font-size: 16px !important"
                      >You:
                    </span>
                    <span
                      class="ml-auto chat_time text-truncate"
                      style="font-size: 16px !important"
                      >{{ item.message }}</span
                    >
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item class="justify-center" clickable @click="$router.push('/chat')">
                <q-item-label class="see_all" style="font-size: 24px !important">
                  Show all discussions
                </q-item-label>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </div>

      <div v-else>
        <span class="text-link q-ml-xl" @click="$router.push('/login')">Connection</span>
        <span class="text-link q-ml-xl" @click="$router.push('/register')">Registration</span>
      </div>
    </q-toolbar>

    <q-drawer v-if="connected" v-model="drawer" overlay>
      <div class="drawer-bg"></div>
      <q-list padding>
        <div @click="drawer = !drawer">
          <q-item>
            <q-btn flat round dense>
              <q-avatar size="60px">
                <q-img :src="image" alt="Photo de profil" />
              </q-avatar>
            </q-btn>
            <q-item-section>
              <q-item-label>{{ user.username }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <q-separator></q-separator>
        <div v-for="link in links" :key="link.text">
          <q-item v-if="link.public || connected" clickable @click="$router.push(link.route)">
            <img :src="link.image" alt="Icon" class="icon-size" />
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <q-item clickable @click="logout">
          <img src="@/assets/Navbar/deconnexion.png" alt="Déconnexion" class="icon-size" />
          <q-item-section>
            <q-item-label>Sign out</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>
  </q-header>
</template>

<script setup>
import utility from '@/utility.js'
import { ref, onMounted, onUnmounted, onBeforeUnmount, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axios from 'axios'

import acceilImage from '@/assets/Navbar/acceil.png'
import decouvrirImage from '@/assets/Navbar/decouvrir.png'
import chatImage from '@/assets/Navbar/chat.png'
import notificationImage from '@/assets/Navbar/notification.png'
import parametreImage from '@/assets/Navbar/parametre.png'

const store = useStore()
const router = useRouter()
const searchText = ref('')
const drawer = ref(false)
const image = computed(() => store.getters.profileImage)
const links = [
  {
    text: 'Homepage',
    route: '/',
    public: true,
    image: acceilImage
  },
  {
    text: 'Discover',
    route: '/discover',
    public: false,
    image: decouvrirImage
  },
  {
    text: 'Chat',
    route: '/chat',
    public: false,
    image: chatImage
  },
  {
    text: 'Notifications',
    route: '/notifications',
    public: false,
    image: notificationImage
  },
  {
    text: 'Settings',
    route: '/settings',
    public: false,
    image: parametreImage
  }
]
let notifMenu = ref(false)
let msgMenu = ref(false)
let notifNum = ref(0)
let newMsgNum = ref(0)
const user = computed(() => store.getters.user)
const connected = computed(() => store.getters.status || localStorage.getItem('token'))
const profileImage = computed(() => store.getters.profileImage)

let notif = ref([])
notif.value = store.getters.notif
let convos = ref([])
convos.value = store.getters.convos
let notifs = ref([])
notifs.value = notif.value
  .sort((a, b) => {
    if (a.is_read !== b.is_read) {
      return a.is_read - b.is_read
    }
    return new Date(b.date) - new Date(a.date)
  })
  .slice(0, 5)

let menuConvos = ref([])
let newMessage = ref([])

const getFullPath = utility.getFullPath
const getNotifMsg = utility.getNotifMsg
const getNotifIcon = utility.getNotifIcon
const formatNotifDate = utility.formatTime
const updateOneNotif = utility.updateOneNotif

const toUserProfile = (id_from) => {
  try {
    updateOneNotif(id_from, user.value.id)
    router.push(`/user/${id_from}`)
  } catch (err) {
    console.error('err toUserProfile in frontend/NavbarView.view ===> ', err)
  }
}

const toUserChat = (convo) => {
  try {
    syncConvo(convo)
  } catch (err) {
    console.error('err toUserChat in frontend/NavbarView.view ===> ', err)
  }
}

const handleClickOutside = (e) => {
  const drawerElement = document.querySelector('.q-drawer')
  if (drawerElement && drawer.value && !drawerElement.contains(e.target)) {
    drawer.value = false
  }
}

onMounted(() => {
  document.body.addEventListener('click', handleClickOutside, true)
})

onUnmounted(() => {
  document.body.removeEventListener('click', handleClickOutside, true)
})

onMounted(async () => {
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/isloggedin`
    const headers = { 'x-auth-token': token }
    const res = await axios.get(url, { headers })
    if (!res.data.msg) {
      const user = res.data
      if (user.birthdate) {
        user.birthdate = new Date(user.birthdate).toISOString().substr(0, 10)
      }
      store.dispatch('login', user)
      updateNotifAndMsg()
    }
  } catch (err) {
    console.error('err async onMounted in frontend/NavbarView.view ===> ', err)
  }
})

const syncConvo = async (convo) => {
  try {
    store.dispatch('syncConvo', convo)
    router.push('/chat').catch((err) => {
      console.error('err syncConvo router.push in frontend/NavbarView.view ===> ', err)
    })
  } catch (err) {
    console.error('err syncConvo in frontend/NavbarView.view ===> ', err)
  }
}

const logout = async (userId) => {
  try {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/logout`
    const headers = { 'x-auth-token': user.value.token }
    const res = await axios.get(url, { headers })
    if (res.data.ok) {
      store.dispatch('logout', user.value.id)
      router.push('/login').catch((err) => {
        console.error('err logout router.push in frontend/NavbarView.view ===> ', err)
      })
    } else {
      router.push('/login').catch((err) => {
        console.error('err logout router.push in frontend/NavbarView.view ===> ', err)
      })
    }
  } catch (err) {
    console.error('err logout in frontend/NavbarView.view ===> ', err)
  }
}

function sortAndFilterMessages(messages) {
  messages.sort((a, b) => {
    if (a.is_read !== b.is_read) {
      return a.is_read - b.is_read
    } else if (a.id_conversation === b.id_conversation) {
      const dateA = new Date(a.last_update)
      const dateB = new Date(b.last_update)
      return dateB - dateA
    } else {
      return b.id_conversation - a.id_conversation
    }
  })

  const uniqueConversations = new Set()
  const uniqueMessages = []

  for (const message of messages) {
    if (!uniqueConversations.has(message.id_conversation)) {
      uniqueMessages.push(message)
      uniqueConversations.add(message.id_conversation)
    }
  }

  return uniqueMessages.slice(0, 5)
}

menuConvos.value = sortAndFilterMessages(newMessage.value)

const getNewMsg = async () => {
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/getInChat`
    const headers = { 'x-auth-token': token }
    const result = await axios.get(url, { headers })
    return result.data
  } catch (err) {
    console.error('Error fetching new messages:', err)
  }
}

const updateNotifAndMsg = async () => {
  if (connected.value !== null) {
    convos.value = store.getters.convos
    notif.value = store.getters.notif
    notifs.value = notif.value
      .sort((a, b) => {
        if (a.is_read !== b.is_read) {
          return a.is_read - b.is_read
        }
        return new Date(b.date) - new Date(a.date)
      })
      .slice(0, 5)
    newMessage.value = await getNewMsg()
    if (newMessage.value) {
      menuConvos.value = sortAndFilterMessages(newMessage.value)
      newMsgNum.value = newMessage.value.filter((cur) => !cur.is_read).length
      const newNotif = computed(() => store.getters.notif)
      notifNum.value = newNotif.value.filter((cur) => !cur.is_read).length
    }
  }
}

function refreshMethods() {
  updateNotifAndMsg()
}

const refreshInterval = setInterval(refreshMethods, 2000)

onBeforeUnmount(() => {
  clearInterval(refreshInterval)
})
</script>

<style scoped>
* {
  font-weight: bold;
  font-size: x-large;
  font-family: 'Elliane' !important;
  align-items: center;
  color: black;
}

q-drawer {
  background-color: transparent;
  border-color: transparent;
}

.drawer-bg {
  background-color: white;
  opacity: 0.9;
  position: absolute;
  width: 100%;
  height: 100%;
}

.search-notif-msg {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  top: 70px;
}

.image-button {
  width: 48px;
  height: 48px;
  object-fit: cover;
}
.search-field {
  max-width: 300px;
  margin-right: 20px;
}

.icon-size {
  width: 42px;
  margin: 7px;
}

.q-header {
  background: linear-gradient(to bottom, #000 0%, #fff 91%, rgba(255, 255, 255, 0) 100%) !important;
  box-shadow: none !important;
  border: none !important;
  padding: 7px;
}

.circular-icon {
  border-radius: 50%;
}

.text-link {
  cursor: pointer;
  color: black;
}

.notif-text {
  line-height: 3.2em !important;
}

.notif-msg {
  font-size: normal !important;
  font-weight: normal !important;
  width: 330px;
  right: 55px;
  top: auto;
  height: auto;
  visibility: visible;
  max-width: 330px;
  overflow: hidden;
}
</style>
