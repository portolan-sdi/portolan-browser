<template>
  <main class="browse d-flex flex-column">
    <b-alert v-if="!allowExternalAccess && isExternal" show>{{ $t('errors.noExternalAccess') }}</b-alert>
    <template v-else-if="error">
      <ErrorAlert :url="url" :description="errorDescription" :id="errorId" />
      <ExternalUrlRecovery v-if="isExternalRoute" :url="url" />
    </template>
    <Loading v-else-if="loading" stretch />
    <component v-else :is="component" />
  </main>
</template>

<script>
import Item from './Item.vue';
import Catalog from './Catalog.vue';
import ExternalUrlRecovery from '../components/ExternalUrlRecovery.vue';
import { mapGetters } from "vuex";
import { defineComponent } from 'vue';
import BrowseMixin from './BrowseMixin';
import { externalBrowserPathRE } from '../router/index.js';

export default defineComponent({
  name: "Browse",
  components: {
    Catalog,
    ExternalUrlRecovery,
    Item
  },
  mixins: [
    BrowseMixin
  ],
  computed: {
    ...mapGetters(["isItem"]),
    // True for a URL that the user gave, i.e. an /external/ route.
    isExternalRoute() {
      return externalBrowserPathRE.test(this.path || '');
    },
    component() {
      if (this.isItem) {
        return 'Item';
      }
      else {
        return 'Catalog';
      }
    }
  }
});
</script>
