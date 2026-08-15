<template>
  <main class="select-data-source">
    <WidgetHook id="view-select-data-source-start" />
    <b-form @submit.prevent="go">
      <b-form-group
        id="select" :label="$t('index.specifyCatalog')" label-for="url"
        :invalid-feedback="error" :state="valid"
        class="mb-3"
      >
        <b-form-input 
          id="url" 
          type="url" 
          :model-value="url" 
          @update:model-value="setUrl"
          placeholder="https://..."
        />
      </b-form-group>
      <b-button type="submit" variant="primary">{{ $t('index.load') }}</b-button>
    </b-form>
    <hr v-if="catalogs.length > 0 || registryError || registryLoading">
    <p v-if="registryLoading" class="text-muted">{{ $t('index.registryLoading') }}</p>
    <b-alert v-if="registryError" variant="warning" show>
      {{ $t('index.registryUnavailable') }}
    </b-alert>
    <b-form-group v-if="catalogs.length > 0" class="stac-index">
      <template #label>
        {{ $t('index.selectPortolan') }}
      </template>
      <b-list-group> 
        <template v-for="catalog in catalogs" :key="catalog.id">
          <b-list-group-item
            v-if="show(catalog)" button
            :active="url === catalog.url"
            @click="open(catalog.url)"
          >
            <div class="d-flex justify-content-between align-items-baseline mb-1">
              <strong>{{ catalog.title }}</strong>
              <b-badge v-if="catalog.isApi" variant="danger">{{ $t('index.api') }}</b-badge>
              <b-badge v-else variant="success">{{ $t('index.catalog') }}</b-badge>
            </div>
            <Description v-if="summary(catalog)" :description="summary(catalog)" compact />
            <small class="text-muted catalog-host">{{ host(catalog.url) }}</small>
          </b-list-group-item>
        </template>
      </b-list-group>
    </b-form-group>
  </main>
</template>

<script>
import { mapGetters } from "vuex";
import { defineComponent } from 'vue';
import Description from '../components/Description.vue';
import Utils from '../utils';
import { hasText, isObject } from 'stac-js/src/utils.js';
import CONFIG from '../merged-config';
import { parseRegistryExport } from '../utils/registry';
import axios from "axios";

// Long enough for a cold CDN fetch, short enough that a hung registry does not
// hold the page hostage.
const REGISTRY_TIMEOUT_MS = 15000;

export default defineComponent({
  name: "SelectDataSource",
  components: {
    Description
  },
  data() {
    return {
      url: '',
      catalogs: [],
      registryError: false,
      registryLoading: false
    };
  },
  computed: {
    ...mapGetters(['toBrowserPath']),
    valid() {
      if (this.url.length === 0) {
        return null;
      }
      return !this.error;
    },
    error() {
      if (!this.url) {
        return null;
      }
      try {
        let url = new URL(this.url);
        if (!url.protocol) {
          return this.$t('index.urlMissingProtocol');
        }
        else if (!url.host) {
          return this.$t('index.urlMissingHost');
        }
        return null;
      } catch (error) {
        return this.$t('index.urlInvalid', { error: error.message });
      }
    }
  },
  async created() {
    // Reset loaded STAC catalog
    this.$store.commit('resetCatalog', true);
    // Load the registered catalogs from the Portolan registry
    if (!hasText(CONFIG.registryUrl)) {
      return;
    }
    this.registryLoading = true;
    try {
      // The registry is a third-party host, so a hang must not leave the page
      // waiting on it forever with nothing said.
      const response = await axios.get(CONFIG.registryUrl, { timeout: REGISTRY_TIMEOUT_MS });
      // A registry that legitimately lists nothing is not a failure. Only a
      // response that is not a registry document at all is — an error page
      // served with a 200 lands here rather than in the catch.
      if (!isObject(response.data) || !Array.isArray(response.data.links)) {
        throw new Error('The response is not a Portolan registry export');
      }
      this.catalogs = parseRegistryExport(response.data);
    } catch (error) {
      console.error('Failed to load the Portolan registry:', error);
      this.registryError = true;
    } finally {
      this.registryLoading = false;
    }
  },
  methods: {
    // The registry stores no prose about a catalog, so say what it does
    // measure. Built here rather than in the parser so the words and the
    // number formatting follow the interface language.
    summary(catalog) {
      const parts = [];
      if (catalog.collectionCount) {
        parts.push(this.$t('index.registryCollections', {
          count: catalog.collectionCount.toLocaleString()
        }, catalog.collectionCount));
      }
      if (catalog.featureCount) {
        parts.push(this.$t('index.registryFeatures', {
          count: catalog.featureCount.toLocaleString()
        }, catalog.featureCount));
      }
      if (parts.length === 0) {
        return '';
      }
      const text = parts.join(' · ');
      return catalog.countsPartial ? this.$t('index.registryCountsPartial', { counts: text }) : text;
    },
    host(url) {
      try {
        return new URL(url).host;
      }
      catch {
        return url;
      }
    },
    show(catalog) {
      if(!this.url) {
        return true;
      }

      return Utils.search(this.url, [catalog.title, catalog.url]);
    },
    setUrl(url) {
      this.url = url;
    },
    open(url) {
      this.url = url;
      this.go();
    },
    go() {
      if (this.url) {
        this.$router.push(this.toBrowserPath(this.url));  // Vue Router navigation
      }
    }
  }
});
</script>

<style lang="scss">
@import '../theme/variables.scss';

#stac-browser .select-data-source {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  hr {
    width: 100%;
  }

  .stac-index {
    margin: 0;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    > div {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: auto;
      border-radius: $border-radius;

      .list-group {
        width: 100%;

        .list-group-item {
          border: 0;
          border-bottom: 1px solid rgba(0,0,0,.125);
        }

        .active .styled-description a {
          color: white;
        }
      }
    }
  }
}
</style>
