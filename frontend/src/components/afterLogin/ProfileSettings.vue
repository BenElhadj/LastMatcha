<template>
  <q-page>
    <q-page-container>
      <h1  class="q-pb-md" style="margin-top: -10px; text-align: center;">Settings</h1>

      <div class="q-pa-md row flex flex-center justify-between" style="margin: 7%;">

        <div style="margin-" class="col-xs-12 col-sm-6 q-pa-md">
          <div class="row items-center">
            <!-- <q-input v-model="user.email" class="col" disabled label="Email" color="primary"></q-input> -->
            <img style="width: 130px; margin-left:7px" class="col-auto q-ml-md" src="@/assets/Settings/resetEmail.png" @click="passDialog = true"/>
            <q-input v-model="user.email" readonly label="Email"/>
          </div>
        </div>

        <div class="q-flex column items-center justify-center">
          <div class="align-center">
            <!-- <q-input class="col" disabled color="primary" value="test" label="Password" type="password"></q-input> -->
            <img style="width: 130px; margin-left:7px" class="col-auto q-ml-md" src="@/assets/Settings/resetPasswd.png" @click="passDialog = true"/>
            <q-input v-model="user.passe" readonly value="***********" label="Password" type="password"/>
          </div>
        </div>

      </div>

      <div class="q-pa-md row flex flex-center justify-between" style="margin: 7%;">

        <div class="q-flex column items-center justify-center">
          <div class="align-center">
            <img style="width: 150px; margin-left:7px" src="@/assets/Settings/geolocalisation.png" @click="openLoc" alt="Location Icon">
          </div>
          <span>Click here to update your location</span>
        </div>

        <div class="q-flex column items-center justify-center">
          <div class="align-center">
            <img style="width: 150px;" src="@/assets/Settings/blocked.png" @click="basic = true"/>
          </div>
          <span>Click here to view blocked users</span>
        </div>

      </div>


      <q-dialog v-if="reRender" v-model="emailDialog" max-width="500" persistent transition-show="rotate" transition-hide="rotate">
        <q-card class="q-pa-md q-ma-md">
          <h5 class="display-1 text-xs-center text-md-left pt-3 pb-3 mb-4 hidden-sm-and-down">
            Change your email
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
              Save
            </q-btn>
            <q-btn flat color="primary" @click="closeEmail">
              Cancel
            </q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-if="reRender" v-model="passDialog" max-width="500px" persistent transition-show="rotate" transition-hide="rotate">
        <q-card class="q-pa-md q-ma-md">
          <h5 class="display-1 text-center text-md-left pt-3 pb-3 mb-4 hidden-sm-and-down">
            Change your password
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
         
        </q-card>
      </q-dialog>

      <q-dialog v-model="locDialog" persistent maximized-toggle transition-show="rotate" transition-hide="rotate">
        <q-card style="position:initial; display:block;">
          <q-header>
            <q-bar>
              <span>{{ 'Longitude : ' +  longitude  }}</span>
              <span>{{ 'Latitude : ' +  latitude  }}</span>
              <q-space></q-space>
              <q-btn dense icon="mdi-google-maps" color="info" @click="changeLoc">
                <q-tooltip class="bg-white text-primary">Update your location</q-tooltip>
              </q-btn>
              <q-space></q-space>

              <q-space></q-space>
              <q-btn dense icon="mdi-window-close" flat color="white" @click="locDialog = false">
                <q-tooltip class="bg-white text-primary">Close</q-tooltip>
              </q-btn>

            </q-bar>
          </q-header>
          <q-page-container>
            <map-location-selector style="margin: 700px 0px 0px important;" :latitude="latitude" :longitude="longitude" @location-updated="locationUpdated"></map-location-selector>
          </q-page-container>
        </q-card>
      </q-dialog>



      <q-dialog v-if="basic" v-model="basic" transition-show="rotate" transition-hide="rotate">
        <q-list class="blacklist_list">
          <q-item v-for="banned in getBlacklist" :key="banned.id" class="blacklist_item mx-2">
            <div class="q-gutter-xs row" style="max-width: 300px" :class="{ 'truncate-chip-labels': truncate }">
              <q-chip removable v-model="blacklistPanel" color="red" text-color="white" max-width="30px">
                <q-avatar>
                  <img :src="getFullPath(banned.avatar)">
                </q-avatar>


<!-- <div class="q-pa-md q-gutter-md">
    <q-list bordered class="rounded-borders" style="max-width: 350px">

      <q-item clickable v-ripple>
        <q-item-section avatar>
          <q-avatar>
            <img src="https://cdn.quasar.dev/img/avatar2.jpg">
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label lines="1">Brunch this weekend?</q-item-label>
          <q-item-label caption lines="2">
            <span class="text-weight-bold">Janet</span>
            -- I'll be in your neighborhood doing errands this
            weekend. Do you want to grab brunch?
          </q-item-label>
        </q-item-section>

        <q-item-section side top>
          1 min ago
        </q-item-section>
      </q-item>

      <q-separator inset="item"></q-separator>

    </q-list>

  </div> -->

                <div class="ellipsis">
                  <span class="q-ml-sm">{{ banned.first_name }} {{ banned.last_name }}</span>
                  <q-icon mdi='mdi-rotate-3d' @click="unBlock(banned)"></q-icon>
                  <q-tooltip>
                    <span>you blocked {{banned.username}} on {{moment(banned.blocked_at).format('D MMMM, YYYY, h:mm A')}}</span>
                  </q-tooltip>
                </div>
              </q-chip>
            </div>
          </q-item>
        </q-list>
      </q-dialog>

      <AlertView :alert="alert"></AlertView>
    </q-page-container>
  </q-page>
