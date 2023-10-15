<template>
  <q-layout v-if="selectedConvo" class="column chat_container">
    <q-img v-if="!limit && selectedConvo" class="chat_load" :src="loadGif"></q-img>
    {{messages}}
    
    
    <div id="q-app" style="min-height: 100vh;">
      <div class="q-pa-md row justify-center">
        <div style="width: 100%; max-width: 400px">
          
          <q-chat-message :name=user.username :avatar=utility.getFullPath(image) stamp="7 minutes ago" sent text-color="white" bg-color="primary">
            <div>Hey there!</div>
            <div>Have you seen Quasar?</div>
          </q-chat-message>

          <q-chat-message :name=usernameConvo :avatar=utility.getFullPath(imageConvo) bg-color="amber">
            <q-spinner-dots size="2rem"></q-spinner-dots>
          </q-chat-message>

        </div>
      </div>
    </div>

    
    <q-item v-for="(msg, i) in messages" :key="i + key">
      
      <q-item-section>

        <h3 class="date_spacer subheading mb-2 mt-4" v-if="newConvo(msg, i)">{{ formatTime(msg.created_at) }}</h3>
        <div :class="layoutClass(msg, i)" align-start>
          
          <q-tooltip>
            <template v-slot:activator="{ on }">
              <q-btn :to="`/user/${msg.id_from}`" v-if="showAvatar(msg, i)" :class="avatarClass(msg, i)">
                <q-avatar size="40">
                  <img v-on="on" :src="utility.getFullPath(imageConvo)" :alt="usernameConvo">
                </q-avatar>
              </q-btn>
            </template>
            <span>{{ usernameConvo }}</span>
          </q-tooltip>

          <div :class="pushClass(msg, i)"></div>
          <q-avatar size="20" v-if="seen(msg, i)" class="mt-2">
            <img :src="utility.getFullPath(imageConvo)" :alt="usernameConvo">
          </q-avatar>
            {{msg.message}}
          
          <q-tooltip :left="msg.id_from === user.id" :right="msg.id_from != user.id">
            <template v-slot:activator="{ on }">
              <div :class="bubbleClass(msg)" v-on="on">{{msg.message}}</div>
            </template>
            <span>{{ formatTime(msg.created_at) }}</span>
          </q-tooltip>
          
        </div>

      </q-item-section>

    </q-item>

    <q-item v-if="typing">
      <q-item-section class="to py-0 px-2 top_msg bottom_msg" align-start>
        <q-btn to="/" class="pull_up_single">
          <q-avatar size="40">
            <img :src="utility.getFullPath(imageConvo)" :alt="usernameConvo">
          </q-avatar>
        </q-btn>
        <div class="mx-2 chat_bubble grey lighten-3">
          <div class="typing">
            <div class="typing_point"></div>
            <div class="typing_point"></div>
            <div class="typing_point"></div>
          </div>
        </div>
      </q-item-section>
    </q-item>
  </q-layout>
  <h2 v-else class="text-xs-center text-md-left pt-4 pb-3 mb-4 hidden-sm-and-down grey--text">matcher-vous avec des autrui pour commencer à discuter avec d'autres utilisateurs</h2>
</template>


<script setup>
import moment from 'moment'
import { ref, computed, watch, onMounted } from 'vue'
import utility from '@/utility.js'
import { useStore } from 'vuex'
import axios from 'axios'

const store = useStore()

const key = ref(0)
const messages = ref([])
const page = ref(0)
const limit = ref(false)
const loadGif = 'https://i.giphy.com/media/uyCJt0OOhJBiE/giphy.webp'
const image = computed(() => store.getters.profileImage)

const {
  user,
  typingSec,
  seenConvo,
  newMessage,
  imageConvo,
  idUserConvo,
  profileImage,
  selectedConvo,
  usernameConvo
} = store.getters

const typing = ref(false)

const checkLimit = (res) => {
  if (res && res.length < 50) {
    limit.value = true;
  } else {
    page.value++;
  }
};

const msgSent = (msg) => {
  messages.value.push(msg)
}

const first = (msg, i) => {
  if (!i) return true
  return messages.value[i - 1].id_from !== msg.id_from
}

const last = (msg, i) => {
  if (messages.value.length - 1 === i) return true
  return messages.value[i + 1].id_from !== msg.id_from
}

