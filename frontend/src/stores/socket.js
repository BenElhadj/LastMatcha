import axios from 'axios'
import utility from '@/utility'
import { createApp } from 'vue'
import { io } from 'socket.io-client'

export const socket = {
  state: {
    isConnected: false,
    typingSec: { status: false, convos: [] },
    seenConvo: false,
    convos: [],
    notif: [],
    online: [],
    blockedBy: [],
    selectedConvo: null,
    newMessage: null
  },
  mutations: {
    SOCKET_connect (state) {
      if (!state.isConnected && state.user.id) {
        state.socket = io(`${import.meta.env.VITE_APP_API_URL}`);
        state.socket.emit('auth', state.user.id);
        state.isConnected = true;
    
        // Écoutez l'événement 'online' pour mettre à jour la liste des utilisateurs en ligne
        state.socket.on('online', (onlineUsers) => {
          state.online = onlineUsers.filter((userId) => userId !== state.user.id).map((userId) => Number(userId));
        });
      }
      // if (!state.isConnected && state.user.id) {
      //   const app = createApp({})
      //   app.config.globalProperties.$socket = io(`${import.meta.env.VITE_APP_API_URL}`)
      //   app.config.globalProperties.$socket.emit('auth', state.user.id)
      //   state.isConnected = true
      // }
      // console.log('connected')
    },
    SOCKET_disconnect (state) {
      if (state.socket) {
        state.socket.disconnect();
        state.isConnected = false;
      }
      // state.isConnected = false
      // console.log('disconnected')
    },
    SOCKET_chat: async (state, data) => {
      try {
        const token = localStorage.getItem('token')
        const headers = { 'x-auth-token': token }
        if (data.id_conversation === state.selectedConvo) {
          if (!state.newMessage) {
            state.newMessage = data
            state.convos.forEach((convo, i) => {
              if (convo.id_conversation === state.selectedConvo) {
                socket.emit('seenConvo', {
                  user: convo.user_id,
                  convo: convo.id_conversation
                })
                state.convos[i].message = data.message
                state.convos[i].message_from = data.id_from
                console.log('SOCKET_chat')
              }
            })
            const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/update`
            const body = { id: state.selectedConvo }
            await axios.post(url, body, { headers })
            console.log('SOCKET_chat')
          }
        } else {
          state.notif.push({ ...data, type: 'chat' })
          state.convos.forEach(cur => {
            if (cur.id_conversation === data.id_conversation) {
              cur.last_update = new Date()
              cur.message = data.message
              cur.message_from = data.id_from
            }
          console.log('SOCKET_chat')
          })
          // eslint-disable-next-line camelcase
          const { id_from, id_to, id_conversation } = data
          // eslint-disable-next-line camelcase
          const body = { id_to, id_from, type: 'chat', id_conversation }
          const url = `${import.meta.env.VITE_APP_API_URL}/api/notif/add`
          await axios.post(url, body, { headers }) // replaced Vue.http.post with axios.post
          console.log('SOCKET_chat')
        }
        console.log('SOCKET_chat')
      } catch (err) {
        console.error('err SOCKET_chat in frontend/socket.js ===> ', err)
      }
    },
    SOCKET_typing: (state, data) => {
      if (!state.typingSec.convos.some(cur => cur.id_conversation === data.id_conversation)) {
        state.typingSec.convos.push(data)
        state.typingSec.status = !!state.typingSec.convos.length
      }
      console.log('SOCKET_typing')
    },
    SOCKET_seenConvo: (state, convo) => {
      if (state.selectedConvo === convo) {
        state.seenConvo = true
      }
      console.log('SOCKET_seenConvo')
    },
    SOCKET_match: async (state, data) => {
      state.notif.push({
        is_read: 0,
        type: data.type,
        date: data.date,
        id_from: data.id_from,
        username: data.username,
        profile_image: data.profile_image
      })
      if (data.type === 'like' || data.type === 'like_back') {
        state.followers.push({
          id: data.id_from,
          profile_image: data.profile_image,
          username: data.username,
          match_date: data.date
        })
        if (data.type === 'like_back') {
          const url = `${import.meta.env.VITE_APP_API_URL}/api/chat/all`
          const headers = { 'x-auth-token': state.user.token }
          const result = await axios.get(url, { headers })
          state.convos = result.body
        }
      } else if (data.type === 'unlike') {
        state.followers = state.followers.filter(cur => cur.id !== data.id_from)
        state.convos.forEach((cur, i) => {
          if (cur.user_id === data.id_from) {
            if (state.selectedConvo === cur.id_conversation) {
              state.selectedConvo = null
            }
            state.convos.splice(i, 1)
          }
        })
      }
      console.log('SOCKET_match')
    },
    SOCKET_visit: (state, data) => {
      state.notif.push({
        is_read: 0,
        type: data.type,
        date: data.date,
        id_from: data.id_from,
        username: data.username,
        profile_image: data.profile_image
      })
      state.visitor.push({
        id: data.id_from,
        profile_image: data.profile_image,
        username: data.username,
        visit_date: data.date
      })
      console.log('SOCKET_visit')
    },
    SOCKET_block: (state, id) => {
      state.blockedBy.push(id)
      const convo = state.convos.find(cur => cur.user_id === id)
      const arr = ['visitor', 'visited', 'notif', 'convos', 'followers', 'following']
      arr.forEach(cur => (state[cur] = utility.filterBlocked(state, cur)))
      if (convo && state.selectedConvo === convo.id_conversation) state.selectedConvo = null
      console.log('SOCKET_block')
    },
    SOCKET_online: (state, online) => {
      state.online = online.filter(cur => cur !== state.user.id).map(cur => Number(cur))
      console.log('Utilisateurs en ligne :', state.online)
      console.log('SOCKET_online')
    },
    SOCKET_out: (state, online) => {
      if (!online.find(cur => cur === state.user.id)) {
        state.status = false
        state.user = {}
        state.isConnected = false
        state.typing = false
        state.blocked = []
        state.location = {}
        state.seenConvo = false
        state.convos = []
        state.notif = []
        state.blockedBy = []
        state.followers = []
        state.following = []
        state.newMessage = null
        state.selectedConvo = null
        state.visited = []
        state.visitor = []
        state.imageConvo = null
      } else {
        state.online = online.filter(cur => cur !== state.user.id).map(cur => Number(cur))
      }
      console.log('SOCKET_out')
    }
  }
}