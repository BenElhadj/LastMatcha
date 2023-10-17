<template>
  <q-layout v-if="selectedConvo" align="center" justify="center" class="messenger_form px-3 chat_layout">
    <q-input class="custom-q-input" rows="1" outlined bottom-slots filled dense @click:append="sendMsg" label="Type a message..." v-model="msg" @keyup.enter="sendMsg">
      <q-btn @click="sendMsg" flat round style="width: 10px" color="primary" icon="mdi-send"/>
    </q-input>
  </q-layout>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { io } from 'socket.io-client'

const props = defineProps({
  toId: {
    type: Number,
    default: -1
  }
})

const store = useStore()
const $q = useQuasar()
const msg = ref(null)
const user = store.getters['user']
const selectedConvo = store.getters['selectedConvo']
let socket = null

onMounted(() => {
  socket = io(`${import.meta.env.VITE_APP_API_URL}`)
})

watch(msg, () => {
  if (msg.value.length) {
    const data = {
      id_conversation: selectedConvo,
      id_from: user.id,
      id_to: props.toId
    }
    socket.emit('typing', data)
  }
})

const sendMsg = async (e) => {
  if (msg.value && msg.value.trim()) {
    if (!e.shiftKey) {
      try {
        const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/send`
        const headers = { 'x-auth-token': user.token }
        const data = {
          id_conversation: store.state.selectedConvo,
          id_from: user.id,
          id_to: props.toId,
          message: msg.value
            .trim()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .slice(0, 2048)
         
        }
        const result = await axios.post(url, data, { headers })
        //console.log('result.data ===> ', store.state.selectedConvo)
        if (result.data.ok) {
          msg.value = ''
          store.dispatch('updateConvos', data)
          socket.emit('chat', data)
        }
      } catch (err) {
        console.error('err sendMsg in frontend/MessengerForm.vue ===> ', err)
      }
    }
  } else {
    msg.value = ''
  }
}
</script>

<style>
.q-field--filled.q-field--dense input {
  margin-top: 5 !important;
}

.send_msg > .q-field__control > .q-field__append > textarea {
  resize: none !important;
  overflow-y: none !important;
  margin-top: 5px;
}
.custom-q-input {
    position: fixed;
    bottom: 140px;
    left: 24%;
    right: 10%;
    z-index: 10;
    border-radius: 10px;
    padding: 10px;
    border: 5% solid white !important;
    background: white;
}

</style>
