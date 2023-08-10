<template>
  <q-page-container>
    <h1 class="py-3 mb-4">
      Paramètres
    </h1>
    <div class="q-pa-md row justify-center">
      <div class="col-xs-12 col-sm-6 q-pa-md">
        <div class="row items-center">
          <q-input v-model="user.email" class="col" disabled label="Email" color="primary"></q-input>
          <q-icon class="col-auto q-ml-md" color="primary" name="edit" @click="emailDialog = true"></q-icon>
        </div>
      </div>
      <div class="col-xs-12 col-sm-6 q-pa-md">
        <div class="row items-center">
          <q-input class="col" disabled color="primary" value="**********" label="Password" type="password"></q-input>
          <q-icon class="col-auto q-ml-md" color="primary" name="edit" @click="passDialog = true"></q-icon>
        </div>
      </div>
      <div class="col-xs-12">
        <q-btn outline block large color="primary" @click="openLoc">
          <span>Changer la location</span>
          <q-icon right name="place"></q-icon>
        </q-btn>
      </div>
    </div>
    <q-expansion-item v-model="blacklistPanel" :disable="closePanel" class="blacklist" expand-icon="arrow_downward" default-opened label="Liste des utilisateurs bloqués">
      <q-list class="blacklist_list">
        <q-item v-for="banned in blacklist" :key="banned.id" class="blacklist_item mx-2">
          <q-item-section>
            <q-item-label>{{ banned.username }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="close" @click="unBlock(banned)"></q-icon>
          </q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
    <q-dialog v-if="reRender" v-model="emailDialog" max-width="500" persistent>
      <q-card class="q-pa-md q-ma-md">
        <h5 class="display-1 text-xs-center text-md-left pt-3 pb-3 mb-4 hidden-sm-and-down">
          Changer l'email
        </h5>
        <div class="my-4">
          <q-input v-model="password" color="primary" label="Current password" :rules="passRules" required :type="showPass ? 'text' : 'password'">
            <template #append>
              <q-icon :name="showPass ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPass = !showPass"></q-icon>
            </template>
          </q-input>
          <q-input v-model="email" color="primary" class="my-3" :rules="emailRules" label="Email" required></q-input>
        </div>
        <q-card-actions :align="right">
          <q-btn flat color="primary" :disable="!valid" @click="saveEmail">
            Enregistrer
          </q-btn>
          <q-btn flat color="primary" @click="closeEmail">
            Annuler
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-if="reRender" v-model="passDialog" max-width="500px" persistent>
      <q-card class="q-pa-md q-ma-md">
        <h5 class="display-1 text-center text-md-left pt-3 pb-3 mb-4 hidden-sm-and-down">
          Changer le mot de passe
        </h5>
        <div class="my-4">
          <q-input v-model="password" color="primary" class="mb-4" :rules="passRules" label="Current password" autocomplete="off" required :type="showPass ? 'text' : 'password'">
            <template #append>
              <q-icon :name="showPass ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPass = !showPass"></q-icon>
            </template>
          </q-input>
          <q-input v-model="newPassword" color="primary" class="mb-4" :rules="passRules" label="New password" autocomplete="off" required :type="showNewPass ? 'text' : 'password'">
            <template #append>
              <q-icon :name="showNewPass ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showNewPass = !showNewPass"></q-icon>
            </template>
          </q-input>
          <q-input v-model="confNewPassword" color="primary" class="mb-4" label="Confirm new password" autocomplete="off" required :type="showConfNewPass ? 'text' : 'password'" :error="!passwordMatch()">
            <template #append>
              <q-icon :name="showConfNewPass ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showConfNewPass = !showConfNewPass"></q-icon>
            </template>
          </q-input>
        </div>
        <q-card-actions :align="right">
          <q-btn flat color="primary" :disable="!valid" @click="savePass">
            Enregistrer
          </q-btn>
          <q-btn flat color="primary" @click="closePass">
            Annuler
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="locDialog" fullscreen transition-show="fade" transition-hide="fade">
      <q-card>
        <q-toolbar dark color="primary">
          <q-btn flat icon="close" @click="locDialog = false"></q-btn>
          <q-toolbar-title>Location</q-toolbar-title>
          <q-space></q-space>
          <q-btn flat label="Enregistrer" @click="changeLoc"></q-btn>
        </q-toolbar>
        <map-location-selector :latitude="latitude" :longitude="longitude" @location-updated="locationUpdated"></map-location-selector>
      </q-card>
    </q-dialog>
    <AlertView :value="alert.state"></AlertView>
  </q-page-container>
</template>

<script>
import { ref, reactive, watch, computed, nextTick } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import AlertView from '@/views/AlertView.vue'

// import mapLocationSelector from 'vue-google-maps-location-selector/src/GoogleMapsLocationSelector'
import mapLocationSelector from 'vue-google-maps-location-selector'


export default {
  name: 'ProfileSettings',
  components: {
    AlertView,
    mapLocationSelector
  },
  setup () {
    const flag = ref(false)
    const valid = ref(false)
    const reRender = ref(true)
    const showPass = ref(false)
    const locDialog = ref(false)
    const passDialog = ref(false)
    const showNewPass = ref(false)
    const emailDialog = ref(false)
    const blacklistPanel = ref(true)
    const showConfNewPass = ref(false)
    const password = ref('')
    const newPassword = ref('')
    const confNewPassword = ref('')
    const email = ref('')
    const loc = reactive({
      lat: null,
      lng: null
    })
    const alert = reactive({
      state: false,
      color: '',
      text: ''
    })
    const passRules = [
      v => !!v || 'Ce champ est obligatoire',
      v => /^(?=.*\d)(?=.*[A-Za-z])[0-9A-Za-z!@#$%]+$/.test(v) || 'Le mot de passe doit contenir au moins une lettre et un chiffre et un caractère spécial',
      v => v.length >= 8 || 'Le mot de passe doit contenir au moins 8 caractères'
    ]
    const emailRules = [
      v => !!v || 'Ce champ est obligatoire',
      v => /.+@.+/.test(v) || 'E-mail invalide'
    ]
    const colors = [
      '#03A9F4',
      '#43A047',
      '#E64A19',
      '#D81B60',
      '#263238'
    ]
    const store = useStore()

    const user = computed(() => store.getters.user)
    const blocked = computed(() => store.getters.blocked)
    const location = computed(() => store.getters.location)
    const blockedBy = computed(() => store.getters.blockedBy)
    const blacklist = computed(() => store.getters.blacklist)

    const latitude = computed(() => Number(location.value.lat))
    const longitude = computed(() => Number(location.value.lng))
    const closePanel = computed(() => {
      if (!blacklist.value.length) {
        return true
      }
      return false
    })

    const syncBlacklist = store.dispatch('syncBlacklist')
    const updateUserEmail = store.dispatch('updateUserEmail')

    const googleLoaded = () => {
      return (typeof window.google === 'object' && typeof window.google.maps === 'object')
    }

    const openLoc = () => {
      locDialog.value = true
      flag.value = googleLoaded()
    }

    const httpPost = async (url, data, headers) => {
      try {
        const response = await axios.post(url, data, { headers })
        return response.data
      } catch (err) {
        console.error('err async httpPost in frontend/ProfileSettings.vue ===> ', err)
      }
    }

    const showAlert = (color, msg) => {
      alert.state = true
      alert.color = color
      alert.text = msg
    }
    const saveEmail = async () => {
      try {
        const url = `${import.meta.env.VITE_APP_API_URL}/api/users/changeemail`
        const headers = { 'x-auth-token': user.value.token }
        const data = {
          email: email.value,
          password: password.value
        }
        const res = await httpPost(url, data, headers)
        password.value = ''
        valid.value = false
        if (res.ok) {
          showAlert('green', 'Your email has been updated')
          emailDialog.value = false
          updateUserEmail(email.value)
          email.value = ''
          reRenderComp()
        } else {
          showAlert('red', res.msg)
        }
      } catch (err) {
        console.error('err saveEmail in frontend/ProfileSettings.vue ===> ', err)
      }
    }

    const savePass = async () => {
      try {
        const url = `${import.meta.env.VITE_APP_API_URL}/api/users/changepassword`
        const headers = { 'x-auth-token': user.value.token }
        const data = {
          password: password.value,
          newPassword: newPassword.value,
          confNewPassword: confNewPassword.value
        }
        const res = await httpPost(url, data, headers)
        password.value = ''
        newPassword.value = ''
        confNewPassword.value = ''
        valid.value = false
        reRenderComp()
        if (res.ok) {
          showAlert('green', 'Your password has been updated')
          passDialog.value = false
        } else {
          showAlert('red', res.msg)
        }
      } catch (err) {
        console.error('err savePass in frontend/ProfileSettings.vue ===> ', err)
      }
    }

    const closeEmail = () => {
      emailDialog.value = false
      password.value = ''
      email.value = ''
      reRenderComp()
    }

    const closePass = () => {
      passDialog.value = false
      password.value = ''
      newPassword.value = ''
      confNewPassword.value = ''
      reRenderComp()
    }

    const reRenderComp = () => {
      reRender.value = false
      nextTick(() => (reRender.value = true))
    }

    const passwordMatch = () => {
      return (confNewPassword.value === newPassword.value) || 'Passwords do not match!'
    }

    const locationUpdated = (loc) => {
      loc.value = loc
    }

    const changeLoc = async () => {
      locDialog.value = false
      const url = `${import.meta.env.VITE_APP_API_URL}/api/users/location`
      const headers = { 'x-auth-token': user.value.token }
      const result = await httpPost(url, loc.value, { headers })
      if (result.ok) {
        store.commit('locate', loc.value)
        showAlert('green', 'Your location has been updated')
      } else {
        showAlert('red', result.msg)
      }
    }

    const unBlock = async (banned) => {
      const { id, username } = banned
      const url = `${import.meta.env.VITE_APP_API_URL}/api/users/unblock`
      const headers = { 'x-auth-token': user.value.token }
      const result = await httpPost(url, { id }, { headers })
      if (result.ok) {
        const blacklist = {
          blocked: blocked.value.filter(cur => cur !== id) || [],
          blockedBy: blockedBy.value
        }
        store.commit('syncBlocked', blacklist)
        syncBlacklist(blacklist.blocked)
        showAlert('green', `${username} has been unblocked`)
      } else {
        showAlert('red', result.msg)
      }
    }

    watch(location, (newLocation) => {
      loc.lat = Number(newLocation.lat)
      loc.lng = Number(newLocation.lng)
    }, { immediate: true })

    return {
      flag,
      valid,
      reRender,
      showPass,
      locDialog,
      passDialog,
      showNewPass,
      emailDialog,
      blacklistPanel,
      showConfNewPass,
      password,
      newPassword,
      confNewPassword,
      email,
      loc,
      alert,
      passRules,
      emailRules,
      colors,
      user,
      blocked,
      location,
      blockedBy,
      blacklist,
      latitude,
      longitude,
      closePanel,
      syncBlacklist,
      updateUserEmail,
      googleLoaded,
      openLoc,
      saveEmail,
      savePass,
      closeEmail,
      closePass,
      reRenderComp,
      passwordMatch,
      locationUpdated,
      changeLoc,
      unBlock
    }
  }
}

</script>

<style>
.map_toolbar {
  z-index: 5;
}

.map-container {
  position: initial !important;
}

.blacklist {
  box-shadow: none;
  border: 1px solid var(--color-primary);
  border-radius: 3px;
}

.blacklist > li,
.blacklist_list,
.blacklist_item {
  background-color: #fafafa !important;
}

.expansion_list {
  color: #666;
}

.v-expansion-panel__header {
  padding: 8px 24px;
}

.color_picker {
  width: 4rem;
  height: 4rem;
  margin: 1vw 2vw;
  border-radius: 5px;
  cursor: pointer;
}
</style>
