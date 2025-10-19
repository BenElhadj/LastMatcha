import { api } from '../boot/axios'

export const auth = {
  state () {
    return {
      user: {},
      status: {},
      isConnected: false,
      typing: false,
      blocked: [],
      location: {},
      seenConvo: false,
      convos: [],
      notif: [],
      blockedBy: [],
      followers: [],
      following: [],
      newMessage: null,
      selectedConvo: null,
      visited: [],
      visitor: [],
      imageConvo: null
    }
  },
  mutations: {
    login (state, user) {
      state.status = true;
      state.user = user;
      if (!state.isConnected) {
        state.isConnected = true;
      }
    },
    logout(state) {
      state.status = false;
      state.user = {};
      state.isConnected = false;
      state.typing = false;
      state.blocked = [];
      state.location = {};
      state.seenConvo = false;
      state.convos = [];
      state.notif = [];
      state.blockedBy = [];
      state.followers = [];
      state.following = [];
      state.newMessage = null;
      state.selectedConvo = null;
      state.visited = [];
      state.visitor = [];
      state.imageConvo = null;
    }
  },
  actions: {
    async login({ commit, dispatch }, user) {
      try {
        if (user.id) {
          localStorage.setItem('token', user.token)
          const { lat, lng } = user
          commit('locate', { lat, lng })
          
          // Dispatch toutes les actions nécessaires
          await Promise.all([
            dispatch('getTags'),
            dispatch('getAllTags'),
            dispatch('getConnectedUsers'),
            dispatch('getNotif'),
            dispatch('syncHistory'),
            dispatch('syncMatches'),
            dispatch('syncConvoAll'),
            dispatch('syncBlocked', user.id)
          ])
          
          commit('login', user)
          return true
        }
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },
    
    logout({ commit }, id) {
      localStorage.removeItem('token')
      commit('logout')
    }
  }
}