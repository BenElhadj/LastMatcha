<template>
  <q-layout>
    <div class="couverture">
      <q-btn class="cover__btn" color="blue" round dense icon="mdi-image" flat @click.stop="pickFile">
        <q-tooltip anchor="bottom middle" self="top middle">Change cover photo</q-tooltip>
      </q-btn>
      <input ref="imageRef" type="file" style="display: none" accept="image/*" @change="onFilePicked">
      <div style="height: 400px; background-repeat: no-repeat; background-size: cover;" :style="{ 'background-image': `url('${coverPhoto}')` }"></div>
    </div>

    <div class="profile">
      <div class="avatar">
        <q-avatar class="mx-auto d-block" size="200px">
          <img :src="profileImage" class="avatar__img">
        </q-avatar>
        {{ profileImage }}
        <q-btn class="avatar__btn" color="grey-5" round dense icon="mdi-image" flat @click.stop="openEditor">
          <q-tooltip anchor="bottom middle" self="top middle">Change profile photo</q-tooltip>
        </q-btn>
      </div>

      <div class="men-tabs">
        <q-tabs v-model="activeTab">
          <q-tab name="profileView">
            <div>
              <q-icon name="mdi-account"></q-icon>
              <span>Profile</span>
            </div>
          </q-tab>
          <q-tab name="gallerieView">
            <div>
              <q-icon name="mdi-image"></q-icon>
              <span>Gallerie</span>
            </div>
          </q-tab>
          <q-tab name="historiqueView">
            <div>
              <q-icon name="mdi-history"></q-icon>
              <span>Historique</span>
            </div>
          </q-tab>
        </q-tabs>
      </div>

      <q-tab-panels v-model="activeTab">
        
        <q-tab-panel name="profileView">
          <div>
            <q-btn round class="edit" color="grey-3" fab small @click="toggleEdit">
              <q-icon v-if="isEditing" name="mdi-close-circle"/>
              <q-icon v-else name="mdi-pencil"/>
            </q-btn>
            <h1 class="pt-4 pb-3 mb-4">Informations</h1>
            
            <q-form class="mt-4">
              <q-layout wrap>
                <q-col cols="12">
                  <q-input v-model="user.username" :disable="!isEditing" color="primary" label="Username"/>
                </q-col>
                <q-col cols="12" sm="6">
                  <q-input v-model="user.first_name" :disable="!isEditing" label="First Name" color="primary"/>
                </q-col>
                <q-col cols="12" sm="6">
                  <q-input v-model="user.last_name" :disable="!isEditing" label="Last Name" color="primary"/>
                </q-col>
                <q-col cols="12" sm="6">
                  <q-input v-model="user.phone" :disable="!isEditing" label="Phone Number" color="primary"/>
                </q-col>
                <q-col cols="12" sm="6">
                  <q-menu v-model="menu" :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y min-width="290px">
                    <template #activator="{ on }">
                      <q-input :disable="!isEditing" color="primary" :value="user.birthdate" label="Birth Date" readonly v-on="on"></q-input>
                    </template>
                    <q-date v-model="user.birthdate" color="primary" @input="menu = false"></q-date>
                  </q-menu>
                </q-col>
                <q-col cols="12" sm="6">
                  <q-select v-model="user.gender" :disable="!isEditing" color="primary" :options="genders" label="Gender"></q-select>
                </q-col>
                <q-col cols="12" sm="6">
                  <q-select v-model="user.looking" :disable="!isEditing" color="primary" :options="looking" label="Looking For"></q-select>
                </q-col>
                <q-col cols="12">
                  <q-input v-model="user.address" :disable="!isEditing" label="Address" color="primary"/>
                </q-col>
                <q-col cols="12" sm="4">
                  <q-input v-model="user.city" :disable="!isEditing" label="City" color="primary"/>
                </q-col>
                <q-col cols="12" sm="4">
                  <q-input v-model="user.country" :disable="!isEditing" label="Country" color="primary"/>
                </q-col>
                <q-col cols="12" sm="4">
                  <q-input v-model="user.postal_code" :disable="!isEditing" color="primary" label="Postal Code" type="number"/>
                </q-col>
                <q-col cols="12">
                  <q-chips-input v-model="tags" :disable="!isEditing" color="primary" label="Tags"></q-chips-input>
                  <q-select v-model="newTag" use-input :disable="!isEditing" color="primary" @new-value="addTag" label="Add Tag"></q-select>
                  <!-- This may require some extra work to integrate -->
                </q-col>
                <q-col cols="12">
                  <q-input v-model="user.biography" :disable="!isEditing" :maxlength="500" color="primary" label="Bio" type="textarea"/>
                </q-col>
                <q-col cols="12" text-xs-right>
                  <q-btn :disable="!isEditing" class="mx-0 font-weight-light" color="primary" large label="Enregistrer" @click.prevent="updateUser"/>
                </q-col>
              </q-layout>
            </q-form>
          </div>
        </q-tab-panel>

        <q-tab-panel name="gallerieView">
          <h1 class="py-3 mb-4">Gallery</h1>
          <div class="row q-gutter-md mt-4">
            <div v-for="image in images" :key="image.id" class="col-xs-12 col-sm-6 col-md-4 img_container">
              <q-btn color="red" dark small icon class="del_img" @click="deleteImg(image)">
                <q-icon name="close" />
              </q-btn>
              <img :src="url+image.name" class="image full-width" />
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="historiqueView">
          <div>
            <h1 class="text-h3 py-3 mb-4">History</h1>
            <div v-for="(entry, i) in history" :key="i" class="q-my-md">
              <div class="row items-center">
                <div class="col-3">
                  <strong class="mt-2 d-block">{{ fromNow(getDate(entry)) }}</strong>
                </div>
                <div class="col">
                  <q-chip outline class="bubble grey lighten-5 px-2 py-2">
                    <router-link :to="`/user/${entry.id}`">
                      <q-avatar>
                        <img :src="getFullPath(entry.profile_image)" :alt="entry.username">
                      </q-avatar>
                    </router-link>
                    <span v-if="entry.type !== 'follower' && entry.type !== 'visitor'" class="mr-1">{{ getHistoryAction(entry.type) }}</span>
                    <span>
                      <router-link :to="`/user/${entry.id}`" class="timeline_link">{{ entry.username }}</router-link>
                    </span>
                    <span v-if="entry.type === 'follower' || entry.type === 'visitor'" class="ml-1">{{ getHistoryAction(entry.type) }}</span>
                    <span v-if="entry.type === 'visited'">'s profile</span>
                  </q-chip>
                </div>
              </div>
            </div>
            <q-btn v-if="moreToLoad" unelevated rounded color="primary" class="my-4 full-width" @click="increaseLimit">Load More</q-btn>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
    <AlertView :alert="alert" />
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import utility from '@/utility.js';
import axios from 'axios';

