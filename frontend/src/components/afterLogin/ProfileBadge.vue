<template>
  <q-layout :align="center" class="q-py-sm">
    <q-col cols="12" sm="11" md="9" offset-lg="3" offset-xl="4" offset-md="2" offset-sm="1" class="badge text-capitalize">
      <h2 class="font-weight-thin mb-2">
        <div class="text-truncate full_name pr-3 d-inline">
          {{ `${user.first_name} ${user.last_name}` }}
        </div>
        <q-tooltip v-if="!settings && like" anchor="bottom middle">
          <template #activator>
            <span viewBox="0 0 407.585 407.585" class="match_icon">
              <q-icon color="red" :name="!match ? 'favorite_border' : 'favorite'"></q-icon>
            </span>
          </template>
          <span>{{ match ? 'You have a match' : 'This user likes you' }}</span>
        </q-tooltip>
      </h2>
      <h4 class="font-weight-thin mb-3">
        {{ `@${user.username}` }}
      </h4>
      <div v-for="field in fields" :key="field.icon" class="font-weight-light text-truncate">
        <p v-if="field.exist" class="my-2">
        <div>
    <q-icon v-if="field.icon" :name="field.icon" small />
    <span class="ml-2">{{ field.text }}</span>
  </div>
        </p>
      </div>
    </q-col>
  </q-layout>
</template>

<script>
import moment from 'moment'
import utility from '@/utility.js'
import { toRefs, reactive } from 'vue'

export default {
  name: 'ProfileBadge',
  props: {
    match: { type: Boolean, default: false },
    like: { type: Boolean, default: false },
    settings: { type: Boolean, default: false },
    user: { type: Object, default: () => ({ }) }
  },
  setup (props) {
    const { user } = toRefs(props)

    const fields = reactive([
      {
        exist: true,
        icon: 'mdi-calendar',
        text: `Joined ${moment(user.value.created_at).format('MMMM YYYY')}`
      }, {
        exist: !!user.value.birthdate,
        icon: 'mdi-cake-variant',
        text: `Born ${moment(user.value.birthdate).format('MMMM D, YYYY')}`
      }, {
        exist: !!user.value.city && !!user.value.country,
        icon: 'mdi-map-marker',
        text: `${user.value.city}, ${user.value.country}`
      }
    ])

    return {
      fields,
      ...utility
    }
  }
}
</script>

<style scoped>

.full_name {
  max-width: 80%;
}

.match_icon {
  width: 2rem;
  height: 2rem;
  margin-bottom: -.5rem !important;
  margin-left: -1rem !important;
}
</style>
