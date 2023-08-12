import utility from '@/utility'
import axios from 'axios'

export const allTags = {
    state: {
        allTags: []
    },
    mutations: {
        setAllTags: (state, allTags) => {
            state.allTags = allTags
        }
    },
    actions: {
        getAllTags: async ({ commit }) => {
            try {
              const allTags = await utility.getAllTags()
              commit('setAllTags', allTags)
            } catch (err) {
              console.error('err getAllTags in frontend/user.js ===> ', err)
            }
        }
    },
}