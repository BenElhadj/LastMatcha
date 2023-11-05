<template>
  <q-layout class="mt-4">
    <div class="login mt-5">
      <h1 class="page-header text-h3 text-secondary">Login</h1>
      <q-form @submit.prevent="log" class="my-4">
        <q-input v-model="identifier" color="primary" class="my-5" :rules="identifierRules" label="Username or Email" required></q-input>
        <q-input v-model="password" color="primary" class="my-5" :rules="passRules" label="Password" :type="showPass ? 'text' : 'password'" @keyup.enter="log">
          <template #append>
            <q-icon :name="showPass ? 'mdi-eye-off' : 'mdi-eye'" class="cursor-pointer" @click="showPass = !showPass"/>
          </template>
        </q-input>
        <q-btn block large color="primary" class="my-5" type="submit">Login</q-btn>
        <div class="row justify-end">
          <q-btn flat label="Forgot password" color="primary" to="/forgot"></q-btn>
          <q-btn flat label="Don't have an account? Sign up" color="primary" to="/register"></q-btn>
        </div>
      </q-form>
    </div>
    <AlertView :alert="alert"></AlertView>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import axios from 'axios'
import AlertView from '@/views/AlertView.vue'
import utility from '@/utility.js'

const store = useStore()
const router = useRouter()
const identifier = ref('')
const password = ref('')
const valid = ref(false)
const showPass = ref(false)
const alert = ref({
  state: false,
  color: '',
  text: ''
})

const identifierRules = ref([
  v => !!v || 'This field is required',
  v => (v.length >= 7 && v.length <= 55) || 'Must be between 7 and 255 characters long',
])

const passRules = ref([
  v => !!v || 'This field is required',
  v => v.length >= 8 || 'Must be at least 8 characters long'
])

const log = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/login`
    const auth = {
      identifier: identifier.value,
      password: password.value
    }
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(auth)
    })
    const data = await res.json()
    if (data.msg) {
      alert.value.state = true
      alert.value.color = 'red'
      alert.value.text = data.msg
    } else {
      const user = data
      if (user.id) {
        if (user.birthdate) {
          user.birthdate = new Date(user.birthdate).toISOString().substr(0, 10)
        }
        store.dispatch('login', user)
        router.push('/')
      }
    }
  } catch (err) {
    console.error('err async log in frontend/LoginView.vue ===> ', err)
  }
}

const checkLogin = async () => {
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/isloggedin`
    const headers = { 'x-auth-token': token }
    const res = await axios.get(url, { headers })
    if (!res.data.msg) router.push('/')
  } catch (err) {
    console.error('err checkLogin in frontend/LoginView.vue ===> ', err)
  }
}

checkLogin()
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
