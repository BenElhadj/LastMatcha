<template>
  <q-layout>
    <q-page class="forgot mt-5">
      <h1 class="page-header font-weight-light text-primary">
        Réinialisation de mot de passe
      </h1>
      <p class="subheading text-primary mt-3">
        Veuillez fournir votre adresse e-mail afin de changer votre mot de passe
      </p>
      <div class="row q-gutter-sm">
        <q-input v-model="email" outlined label="Email" require class="my-5" @keyup.enter="recover"></q-input>
        <q-btn large outline color="primary" class="ml-0 py-3 send_btn" @click.prevent="recover">
          Envoyer
        </q-btn>
      </div>
      <AlertView :value="alert.state"></AlertView>
    </q-page>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import AlertView from '@/views/AlertView.vue'
import utility from '@/utility'
import axios from 'axios'

export default {
  name: 'ForgotView',
  components: { AlertView },
  setup () {
    const email = ref(null)
    const alert = ref({
      state: false,
      color: '',
      text: ''
    })

    const recover = async (e) => {
      if (email.value && email.value.length && /.+@.+/.test(email.value)) {
        const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/forget_password`
        const res = await axios.post(url, { email: email.value })
        email.value = ''
        if (res.data.ok) {
          showAlert('green', 'Please check your email ..')
        } else {
          showAlert('red', 'Ouups something went wrong!')
        }
      } else {
        showAlert('red', 'Please provide a valid email')
      }
    }

    const showAlert = (color, text) => {
      alert.value = {
        state: true,
        color,
        text
      }
    }

    return {
      email,
      alert,
      recover,
      ...utility
    }
  }
}
</script>

<style scoped>
.q-input--outline.q-input--single-line input {
  margin-top: 0 !important;
}

.theme--light.q-input--outline:not(.v-input--is-focused):not(.v-input--has-state)>.v-input__control>.v-input__slot:hover {
  box-shadow: none;
  border: 1px solid var(--color-primary);
}

.send_btn {
  height: 56px;
  margin-left: -1px !important;
}
</style>
