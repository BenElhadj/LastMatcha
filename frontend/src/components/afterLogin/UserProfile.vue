<template>
  <q-page class="page-container">
    <q-page-container v-if="loading">

      <div>
        <div class="profile__cover" parallax>
          <img :src="coverPhoto" alt="Cover Photo" class="cover__img">
        </div>
        <!-- <q-btn @click="openEditor" fab small outlined flat round lighten-3 class="update__img" style="top:85px;">
          <q-icon name="mdi-image"></q-icon>

          <q-tooltip left>
            <span>Changer votre photo de couverture</span>
          </q-tooltip>
        </q-btn> -->
      </div>

      <div class="avatar">
        <q-avatar slot="offset" class="profile__avatar mx-auto" size="250px">
          <img :src="profileImage">
        </q-avatar>

        <!-- <q-file
            @click="openEditor" fab small outlined flat round lighten-3 class="update__img" style="top:470px;left:190px;" accept=".jpg, image/*"
            v-model="filesImages"
          >
          <q-icon name="mdi-image"></q-icon>
          </q-file> -->

        <!-- <q-btn @click="openEditor" fab small outlined flat round lighten-3 class="update__img" style="top:470px;left:190px;">
          <q-icon name="mdi-image"></q-icon>
          <q-tooltip left>
            <span>Changer votre photo de profil</span>
          </q-tooltip>
        </q-btn> -->
      </div>

      <q-separator spacing class="separator-margin"></q-separator>
      <div class=" centered-tabs" style="max-width: 800px;">  
        <q-card>

          <q-tabs v-model="activeTab" class="bg-grey-2 text-grey q-tabs__content" active-color="primary" indicator-color="bg-grey-2">
            <q-tab name="tab-profile" label="Profile"></q-tab>
            <q-tab  name="tab-photo" label="Photos"></q-tab>
          </q-tabs>

          <q-separator spacing class="separator-margin"></q-separator>

          <q-tab-panels v-model="activeTab" animated class="bg-grey-2 text-black">
            
            <q-tab-panel name="tab-profile">
              <profile-form ref="form" :user="user"/>
            </q-tab-panel>

            <q-tab-panel  name="tab-photo">
              <profile-gallery :images="filteredImages"></profile-gallery>
            </q-tab-panel>

            <q-tab-panel >
                <div z-index="100">
                  <q-badge small color="red"/>
                  <!-- :color="item.is_read == 0 ? 'blue' : 'grey'" /> -->
                </div>
              </q-tab-panel>



              <q-fab color="accent" glossy icon="keyboard_arrow_down" direction="down">
                <q-fab-action color="amber" text-color="black" @click="onClick" icon="mail"></q-fab-action>
                <q-fab-action color="amber" text-color="black" @click="onClick" icon="alarm"></q-fab-action>
              </q-fab>



            <!-- <q-item-section side>
              <q-tooltip bottom class="status_container">
                <span>{{ lastSeen[convo.user_id] }}</span>
              </q-tooltip>
              <q-badge v-if="notTyping(convo)" small rounded :color="lastSeen[convo.user_id] == 'online' ? 'green' : 'grey'" />
              <div v-else class="typing">
                <q-spinner-dots size="2rem" />
              </div>
            </q-item-section> -->

            <!-- <q-tab-panel  name="tab-history">
              <profile-history></profile-history>
            </q-tab-panel>

            <q-tab-panel name="tab-setting">
              <profile-settings></profile-settings>
            </q-tab-panel> -->
          </q-tab-panels>

        </q-card>
      </div>

      <AlertView :alert="alert"></AlertView>
      <!-- <profile-editor @file_error="error = true" @file_succes="error = false" @update-image="updateImage" ref="profile_editor"></profile-editor> -->
    </q-page-container>
    <LoaderView v-else />
  </q-page>
</template>

<script setup>
import AlertView from '@/views/AlertView.vue'
import LoaderView from '@/views/LoaderView.vue'
import utility from '@/utility.js'
import ProfileEditor from '@/components/afterLogin/ProfileEditor.vue'
import ProfileBadge from '@/components/afterLogin/ProfileBadge.vue'
import ProfileTabs from '@/components/afterLogin/ProfileTabs.vue'
import ProfileForm from '@/components/afterLogin/ProfileForm.vue'
import ProfileSettings from '@/components/afterLogin/ProfileSettings.vue'
import ProfileGallery from '@/components/afterLogin/ProfileGallery.vue'
import ProfileHistory from '@/components/afterLogin/ProfileHistory.vue'

