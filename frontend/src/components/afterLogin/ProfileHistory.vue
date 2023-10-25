<template>
  <q-page>
    <q-page-container>
      <h1  class="q-pb-md" style="margin-top: -10px; text-align: center;">History</h1>

<!-- <q-timeline-entry
        v-for="(entry, i) in notif"
        :key="i"
         >
         <span v-if="entry.type === 'like'">
          <q-icon :class="getNotifIcon(entry.type)"/>
          <q-chip color="red" text-color="white" label="Like"> Vous avez aimé le profil de {{ entry.username }}</q-chip>

        </span>

        <span v-else-if="entry.type === 'unlike'">
          <q-icon :class="getNotifIcon(entry.type)"/>
          <q-chip
            color="red"
            text-color="white"
            label="Unlike"
            
          > Vous n'avez pas aimé le profil de {{ entry.username }}</q-chip>
        </span> -->



      <q-timeline align="top" dense center class="timeline_container" >
        <q-timeline-entry
          color="primary"
          small
          v-for="(entry, i) in history"
          :key="i"
          :avatar="getFullPath(entry.avatar)"
        >
          <!--  -->
          <!-- :class="getNotifIcon(entry.type)" -->
          <q-icon small style="font-size:25px !important;" class="mr-2 q-ml-xl">
            <span :class="getNotifIcon(entry.type)"></span>&nbsp;
          </q-icon>

          <div class="v-timeline-item__body ">
            <div class="hidden-xs-only">
              <q-tooltip label="formatTime(entry)" position="left">
                <strong class="mt-2 d-block">{{ fromNow(getDate(entry)) }}</strong>
              </q-tooltip>
            </div>
            <q-chip small class="bubble grey lighten-5 px-2 py-2">
              <q-avatar :avatar="getFullPath(entry.avatar)">
                <!-- <img :img="getFullPath(entry.avatar)" :alt="entry.username" /> -->
              </q-avatar>
              <router-link :to="`/user/${entry.id}`">
                <span class="mr-1" v-if="entry.type !== 'follower' && entry.type !== 'visitor'">{{ getHistoryAction(entry.type) }}</span>
                <span><q-route-link to="`/user/${entry.id}`" class="timeline_link">{{ entry.username }}</q-route-link></span>
                <span v-if="entry.type === 'follower' || entry.type === 'visitor'" class="ml-1">{{ getHistoryAction(entry.type) }}</span>
                <span v-if="entry.type === 'visited'">'s profile</span>
              </router-link>
            </q-chip>
          </div>
        </q-timeline-entry>
      </q-timeline>
      <q-btn
        v-if="moreToLoad"
        label="Afficher plus"
        color="primary"
        text
        rounded
        class="my-4"
        @click="increaseLimit"
      />
    </q-page-container>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import utility from '@/utility.js';
import axios from 'axios';

const store = useStore()
const router = useRouter()
const limit = ref(15)
const user = computed(() => store.getters.user)
const getNotifIcon = utility.getNotifIcon

const AllHistory = ref([])

const getHistory = async () => {
  try {
    const token = user.value.token || localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/browse/allhistory`
    const headers = { 'x-auth-token': token }
    console.log('headers : ', headers)
    const result = await axios.get(url, { headers })
    AllHistory.value = result.data
    console.log('******AllHistory : ', AllHistory.value)
    return result
  } catch (err) {
    console.error('err history in frontend/ProfileHistory.vue ===> ', err)
  }
}

getHistory();


const history = computed(() => {
  const blocked = store.getters.blocked;
  return AllHistory.value
    .filter((cur) => !blocked.includes(cur.id))
    .sort((a, b) => new Date(getDate(b)) - new Date(getDate(a)))
    .slice(0, limit.value);
});

const moreToLoad = computed(() => {
  return limit.value < history.value.length - 1;
});

const fromNow = utility.fromNow;
const getDate = utility.getDate;
const formatTime = utility.formatTime;
const getFullPath = utility.getFullPath;
const getHistoryAction = utility.getHistoryAction;

const increaseLimit = () => {
  if (limit.value + 11 < history.value.length) {
    limit.value += 10;
  } else {
    limit.value = history.value.length - 1;
  }
};


</script>


<style>

.timeline_container {
  margin-top: 20px;
}

.timeline_link {
  text-decoration: none;
}

.bubble.grey {
  border-radius: 5rem;
  border: 1px solid rgba(0, 0, 0, .1) !important;
  transition: all .3s ease-out;
}

.bubble.grey:hover {
  border: 1px solid rgba(0, 0, 0, .25) !important;
}

.v-timeline-item__body {
  margin-top: -.8rem !important;
}
</style>