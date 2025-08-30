<template>
  <q-layout v-if="selectedConvo" class="chat_container">
    <q-img v-if="!selectedConvo" class="chat_load" :src="loadGif"></q-img>

    <div id="q-app" >
      <div class="row" >
        <div style="max-width: 85%; min-width: 20%; padding-bottom: 50px;">

          <q-item v-for="(msg, i) in messages" :key="i + key" :class="{rtl: msg.id_from === user.id}" >

            <q-chat-message v-if="msg.id_from === user.id" :name="user.username"
              :avatar="utility.getFullPath(image)" :stamp="formatTime(msg.created_at)"
              sent text-color="white" bg-color="primary" class="nortl"
              @click="$router.push(`/`)"> 
                <div v-if="typing">
                  <q-spinner-dots size="2rem"/>
                </div>
                <div v-else>
                  <span>{{msg.message}}</span>
                  <q-tooltip :left="msg.id_from === user.id" :right="msg.id_from != user.id">
                    <span>{{ moment(msg.created_at).format('D MMMM, YYYY, h:mm A') }}</span>
                  </q-tooltip>
                </div>
            </q-chat-message>

            <q-chat-message v-else :name="usernameConvo" :avatar="utility.getFullPath(imageConvo)"
              bg-color="grey-3" :stamp="formatTime(msg.created_at)"
              @click="$router.push(`/user/${msg.id_from}`)">
                <div v-if="typing">
                  <q-spinner-dots size="2rem" />
                </div>
                <div v-else >
                  <span>{{msg.message}}</span>
                  <q-tooltip :left="msg.id_from === user.id" :right="msg.id_from != user.id">
                    <span>{{ moment(msg.created_at).format('D MMMM, YYYY, h:mm A') }}</span>
                  </q-tooltip>
                </div>
            </q-chat-message>

          </q-item>
        </div>
      </div>
    </div>
  </q-layout>
  <h2 v-else class="text-xs-center text-md-left pt-4 pb-3 mb-4 hidden-sm-and-down grey--text">Match with others to start chatting with other users</h2>
</template>

<script setup>
import moment from 'moment'
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import utility from '@/utility.js'
import { useStore } from 'vuex'
import axios from 'axios'
import io from 'socket.io-client'

const socket = io(`${import.meta.env.VITE_APP_API_URL}`)
const store = useStore()
const key = ref(0)
const page = ref(0)
const limit = ref(false)
const typing = ref(false)
const messages = ref([])
const user = computed(() => store.getters.user)
const image = computed(() => store.getters.profileImage)
// const typingSec = computed(() => store.getters.typingSec)
const newMessage = computed(() => store.getters.newMessage)
const imageConvo = computed(() => store.getters.imageConvo)
const idUserConvo = computed(() => store.getters.idUserConvo)
const profileImage = computed(() => store.getters.profileImage)
const selectedConvo = computed(() => store.getters.selectedConvo)
const usernameConvo = computed(() => store.getters.usernameConvo)
const seenConvo = store.getters
const loadGif = 'https://i.giphy.com/media/uyCJt0OOhJBiE/giphy.webp'
const convo = ref(selectedConvo.value)

const checkLimit = (res) => {
  if (res && res.length < 50) {
    limit.value = true
  } else {
    page.value++
  }
}

const formatTime = (created_at) => {
  
  return moment(created_at).fromNow()
}

const scroll = () => {
  const chatContainer = document.querySelector('.chat_container .top_chat');
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
};


const getChat = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/messages`
    const headers = { 'x-auth-token': user.value.token }
    const data = {
      id: selectedConvo.value,
      page: page.value
    }
    const result = await axios.post(url, data, { headers })
    return result
  } catch (err) {
    console.error('err getChat in frontend/MessengerChat.vue ===> ', err)
  }
}

socket.on('chat', (data) => {
  // Handle the 'chat' event here
  console.log('Received chat event from the backend:', data);

  // Call the getChat function or perform any other actions as needed
  getChat();
});

watch(() => selectedConvo.value, async () => {
  if (selectedConvo) {
    page.value = 0
    limit.value = false
    try {
      const result = await getChat()

      checkLimit(result.data)
      messages.value = result.data
      store.dispatch('syncNotif')
    } catch (err) {
      console.error('err watch(selectedConvo) in frontend/MessengerChat.vue ===> ', err)
    }
  }
})

watch(() => messages.value, () => {
  if (page.value < 2) {
    scroll()
  }
})

watch(() => newMessage.value, () => {
  if (newMessage && selectedConvo.value === newMessage.id_conversation) {
    messages.value.push(newMessage)
    store.dispatch('messageClr')
  }
})

// watch(() => typingSec, () => {
//   if (typingSec) {
//     scroll()
//   }
// })

watch(() => seenConvo, () => {
  if (seenConvo) {
    messages.value.forEach((cur, i) => {
      if (cur.id_from === user.id && !cur.is_read) {
        messages.value[i].is_read = 1
        key.value++
      }
    })
    store.dispatch('seenConvoClr')
  }
})

onMounted(async () => {
  await fetchNewMessages()
  await getChat()
  scroll()

  const top = document.querySelector('.top_chat')
  top.addEventListener('scroll', async (e) => {
    if (!limit.value && top.scrollTop <= 10) {
      const result = await getChat()
      checkLimit(result.data)
      messages.value = [...result.data, ...messages.value]
      scroll()
    }
  })
})


onBeforeUnmount(() => {
  socket.off('newMessage')
})

const fetchNewMessages = async () => {
  if (selectedConvo) {
    try {
      const result = await getChat()
      checkLimit(result.data)
      const newMessages = result.data.filter((message) => {
        return !messages.value.some((msg) => msg.id === message.id)
      })

      if (newMessages.length > 0) {
        messages.value = [...messages.value, ...newMessages]
        scroll()
      }
    } catch (err) {
      console.error('Error fetching new messages:', err)
    }
  }
}
function refreshMethods() {
  if (selectedConvo) {
    fetchNewMessages()
    getChat()
    scroll()
  }
  else {
    console.log('not refreshing')
  }
}

const refreshInterval = setInterval(refreshMethods,  2000);


onBeforeUnmount(() => {
  clearInterval(refreshInterval);
});


</script>

<style>
.chat_container {
  overflow: hidden;
}

.chat_load {
  height: 3rem;
  margin: auto;
}

.rtl {
  direction: rtl;
}
.nortl {
  direction: ltr;
}
</style>
