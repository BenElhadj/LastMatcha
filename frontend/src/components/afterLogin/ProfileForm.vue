<template>
  <q-page-container>
    <q-btn round class="edit" color="grey-3" fab small @click="isEditing = !isEditing">
      <q-icon v-if="isEditing" name="mdi-close-circle"/>
      <q-icon v-else name="mdi-pencil"/>
    </q-btn>
    <h1 class="pt-4 pb-3 mb-4">
      Informations
    </h1>
    <q-form class="mt-4">
      <q-layout wrap>
        <q-col cols="12">
          <q-input v-model="user.username" :disable="!isEditing" color="primary" label="Username"
          />
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
          <q-chips-input v-model='tags' :disable='!isEditing' color='primary' label='Tags'></q-chips-input>
          <q-select v-model='newTag' use-input :disable='!isEditing' color='primary' @new-value='addTag' label='Add Tag'></q-select>
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
  </q-page-container>
</template>

<script>
import { mapGetters } from 'vuex'
import utility from '@/utility.js'
import { VueTagsInput, createTags } from '@johmun/vue-tags-input'

export default {
  name: 'ProfileForm',
  components: { VueTagsInput },
  data () {
    return {
      isEditing: false,
      menu: false,
      tag: '',
      tags: [],
      genders: ['male', 'female'],
      looking: ['male', 'female', 'both'],
      tagEsc: [13, ':', ',', ';']
    }
  },
  computed: {
    ...mapGetters({ tags: 'tags' }),
    formatedTags (val) {
      return createTags(this.tags).filter(cur => {
        const txt = cur.text.toLowerCase()
        const tag = this.tag.toLowerCase()
        return txt.length && txt.indexOf(tag) !== -1
      })
    }
  },
  props: {
    user: {
      type: Object,
      default: function () { return {} }
    }
  },
  watch: {
    user: {
      handler: 'syncUser',
      immediate: true
    },
    tags () {
      this.user.tags = this.tags
        .map(cur => cur.text.toLowerCase())
        .join(',')
    }
  },
  methods: {
    ...utility,
    syncUser () {
      const tags = this.user.tags
      const list = tags ? tags.split(',') : []
      this.tags = list ? createTags(list) : []
      this.$emit('sync-user', this.user)
    },
    updateUser () {
      this.$emit('update-user', this.user)
    },
    toggleEdit () {
      this.isEditing = !this.isEditing
    }
  }
}
</script>

<style scoped>
/* .edit, .edit:hover, .edit:focus {
  position: absolute;
} */

.edit {
  right: 0;
  transform: translate(-50%, 60%);
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
