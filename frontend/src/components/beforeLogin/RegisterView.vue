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
          <q-input v-model="password" color="primary" class="my-3" :rules="rules.password" label="Password" hint="Choose your new password" filled :type="showPass ? 'text' : 'password'" @keyup.enter="registerUser">
            <template v-slot:append>
              <q-icon
                :name="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                class="cursor-pointer"
                @click="showPass = !showPass"
              ></q-icon>
            </template>
          </q-input>
          <q-input v-model="passwordConfirm" color="primary" class="my-3" :rules="rules.passwordConfirm" label="Confirm Password" hint="Confirm your password" filled :type="showConfPass ? 'text' : 'password'" @keyup.enter="registerUser" :error-messages="passwordMatch">
            <template v-slot:append>
              <q-icon
                :name="showConfPass ? 'mdi-eye' : 'mdi-eye-off'"
                class="cursor-pointer"
                @click="showConfPass = !showConfPass"
              ></q-icon>
            </template>
          </q-input>
          <q-btn block large color="primary" @click="registerUser"  class="my-5">Submit</q-btn>
          <div class="row justify-end">
            <q-btn flat label="Have an account? Login" color="primary" to="/login"></q-btn>
          </div>
        </q-form>
      </div>
      <AlertView :alert="alert"></AlertView>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import axios from 'axios'
import AlertView from '@/views/AlertView.vue'
import utility from '@/utility.js'
import { ref, computed } from 'vue'
import { useStore } from 'vuex'

const firstname = ref('')
const lastname = ref('')
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const email = ref('')
const valid = ref(false)
const showPass = ref(false)
const showConfPass = ref(false)

const alert = ref({
  state: false,
  color: '',
  text: ''
});

const rules = {
  name: [
    v => !!v || 'Firstname and Lastname field is required',
    // eslint-disable-next-line
    v => !(/[^a-zA-Z\- ]+/.test(v)) || 'Name must contain letters only',
    v => (v.length >= 3 && v.length <= 255) || 'The name must contain between 3 and 255 characters'
  ],
  username: [
    v => !!v || 'Username field is required',
    v => (v.length >= 7 && v.length <= 25) || 'Username must be between 8 and 25 characters',
    v => !(/[^a-zA-Z0-9]+/.test(v)) || 'Username must contain letters and numbers only'
  ],
  email: [
    v => !!v || 'Email field is required',
    v => /.+@.+/.test(v) || 'Invalid email'
  ],
  password: [
    v => !!v || 'Password field is required',
    v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v) || 'The password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    v => v.length >= 8 || 'Password must contain at least 8 characters'
  ],
  passwordConfirm: [
    v => !!v || 'Confirm Password field is required',
    v => v === password.value || 'Passwords do not match',
  ]
}
const registerUser = async () => {
  if (passwordConfirm.value !== password.value)
    return alert.value = { state: true, color: 'red', text: 'Passwords do not match'}
  else {
    try {
      const url = `${import.meta.env.VITE_APP_API_URL}/api/users/add`;
      const data = {
        first_name: firstname.value,
        last_name: lastname.value,
        username: username.value,
        email: email.value,
        password: password.value,
        passwordConfirm: passwordConfirm.value
      };
      const res = await axios.post(url, data)
      if (res.data.ok) {
        alert.value.state = true;
        alert.value.color = 'green';
        alert.value.text = 'please check your email to finalize your registration'
      } else {
        alert.value.state = true;
        alert.value.color = 'red';
        alert.value.text = res.data.msg;
      }
    } catch (err) {
      console.error('err registerUser in frontend/RegisterView.vue ===> ', err)
    }
  }
};

const passwordMatch = () => {
  return utility.passMatch(passwordConfirm.value, password.value)
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
