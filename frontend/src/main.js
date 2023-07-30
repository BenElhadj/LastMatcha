import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { store } from '@/stores/store'
import quasarUserOptions from '../quasar.config.js'
import router from './router'
import App from './App.vue'
import 'quasar/dist/quasar.css'
import './assets/main.css'

const app = createApp(App)

app.use(Quasar, quasarUserOptions)
app.use(store)
app.use(router)

app.mount('#app')
