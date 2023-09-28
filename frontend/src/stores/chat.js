import axios from 'axios'

export const chat = {
  state: {
    newMessage: null,
    selectedConvo: null,
    convos: [],
    typingSec: { status: [], convos: [] },
    seenConvo: false
  },
  mutations: {
    seenConvoClr (state) {
      state.seenConvo = false
    },
    typingSecClr (state, convId) {
      state.typingSec.convos = state.typingSec.convos.filter(cur => cur.id_conversation !== convId)
      state.typingSec.status = !!state.typingSec.convos.length
    },
    messageClr (state) {
      state.newMessage = null
    },
    syncNotif (state) {
      state.notif = state.notif.filter(cur => !cur.id_conversation || cur.id_conversation !== state.selectedConvo)
    },
    syncConvo (state, convo) {
      if (!convo) {
        state.selectedConvo = null
      } else {
        state.selectedConvo = convo.id_conversation
      }
    },
    syncConvoAll (state, convos) {
      state.convos = convos
    },
    updateConvos (state, msg) {
      state.convos.forEach((cur, i) => {
        if (cur.id_conversation === msg.id_conversation) {
          state.convos[i].message = msg.message
          state.convos[i].message_from = msg.id_from
        }
      })
    },
    updateConvosOrder (state, id) {
      state.convos.forEach(cur => {
        if (cur.id_conversation === id) {
          cur.last_update = new Date()
        }
      })
    }
  },
  actions: {
    syncNotif ({ commit }) {
      commit('syncNotif')
    },
    messageClr ({ commit }) {
      commit('messageClr')
    },
    typingSecClr ({ commit }, convId) {
      commit('typingSecClr', convId)
    },
    seenConvoClr ({ commit }) {
      commit('seenConvoClr')
    },
    syncConvo ({ commit }, convo) {
      commit('syncConvo', convo)
    },
    updateConvos ({ commit }, msg) {
      commit('updateConvos', msg)
    },
    updateConvosOrder ({ commit }, id) {
      commit('updateConvosOrder', id)
    },
    syncConvoAll: async ({ commit }) => {
      try {
        const token = localStorage.getItem('token')
        const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/all`
        const headers = { 'x-auth-token': token }
        const result = await axios.get(url, { headers })
        if (!result.data.msg) commit('syncConvoAll', result.data)
      } catch (err) {
        console.error('err syncConvoAll in frontend/chat.js ===> ', err)
      }
    }
  }
}
