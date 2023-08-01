<template>
  <q-header elevated class="black-text">
    <q-toolbar>
      <q-btn v-if="status" flat round dense @click="drawer = true">
      <!-- <q-btn v-if="status" dense flat @click="drawer = !drawer" icon="menu"> -->
        <q-avatar :src="image" size="42px" alt="Photo de profil" class="icon-size circular-icon"
        ></q-avatar>
      </q-btn>
      <div v-else></div>
      <q-toolbar-title>
        <span>MATCHA </span>
      </q-toolbar-title>
      <q-space></q-space>
      <div v-if="status" justify-end class="search-notif-msg">
        <q-input v-model="searchText" margin-right="37px" class="search-field" dense outlined hide-details placeholder="Recherche" prefix="mdi-magnify"
        ></q-input>
        <q-menu v-model="notifMenu" :nudge-width="250">
          <template #activator="{ on }">
            <q-btn text icon large color="grey" v-on="on">
              <q-badge overlap :value="!!notifNum" color="primary" class="mx-2" right>
                <template #badge>
                  <span>{{ notifNum }}</span>
                </template>
              </q-badge>
              <img src="@/assets/Navbar/notification.png" alt="Notifications">
            </q-btn>
          </template>
          <q-list padding class="pa-0">
            <q-item v-for="(item, i) in notifs" :key="i" clickable @click="toUserProfile(item.id_from)">
              <q-item-section avatar>
                <q-avatar :src="getFullPath(item.profile_image)"></q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="notif_msg">
                  <strong class="notif_username">{{ item.username }}</strong>
                  <span>{{ getNotifMsg(item) }}</span>
                </q-item-label>
                <q-item-label caption>
                  <q-icon small color="blue lighten-2" class="mr-2">
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
        <q-menu v-model="msgMenu" anchor="top right" :content-class="'grey lighten-5'">
          <q-btn ripple flat round dense class="icon-size" v-on="on">
            <q-badge :value="!!newMsgNum" color="primary" floating class="mx-2">
              <template #default>
                <span>{{ newMsgNum }}</span>
              </template>
            </q-badge>
            <img src="@/assets/Navbar/chat.png" alt="Messages">
          </q-btn>
          <q-list padding class="pa-0 message_list">
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
      <div v-else>
        <q-btn ripple text color="grey" class="q-ml-sm" @click="$router.push('/login')">
          Se connecter
        </q-btn>
        <q-btn ripple text color="grey" class="q-ml-sm" @click="$router.push('/register')">
          S'inscrire
        </q-btn>
      </div>
    </q-toolbar>
    <q-drawer v-if="status" v-model="drawer" show-if-above bordered :content-class="'primary'" @click-outside="drawer = false">
      <div class="drawer-bg"></div>
      <q-list padding>
        <q-item>
          <q-item-section avatar>
            <q-avatar :src="image"></q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ user.username }}</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-icon name="arrow_back_ios" @click="drawer = false"
            ></q-icon>
          </q-item-section>
        </q-item>
        <q-separator></q-separator>
        <div v-for="link in links" :key="link.text">
          <q-item v-if="link.public || status" clickable @click="$router.push(link.route)">
            <q-item-section avatar>
              <q-avatar>
                <img :src="link.image" alt="Icon">
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>
        </div>
        <q-item clickable @click="logout">
          <q-item-section avatar>
            <q-avatar>
              <img src="@/assets/Navbar/deconnexion.png" alt="Déconnexion">
            </q-avatar>
          </q-item-section>
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
import { computed, watch, ref } from 'vue'
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
        icon: 'mdi-home-circle',
        text: 'Accueil',
        route: '/',
        public: true,
        image: acceilImage
      },
      {
        icon: 'mdi-account-group',
        text: 'Découvrir',
        route: '/discover',
        public: false,
        image: decouvrirImage
      },
      {
        icon: 'mdi-account-search',
        text: 'Recherche',
        route: '/search',
        public: false,
        image: rechercheImage
      },
      {
        icon: 'mdi-chat',
        text: 'Chat',
        route: '/chat',
        public: false,
        image: chatImage
      },
      {
        icon: 'mdi-bell',
        text: 'Notifications',
        route: '/notifications',
        public: false,
        image: notificationImage
      },
      {
        icon: 'mdi-account-cog',
        text: 'Paramètres',
        route: '/settings',
        public: false,
        image: parametreImage
      }
    ]

    const user = computed(() => store.getters.user)
    const notif = computed(() => store.getters.notif)
    const status = computed(() => store.getters.status)
    const convos = computed(() => store.getters.convos)
    const typingSec = computed(() => store.getters.typingSec)
    const profileImage = computed(() => store.getters.profileImage)
    const typingConvos = computed(() => typingSec.value.convos ? typingSec.value.convos.length : false)

    const getFullPath = utility.getFullPath

    console.log('Store:', store);
    console.log('Getters:', store.getters);
    const seenNotif = async () => {
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
      try {
        router.push(`/user/${id}`)
      } catch (error) {
        console.log('Error navigating to user profile:', error)
      }
    }

    const toUserChat = (convo) => {
      try {
        syncConvo(convo)
      } catch (error) {
        console.log('Error navigating to user chat:', error)
      }
    }

    const syncConvo = async (convo) => {
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

.no-divider .v-divider {
  display: none;
}

.black-text {
  font-size: xx-large !important;
}

.circular-icon {
  border-radius: 50%;
}

.drawer-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("@/assets/drawer-bg.jpg");
  background-size: cover;
  background-repeat: no-repeat;
}

</style>