const seen = (msg, i) => {
  if (msg.id_from === user.id && msg.is_read) {
    while (++i < messages.value.length) {
      if (messages.value[i].id_from === user.id && messages.value[i].is_read) {
        return false
      }
    }
    return true
  } else {
    return false
  }
}

const formatTime = (timestamp) => {
  return moment(timestamp).format('MMMM D, YYYY, h:mm A');
}

const layoutClass = (msg, i) => {
  return [
    msg.id_from === user.id ? 'from' : 'to',
    first(msg, i) ? 'top_msg' : '',
    last(msg, i) ? 'bottom_msg' : '',
    'py-0',
    'px-2'
  ].join(' ')
}

const bubbleClass = (msg) => {
  return [
    'mx-2',
    'chat_bubble',
    msg.id_from !== user.id ? 'grey lighten-3' : 'primary white--text'
  ].join(' ')
}

const pushClass = (msg, i) => {
  if (!last(msg, i) && msg.id_from !== user.id) {
    return 'push_left'
  } else if (!seen(msg, i) && msg.id_from === user.id) {
    return 'push_right'
  } else {
    return 'd-none'
  }
}

const showAvatar = (msg, i) => {
  return last(msg, i) && msg.id_from !== user.id
}

const avatarClass = (msg, i) => {
  return last(msg, i) && !first(msg, i) ? 'pull_up' : 'pull_up_single'
}

const newConvo = (msg, i) => {
  if (!i) return true
  return moment(msg.created_at).diff(messages.value[i - 1].created_at, 'minutes', true) > 60
}

const scroll = () => {
  const top = document.querySelector('.top_chat')
  top.scrollTop = top.scrollHeight - top.clientHeight
}

const getChat = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/messages`
    const headers = { 'x-auth-token': user.token }
    const data = {
      id: selectedConvo,
      page: page.value
    }
    const result = await axios.post(url, data, { headers })
    console.log('result ===> ', result)
    return result
  } catch (err) {
    console.error('err getChat in frontend/MessengerChat.vue ===> ', err)
  }
}

watch(() => selectedConvo, async () => {
  if (selectedConvo) {
    page.value = 0
    limit.value = false
    try {
      const result = await getChat()
      checkLimit(result.body)
      messages.value = result.body
      console.log('messages.value ===> ', messages.value)
      store.dispatch('syncNotif')
      store.dispatch('seenConvo', {
        user: idUserConvo,
        convo: selectedConvo
      })
    } catch (err) {
      console.error('err watch(selectedConvo) in frontend/MessengerChat.vue ===> ', err)
    }
  }
})

watch(() => messages, () => {
  if (page.value < 2) {
    scroll()
  }
})

watch(() => newMessage, () => {
  if (newMessage && selectedConvo === newMessage.id_conversation) {
    messages.value.push(newMessage)
    store.dispatch('messageClr')
  }
})

watch(() => typingSec, () => {
  if (typingSec) {
    scroll()
  }
})

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

onMounted(() => {
  const top = document.querySelector('.top_chat')
  top.addEventListener('scroll', async (e) => {
    if (!limit.value && top.scrollTop <= 10) {
      const result = await getChat()
      console.log(result)
      checkLimit(result.data)
      console.log('result.data ===> ', result.data)
      if (Array.isArray(result.data)) {
        messages.value = [...result.data, ...messages.value]
      } else {
        console.error('Le résultat du serveur n\'est pas un tableau', result.body);
      }
      top.scrollTop = 150
    }
  })
})
</script>




<!-- <script setup>
import { watch, ref, computed, nextTick } from 'vue'
import { useStore } from 'vuex'
import { io } from 'socket.io-client'
import moment from 'moment'
import utility from '@/utility.js'
import axios from 'axios'

const store = useStore()
const key = ref(0)
const messages = ref([])
const page = ref(0)
const timer = ref({})
const limit = ref(false)
const loadGif = ref('https://i.giphy.com/media/uyCJt0OOhJBiE/giphy.webp')

const selectedConvo = ref(null)
const newMessage = ref(null)
const seenConvo = ref(false)

const socket = io(`${import.meta.env.VITE_APP_API_URL}`)
const user = computed(() => store.getters.user)
const typing = computed(() => store.getters.typingSec.status && store.getters.typingSec.convos.find(cur => cur.id_conversation === store.getters.selectedConvo))

const getChat = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/messages`
    const headers = { 'x-auth-token': user.value.token }
    const data = {
      id: store.getters.selectedConvo,
      // id: selectedConvo.value,
      page: page.value
    }
    console.log('data ===> ', data)
    const result = await axios.post(url, data, { headers })
    return result
  } catch (err) {
    console.error('err getChat in frontend/MessengerChat.vue ===> ', err)
  }
}

