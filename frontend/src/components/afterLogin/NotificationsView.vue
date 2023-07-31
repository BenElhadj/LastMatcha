<template>
  <q-layout>
    <q-page padding>
      <h1 class="text-h5 q-my-md">
        Notifications
      </h1>
      <div
        v-for="(entry, i) in notifs"
        :key="i"
        class="q-my-md"
      >
        <div class="row justify-center items-start q-pa-md">
          <div class="col-3 text-center">
            <q-tooltip
              anchor="bottom middle"
              self="top middle"
            >
              <template #activator="{ on }">
                <strong
                  class="mt-2 d-block grey--text"
                  v-on="on"
                >{{ fromNow(entry.date) }}</strong>
              </template>
              <span>{{ formatTime(entry.date) }}</span>
            </q-tooltip>
          </div>
          <div class="col-9">
            <q-card class="notif_bubble">
              <q-card-section>
                <div class="row items-center">
                  <q-avatar>
                    <img
                      :src="getFullPath(entry.profile_image)"
                      :alt="entry.username"
                    >
                  </q-avatar>
                  <div class="q-ml-md">
                    <router-link
                      :to="`/user/${entry.id_from}`"
                      class="timeline_link"
                    >
                      {{ entry.username }}
                    </router-link>
                    <div class="subtitle">
                      {{ getNotifMsg(entry) }}
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
      <q-btn
        v-if="moreToLoad"
        block
        color="primary"
        class="my-4"
        @click="increaseLimit"
      >
        Afficher plus
      </q-btn>
    </q-page>
  </q-layout>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axios from 'axios'
import utility from '@/utility.js'

export default {
  name: 'NotificationsView',
  setup () {
    const store = useStore()
    const router = useRouter()
    const limit = ref(15)

    const user = computed(() => store.state.user)
    const notif = computed(() => store.state.notif)
    const notChats = computed(() => notif.value.filter(cur => cur.type !== 'chat'))
    const notifs = computed(() => [...notChats.value].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit.value))
    const { fromNow, formatTime, getFullPath, getNotifMsg } = utility

    const increaseLimit = () => {
      if (limit.value + 11 < notChats.value.length) {
        limit.value += 10
      } else {
        limit.value = notChats.value.length - 1
      }
    }

    const moreToLoad = computed(() => {
      return limit.value < notChats.value.length - 1
    })

    const logout = async (userId) => {
      try {
        const url = `${import.meta.env.VUE_APP_API_URL}/logout`
        const res = await axios.post(url, { userId })
        if (res.data.ok) {
          store.dispatch('logout')
        } else {
          console.log('Logout failed:', res.data.message)
        }
      } catch (error) {
        console.log('Got error while logging out:', error)
      }
    }

    watch(user, async (newUser) => {
      const token = newUser.token || localStorage.getItem('token')
      if (token) {
        try {
          const url = `${import.meta.env.VUE_APP_API_URL}/api/auth/isloggedin`
          const headers = { 'x-auth-token': token }
          const res = await axios.get(url, { headers })
          if (!res.data.msg) return
        } catch (err) {
          console.log('Got error here --> ', err)
        }
      }
      await logout(newUser.id)
      router.push('/login')
    }, { immediate: true })

    return {
      user,
      notif,
      notChats,
      notifs,
      moreToLoad,
      increaseLimit,
      logout,
      fromNow,
      formatTime,
      getFullPath,
      getNotifMsg
    }
  }
}
</script>

<style scoped>
.timeline_link {
  text-decoration: none;
}

.bubble.grey {
  border-radius: 5rem;
  border: 1px solid rgba(0, 0, 0, .1) !important;
  transition: all .3s ease-out;
}

.bubble.grey:hover {
  border: 1px solid rgba(0, 0, 0, .25) !important;
}

.notif_bubble {
  margin-top: -.6rem;
}
</style>