const store = useStore();
const { coverPhoto, profileImage, user } = store.getters;

const activeTab = ref('profileView');
const username = ref('');
const first_name = ref('');
const last_name = ref('');
const phone = ref('');
const birthdate = ref('');
let images = ref(store.getters.user.images);
const tags = ref(store.getters.user.tags);
let alert = ref({
  show: ref(false),
  message: ref(''),
  type: ref(''),
});

const url = `${import.meta.env.VITE_APP_API_URL}/uploads/`;

const history = computed(() => {
  if (Array.isArray(store.state.history)) {
    return store.state.history.filter(cur => !store.state.blocked.includes(cur.id)).sort((a, b) => new Date(getDate(b)) - new Date(getDate(a))).slice(0, limit.value);
  } else {
    return [];
  }
});

const deleteImg = async image => {
  try {
    const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image/del`;
    const headers = { 'x-auth-token': user.token };
    const data = {
      id: image.id,
      profile: image.profile,
    };
    const res = await axios.post(url, data, { headers });
    if (res.data.ok) {
      await store.dispatch('delImg', image.id);
      alert.value = { state: true, color: 'green', text: 'Photo has been removed' };
    } else {
      alert.value = { state: true, color: 'red', text: 'Oups.. something went wrong' };
    }
  } catch (err) {
    console.error('err deleteImg in frontend/ProfileGallery.vue ===> ', err);
  }
};

const syncUser = (updatedUser) => {
  store.commit('updateUser', updatedUser);
};

const changeTab = (tab) => {
  activeTab.value = tab;
};

const openEditor = () => {
  activeTab.value.pickFile();
};

const pickFile = () => {
  imageRef.value.click();
};

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

const onFilePicked = async (e) => {
  const files = e.target.files;
  if (files[0]) {
    const imageFile = files[0];
    const imageName = imageFile.name;
    if (imageName.lastIndexOf('.') <= 0) return;
    if (imageFile.size > 1024 * 1024) {
      alert.value = { state: true, color: 'red', text: 'Image is too large..'};
    } else {
      try {
        let msg;
        const fd = new FormData();
        fd.append('image', imageFile);
        const url = `${import.meta.env.VITE_APP_API_URL}/api/users/image/cover`;
        const headers = { 'x-auth-token': user.token };
        const res = await axios.post(url, fd, { headers });
        if (res && res.data && !res.data.msg) {
          msg = 'You cover image has been updated successfully';
          alert.value = { state: true, color: 'success', text: msg};
          store.commit('updateCoverImage', res.data);
        } else {
          msg = res.data.msg ? res.data.msg : 'Oops something went wrong!';
          alert.value = { state: true, color: 'red', text: msg};
        }
      } catch (err) {
        console.error('err onFilePicked in frontend/SettingsView.vue ===> ', err);
      }
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  padding: 4em;
}
.profile {
  margin-top: -101px;
}
</style>