import { ref, onMounted, computed, watch, toRefs } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import axios from 'axios'
import moment from "moment";

import io from 'socket.io-client'
const socket = io(`${import.meta.env.VITE_APP_API_URL}`)

const store = useStore();
const route = useRoute();
const router = useRouter();
const loading = ref(true);
const fab = ref(false);
const blockDialog = ref(false);
const reportDialog = ref(false);
const activeTab = ref("tab-profile");
const alert = ref({
  state: false,
  color: "",
  text: "",
});

const user = ref({});
user.value = {}

const calculateDistance = utility.calculateDistance
const getFullPath = utility.getFullPath
const data = ref(null)

watch(user, async (newUser) => {
  const token = newUser.token || localStorage.getItem('token')
  if (token) {
    try {
      const url = `${import.meta.env.VITE_APP_API_URL}/api/auth/isloggedin`
      const headers = { 'x-auth-token': token }
      const res = await axios.get(url, { headers })
      data.value = res.data
      if (!res.data.msg) {
        // console.log('res.data ===> ', res.data)
        loading.value = true
        return
      } else {
        loading.value = false
      }
    } catch (err) {
      console.error('err watch user in frontend/MessengerView.vue ===> ', err)
    }
  }
}, { immediate: true })

const userCantLike = computed(() => {
  const imgs = user.value.images;
  return imgs ? !imgs.length : true;
});

const userCanChat = computed(() => {
  console.log('store.getters ===> ', store.state.user)
  for (const match of store.getters.matches) {
    if (match.id === user.value.id) return true;
  }
  return false;
});

const liked = computed({
  get: () => {
    for (const match of store.state.following) {
      if (match.id === user.value.id) return true;
    }
    return false;
  },
  set: () => {
    syncMatches(store.state.loggedIn.id);
  },
});

const likedBy = computed(() => {
  for (const match of store.state.followers) {
    if (match.id === user.value.id) return true;
  }
  return false;
});

const profileImage = computed(() => {
  return getFullPath(getProfileImage());
});

const distance = computed(() => {
  const from = store.state.location;
  const to = {
    lat: user.value.lat,
    lng: user.value.lng,
  };
  const dist = calculateDistance(from, to);
  return `${Math.round(dist)} kms away`;
});

const isOnline = computed(() => {
  return store.state.online.includes(user.value.id);
});

const coverPhoto = computed(() => {
  const cover = "@/assets/default/defaut_couverture.jpg";
  if (!user.value || !user.value.images) return getFullPath(cover);
  const image = user.value.images.find((cur) => cur.cover);
  return getFullPath(image ? image.name : cover);
});

const filteredImages = computed(() => {
  return user.value.images.filter((cur) => !cur.cover);
});

const userTags = computed(() => {
  const tags = user.value.tags;
  if (!tags) return [];
  return tags.split(",");
});

const informations = computed(() => {
  return [
    { label: "Nom d'utilisateur", content: user.value.username },
    { label: "Nom", content: user.value.first_name },
    { label: "Prénom", content: user.value.last_name },
    { label: "Age", content: user.value.birthdate ? moment().year() - moment(user.value.birthdate).year() : "" },
    { label: "Genre", content: user.value.gender },
    { label: "Interressé(e) par", content: user.value.looking },
    { label: "Téléphone", content: user.value.phone },
    { label: "Ville", content: user.value.city },
    { label: "Pays", content: user.value.country },
    { label: "Code postal", content: user.value.postal_code },
    { label: "Addresse", content: user.value.address },
  ];
});

const lastSeen = computed(() => {
  if (isOnline.value) return "online";
  if (user.value.status) return moment(user.value.status).utc().fromNow();
  return moment(user.value.created_at).utc().fromNow();
});

onMounted(() => {
  if (isNaN(route.params.id) || !route.params.id) router.push("/404");
  fetchUser(route.params.id);
});

const getProfileImage = () => {
  if (!user.value || !user.value.images) return "default.png";
  const image = user.value.images.find((cur) => cur.profile === 1);
  return image ? image.name : "default.png";
};

