<template>
  <q-page>
    <q-page-container>
      <h1 class="q-pb-md" style="margin-top: -10px; text-align: center;">Profile</h1>
      
      <q-btn v-if="isEditing" class="edit" color="grey-5" fab icon="mdi-close-circle" @click="isEditing = false" />
      <q-btn v-else class="edit" color="grey-5" fab icon="mdi-pencil" @click="isEditing = true" />

      <q-form @submit.prevent="updateUser" class="q-gutter-md">

          <q-input v-model="user.username" :readonly="!isEditing" label="Username" class="one-input"/>

          <div class="q-gutter-md row">
            <q-input v-model="user.first_name" :readonly="!isEditing" label="First Name" class="tow-input"/>
            <q-separator vertical spacing class="separator-margin"></q-separator>
            <q-input v-model="user.last_name" :readonly="!isEditing" label="Last Name" class="tow-input"/>
          </div>

          <q-input v-model="user.birthdate" :readonly="!isEditing" label="Birth Date" type="date" class="one-input"/>
          <q-input v-model="user.phone" mask="## ## ## ## ##" fill-mask :readonly="!isEditing" label="Phone Number" class="one-input"/>
          
          <div class="q-gutter-md row">
            <q-select v-model="user.gender" :readonly="!isEditing" label="Gender" :options="genders" dropdown-icon="mdi-chevron-down" class="tow-input"/>
            <q-separator vertical spacing class="separator-margin"></q-separator>
            <q-select v-model="user.looking" :readonly="!isEditing" label="Looking For" :options="looking" dropdown-icon="mdi-chevron-down" class="tow-input"/>
          </div>

          <q-input v-model="user.address" :readonly="!isEditing" label="Address" class="one-input"/>
          
          <div class="q-gutter-md row">
            <q-input v-model="user.city" :readonly="!isEditing" label="City" class="tow-input"/>
            <q-separator vertical spacing ></q-separator>
            <q-input v-model="user.postal_code" :readonly="!isEditing" label="Postal Code" type="number" class="tow-input"/>
          </div>

          <q-input v-model="user.country" :readonly="!isEditing" label="Country" class="one-input"/>
          


          <!-- <vue3-tags-input v-model="tags" :readonly="!isEditing" class="one-input" :disabled="!isEditing" :max-tags="20" :maxlength="25"  :autocomplete-items="allTags" :add-on-key="tagEsc" :tags="tag" @on-tags-changed="newTags => tags = newTags"/> -->
          <div class="one-input">
            <span class="text-h8 text-grey-7">Tags</span>
            <vue3-tags-input :max-tags="20" :maxlength="25" :autocomplete-items="allTags" :add-on-key="tagEsc" :tags="tag" @on-tags-changed="newTags => tags = newTags" v-if="isEditing"></vue3-tags-input>
            <div v-else>
              <q-input v-model="tags" readonly />
            </div>
          </div>


          
          <!-- <q-input v-model="user.biography" :readonly="!isEditing" :counter="500" label="Bio" filled type="textarea" class="one-input"/> -->
          <q-input v-model="user.biography" :readonly="!isEditing" label="Bio" filled type="textarea" class="one-input" :counter="true" :max-length="500"/>

          <!-- <q-btn v-if="isEditing" class="q-mt-md" color="primary" large dark @click.prevent="updateUser"> Enregistrer</q-btn> -->
          <div v-if="isEditing" >
            <q-btn label="Enregistrer" type="submit" color="primary"/>
            <q-btn label="Reset" @click="resetForm" color="red" flat class="q-ml-sm" />
            <!-- <q-btn label="annuler" type="reset" color="primary" flat class="q-ml-sm"/> -->
          </div>

      </q-form>
      <AlertView :alert="alert"></AlertView>
    </q-page-container>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore, mapActions } from 'vuex'
import utility from '@/utility.js'
import { createTags } from '@johmun/vue-tags-input'
import axios from 'axios'
import AlertView from '@/views/AlertView.vue'


const store = useStore()

const isEditing = ref(false)
const menu = ref(false)
const date = ref('')
const genders = ['male', 'female']
const looking = ['male', 'female', 'both']
const tagEsc = [13, ':', ',', ';']
let tag = ref('')
let tags = ref([])
const user = computed(() => store.getters.user)
const allTags = computed(() => store.getters.allTags)
const initialUser = ref({ ...user.value })
console.log('************ initialUser in ProfileForm',initialUser.value)

const alert = ref({
  state: false,
  color: '',
  text: ''
});

onMounted(() => {
  syncUser()
})

const syncUser = () => {
  tags.value = user.value.tags ? user.value.tags.split(', ').map(tag => tag.trim()) : []
  tag = tags.value[0].split(',').map(tag => tag.trim())
}

const resetForm = () => {
  event.preventDefault()
  user.value = { ...initialUser };
  tags.value = initialUser.tags ? initialUser.tags.split(', ').map(tag => tag.trim()) : [];
  isEditing.value = false;
}

const updateUser = async () => {
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/updateprofile`
    const headers = { 'x-auth-token': token }
    const res = await axios.post(url, user.value, { headers })

    console.log('res updateUser in frontend/ProfileForm.vue ===> ', res)

    if (res && res.data && !res.data.msg) {
      isEditing.value = false
      store.dispatch('updateUser', user.value)

      alert.value = { state: true, color: 'green', text: 'Your account has been updated successfully'}
    } else {
      alert.value = { state: true, color: 'red', text: res.data.msg ? res.data.msg : 'Oops... something went wrong!'}
    }
  } catch (err) {
    alert.value = { state: true, color: 'red', text: res.data.msg ? res.data.msg : 'Oops... error update User!'}
    console.error('err updateUser in frontend/ProfileForm.vue ===> ', err)
  }
}


</script>

<style scoped>
.one-input {
  min-width: 40px;
  margin-left: 30px;
  margin-right: 55px;
  color: "primary"; 
}

.tow-input {
  min-width: 330px;
  color: "primary";
}

.separator-margin {
  margin-left: 20px;
}

.edit, .edit:hover, .edit:focus {
  position: absolute;
}

.edit {
  right: 0;
  transform: translate(-150%, -170%);
  position: absolute !important;
}

.vue-tags-input {
  background: transparent !important;
  max-width: 100% !important;
  font-size: 1.2em;
}

.vue-tags-input .ti-input::after {
  content: '';
  display: block;
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 25%);
  height: 1.2px;
  /* background: var(--color-primary); */
  transition: width .2s ease-in-out;
}

.ti-tag {
  background: var(--color-primary) !important;
}

.ti-autocomplete {
  border: 1px solid var(--color-primary) !important;
  transform: translate(-.5px, -1.2px);
}

.ti-item {
  /* background-color: #fafafa !important; */
}

.ti-item.ti-selected-item {
  /* background-color: var(--color-primary) !important; */
}

.vue-tags-input.ti-disabled > .ti-input > .ti-tags > .ti-tag {
  /* background: #c8c8c8 !important; */
}

.vue-tags-input.ti-disabled > .ti-input {
  /* border-bottom: 1px dashed #c8c8c8 !important; */
}

.vue-tags-input.ti-focus .ti-input::after {
  width: 100%;
}

.vue-tags-input .ti-input {
  border: none !important;
  /* border-bottom: 1px solid grey !important; */
}
</style>
