import { createApp } from 'vue'
import { store } from '@/stores/store'
import { Quasar } from 'quasar'
import quasarUserOptions from '../quasar.config.js'
import router from '@/router/index'
import '@/assets/main.css'
import 'quasar/dist/quasar.css'

import App from '@/App.vue'



const app = createApp(App)

app.use(Quasar, quasarUserOptions)
app.use(store)
app.use(router)

app.mount('#app')
