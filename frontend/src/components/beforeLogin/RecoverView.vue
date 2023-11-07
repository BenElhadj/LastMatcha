<template>
  <q-layout>
    <q-page-container class="recover mt-4">
      <q-form class="recover mt-5 my-4">
      <!-- <form v-if="notSubmited && !loading" class="my-4" @submit.prevent="submit"> -->
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

            <q-btn block large color="primary" @click="submit" class="my-5" type="submit">Submit</q-btn>

            <div class="row justify-end">
              <q-btn flat label="Have an account? Login" color="primary" to="/login"></q-btn>
              <q-btn flat label="Don't have an account? Sign up" color="primary" to="/register"></q-btn>
            </div>

          </q-form>
        </div>
      </q-form>
      <q-btn v-if="!notSubmited && !loading" color="primary" large block to="/" class="mt-5 py-3">
        Go back
      </q-btn>
      <!-- <LoaderView v-if="loading" /> -->
      <AlertView :alert="alert"></AlertView>
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
const notSubmited = ref(true)
const valid = ref(false)
const loading = ref(true)
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
const alert = {
  state: false,
  color: '',
  text: ''
}
const router = useRouter()

const user = computed(() => store.state.user)

onMounted(async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 100));
    const headers = {
      'x-auth-token': localStorage.getItem('token'), // Récupérez le token du localStorage
      'x-auth-key': localStorage.getItem('key'), // Récupérez la clé du localStorage
    };
    console.log('headers ===> ', headers);
    console.log('token ===> ', localStorage.getItem('token'));
    console.log('key ===> ', localStorage.getItem('key'));
    const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/recover`;
    const res = await axios.get(url, { headers });
    loading.value = false;
    if (res.status === 200) {
      router.replace('/recover').catch(err => {
        console.error('err onMounted router.replace in frontend/RecoverView.vue ===> ', err);
      });
    } else {
      router.push('/404');
    }
  } catch (err) {
    console.error('err onMounted in frontend/RecoverView.vue ===> ', err);
  }
});



const submit = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const key = localStorage.getItem('key')
    const headers = { 'x-auth-token': token }
    console.log('key ===> ', key)
    console.log('token ===> ', token)
    const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/rkeycheck`
    const data = { key, password: password.value }
    const res = await axios.post(url, data, { headers })
    loading.value = false
    if (res.data.ok) {
      notSubmited.value = false
      alert.state = true
      alert.color = 'green'
      alert.text = 'Votre mot de passe a été réinitialisé !'
    } else {
      alert.state = true
      alert.color = 'red'
      alert.text = 'Oups, une erreur s\'est produite. Merci de réessayer.'
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
