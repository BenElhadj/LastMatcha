<template>
  <q-page>
    <q-page-container>
      <h1 class="q-pb-md" style="margin-top: -10px; text-align: center;">Informations</h1>
      
      <q-btn v-if="isEditing" class="edit" color="grey-5" fab icon="mdi-close-circle" @click="isEditing = false" />
      <q-btn v-else class="edit" color="grey-5" fab icon="mdi-pencil" @click="isEditing = true" />

      <q-form @submit.prevent.stop="updateUser" @reset.prevent.stop="onReset" class="q-gutter-md">

          <q-input v-model="user.username" :readonly="!isEditing" label="Username" class="one-input"/>

          <div class="q-gutter-md row">
            <q-input v-model="user.first_name" :readonly="!isEditing" label="First Name" class="tow-input"/>
            <q-separator vertical spacing class="separator-margin"></q-separator>
            <q-input v-model="user.last_name" :readonly="!isEditing" label="Last Name" class="tow-input"/>
          </div>

          <q-input v-model="user.birthdate" :readonly="!isEditing" label="Birth Date" type="date" class="one-input"/>
          <q-input v-model="user.phone" :readonly="!isEditing" label="Phone Number" class="one-input"/>
          
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
          
          <vue3-tags-input :max-tags="20" :maxlength="25" :autocomplete-items="allTags" :add-on-key="tagEsc" :disabled="!isEditing" :tags="tags" v-model="tags" @on-tags-changed="newTags => tags = newTags" class="one-input"/>
          <q-input v-model="user.biography" :readonly="!isEditing" :counter="500" label="Bio" filled type="textarea" class="one-input"/>
          
          <q-btn v-if="isEditing" class="q-mt-md" color="primary" large dark @click.prevent="updateUser"> Enregistrer</q-btn>
          <div v-if="isEditing" >
            <q-btn label="Enregistrer" type="submit" color="primary"/>
            <q-btn label="annuler" type="reset" color="primary" flat class="q-ml-sm"/>
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

const user = computed(() => store.getters.user)
const isEditing = ref(false)
const menu = ref(false)
const tag = ref('')
const date = ref('')
const tags = ref([])
const genders = ['male', 'female']
const looking = ['male', 'female', 'both']
const tagEsc = [13, ':', ',', ';']
const allTags = computed(() => store.getters.allTags)
const alert = ref({
  state: false,
  color: '',
  text: ''
});

const serverDate = computed(() => isEditing.value ? toServerDate(displayDate.value) : user.value.birthdate)

const syncUser = () => {
  console.log('-------- in syncUser')
  const tag = user.value.tags
  console.log('--------first tag', typeof(tag))
  const list = tag ? tag.split(', ') : []
  console.log('-------- list', list)
  tags.value = list ? createTags(list) : []
  console.log('-------- tags', tags.value)
}


const updateUser = async () => {
  try {
    const token = localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/updateprofile`
    const headers = { 'x-auth-token': token }
    const res = await axios.post(url, user.value, { headers })
    console.log('-------- in updateUser',  res.data)

    if (res && res.data && !res.data.msg) {
      isEditing.value = false
      store.dispatch('updateUser', user.value)
      alert.value = { state: true, color: 'green', text: 'Your account has been updated successfully'}
      console.log('Alert, green, Your account has been updated successfully')
    } else {
      alert.value = { state: true, color: 'red', text: res.body.msg ? res.body.msg : 'Oops... something went wrong!'}
      console.log('Alert, red, Oops... something went wrong!')
    }
  } catch (err) {
    alert.value = { state: true, color: 'red', text: res.body.msg ? res.body.msg : 'Oops... error update User!'}
    console.log('Alert, red, Oops... something went wrong!')
    console.error('err updateUser in frontend/ProfileForm.vue ===> ', err)
  }
}

onMounted(() => {
  syncUser()
})
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