const match = async () => {
  const url = `${import.meta.env.VITE_APP_API_URL}/api/matching/match`;
  // console.log('***************url ===> ', url)
  const data = {
    id: route.params.id,
    liked: liked.value,
  };
  // console.log('data ===> ', data)
  const headers = { "x-auth-token": store.state.loggedIn.token };
  const res = await axios.post(url, data, { headers });
  if (res.data.ok) {
    liked.value = !liked.value;
    const profileImg = store.state.loggedIn.images.find((cur) =>
      cur.profile === true
    );
    console.log('store.state.loggedIn.id ===> ', store.state.loggedIn.id)
    const data = {
      date: new Date(),
      id_from: store.state.loggedIn.id,
      username: store.state.loggedIn.username,
      profile_image: profileImg ? profileImg.name : "default.png",
      id_to: route.params.id,
    };
    if (!liked.value) {
      if (store.state.followers.some((cur) => cur.id === route.params.id)) {
        data.type = "like_back";
      } else {
        data.type = "like";
      }
    } else {
      data.type = "unlike";
    }
    syncConvoAll();
    socket.emit("match", data);
  }
};

const block = async () => {
  const url = `${import.meta.env.VITE_APP_API_URL}/api/users/block`;
  let data = { id: route.params.id };
  const headers = { "x-auth-token": store.state.loggedIn.token };
  const res = await axios.post(url, data, { headers });
  if (!res.data.msg) {
    syncBlocked(store.state.loggedIn.id);
    data = {
      id_from: store.state.loggedIn.id,
      id_to: route.params.id,
    };
    socket.emit("block", data);
    blockDialog.value = false;
    router.push("/");
  }
};

const goToChat = () => {
  const convo = store.state.convos.find((cur) => cur.user_id === user.value.id);
  if (convo) {
    syncConvo({
      username: convo.username,
      id_conversation: convo.id_conversation,
      profile_image: convo.profile_image,
    });
    router.push("/chat");
  }
};

const fetchUser = async (id) => {
  // console.log("fetching user id =====> ", id);
  if (id && loading.value) {
    if (user.id === id) {
      router.push("/settings");
    } else {
      try {
        const token = user.token || localStorage.getItem('token')
        const headers = { "x-auth-token": token };
        const url = `${import.meta.env.VITE_APP_API_URL}/api/users/show/${id}`;
        const res = await axios.get(url, { headers });
        if (res.data.msg) {
          router.push("/404");
        }
        loading.value = false;
        user.value = { ...res.data, rating: Number(res.data.rating) };
        const profileImg = res.data.images.find((cur) => cur.profile === 1);
        
        if (isOnline.value) {
          user.value.status = true;
        }
        // console.log('user.value 4645 ===> ', user.value)
        // console.log('id 4645 ===> ', id)
        console.log('store.state ===> ', store.state.user.id)
        const data = {
          date: new Date(),
          id_from: store.state.user.id,
          username: store.state.user.username,
          profile_image: profileImg ? profileImg.name : "default.png",
          id_to: id,
          type: "visit",
        };
        socket.emit("visit", data);
        loading.value = false;
      } catch (err) {
        console.error(err);
      }
    }
  }
};

const reportUser = async () => {
  const url = `${import.meta.env.VITE_APP_API_URL}/api/users/report`
  const data = { id: this.$route.params.id }
  const headers = { 'x-auth-token': this.loggedIn.token }
  const res = await axios.post(url, data, { headers })
  if (!res.data.msg) {
    this.reportDialog = false
    this.alert.state = true
    this.alert.color = 'green'
    this.alert.text = 'User reported successfuly'
  } else {
    this.alert.state = true
    this.alert.color = 'red'
    this.alert.text = res.data.msg
  }
}





</script>

<style scoped>
.q-tabs__content {
  align: "justify";
  align-items: "justify-center";
  justify-content: "justify-center";
  padding: 0;
}
.separator-margin {
  margin-left: -2000px;
  margin-right: -2000px;
  z-index: 1;
}
.page-container {
  font-family: 'Elliane' !important;
  color: black;
  margin-top: -87px !important;
  margin-bottom: 0px !important;
}
.container {
  width: 100%;
}
.profile__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2em;
}
.profile__cover {
  width: 100%;
  height: 450px;
  top: 0;
  margin-top: 0;
  overflow: hidden;
  position: relative;
}
.cover__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-repeat: no-repeat;
}
.profile__avatar {
  position: absolute;
  size: 170px;
  top: 470px;
  left: 3%;
  z-index: 7;
}
.update__img {
  z-index: 10;
  color: black;
  position: absolute;
  transform: translate(50%, 50%) scale(1);
  background: rgba(211, 211, 211, 0.3); 
}
.centered-tabs {
  max-width: 800px;
  margin: 0 auto;
}
</style>