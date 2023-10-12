<template>
  <q-layout v-if="selectedConvo" align="center" justify="center" class="messenger_form px-3 chat_layout">
    <q-input rows="1" filled dense class="ma-4 send_msg" append-icon="mdi-send" @click:append="sendMsg" label="Type a message..." v-model="msg" @keyup.enter="sendMsg"></q-input>
  </q-layout>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { io } from 'socket.io-client'

export default {
  name: 'MessengerForm',
  props: {
    toId: {
      type: Number,
      default: -1
    }
  },
  setup(props) {
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
              id_conversation: selectedConvo,
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

    return { msg, selectedConvo, sendMsg }
  }
}
</script>

<style>
.q-field--filled.q-field--dense input {
  margin-top: 0 !important;
}

.send_msg > .q-field__control > .q-field__append > textarea {
  resize: none !important;
  overflow-y: hidden;
  margin-top: 5px;
}
</style>
