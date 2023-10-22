import { createApp } from 'vue'
import { store } from '@/stores/store'
import '@mdi/font/css/materialdesignicons.min.css';



import { Quasar } from 'quasar'
import router from '@/router/index'
// 
// import '@quasar/extras/roboto-font/roboto-font.css'
// import '@quasar/extras/material-icons/material-icons.css'
// import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
// import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
// import '@quasar/extras/eva-icons/eva-icons.css'
// import '@quasar/extras/themify/themify.css'
// import '@quasar/extras/line-awesome/line-awesome.css'
// import '@quasar/extras/bootstrap-icons/bootstrap-icons.css'


import 'quasar/src/css/index.sass' 


import App from '@/App.vue'

const app = createApp(App)

app.use(Quasar)
app.use(store)
app.use(router)

app.mount('#app')