// Define your methods
const syncNotif = () => store.dispatch('syncNotif')
const messageClr = () => store.dispatch('messageClr')
const seenConvoClr = () => store.dispatch('seenConvoClr')
const typingSecClr = () => store.dispatch('typingSecClr')


const checkLimit = (res) => {//
  if (res.length < 50) {
    limit.value = true
  } else {
    page.value++
  }
}//

const msgSent = (msg) => {//
  messages.value.push(msg)
}//

const first = (msg, i) => {//
  if (!i) return true
  return messages.value[i - 1].id_from !== msg.id_from
}//

const last = (msg, i) => {//
  if (messages.value.length - 1 === i) return true
  return messages.value[i + 1].id_from !== msg.id_from
}//

const seen = (msg, i) => {//
  if (msg.id_from === user.value.id && msg.is_read) {
    while (++i < messages.value.length) {
      if (messages.value[i].id_from === user.value.id && messages.value[i].is_read) {
        return false
      }
    }
    return true
  } else {
    return false
  }
}//

const layoutClass = (msg, i) => [
  msg.id_from === user.value.id ? 'from' : 'to',
  first(msg, i) ? 'top_msg' : '',
  last(msg, i) ? 'bottom_msg' : '',
  'py-0',
  'px-2'
].join(' ')

const bubbleClass = (msg) => [
  'mx-2',
  'chat_bubble',
  msg.id_from !== user.value.id ? 'grey lighten-3' : 'primary white--text'
].join(' ')

const pushClass = (msg, i) => {
  if (!last(msg, i) && msg.id_from !== user.value.id) {
    return 'push_left'
  } else if (!seen(msg, i) && msg.id_from === user.value.id) {
    return 'push_right'
  } else {
    return 'd-none'
  }
}

const showAvatar = (msg, i) => last(msg, i) && msg.id_from !== user.value.id

const avatarClass = (msg, i) => last(msg, i) && !first(msg, i) ? 'pull_up' : 'pull_up_single'

const newConvo = (msg, i) => {
  if (!i) return true
  return moment(msg.created_at).diff(messages.value[i - 1].created_at, 'minutes', true) > 60
}

const scroll = () => {
  const top = document.querySelector('.top_chat')
  top.scrollTop = top.scrollHeight - top.clientHeight
}

// Watch for changes
watch(messages, () => {
  if (page.value < 2) nextTick(scroll)
})

watch(newMessage, (newVal) => {
  if (newVal && selectedConvo.value === newVal.id_conversation) {
    messages.value.push(newVal)
    messageClr()
  }
})

watch(typing, (newVal) => {
  if (newVal) {
    nextTick(scroll)
  }
})

watch(seenConvo, (newVal) => {
  if (newVal) {
    messages.value.forEach((cur, i) => {
      if (cur.id_from === user.value.id && !cur.is_read) {
        messages.value[i].is_read = 1
      }
    })
    seenConvoClr()
  }
})


watch(messages, () => {
  if (page.value < 2) nextTick(scroll);
})

watch(newMessage, (newVal) => {
  if (newVal && selectedConvo.value === newVal.id_conversation) {
    messages.value.push(newVal);
    messageClr();
  }
});

watch(typing, (newVal) => {
  if (newVal) {
    nextTick(scroll)
  }
});

watch(seenConvo, (newVal) => {
  if (newVal) {
    messages.value.forEach((cur, i) => {
      if (cur.id_from === user.id && !cur.is_read) {
        messages.value[i].is_read = 1
        // Pour forcer le re-render, vous pouvez utiliser une clé avec ref et incrémenter sa valeur.
        // Cependant, cela peut ne pas être nécessaire dans Vue 3 avec la Composition API.
      }
    })
    seenConvoClr()
  }
})

// const seenConvoClr = () => {
//   store.dispatch('seenConvoClr')
// }

// // Watch for changes
// watch(() => page.value, () => {
//   if (page.value < 2) nextTick(scroll)
// })

watch(() => store.getters.newMessage, (newMessage) => {
  if (newMessage && store.getters.selectedConvo === newMessage.id_conversation) {
    messages.value.push(newMessage)
    messageClr()
  }
})

