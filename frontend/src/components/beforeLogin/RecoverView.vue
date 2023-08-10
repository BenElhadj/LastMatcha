<template>
  <q-layout>
    <q-container class="recover mt-5">
      <form v-if="notSubmited && !loading" class="my-4" @submit.prevent="submit">
        <div class="row justify-center">
          <div class="col-xs-12">
            <h1 class="text-h5 mb-5 font-weight-light text-grey-7">
              Reset password
            </h1>
          </div>
          <div class="col-md-8 col-sm-10 col-xs-12">
            <q-input v-model="password" filled :rules="passRules" label="New password" :type="showPass ? 'text' : 'password'" :append="showPass ? 'visibility_off' : 'visibility'" @click:append="showPass = !showPass"></q-input>
          </div>
          <div class="col-md-8 col-sm-10 col-xs-12">
            <q-input v-model="passwordConfirm" filled :rules="confPassRules" label="Confirm new password" :type="showConfPass ? 'text' : 'password'" :append="showConfPass ? 'visibility_off' : 'visibility'" @click:append="showConfPass = !showConfPass"></q-input>
          </div>
          <div class="col-md-8 col-sm-10 col-xs-12">
            <q-btn color="primary" size="large" block :disable="!valid" class="mt-5 text-white" @click="submit">
              Submit
            </q-btn>
          </div>
        </div>
      </form>
      <q-btn v-if="!notSubmited && !loading" color="primary" large block to="/" class="mt-5 py-3">
        Go back
      </q-btn>
      <LoaderView v-if="loading" />
      <AlertView :value="alert.state"></AlertView>
    </q-container>
  </q-layout>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import AlertView from '@/views/AlertView.vue'
import LoaderView from '@/views/LoaderView.vue'
import utility from '@/utility.js'
import router from '@/router/index'
import axios from 'axios'

export default {
  name: 'RecoverView',
  components: {
    AlertView,
    LoaderView
  },
  setup () {
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
      v => !!v || 'This field is required'
    ]
    const alert = {
      state: false,
      color: '',
      text: ''
    }

    const user = computed(() => store.state.user)

    onMounted(async () => {
      try {
        const token = localStorage.getItem('token')
        const key = localStorage.getItem('key')
        const headers = { 'x-auth-token': token }
        const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/recover`
        const res = await axios.get(url, { key }, { headers })
        this.loading = false
        if (res.ok) {
          router.replace('/recover').catch(err => {
            console.error('err onMounted router.replace in frontend/RecoverView.vue ===> ', err)
          })
        } else {
          this.$router.push('/404')
        }
      } catch (err) {
        console.error('err onMounted in frontend/RecoverView.vue ===> ', err)
      }
    })

    const passwordMatch = () => {
      return !passwordConfirm.value.length || password.value === passwordConfirm.value ? '' : 'Les mots de passe ne correspondent pas'
    }

    const submit = async () => {
      this.loading = true
      try {
        const token = localStorage.getItem('token')
        const key = localStorage.getItem('key')
        const headers = { 'x-auth-token': token }
        const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/rkeycheck`
        const data = { key, password: this.password }
        const res = await axios.post(url, data, { headers })
        this.loading = false
        if (res.data.ok) {
          this.notSubmited = false
          this.showAlert('green', 'Votre mot de passe a été réinitialisé !', this)
        } else {
          this.showAlert('red', 'Oups, une erreur s\'est produite. Merci de réessayer.', this)
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

    return {
      password,
      passwordConfirm,
      notSubmited,
      valid,
      loading,
      showPass,
      showConfPass,
      passRules,
      confPassRules,
      alert,
      user,
      beforeDestroy,
      passwordMatch,
      submit
    }
  },
  methods: {
    ...utility
  }
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
</style>
