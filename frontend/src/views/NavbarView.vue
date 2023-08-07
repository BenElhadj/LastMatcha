<template>
  <q-header class="black-text">
    <q-toolbar>

      <div v-if="status" @click="drawer = true">
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
      <div v-if="status" justify-end class="search-notif-msg">
        
        <q-input v-model="searchText" margin-right="37px" class="search-field q-ml-xl" dense outlined hide-details placeholder="Recherche">
          <template #prepend>
            <q-icon name="mdi-magnify"></q-icon>
          </template>
        </q-input> 
        
        <div>
          <img src="@/assets/Navbar/notification.png" alt="Notifications" class="icon-size mx-2 q-ml-xl">
          <q-menu v-model="notifMenu" :nudge-width="250">
            <template #activator="{ on }">
              <q-btn text icon large color="grey" v-on="on">
                <q-badge overlap :value="!!notifNum" color="primary" floating class="mx-2 q-ml-xl" right>
                  <template #badge>
                    <span>{{ notifNum }}</span>
                  </template>
                </q-badge>
              </q-btn>
            </template>
            <q-list padding class="pa-0 q-ml-xl">
              <q-item v-for="(item, i) in notifs" :key="i" clickable @click="toUserProfile(item.id_from)">
                <q-item-section avatar>
                  <q-avatar :src="getFullPath(item.profile_image)"></q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="notif_msg q-ml-xl">
                    <strong class="notif_username q-ml-xl">{{ item.username }}</strong>
                    <span>{{ getNotifMsg(item) }}</span>
                  </q-item-label>
                  <q-item-label caption>
                    <q-icon small color="blue lighten-2" class="mr-2 q-ml-xl">
                      {{ getNotifIcon(item.type) }}
                    </q-icon>
                    <span class="notif_date">{{ formatNotifDate(item) }}</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="$router.push('/notifications')">
                <q-item-label class="see_all">
                  Consulter toutes les notifications
                </q-item-label>
              </q-item>
            </q-list>
          </q-menu>
        </div>
        
        <div>
          <img src="@/assets/Navbar/chat.png" alt="Messages" class="icon-size mx-2 q-ml-xl">
          <q-menu v-model="msgMenu" anchor="top right" :content-class="'grey lighten-5'">
            <template #activator="{ on }">
              <q-btn ripple flat round dense class="icon-size" v-on="on">
                <q-badge :value="!!newMsgNum" color="primary" floating class="mx-2 q-ml-xl">
                  <template #default>
                    <span>{{ newMsgNum }}</span>
                  </template>
                </q-badge>
              </q-btn>
            </template>
            <q-list padding class="pa-0 q-ml-xl ">
              <q-item v-for="(item, i) in menuConvos" :key="i" clickable @click="toUserChat(item)">
                <q-item-section avatar>
                  <q-avatar :src="getFullPath(item.profile_image)"></q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="notif_msg">
                    <q-item-section horizontal>
                      <q-item-section>
                        <strong class="notif_username">{{ item.username }}</strong>
                      </q-item-section>
                      <q-item-section side>
                        <span class="ml-auto chat_time">{{ formatNotifDate(item) }}</span>
                      </q-item-section>
                    </q-item-section>
                  </q-item-label>
                  <q-item-label caption>
                    <span v-if="item.message_from === user.id" class="notif_date">You: </span>
                    <span class="notif_date text-truncate">{{ item.message }}</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="$router.push('/chat')">
                <q-item-label class="see_all">
                  Voir toutes les discussions
                </q-item-label>
              </q-item>
            </q-list>
          </q-menu>
        </div>

      </div>

      <div v-else>
        <span class="text-link q-ml-xl" @click="$router.push('/login')">Connexion</span>
        <span class="text-link q-ml-xl" @click="$router.push('/register')">Inscription</span>
      </div>
      
    </q-toolbar>

    <q-drawer v-if="status" v-model="drawer" overlay>
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
          <q-item v-if="link.public || status" clickable @click="$router.push(link.route)">
            <img :src="link.image" alt="Icon" class="icon-size">
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <q-item clickable @click="logout">
          <img src="@/assets/Navbar/deconnexion.png" alt="Déconnexion" class="icon-size">
          <q-item-section>
            <q-item-label>Se déconnecter</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

  </q-header>
</template>

<script>
import utility from '@/utility.js'
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axios from 'axios'
import acceilImage from '@/assets/Navbar/acceil.png'
import decouvrirImage from '@/assets/Navbar/decouvrir.png'
import rechercheImage from '@/assets/Navbar/recherche.png'
import chatImage from '@/assets/Navbar/chat.png'
import notificationImage from '@/assets/Navbar/notification.png'
import parametreImage from '@/assets/Navbar/parametre.png'

