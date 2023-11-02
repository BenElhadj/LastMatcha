<template>
  <q-page>
    <q-page-container>
      <h1  class="q-pb-md" style="margin-top: -10px; text-align: center;">Settings</h1>
      <h3 style="margin-top: -70px; margin-bottom:70px; text-align: center;">{{user.username}}</h3>
      <div class="q-pa-md row flex flex-center justify-between" style="margin: 7%;">
        <div class="col-xs-12 col-sm-6 q-pa-md">
          <div class="row items-center">
            <img style="width: 130px; margin-left:7px" class="col-auto q-ml-md" src="@/assets/Settings/resetEmail.png" @click="emailDialog = true"/>
            <q-input v-model="user.email" readonly label="Email"/>
          </div>
        </div>
        <div class="q-flex column items-center justify-center">
          <div class="align-center">
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
            <img style="width: 150px;" src="@/assets/Settings/blocked.png" @click="blacklist.length === 0 ? noBlacklist() : blackListDialog = true"/>
          </div>
          <span>Click here to view blocked users</span>
        </div>
      </div>

      <q-dialog v-model="emailDialog" max-width="500" persistent transition-show="rotate" transition-hide="rotate">
        <q-card class="q-pa-md q-ma-md">
          <h5 class="display-1 text-center text-md-left pt-3 pb-3 mb-4 hidden-sm-and-down">Change your email</h5>
          <div class="my-4">
            <q-input v-model="oldEmail" color="primary" label="Current email" :rules="rules.email" required >
              <template #append>
                <q-icon class="cursor-pointer"></q-icon>
              </template>
            </q-input>
            <q-input v-model="newEmail" color="primary" label="New email" :rules="rules.email" required>
              <template #append>
                <q-icon class="cursor-pointer"></q-icon>
              </template>
            </q-input>
            <q-input v-model="pwd" color="primary" class="mb-3" :rules="rules.passRules" label="Current password" hint="Start with your old password" autocomplete="off" filled :type="showPwd ? 'text' : 'password'">
              <template #append>
                <q-icon
                  :name="showPwd ? 'mdi-eye' : 'mdi-eye-off'" 
                  class="cursor-pointer" 
                  @click="showPwd = !showPwd"></q-icon>
              </template>
            </q-input>
          </div>
          <q-card-actions align="right">
            <q-btn flat color="primary" :disable="!validEmail" @click="saveEmail">Save</q-btn>
            <q-btn flat color="primary" @click="closeEmail">Cancel</q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="passDialog" max-width="500px" persistent transition-show="rotate" transition-hide="rotate">
        <q-card class="q-pa-md q-ma-md">
          <h5 class="display-1 text-center text-md-left pt-3 pb-3 mb-4 hidden-sm-and-down">Change your password</h5>
          <div class="my-4">
            <q-input v-model="oldPwd" color="primary" :rules="rules.passRules" label="Current password" hint="Start with your old password" autocomplete="off" filled :type="showPwd ? 'text' : 'password'">
              <template #append>
                <q-icon
                  :name="showPwd ? 'mdi-eye' : 'mdi-eye-off'" 
                  class="cursor-pointer" 
                  @click="showPwd = !showPwd"></q-icon>
              </template>
            </q-input>
            <q-input v-model="newPwd" color="primary" :rules="rules.newPwd" label="New password" hint="Choose your new password" filled :type="showNewPwd ? 'text' : 'password'">
              <template v-slot:append>
                <q-icon
                  :name="showNewPwd ? 'mdi-eye' : 'mdi-eye-off'"
                  class="cursor-pointer"
                  @click="showNewPwd = !showNewPwd"
                ></q-icon>
              </template>
            </q-input>
            <q-input v-model="confNewPwd" color="primary" :rules="rules.confNewPwd" label="Confirm Password" hint="Confirm your password" filled :type="showConfPwd ? 'text' : 'password'" @keyup.enter="savePass" :error-messages="passwordMatch">
              <template v-slot:append>
                <q-icon
                  :name="showConfPwd ? 'mdi-eye' : 'mdi-eye-off'"
                  class="cursor-pointer"
                  @click="showConfPwd = !showConfPwd"
                ></q-icon>
              </template>
            </q-input>
          </div>
          <q-card-actions align="right">
            <q-btn flat color="primary" :disable="!validPwd" @click="savePass">Save</q-btn>
            <q-btn flat color="primary" @click="closePass">Cancel</q-btn>
          </q-card-actions>
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

      <q-dialog v-model="blackListDialog" class="q-pa-md" transition-show="rotate" transition-hide="rotate">
        <div v-if="blacklist.length > 0" class="q-pa-md" style="background-color: white;">
          <q-item v-for="banned in blacklist" :key="banned.id"   class="blacklist_item mx-2" style="width: 340px">
            <q-expansion-item  class="bg-grey-3" dropdown-icon="mdi-chevron-down !important" icon='mdi-chevron-double-right' >
              <template v-slot:header>
                <q-item-section avatar >
                  <q-avatar>
                    <img :src="getFullPath(banned.avatar)">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  {{banned.username}}
                </q-item-section>

                <div class="note">
                  <p class="caption text-capitalize rating_value">{{ banned.rating ? banned.rating.toFixed(1) : 'N/A' }}</p>
                  <q-rating
                    :color="banned.gender === 'male' ? 'blue-3' : 'pink-2'"
                    :color-selected="banned.gender === 'male' ? 'blue-9' : 'pink-8'"
                    :modelValue="banned.rating && !isNaN(banned.rating) ? banned.rating : 0"
                    icon="mdi-heart-outline"
                    icon-selected="mdi-heart"
                    icon-half="mdi-heart-half-full"
                    max="7"
                    readonly
                    dense
                    size="1.3em"
                    half-increments
                    class="rating"/>
                </div>

              </template>
              <q-card>
                <q-card-section>
                  <span>
                    {{ banned.first_name }} {{ banned.last_name }} is {{ new Date().getFullYear() - new Date(banned.birthdate).getFullYear() }} years old.
                  </span>
                  <br>
                  <span>
                    You blocked him on {{moment(banned.blocked_at).format('D MMMM, YYYY')}}
                  </span>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn color="green" flat  @click="unBlock(banned)">unblocked</q-btn>
                </q-card-actions>
              </q-card>
            </q-expansion-item>
          </q-item>
        </div>
      </q-dialog>

      <AlertView :alert="alert"/>
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
const showPwd = ref(false)
const showNewPwd = ref(false)
const showConfPwd = ref(false)
const pwd = ref('')
const oldPwd = ref('')
const newPwd = ref('')
const confNewPwd = ref('')
const oldEmail = ref('')
const newEmail = ref('')
const blacklist = ref(null)

