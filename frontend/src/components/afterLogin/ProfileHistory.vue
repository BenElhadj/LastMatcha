<template>
  <q-page class="q-pa-lg">
    <q-page-container>
      <h1   style="margin-top: -10px; text-align: center;">History</h1>
      <q-timeline align="top" label="Loose" center class="timeline_container q-gutter-md " >

        <q-timeline  color="secondary">
          <q-timeline-entry heading style="margin: 10px; text-align: center;">
            Her you can see all your history of actions on the website
            <br>
          </q-timeline-entry>

          <q-timeline-entry
            v-for="(entry, i) in history"
            :title="getHistoryAction(entry.type, entry.first_name, entry.last_name)"
            :subtitle="moment(entry.created_at).format('D MMMM, YYYY, h:mm A')"
            :right="true"
            :color="getNotifIcon(entry.type)[2]"
            :class="getNotifIcon(entry.type)[2]"
            :icon="getNotifIcon(entry.type)[1]"
          >

            <q-avatar clickable v-ripple avatar @click="redirectToUser(entry.his_id)">
              <img :src="getFullPath(entry.avatar)">
            </q-avatar>

            <q-item-section right>
              {{ moment(entry.created_at).fromNow() }}
            </q-item-section>
            
          </q-timeline-entry>

          <q-timeline-entry
            :subtitle="!moreToLoad ? 'you can\'t see more history' : null"
            :title="moreToLoad ? 'You can show more history' : 'you created your profile on ' + moment(user.created_at).format('D MMMM, YYYY, h:mm A')"
            side="left"
          ></q-timeline-entry>

        </q-timeline>
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
import moment from 'moment';
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

// const layout = computed(() => {
//   return screen.lt.sm ? 'dense' : (screen.lt.md ? 'comfortable' : 'loose')
// })

const getHistory = async () => {
  try {
    const token = user.value.token || localStorage.getItem('token')
    const url = `${import.meta.env.VITE_APP_API_URL}/api/browse/allhistory`
    const headers = { 'x-auth-token': token }
    const result = await axios.get(url, { headers })
    AllHistory.value = result.data
  } catch (err) {
    console.error('err history in frontend/ProfileHistory.vue ===> ', err)
  }
}

getHistory();

const redirectToUser = (hisId) => {
  if (hisId === user.value.id) {
    console.log('hisId === user.value.id hisId =>', hisId, 'user.value.id =>', user.value.id);
    router.push('/');
  } else {
    console.log('hisId !== user.value.id hisId =>', hisId, 'user.value.id =>', user.value.id);
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