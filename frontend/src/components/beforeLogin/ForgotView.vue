<template>
  <q-layout>
    <q-page-container class="mt-4">
      <q-form class="forgot mt-5 my-4">
        <h1 class="page-header text-h3 text-secondary">Rreset password</h1>
        <q-form class="my-4">
          <p class="subheading text-primary mt-3">Please provide your email address to reset your password</p>
          <q-input v-model="email" color="primary" class="my-5" :rules="rules.email" label="Email" required @keyup.enter="recover"></q-input>
          <q-btn block large color="primary"  @click.prevent="recover" class="my-5" type="submit">Send</q-btn>
          <div class="row justify-end">
            <q-btn flat label="Have an account? Login" color="primary" to="/login"></q-btn>
            <q-btn flat label="Don't have an account? Sign up" color="primary" to="/register"></q-btn>
          </div>
        </q-form>
      </q-form>
      <AlertView :alert="alert" :redirect="true"/>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import AlertView from '@/views/AlertView.vue'
import utility from '@/utility'
import axios from 'axios'
import { useRouter } from 'vue-router'
 
const router = useRouter()
const email = ref(null)
const alert = ref({
  state: false,
  color: '',
  text: ''
})

const rules = {
  email: [
    v => !!v || 'Email field is required',
    v => /.+@.+/.test(v) || 'Invalid email'
  ]}

const emailRule = (v) => {
  if (!v || (v.length >= 10 && v.length <= 55 && /.+@.+/.test(v))) {
    return true
  }
  return alert.value = { state: true, color: 'red', text: 'Please provide a valid email and ensure it has a length between 10 and 55 characters.'}
}

const recover = async () => {
  if (emailRule(email.value) === true) {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/forget_password`
    const res = await axios.post(url, { email: email.value })
    email.value = ''
    if (res.data.ok) {
      alert.value = { state: true, color: 'green', text: res.data.msg ? res.data.msg : 'Please check your email ..'}
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (!alert.value.state) {
            clearInterval(interval)
            resolve()
          }
        }, 2000)
      })
    router.push('/login')
    } else {
      alert.value = { state: true, color: 'red', text: res.data.msg ? res.data.msg : 'Oops... something went wrong!'}
    }
  } else {
    alert.value = { state: true, color: 'red', text: 'Please provide a valid email and ensure it has a length between 10 and 55 characters.'}
  }
}
</script>


<style scoped>
.alert-enter-active, .alert-leave-active, .register {
  transition: all .5s;
}
.alert-enter, .alert-leave-to {
  opacity: 0;
}
.alert {
  position: absolute;
  left: 50%;
  top: 1rem;
  transform: translateX(-50%);
}
.forgot, .alert {
  width: 100%;
  max-width: 40rem;
  margin: auto;
}
</style>