export default {
  name: 'NavbarView',
  setup (_, { app }) {
    // console.log('*** Setting up NavbarView ***')
    const store = useStore()
    const router = useRouter()
    const timer = {}
    const notifMenu = ref(false)
    const msgMenu = ref(false)
    const notifNum = ref(0)
    const newMsgNum = ref(0)
    const searchText = ref('')
    const drawer = ref(false)
    const image = computed(() => store.getters.profileImage)

    const links = [
      {
        text: 'Accueil',
        route: '/',
        public: true,
        image: acceilImage
      },
      {
        text: 'Découvrir',
        route: '/discover',
        public: false,
        image: decouvrirImage
      },
      {
        text: 'Recherche',
        route: '/search',
        public: false,
        image: rechercheImage
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
        text: 'Paramètres',
        route: '/settings',
        public: false,
        image: parametreImage
      }
    ]

    const user = computed(() => store.getters.user)
    const notif = computed(() => store.getters.notif)
    const notifs = computed(() => store.getters.notifs)
    // const status = computed(() => store.getters.status)
    const status = computed(() => store.getters.status || localStorage.getItem('token'))
    const convos = computed(() => store.getters.convos)
    const typingSec = computed(() => store.getters.typingSec)
    const profileImage = computed(() => store.getters.profileImage)
    const typingConvos = computed(() => typingSec.value.convos ? typingSec.value.convos.length : false)

    const getFullPath = utility.getFullPath

    // console.log('Store:', store);
    // console.log('Getters:', store.getters);
    const seenNotif = async () => {
      // console.log('*** Seen notification called ***')
      try {
        const url = `${import.meta.env.VITE_APP_API_URL}/api/notif/update`
        const headers = { 'x-auth-token': user.value.token }
        await axios.post(url, {}, { headers })
        store.dispatch('seenNotif')
      } catch (error) {
        console.log('Got error here -->', error)
      }
    }

    const typingSecClr = (convId) => {
      store.dispatch('typingSecClr', convId)
    }

    const toUserProfile = (id) => {
      // console.log('*** Navigating to user profile ***')
      try {
        router.push(`/user/${id}`)
      } catch (error) {
        console.log('Error navigating to user profile:', error)
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
      // console.log('*** NavbarView mounted ***')
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
        }
      } catch (err) {
        console.log('Got error here -->', err)
      }
    })

    const toUserChat = (convo) => {
      try {
        syncConvo(convo)
      } catch (error) {
        console.log('Error navigating to user chat:', error)
      }
    }

    const syncConvo = async (convo) => {
      // console.log('*** Syncing conversation ***')
      try {
        store.dispatch('syncConvo', convo)
        router.push('/chat').catch(err => {
          console.log('Error navigating to user chat:', err)
        })
      } catch (error) {
        console.log('Error synchronizing conversation:', error)
      }
    }

    const logout = async (userId) => {
      // console.log('*** Logging out ***')
      try {
        const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/logout`
        const headers = { 'x-auth-token': user.value.token }
        const res = await axios.get(url, { headers })
        if (res.data.ok) {
          store.dispatch('logout', user.value.id)
        }
        router.push('/').catch(err => {
          console.log('Error navigating to home:', err)
        })
      } catch (err) {
        console.log('Error logging out:', err)
      }
    }

    watch(notif, (newNotif) => {
      newMsgNum.value = newNotif.filter(cur => cur.type === 'chat' && !cur.is_read).length
      notifNum.value = newNotif.filter(cur => cur.type !== 'chat' && !cur.is_read).length
    })

    watch(typingConvos, (value) => {
      if (typingSec.value.status) {
        const len = typingSec.value.convos.length
        const convId = typingSec.value.convos[len - 1].id_conversation
        if (timer[convId]) clearTimeout(timer[convId])
        timer[convId] = setTimeout(() => typingSecClr(convId), 1200)
      }
    })

    const menuConvos = computed(() => {
      return convos.value.slice(0, 7);
    })

    const handleNotifMenu = () => {
      notifMenu.value = !notifMenu.value
    }

    const handleMsgMenu = () => {
      msgMenu.value = !msgMenu.value
    }

    const formatNotifDate = utility.formatTime

    return {
      user,
      notif,
      notifs,
      status,
      convos,
      typingSec,
      profileImage,
      typingConvos,
      searchText,
      drawer,
      links,
      notifMenu,
      msgMenu,
      getFullPath,
      formatNotifDate,
      image,
      seenNotif,
      syncConvo,
      typingSecClr,
      toUserProfile,
      toUserChat,
      logout,
      handleNotifMenu,
      menuConvos,
      handleMsgMenu
    }
  }
}
</script>

<style scoped>
* {
  font-weight: bold;
  font-size: x-large;
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

.black-text {
  font-size: xx-large !important;
}

.circular-icon {
  border-radius: 50%;
}

.text-link {
  cursor: pointer;
  color: black;
}

</style>
