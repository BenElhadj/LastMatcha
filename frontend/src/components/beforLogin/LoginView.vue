<template>
  <q-page-container class="mt-4">
    <div class="login mt-5">
      <h1 class="page-header font-weight-light text-secondary">
        Se connecter
      </h1>
      <q-form
        v-model="valid"
        class="my-4"
      >
        <q-input
          v-model="username"
          color="primary"
          class="my-5"
          :rules="usernameRules"
          label="Nom d'utilisateur"
          required
        ></q-input>
        <q-input
          v-model="password"
          filled
          label="Mot de passe"
          type="password"
          :rules="passRules"
          required
          @keyup.enter="log"
        >
          <template #append>
            <q-icon
              :name="showPass ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPass = !showPass"
            />
          </template>
        </q-input>
        <q-btn
          block
          large
          color="primary"
          class="my-5"
          @click.prevent="log"
        >
          Se connecter
        </q-btn>
        <div class="row justify-end">
          <q-btn
            flat
            label="Mot de passe oublié"
            color="primary"
            to="/forgot"
          ></q-btn>
          <q-btn
            flat
            label="S'inscrire"
            color="primary"
            to="/register"
          ></q-btn>
        </div>
      </q-form>
    </div>
    <AlertView :value="alert.state"></AlertView>
  </q-page-container>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import AlertView from './Alert'
// import utility from '../utility.js'

export default {
  name: 'LoginView',
  components: {
    AlertView
  },
  setup () {
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

    const log = async () => {
      try {
        const url = `${process.env.VUE_APP_API_URL}/api/auth/login`
        const auth = {
          username: username.value,
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
          alert.value = { state: true, color: 'red', text: data.msg }
          // utility.showAlert('red', data.msg)
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
        console.error(err)
      }
    }

    const usernameRules = [
      v => !!v || 'This field is required',
      v => (v.length >= 8 && v.length <= 25) || 'Username must be between 8 and 25 characters long',
      v => !(/[^a-zA-Z0-9]+/.test(v)) || 'Username can contain only letters and numbers'
    ]

    const passRules = [
      v => !!v || 'This field is required',
      v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v) || 'Password must contain at least one uppercase, one lowercase, one number and one special char',
      v => v.length >= 8 || 'Password must be at least 8 characters long'
    ]

    return {
      username,
      usernameRules,
      password,
      valid,
      showPass,
      passRules,
      alert,
      log
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
