<template>
  <q-page>
    <q-page-container>
      <h1 class="q-pb-md" style="margin-top: -10px; text-align: center;">Profile</h1>
      <h3 style="margin-top: -70px; margin-bottom:100px; text-align: center;">{{user.username}}</h3>
      

      <div v-if="owner" class="q-flex column items-center justify-center">
        <q-btn v-if="isEditing" class="edit icon-edit stack" flat square fab @click="isEditing = false" />
        <q-btn v-else class="edit icon-toEdit stack" flat square fab @click="isEditing = true"/>
      </div>

      <div v-else class="note">
        <p class="caption text-capitalize rating_value">{{ user.rating ? user.rating.toFixed(1) : 'N/A' }}</p>
        <q-rating
          :color="user.gender === 'male' ? 'blue-3' : 'pink-2'"
          :color-selected="user.gender === 'male' ? 'blue-9' : 'pink-8'"
          :modelValue="user.rating && !isNaN(user.rating) ? user.rating : 0"
          icon="mdi-heart-outline"
          icon-selected="mdi-heart"
          icon-half="mdi-heart-half-full"
          max="7"
          readonly
          dense
          size="4em"
          half-increments
          class="rating"/>
      </div>

      <q-form @submit.prevent="updateUser" class="q-gutter-md" style="margin-top: 70px" v-if="user">

          <q-input v-model="user.username" :readonly="!isEditing" label="Username" class="one-input"/>

          <div class="q-gutter-md row">
            <q-input v-model="user.first_name" :readonly="!isEditing" label="First Name" class="tow-input"/>
            <q-separator vertical spacing class="separator-margin"></q-separator>
            <q-input v-model="user.last_name" :readonly="!isEditing" label="Last Name" class="tow-input"/>
          </div>

          <q-input v-model="user.birthdate" :readonly="!isEditing" label="Birth Date" type="date" class="one-input"/>
          <q-input v-model="user.phone"  :readonly="!isEditing" label="Phone Number" class="one-input"/>
          
          <div class="q-gutter-md row">
            <q-select v-model="user.gender" id="gender" :readonly="!isEditing" label="Gender" :options="genders" dropdown-icon="mdi-chevron-down" class="tow-input"/>
            <q-separator vertical spacing class="separator-margin"></q-separator>
            <q-select v-model="user.looking" id="looking" :readonly="!isEditing" label="Looking For" :options="looking" dropdown-icon="mdi-chevron-down" class="tow-input"/>
          </div>

          <q-input v-model="user.address" :readonly="!isEditing" label="Address" class="one-input"/>
          
          <div class="q-gutter-md row">
            <q-input v-model="user.city" :readonly="!isEditing" label="City" class="tow-input"/>
            <q-separator vertical spacing ></q-separator>
            <q-input v-model="user.postal_code" :readonly="!isEditing" type="number" class="tow-input"/>
          </div>

          <q-input v-model="user.country" :readonly="!isEditing" label="Country" class="one-input"/>
          
          <div class="one-input">
            <span class="text-h8 text-grey-7">Tags</span>
            <!-- <vue3-tags-input v-if="isEditing" :max-tags="20" :maxlength="25" :add-on-key="tagEsc" :tags="tags" @on-tags-changed="newTags => tags = newTags"/>    -->
            <vue3-tags-input v-if="isEditing" :max-tags="20" :maxlength="25" :add-on-key="tagEsc" :tags="tags" @on-tags-changed="updateUserTags"/>   
            <div v-else>
              <q-input v-model="user.tags" readonly />
            </div>
          </div>

          <q-input v-model="user.biography" :readonly="!isEditing" label="Bio" filled type="textarea" class="one-input" :counter="true" :max-length="500"/>
          
          <div v-if="isEditing" >
            <q-btn label="Enregistrer" type="submit" color="primary"/>
            <q-btn label="Reset" @click="resetForm" color="red" flat class="q-ml-sm" />
          </div>

      </q-form>
      <AlertView :alert="alert"></AlertView>
    </q-page-container>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, toRefs } from 'vue'
import { useStore, mapActions } from 'vuex'
import utility from '@/utility.js'
import { createTags } from '@johmun/vue-tags-input'
import axios from 'axios'
import AlertView from '@/views/AlertView.vue'
import { defineProps } from 'vue'
import moment from 'moment'

const store = useStore()
const isEditing = ref(false)
const genders = ['male', 'female', 'both']
const looking = ['male', 'female', 'both']
const tagEsc = [13, ':', ',', ';']
const tagsString = ref('')
const owner = ref(false)
let tag = ref('')
let tags = ref([])
const { user } = defineProps(['user'])
const allTags = computed(() => store.getters.allTags)
const initialUser = ref({ ...user })
const alert = ref({
  state: false,
  color: '',
  text: '',
});



const updateUserTags = (newTags) => {
  user.tags = newTags.join(', ');
}

const syncTags = () => {
  if (user.tags) {
    tags.value = user.tags.split(', ').map(tag => tag.trim())
    tag = tags.value[0].split(',').map(tag => tag.trim())
  }
}

const handleTagsInput = (event) => {
  if (!isEditing.value) {
    event.preventDefault()
  }
}

const resetForm = () => {
  if (initialUser.value) {
    for (const prop in initialUser.value) {
      user[prop] = initialUser.value[prop]
    }
    syncTags()
    isEditing.value = false
  }
}

const updateUser = async () => {
  try {
    user.birthdate = moment(user.birthdate).format('YYYY-MM-DD')

    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/updateprofile`
    const headers = { 'x-auth-token': token }
 


    const res = await axios.post(url, user, { headers })
    
    if (res && res.data && !res.data.msg) {
      isEditing.value = false
      store.dispatch('updateUser', user)

      alert.value = { state: true, color: 'green', text: 'Your account has been updated successfully'}
    } else {
      alert.value = { state: true, color: 'red', text: res.data.msg ? res.data.msg : 'Oops... something went wrong!'}
    }
  } catch (err) {
    alert.value = { state: true, color: 'red', text: err.data.msg ? err.data.msg : 'Oops... error update User!' }
    console.error('err updateUser in frontend/ProfileForm.vue ===> ', err)
  }
}

onMounted(async () => {
  if (user) {
    owner.value = true ? user.id === store.getters.user.id : false
    syncTags()
  }
})

</script>

<style scoped>
.rating_value {
  margin-left: 7px;
  margin-right: -3px;
}
.note {
  display: flex;
    align-items: flex-start;
    flex-direction: row;
    justify-content: center;
}
.icon-toEdit {
  background-image: url('@/assets/edit/clicToEdit.png');
  background-repeat: no-repeat;
}
.icon-edit {
  background-image: url('@/assets/edit/writing.png');
  background-repeat: no-repeat;
}
.edit {
  width: 100px !important;
  height: 120px !important;
  position: absolute !important;
  background-size: 100%;
}
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
