import { createApp } from 'vue'
import { store } from '@/stores/store'
import '@mdi/font/css/materialdesignicons.min.css';
import Vue3TagsInput from 'vue3-tags-input'
import { Quasar } from 'quasar'
import router from '@/router/index'
import 'quasar/src/css/index.sass' 
import App from '@/App.vue'

const app = createApp(App)

app.use(Quasar)
app.use(Vue3TagsInput)
app.use(store)
app.use(router)

app.mount('#app')