</template>


<script setup>
import moment from 'moment'
import { ref, onMounted, computed, nextTick } from 'vue'
import { useStore } from 'vuex'
import axios from 'axios'
import utility from '@/utility'
import AlertView from '@/views/AlertView.vue'
import mapLocationSelector from 'vue-google-maps-location-selector'

const store = useStore()
const user = computed(() => store.getters.user)

const emailDialog = ref(false)
const passDialog = ref(false)
const locDialog = ref(false)
const showPass = ref(false)
const showNewPass = ref(false)
const showConfNewPass = ref(false)
const password = ref('')
const newPassword = ref('')
const confNewPassword = ref('')
const email = ref('')
const valid = ref(false)
const reRender = ref(true)
const blacklistPanel = ref(true)
const getBlacklist = ref(null)

const basic = ref(false)

const latitude = computed(() => location.value ? Number(location.value.lat) : 0)
const longitude = computed(() => location.value ? Number(location.value.lng) : 0)
const location = computed(() => store.getters.location)
const passwordMatch = computed(() => confNewPassword.value === newPassword.value || 'Passwords do not match!')

const getFullPath = utility.getFullPath

const newLocation = ref({
  lat: null,
  lng: null
})
const alert = ref({
  state: false,
  color: '',
  text: ''
})

const closePanel = () => {
  if (!blacklist.value.length) {
    console.log('------------ blacklist vide')
    // this.blacklistPanel = false
    return true
  }
  return false
}

const swapLocation = ref({
  lat: location.value.lat,
  lng: location.value.lng
})

const fetchBlacklist = async () => {
  try {
    getBlacklist.value = await utility.sync('users/getblocked')
    console.log('Résultat de la requête getblocked :', getBlacklist.value)
  } catch (error) {
    console.error('Une erreur s\'est produite :', error)
  }
}




const googleLoaded = () => {
  return (typeof window.google === 'object' && typeof window.google.maps === 'object')
}

const flag = ref(googleLoaded())
const openLoc = () => {
  locDialog.value = true
  flag.value = googleLoaded()
  console.log('flag', flag.value)
}

const saveEmail = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/changeemail`
    const headers = { 'x-auth-token': user.value.token }
    const data = {
      email: email.value,
      password: password.value
    }
    const res = await axios.post(url, data, headers)
    password.value = ''
    valid.value = false
    if (res.ok) {
      alert.value = { state: true, color: 'green', text: 'Your email has been updated' }
      emailDialog.value = false
      updateUserEmail(email.value)
      email.value = ''
      reRenderComp()
    } else {
      alert.value = { state: true, color: 'red', text: res.msg }
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
    const res = await axios.post(url, data, headers)
    password.value = ''
    newPassword.value = ''
    confNewPassword.value = ''
    valid.value = false
    reRenderComp()
    if (res.ok) {
      alert.value = { state: true, color: 'green', text: 'Your password has been updated' }
      passDialog.value = false
    } else {
      alert.value = { state: true, color: 'red', text: res.msg }
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

const locationUpdated = (newLocation) => {
  swapLocation.value = newLocation
}

const changeLoc = async () => {
  locDialog.value = false
  const url = `${import.meta.env.VITE_APP_API_URL}/api/users/location`
  const headers = { 'x-auth-token': user.value.token }
  const res = await axios.post(url, swapLocation.value, { headers })
  if (res && res.data && !res.data.msg) {
    store.commit('locate', location)
    alert.value = { state: true, color: 'green', text: 'Your location has been updated' }
  } else {
    alert.value = { state: true, color: 'red', text: res.data.msg ? res.data.msg : 'Oops... something went wrong!' }
  }
}

const unBlock = async (banned) => {
  const { id, username } = banned
  const url = `${import.meta.env.VITE_APP_API_URL}/api/users/unblock`
  const headers = { 'x-auth-token': user.value.token }
  const result = await axios.post(url, { id }, { headers })
  if (result.ok) {
    const blacklist = {
      blocked: blacklist.value.filter(cur => cur !== id) || [],
      blockedBy: blockedBy.value
    }
    store.commit('syncBlocked', blacklist)
    syncBlacklist(blacklist.blocked)
    alert.value = { state: true, color: 'green', text: `${username} has been unblocked` }
  } else {
    alert.value = { state: true, color: 'red', text: result.msg }
  }
}

onMounted(() => {
  fetchBlacklist()
  
  // const { blacklist } = defineProps(['blacklist'])
  // console.log('blacklist.value =============> ', blacklist)

  console.log('getBlacklist.value =============> ', getBlacklist.value)
})

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
