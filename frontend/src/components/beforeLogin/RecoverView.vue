<template>
  <q-layout>
    <q-page-container class="recover mt-4">
      <q-form class="recover mt-5 my-4">
        <div class="my-4">
          <h1 class="page-header text-h3 text-secondary">Reset password</h1>
          <q-form @submit.prevent="submit" class="my-4">
            
            <q-input v-model="password" color="primary" class="my-5" :rules="passRules" label="New password" :type="showPass ? 'text' : 'password'">
              <template #append>
                <q-icon :name="showPass ? 'mdi-eye-off' : 'mdi-eye'" class="cursor-pointer" @click="showPass = !showPass"/>
              </template>
            </q-input>

            <q-input v-model="passwordConfirm" color="primary" class="my-5" :rules="confPassRules" label="Confirm new password" :type="showConfPass ? 'text' : 'password'" @keyup.enter="submit">
              <template #append>
                <q-icon :name="showConfPass ? 'mdi-eye-off' : 'mdi-eye'" class="cursor-pointer" @click="showConfPass = !showConfPass"/>
              </template>
            </q-input>

            <q-btn block large color="primary" @click="submit" class="my-5" type="submit" :disabled="!valid">Submit</q-btn>

            <div class="row justify-end">
              <q-btn flat label="Have an account? Login" color="primary" to="/login"></q-btn>
              <q-btn flat label="Don't have an account? Sign up" color="primary" to="/register"></q-btn>
            </div>

          </q-form>
        </div>
      </q-form>
      <AlertView v-if="alert.state" :alert="alert"/>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import AlertView from '@/views/AlertView.vue'
import LoaderView from '@/views/LoaderView.vue'
import utility from '@/utility.js'
import { useRouter } from 'vue-router'
import axios from 'axios'

const store = useStore()
const password = ref('')
const passwordConfirm = ref('')
const submitting = ref(false)
const showPass = ref(false)
const showConfPass = ref(false)

const passRules = [
  v => !!v || 'This field is required',
  v => /^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]+$/.test(v) || 'Password must contain at least one letter, one number and one special char',
  v => v.length >= 8 || 'Password must be at least 8 characters long'
]
const confPassRules = [
  v => !!v || 'This field is required',
  v => v === password.value || 'Passwords do not match'
]
const valid = computed(() => {
  return passRules.every(rule => rule(password.value) === true) &&
         confPassRules.every(rule => rule(passwordConfirm.value) === true)
})

const alert = ref({
  state: false,
  color: '',
  text: ''
});
const router = useRouter()

const user = computed(() => store.state.user)

onMounted(async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 100))
        const params = new URLSearchParams(window.location.search)
        const key = params.get('key')
        const token = params.get('token')
        localStorage.setItem('key', key)
        localStorage.setItem('token', token)
        const headers = {
            'x-auth-token': token,
            'x-auth-key': key,
        };
    } catch (err) {
        console.error('err onMounted in frontend/RecoverView.vue ===> ', err)
    }
});

const submit = async () => {
  if (submitting.value) return
  try {
    submitting.value = true
    const token = localStorage.getItem('token')
    const key = localStorage.getItem('key')
    const headers = { 'x-auth-token': token }
    const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/rkeycheck`
    const data = { key, password: passwordConfirm.value }
    const res = await axios.post(url, data, { headers })
    if (res.data.ok) {
      alert.value = { state: true, color: 'green', text: 'Your password has been reset!'}
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (!alert.value.state) {
            clearInterval(interval)
            resolve()
          }
        }, 1000)
      })
      router.push('/')
    } else {
      alert.value = { state: true, color: 'red', text: res.data.msg ? res.data.msg : 'Oops, an error occurred. Please try again.'}
      await new Promise(resolve => {
        const interval = setInterval(() => {
          if (!alert.value.state) {
            clearInterval(interval)
            resolve()
          }
        }, 1000)
      })
      router.push('/forgot')
    }
  } catch (err) {
    console.error('err submit in frontend/RecoverView.vue ===> ', err)
  }
}

const beforeDestroy = async () => {
  const headers = { 'x-auth-token': user.value.token }
  const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/destroykey`
  await axios.get(url, { headers })
}

</script>

<style scoped>
.pass_reset_title {
  text-align: center;
}

.back_btn:hover,
.back_btn {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.recover, .alert {
  width: 100%;
  max-width: 40rem;
  margin: auto;
}
</style>
