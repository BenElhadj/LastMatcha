<template>
  <q-layout>
    <q-page v-if="loaded" class="messenger pa-3">
      <div class="parent row">
        <div class="left-scroll col-md-3 col-sm-1">
          <div class="left">
            <MessengerList />
          </div>
        </div>
        <div class="right-scroll col-md-9 col-sm-11 col-xs-12">
          <div class="chat_layout column justify-start">
            <div class="top_chat col-xs-9">
              <MessengerChat ref="chat" />
            </div>
            <div class="bottom col-xs-3">
              <MessengerForm :to-id="getToId()" @msgSent="messageSent" />
            </div>
          </div>
        </div>
      </div>
    </q-page>
    <LoaderView v-else />
  </q-layout>
</template>

<script setup>
import { onBeforeUnmount, ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axios from 'axios'
import LoaderView from '@/views/LoaderView.vue'
import MessengerList from '@/components/afterLogin/MessengerList.vue'
import MessengerChat from '@/components/afterLogin/MessengerChat.vue'
import MessengerForm from '@/components/afterLogin/MessengerForm.vue'

const store = useStore()
const router = useRouter()
const loaded = ref(false)
const user = computed(() => store.state.user)
const convos = computed(() => store.state.convos)
const selectedConvo = computed(() => store.state.selectedConvo)
const data = ref(null)

const getToId = () => {
  for (const cur of convos.value) {
    if (cur.id_conversation === selectedConvo.value) {
      return cur.user_id
    }
  }
}

const messageSent = (msg) => {
  store.dispatch('updateConvosOrder', msg.id_conversation)
}

watch(user, async (newUser) => {
  const token = newUser.token || localStorage.getItem('token')
  if (token) {
    try {
      const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/isloggedin`
      const headers = { 'x-auth-token': token }
      const res = await axios.get(url, { headers })
      data.value = res.data
      if (!res.data.msg) {
        loaded.value = true
        return
      }
    } catch (err) {
      console.error('err watch user in frontend/MessengerView.vue ===> ', err)
    }
  }
  store.dispatch('logout', newUser.id)
  router.push('/login')
}, { immediate: true })

watch(convos, (newConvos) => {
  if (newConvos.length && !selectedConvo.value) {
    store.dispatch('syncConvo', newConvos[0])
  }
}, { immediate: true })

onBeforeUnmount(() => {
  store.dispatch('syncConvo', null)
})
</script>

<style scoped>
.messenger {
  height: calc(100vh - 4.75rem);
}

.left-scroll {
  height: 100%;
  overflow-y: auto;
}

.right-scroll {
  height: 100%;
  overflow-y: auto;
}

.top_chat {
  flex: 0% 50% 100% !important;
}

.top_chat::-webkit-scrollbar {
  width: 10px;
}

.top_chat::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 10px;
}

.left {
  padding: 0 !important;
  margin: 0 !important;
}

.right, .chat_layout, .parent {
  height: 100% !important;
}

.bottom {
  flex: 0 0 100% !important;
}

.left-scroll {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.right-scroll {
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}

.left-scroll::-webkit-scrollbar,
.right-scroll::-webkit-scrollbar {
  width: 12px;
}

.left-scroll::-webkit-scrollbar-thumb,
.right-scroll::-webkit-scrollbar-thumb {
  background-color: transparent;
}

.left-scroll::-webkit-scrollbar-track,
.right-scroll::-webkit-scrollbar-track {
  background-color: transparent;
}

</style>
