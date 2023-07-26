<template>
  <q-page padding>
    <div class="register mt-5">
      <h1 class="text-h3 text-grey-7 mb-4">
        S'inscrire
      </h1>
      <form @submit.prevent="registerUser">
        <q-input
          v-model="firstname"
          class="my-3"
          :rules="rules.name"
          label="Nom"
          required
        />
        <q-input
          v-model="lastname"
          class="my-3"
          :rules="rules.name"
          label="Prénom"
          required
        />
        <q-input
          v-model="username"
          class="my-3"
          :rules="rules.username"
          label="Nom d'utilisateur"
          required
        />
        <q-input
          v-model="email"
          class="my-3"
          :rules="rules.email"
          label="E-mail"
          required
        />
        <q-input
          v-model="password"
          class="my-3"
          :rules="rules.password"
          label="Mot de passe"
          required
          :type="showPass ? 'password' : 'text'"
          @click:append="showPass = !showPass"
        />
        <q-input
          v-model="passwordConfirm"
          class="my-3"
          label="Confirmation du mot de passe"
          required
          :type="showConfPass ? 'password' : 'text'"
          :error-messages="passwordMatch()"
          @click:append="showConfPass = !showConfPass"
        />
        <q-btn
          type="submit"
          color="primary"
          class="my-5"
          :disable="valid"
        >
          Envoyer
        </q-btn>
      </form>
      <q-btn
        flat
        label="Déja membre? Se conncecter"
        to="/login"
      />
    </div>
    <AlertView :value="alert.state" />
  </q-page>
</template>

<script>
// Import axios
import axios from 'axios'
import AlertView from './Alert'
import utility from '../utility.js'

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
        v => !(/[^a-zA-Z\-]+/.test(v)) || 'Le nom doit contenir des lettres uniquement', // Check \- escape char
        v => (v.length >= 3 && v.length <= 255) || 'Le nom doit contenir entre 3 et 255 caractères'
      ],
      username: [
        v => !!v || 'This field is required',
        v => (v.length >= 8 && v.length <= 25) || 'Le nom d\'utilisateur doit contenir entre 8 et 25 caractères',
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
        const url = `${process.env.VUE_APP_API_URL}/api/users/add`
        const data = {
          first_name: this.firstname,
          last_name: this.lastname,
          username: this.username,
          email: this.email,
          password: this.password
        }
        const res = await axios.post(url, data)
        if (res.data.ok) {
          this.showAlert('green', res.data.status, this)
        } else {
          this.showAlert('red', res.data.msg, this)
        }
      } catch (err) {
        console.error(err)
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
