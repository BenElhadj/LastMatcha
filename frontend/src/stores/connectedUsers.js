import utility from '@/utility'
import axios from 'axios'

export const connectedUsers = {
    state: {
        connectedUsers: []
    },
    mutations: {
      setConnectedUsers: (state, connectedUsers) => {
            state.connectedUsers = connectedUsers
        }
    },
    actions: {
        getConnectedUsers: async ({ commit }) => {
            try {
              // const response = await axios.get('/connectedUsers')
              // commit('setConnectedUsers', response.data)
              const connectedUsers = await utility.getConnectedUsers()
              // console.log('---> connectedUsers in getConnectedUsers at connectedUsers.js ===> ', connectedUsers)
              commit('setConnectedUsers', connectedUsers)
            } catch (err) {
              console.error('err getConnectedUsers in frontend/src/stores/ConnectedUsers.js ===> ', err)
            }
        }
    },
}