watch(() => typing.value, () => {
  if (typing.value) {
    nextTick(scroll)
  }
})

watch(() => store.getters.seenConvo, (seenConvo) => {
  if (seenConvo) {
    messages.value.forEach((cur, i) => {
      if (cur.id_from === store.getters.user.id && !cur.is_read) {
        messages.value[i].is_read = 1
        key.value++ // To force re-render the messages
      }
    })
    seenConvoClr()
  }
})

// Define the rest of your watchers here...
</script> -->




<!-- <script>
import { ref, watch, computed, nextTick } from 'vue'
import { useStore } from 'vuex'
import { io } from 'socket.io-client'
import moment from 'moment'
import utility from '@/utility.js'
import axios from 'axios'

export default {
  name: 'MessengerChat',
  props: ['selectedConvo'],
  setup (props, { emit }) {
    const store = useStore()
    const key = ref(0)
    const messages = ref([])
    const page = ref(0)
    const timer = ref({})
    const limit = ref(false)
    const loadGif = ref('https://i.giphy.com/media/uyCJt0OOhJBiE/giphy.webp')

    const selectedConvo = ref(null);
    const newMessage = ref(null);
    const seenConvo = ref(false);

    const socket = io(`${import.meta.env.VITE_APP_API_URL}`)
    const typing = computed(() => store.getters.typingSec.status && store.getters.typingSec.convos.find(cur => cur.id_conversation === store.getters.selectedConvo))
    const scroll = () => {
      const top = document.querySelector('.top_chat')
      top.scrollTop = top.scrollHeight - top.clientHeight
    }
    const messageClr = () => {
      store.dispatch('messageClr')
    }
    const getters = computed(() => {
      return {
        user: store.getters.user,
        typingSec: store.getters.typingSec,
        seenConvo: store.getters.seenConvo,
        newMessage: store.getters.newMessage,
        imageConvo: store.getters.imageConvo,
        idUserConvo: store.getters.idUserConvo,
        profileImage: store.getters.profileImage,
        selectedConvo: store.getters.selectedConvo,
        usernameConvo: store.getters.usernameConvo
      }
    })

    const getChat = async () => {
      try {
        const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/messages`
        const headers = { 'x-auth-token': getters.value.user.token }
        const data = {
          id: getters.value.selectedConvo,
          page: page.value
        }
        const result = await axios.post(url, data, { headers })
        return result
      } catch (err) {
        console.error('err getChat in frontend/MessengerChat.vue ===> ', err)
      }
    }

    // Define your methods
    const methods = {
      ...utility,
      syncNotif: () => store.dispatch('syncNotif'),
      messageClr: () => store.dispatch('messageClr'),
      seenConvoClr: () => store.dispatch('seenConvoClr'),
      typingSecClr: () => store.dispatch('typingSecClr'),
      
      checkLimit: (res) => {
        if (res.length < 50) {
          limit.value = true
        } else {
          page.value++
        }
      },

      msgSent (msg) {
        messages.value.push(msg)
      },

      first (msg, i) {
        if (!i) return true
        return messages.value[i - 1].id_from !== msg.id_from
      },

      last (msg, i) {
        if (messages.value.length - 1 === i) return true
        return messages.value[i + 1].id_from !== msg.id_from
      },

      seen (msg, i) {
        if (msg.id_from === getters.value.user.id && msg.is_read) {
          while (++i < messages.value.length) {
            if (messages.value[i].id_from === getters.value.user.id && messages.value[i].is_read) {
              return false
            }
          }
          return true
        } else {
          return false
        }
      },

      layoutClass (msg, i) {
        return [
          msg.id_from === getters.value.user.id ? 'from' : 'to',
          methods.first(msg, i) ? 'top_msg' : '',
          methods.last(msg, i) ? 'bottom_msg' : '',
          'py-0',
          'px-2'
        ].join(' ')
      },

      bubbleClass (msg) {
        return [
          'mx-2',
          'chat_bubble',
          msg.id_from !== getters.value.user.id ? 'grey lighten-3' : 'primary white--text'
        ].join(' ')
      },

      pushClass (msg, i) {
        if (!methods.last(msg, i) && msg.id_from !== getters.value.user.id) {
          return 'push_left'
        } else if (!methods.seen(msg, i) && msg.id_from === getters.value.user.id) {
          return 'push_right'
        } else {
          return 'd-none'
        }
      },

      showAvatar (msg, i) {
        return methods.last(msg, i) && msg.id_from !== getters.value.user.id
      },

      avatarClass (msg, i) {
        return methods.last(msg, i) && !methods.first(msg, i) ? 'pull_up' : 'pull_up_single'
      },

      newConvo (msg, i) {
        if (!i) return true
        return moment(msg.created_at).diff(messages.value[i - 1].created_at, 'minutes', true) > 60
      },

      scroll () {
        const top = document.querySelector('.top_chat')
        top.scrollTop = top.scrollHeight - top.clientHeight
      }
    }


    watch(messages, () => {
      if (page.value < 2) nextTick(scroll);
    })

    watch(newMessage, (newVal) => {
      if (newVal && selectedConvo.value === newVal.id_conversation) {
        messages.value.push(newVal);
        messageClr();
      }
    });

    watch(typing, (newVal) => {
      if (newVal) {
        nextTick(scroll)
      }
    });

    watch(seenConvo, (newVal) => {
      if (newVal) {
        messages.value.forEach((cur, i) => {
          if (cur.id_from === user.id && !cur.is_read) {
            messages.value[i].is_read = 1
            // Pour forcer le re-render, vous pouvez utiliser une clé avec ref et incrémenter sa valeur.
            // Cependant, cela peut ne pas être nécessaire dans Vue 3 avec la Composition API.
          }
        })
        seenConvoClr()
      }
    })

    const seenConvoClr = () => {
      store.dispatch('seenConvoClr')
    }

    // // Watch for changes
    // watch(() => page.value, () => {
    //   if (page.value < 2) nextTick(scroll)
    // })

    watch(() => store.getters.newMessage, (newMessage) => {
      if (newMessage && store.getters.selectedConvo === newMessage.id_conversation) {
        messages.value.push(newMessage)
        messageClr()
      }
    })

    watch(() => typing.value, () => {
      if (typing.value) {
        nextTick(scroll)
      }
    })

    watch(() => store.getters.seenConvo, (seenConvo) => {
      if (seenConvo) {
        messages.value.forEach((cur, i) => {
          if (cur.id_from === store.getters.user.id && !cur.is_read) {
            messages.value[i].is_read = 1
            key.value++ // To force re-render the messages
          }
        })
        seenConvoClr()
      }
    })

    // Define the rest of your watchers here...

    return {
      newMessage,
      seenConvo,
      utility,
      key,
      messages,
      page,
      typing,
      timer,
      limit,
      loadGif,
      idUserConvo: getters.value.idUserConvo,
      selectedConvo: getters.value.selectedConvo,
      ...getters.value,
      ...methods
    }
  }
}
</script> -->

<style>
.chat_container {
  overflow-x: hidden;
}

.layout.from {
  flex-direction: row-reverse;
}

.chat_bubble {
  box-sizing: border-box;
  max-width: 70%;
  font-size: 0.95em;
  letter-spacing: 0.75px;
  padding: 0.6rem 1rem;
  margin-bottom: 0.2rem;
  overflow-x: hidden;
  white-space: pre-wrap;
}

.chat_bubble.grey,
.chat_bubble.blue {
  border: 0.5px solid rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.05) !important;
}

.layout.from > .chat_bubble {
  border-radius: 1.5rem 4px 4px 1.5rem;
}

.layout.to > .chat_bubble {
  border-radius: 4px 1.5rem 1.5rem 4px;
}

.layout.from.top_msg > .chat_bubble {
  border-radius: 1.5rem 1.5rem 4px 1.5rem;
}

.layout.to.top_msg > .chat_bubble {
  border-radius: 1.5rem 1.5rem 1.5rem 4px;
}

.layout.from.bottom_msg > .chat_bubble {
  border-radius: 1.5rem 4px 1.5rem 1.5rem;
}

.layout.to.bottom_msg > .chat_bubble {
  border-radius: 4px 1.5rem 1.5rem 1.5rem;
}

.bottom_msg {
  margin-bottom: 1rem !important;
}

.top_msg.bottom_msg > .chat_bubble {
  border-radius: 1.5rem !important;
}

.push_left {
  width: 40px;
}

.push_right {
  width: 20px;
}

.pull_up {
  margin-top: -5px;
}

.pull_up_single {
  margin-top: -2px;
}

.chat_load {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 auto;
}

.date_spacer {
  color: #777;
  font-size: 1.1em !important;
  text-align: center;
}
</style>
