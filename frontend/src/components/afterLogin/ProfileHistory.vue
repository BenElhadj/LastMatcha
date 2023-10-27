<template>
  <q-page>
    <q-page-container>
      <h1  class="q-pb-md" style="margin-top: -10px; text-align: center;">History</h1>
      <q-timeline align="top" dense center class="timeline_container" >
        <q-timeline-entry
          color="primary"
          small
          v-for="(entry, i) in history"
          style="width: 120px; height: 120px;"
          :key="i"
          size="7.4em"
          :avatar="getFullPath(entry.avatar)"
          @click="redirectToUser(entry.his_id)"
          col-md-4>
          <q-icon small style="font-size:25px !important;" class="mr-2 q-ml-xl">
            <span :class="getNotifIcon(entry.type)"></span>&nbsp;
          </q-icon>
          <div class="v-timeline-item__body ">
            <div>
              <q-tooltip label="formatTime(entry)" position="left">
                <strong class="mt-2 d-block">{{ moment(entry.created_at).fromNow() }}</strong>
              </q-tooltip>
            </div>
              <!-- <q-avatar style="width: 120px; height: 120px;" :avatar="getFullPath(entry.avatar)"/> -->
            <q-chip small class="bubble grey lighten-5 px-2 py-2">
              <router-link :to="`/user/${entry.his_id}`">
                <span class="mr-1" v-if="entry.type !== 'follower' && entry.type !== 'visitor'">{{ getHistoryAction(entry.type, entry.first_name, entry.last_name) }}</span>
                <!-- <span><q-route-link to="`/user/${entry.his_id}`" class="timeline_link"></q-route-link></span> -->
                <span><router-link :to="`/user/${entry.his_id}`" class="timeline_link"></router-link></span>
                <span v-if="entry.type === 'follower' || entry.type === 'visitor'" class="ml-1">{{ getHistoryAction(entry.type) }}</span>
                <span v-if="entry.type === 'visited'">'s profile</span>
              </router-link>
            </q-chip>
          </div>
        </q-timeline-entry>
      </q-timeline>
      <q-btn v-if="moreToLoad" label="Show more" color="primary" text rounded class="my-4" @click="increaseLimit"/>
    </q-page-container>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import utility from '@/utility.js';
import axios from 'axios';

const store = useStore()
const route = useRoute()
const router = useRouter()
const limit = ref(25)
const user = computed(() => store.getters.user)
const getNotifIcon = utility.getNotifIcon

const AllHistory = ref([])

const fromNow = utility.fromNow
const formatTime = utility.formatTime
const getFullPath = utility.getFullPath
const getHistoryAction = utility.getHistoryAction


const getHistory = async () => {
  try {
    const token = user.value.token || localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/browse/allhistory`
    const headers = { 'x-auth-token': token }
    const result = await axios.get(url, { headers })
    AllHistory.value = result.data
    return result
  } catch (err) {
    console.error('err history in frontend/ProfileHistory.vue ===> ', err)
  }
}

getHistory();

const redirectToUser = (hisId) => {
  if (hisId === user.value.id) {
    router.push('/');
  } else {
    router.push(`/user/${hisId}`);
  }
}

const history = computed(() => {
  return AllHistory.value
    .filter((cur) => !AllHistory.value.includes(cur.id))
    .slice(0, limit.value);
});

const moreToLoad = computed(() => {
  return limit.value < AllHistory.value.length - 1;
});


const increaseLimit = () => {
  if (limit.value + 24 < AllHistory.value.length) {
    limit.value += 25;
  } else {
    limit.value = AllHistory.value.length - 1;
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