<template>
  <q-layout v-if="selectedConvo" :align="center" justify="center" row class="messenger_form px-3 chat_layout">
    <q-input v-model="msg" outlined class="ma-4 send_msg" label="Type a message..." @keyup.enter="sendMsg" @input="emitTyping"/>
  </q-layout>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import { io } from 'socket.io-client'
const socket = io(import.meta.env.VITE_APP_API_URL)

export default {
  name: 'MessengerForm',
  props: {
    toId: {
      type: Number,
      default: -1
    }
  },
  setup (props) {
    const store = useStore()
    const msg = ref(null)
    const user = computed(() => store.state.user)
    const selectedConvo = computed(() => store.state.selectedConvo)

    const sendMsg = async (e) => {
      if (msg.value && msg.value.trim()) {
        if (!e.shiftKey) {
          try {
            const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/send`
            const headers = { 'x-auth-token': user.value.token }
            const data = {
              id_conversation: selectedConvo.value,
              id_from: user.value.id,
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
            console.error(err)
          }
        }
      } else {
        msg.value = ''
      }
    }

    const emitTyping = () => {
      if (msg.value.length) {
        const data = {
          id_conversation: selectedConvo.value,
          id_from: user.value.id,
          id_to: props.toId
        }
        socket.emit('typing', data)
      }
    }

    return {
      msg,
      sendMsg,
      emitTyping
    }
  }
}
</script>

<style scoped>
.q-input--outline.q-input--single-line input {
  margin-top: 0 !important;
}

.send_msg > .v-input__control > .v-input__slot > .q-input__slot > textarea {
  resize: none !important;
  overflow-y: hidden;
  margin-top: 5px;
}
</style>
