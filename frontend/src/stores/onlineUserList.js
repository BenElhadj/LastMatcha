import utility from '@/utility'
import axios from 'axios'

export const onlineUserList = {
    state: {
        onlineUserList: []
    },
    mutations: {
        setOnlineUserList: (state, onlineUserList) => {
            state.onlineUserList = onlineUserList
        }
    },
    actions: {
        getOnlineUserList: async ({ commit }) => {
            try {
              const onlineUserList = await utility.getOnlineUserList()
              commit('setOnlineUserList', onlineUserList)
            } catch (err) {
              console.error('err getOnlineUserList in frontend/user.js ===> ', err)
            }
        }
    },
}