<template>
  <q-layout class="justify-center q-py-none">
    <div class="col-xs-12 col-sm-11 col-md-9 offset-lg-3 offset-xl-4 offset-md-2 offset-sm-1 badge text-capitalize">
      <h2 class="q-mb-md">
        <div class="text-truncate full_name q-pr-md inline-block">{{ `${user.first_name} ${user.last_name}` }}</div>
        <q-tooltip v-if="!settings && like" anchor="bottom middle" self="top middle">
          <template v-slot:activator="{on}">
            <span x="0px" y="0px" viewBox="0 0 407.585 407.585" v-on="on" class="match_icon">
              <q-icon :name="match ? 'mdi-heart-multiple' : 'mdi-heart-multiple-outline'" color="red"></q-icon>
            </span>
          </template>
          <span>{{ match ? 'Avez-vous un match' : 'Cet utilisateur vous aime' }}</span>
        </q-tooltip>
      </h2>
      <h4 class="q-mb-md">{{ `@${user.username}` }}</h4>
      <div class="font-weight-light text-truncate" v-for="field in fields" :key="field.icon">
        <p class="my-2" v-if="field.exist">
          <q-icon :name="field.icon" size="sm"></q-icon>
          <span class="q-ml-md">{{ field.text }}</span>
        </p>
      </div>
    </div>
  </q-layout>
</template>

<script setup>
import moment from 'moment'
import utility from '@/utility.js'
import { ref, computed, toRefs } from 'vue'

// Props
const props = defineProps({
  match: { type: Boolean, default: false },
  like: { type: Boolean, default: false },
  settings: { type: Boolean, default: false },
  user: { type: Object, default: () => ({ }) }
})

// Destructure les propriétés pour un accès plus facile
const { user } = toRefs(props)

// Calculé
const fields = computed(() => {
  return [
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
  ]
})

// Méthodes
const { someMethod, anotherMethod } = utility

</script>



<!-- <script>
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
</script> -->

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