const blackListDialog = ref(false)

const latitude = computed(() => location.value ? Number(location.value.lat) : 0)
const longitude = computed(() => location.value ? Number(location.value.lng) : 0)
const location = computed(() => store.getters.location)
const passwordMatch = () => {
  return confNewPwd.value === newPwd.value || 'Passwords do not match!';
}

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

const swapLocation = ref({
  lat: location.value.lat,
  lng: location.value.lng
})

const fetchBlacklist = async () => {
  try {
    blacklist.value = await utility.sync('users/getblocked')
  } catch (error) {
    console.error('Une erreur s\'est produite :', error)
  }
}
const noBlacklist = async () => {
  alert.value = { state: true, color: 'green', text: "you haven't blocked anyone" }
}

const rules = {
  email: [
    v => !!v || 'Email field is required',
    v => /.+@.+/.test(v) || 'Invalid email'
  ],
  passRules: [
    v => !!v || 'Password field is required',
  ],
  newPwd: [
    v => !!v || 'Password field is required',
    v => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v) || 'The password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
    v => v.length >= 8 || 'Password must contain at least 8 characters'
  ],
  confNewPwd: [
    v => !!v || 'Confirm Password field is required',
    v => v === newPwd.value || 'Passwords do not match',
  ]
}



const validPwd = computed(() => {
  return rules.newPwd.every(rule => rule(newPwd.value) === true)
})

const savePass = async () => {
  if (validPwd) {
    if (newPwd.value !== confNewPwd.value) {
      alert.value = { state: true, color: 'red', text: 'enter your current email first' }
      return
    }
    try {
      const url = `${import.meta.env.VITE_APP_API_URL}/api/users/changepassword`
      const headers = { 'x-auth-token': user.value.token }
      const data = {
        password: oldPwd.value,
        newPassword: newPwd.value,
        confNewPassword: confNewPwd.value
      }
      const res = await axios.post(url, data, { headers })
      if (res.data.ok) {
        alert.value = { state: true, color: 'green', text: 'Your password has been updated' }
        closePass()
      } else {
        alert.value = { state: true, color: 'red', text: res.data.msg }
      }
    } catch (err) {
      console.error('err savePass in frontend/ProfileSettings.vue ===> ', err)
    }
  } else {
    alert.value = { state: true, color: 'red', text: 'Please fill all fields!' }
  }
}

const closePass = () => {
  passDialog.value = false
  oldPwd.value = ''
  newPwd.value = ''
  confNewPwd.value = ''
}

const validEmail = computed(() => {
  return rules.email.every(rule => rule(newEmail.value) === true)
})

const saveEmail = async () => {
  if (validEmail) {
    try {
      const url = `${import.meta.env.VITE_APP_API_URL}/api/users/changeemail`
      const headers = { 'x-auth-token': user.value.token }
      const data = {
        email: newEmail.value,
        password: pwd.value
      }
      const res = await axios.post(url, data, { headers })

      pwd.value = ''
      if (res.data.ok) {
        alert.value = { state: true, color: 'green', text: 'Your email has been updated' }
        closeEmail()
      } else {
        alert.value = { state: true, color: 'red', text: res.data.msg }
      }
    } catch (err) {
      console.error('err saveEmail in frontend/ProfileSettings.vue ===> ', err)
    }
  } else {
    alert.value = { state: true, color: 'red', text: 'Please fill all fields!' };
  }
}

const closeEmail = () => {
  emailDialog.value = false
  oldEmail.value = ''
  newEmail.value = ''
  pwd.value = ''
}

const googleLoaded = () => {
  return (typeof window.google === 'object' && typeof window.google.maps === 'object')
}

const flag = ref(googleLoaded())
const openLoc = () => {
  locDialog.value = true
  flag.value = googleLoaded()
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
  const { blocked_id, username } = banned
  const url = `${import.meta.env.VITE_APP_API_URL}/api/users/unblock`
  const headers = { 'x-auth-token': user.value.token }
  const result = await axios.post(url, { id: blocked_id }, { headers })
  if (result.data.ok) {
    fetchBlacklist()
    alert.value = { state: true, color: 'green', text: `${username} has been unblocked` }
  } else {
    alert.value = { state: true, color: 'red', text: result.data.msg }
  }
}

onMounted(() => {
  fetchBlacklist()
})

</script>

<style>
.map_toolbar {
  z-index: 5;
}

.map-container {
  position: initial !important;
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
