import { createApp } from 'vue'
import { store } from '@/stores/store'


import { Quasar } from 'quasar'
import router from '@/router/index'

import '@quasar/extras/roboto-font/roboto-font.css'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import '@quasar/extras/eva-icons/eva-icons.css'
import '@quasar/extras/themify/themify.css'
import '@quasar/extras/line-awesome/line-awesome.css'
import '@quasar/extras/bootstrap-icons/bootstrap-icons.css'

import 'quasar/src/css/index.sass'


import App from '@/App.vue'

const app = createApp(App)

app.use(Quasar, {
    plugins: {}, // import Quasar plugins and add here
    /*
    config: {
      brand: {
        // primary: '#e46262',
        // ... or all other brand colors
      },
      notify: {...}, // default set of options for Notify Quasar plugin
      loading: {...}, // default set of options for Loading Quasar plugin
      loadingBar: { ... }, // settings for LoadingBar Quasar plugin
      // ..and many more (check Installation card on each Quasar component/directive/plugin)
    }
    */
  })
app.use(store)
app.use(router)

app.mount('#app')
