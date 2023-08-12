<template>
  <q-layout>
    <q-page-container class="mt-4">
      <div class="register mt-5">
        <h1 class="page-header text-h3 text-secondary">Register</h1>
        <q-form @submit.prevent="registerUser" class="my-4" ref="formRef">
          <q-input v-model="firstname" color="primary" class="my-3" :rules="rules.name" label="First name" required></q-input>
          <q-input v-model="lastname" color="primary" class="my-3" :rules="rules.name" label="Last name" required></q-input>
          <q-input v-model="username" color="primary" class="my-3" :rules="rules.username" label="Username" required></q-input>
          <q-input v-model="email" color="primary" class="my-3" :rules="rules.email" label="E-mail" required></q-input>
          <q-input v-model="password" color="primary" class="my-3" :rules="rules.password" label="Password" :type="showPass ? 'text' : 'password'" @keyup.enter="registerUser"></q-input>
          <q-input v-model="passwordConfirm" color="primary" class="my-3" label="Confirm Password" :type="showConfPass ? 'text' : 'password'" @keyup.enter="registerUser" :error-messages="passwordMatch"></q-input>
          <q-btn block large color="primary" @click="registerUser"  class="my-5">Submit</q-btn>
          <div class="row justify-end">
            <q-btn flat label="Have an account? Login" color="primary" to="/login"></q-btn>
          </div>
        </q-form>
      </div>
      <AlertView :message="alert"></AlertView>
    </q-page-container>
  </q-layout>
</template>

<script>
// Import axios
import axios from 'axios'
import AlertView from '@/views/AlertView.vue'
import utility from '@/utility.js'

export default {
  name: 'RegisterView',
  components: {
    AlertView
  },
  data: () => ({
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    passwordConfirm: '',
    email: '',
    valid: false,
    showPass: false,
    showConfPass: false,
    alert: {
      state: false,
      color: '',
      text: ''
    },
    rules: {
      name: [
        v => !!v || 'This field is required',
        // eslint-disable-next-line
        v => !(/[^a-zA-Z\- ]+/.test(v)) || 'Le nom doit contenir des lettres uniquement',
        v => (v.length >= 3 && v.length <= 255) || 'Le nom doit contenir entre 3 et 255 caractères'
      ],
      username: [
        v => !!v || 'This field is required',
        v => (v.length >= 7 && v.length <= 25) || 'Le nom d\'utilisateur doit contenir entre 8 et 25 caractères',
        v => !(/[^a-zA-Z0-9]+/.test(v)) || 'Le nom d\'utilisateur doit contenir des lettres et des chiffres uniquement'
      ],
      email: [
        v => !!v || 'This field is required',
        v => /.+@.+/.test(v) || 'E-mail invalide'
      ],
      password: [
        v => !!v || 'This field is required',
        v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v) || 'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial',
        v => v.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères'
      ]
    }
  }),
  methods: {
    ...utility,
    async registerUser () {
      try {
        const url = `${import.meta.env.VITE_APP_API_URL}/api/users/add`
        const data = {
          first_name: this.firstname,
          last_name: this.lastname,
          username: this.username,
          email: this.email,
          password: this.password
        }
        const res = await axios.post(url, data)
        console.log(res)
        if (res.data.ok) {
          this.showAlert('green', res.data.status, this)
        } else {
          this.showAlert('red', res.data.msg, this)
        }
      } catch (err) {
        console.error('err registerUser in frontend/RegisterView.vue ===> ', err)
      }
    },
    passwordMatch () {
      return this.passMatch(this.passwordConfirm, this.password)
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
.register, .alert {
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
</style>
