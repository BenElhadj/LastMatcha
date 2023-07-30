<template>
  <q-layout class="mt-4">
    <div class="login mt-5">
      <h1 class="page-header text-h3 text-secondary">Login</h1>
      <q-form @submit.prevent="log" class="my-4">
        <q-input
          v-model="username"
          color="primary"
          class="my-5"
          :rules="usernameRules"
          label="Username"
          required
        ></q-input>
        <q-input
          v-model="password"
          color="primary"
          class="my-5"
          :rules="passRules"
          label="Password"
          :type="showPass ? 'text' : 'password'"
          @keyup.enter="log"
        >
          <template #append>
            <q-icon
              :name="showPass ? 'eye-slash' : 'eye'"
              class="cursor-pointer"
              @click="showPass = !showPass"
            />
          </template>
        </q-input>
        <q-btn block large color="primary" class="my-5" type="submit">Login</q-btn>
        <div class="row justify-end">
          <q-btn flat label="Forgot password" color="primary" to="/forgot"></q-btn>
          <q-btn flat label="Don't have an account? Sign up" color="primary" to="/register"></q-btn>
        </div>
      </q-form>
    </div>
    <AlertView :message="alert"></AlertView>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AlertView from '@/views/AlertView.vue'
import utility from '@/utility.js'

export default {
  name: 'LoginView',
  components: {
    AlertView
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const username = ref('')
    const password = ref('')
    const valid = ref(false)
    const showPass = ref(false)
    const alert = ref({
      state: false,
      color: '',
      text: ''
    })

    const nameRules = ref([
      v => !!v || 'This field is required',
      v => !(/[^a-zA-Z \-]+/.test(v)) || 'Name can contain only letters',
      v => (v.length >= 3 && v.length <= 255) || 'Name must be at least 3 characters long'
    ])
    const usernameRules = ref([
      v => !!v || 'This field is required',
      v => (v.length >= 8 && v.length <= 25) || 'Username must be between 8 and 25 characters long',
      v => !(/[^a-zA-Z0-9]+/.test(v)) || 'Username can contain only letters and numbers'
    ])
    const emailRules = ref([
      v => !!v || 'This field is required',
      v => /.+@.+/.test(v) || 'E-mail must be valid'
    ])
    const passRules = ref([
      v => !!v || 'This field is required',
      v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v) || 'Password must contain at least one uppercase, one lowercase, one number and one special char',
      v => v.length >= 8 || 'Password must be at least 8 characters long'
    ])

    const log = async () => {
      console.log("================== VUE_APP_API_URL:", process.env.VUE_APP_API_URL)
      try {
        const url = `http://localhost:5173/api/auth/login`
        console.log("====================== URL for login: ", url)
        const auth = {
          username: username.value,
          password: password.value
        }
        const res = await axios.post(url, auth)
        console.log("===================== Response:", res);
        if (res.data.msg) {
          alert.value = { state: true, color: 'red', text: data.msg }
          utility.showAlert('red', res.data.msg, alert)
        } else {
          const user = res.data
          if (user.id) {
            if (user.birthdate) {
              user.birthdate = new Date(user.birthdate).toISOString().substr(0, 10)
            }
            store.dispatch('login', user)
            utility.updateLocation()
            router.push('/')
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    const checkLogin = async () => {
      try {
        const token = localStorage.getItem('token')
        const url = `http://localhost:5173/api/auth/isloggedin`
        console.log("====================== URL for checking login status:", process.env.VUE_APP_API_URL)
        const headers = { 'x-auth-token': token }
        const res = await axios.get(url, { headers })
        if (!res.data.msg) router.push('/')
      } catch (err) {
        console.log('Got error here -->', err)
      }
    }

    checkLogin()

    return {
      username,
      password,
      valid,
      showPass,
      alert,
      log,
      nameRules,
      usernameRules,
      emailRules,
      passRules
    }
  }
}
</script>

<style>
.alert-enter-active, .alert-leave-active, .register {
    transition: all .5s;
}
.alert-enter, .alert-leave-to {
    opacity: 0;
}
.login, .alert {
    width: 100%;
    max-width: 40rem;
    margin: auto;
}
.alert {
    position: absolute;
    left: 50%;
    top: 1rem;
    transform: translateX(-50%);
}
.google {
    text-decoration: none;
}
</style>

