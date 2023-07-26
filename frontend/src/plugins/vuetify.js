import Vue from 'vue'
import Vuetify from 'vuetify'
// import 'vuetify/dist/vuetify.min.css'
// import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify)
export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: '#0E4BEF',
        secondary: '#e57373',
        accent: '#9c27b0',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196f3',
        success: '#4caf50'
      }
    }
  }
})
