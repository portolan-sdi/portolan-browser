<template>
  <b-alert v-if="mode" class="external-url-recovery" variant="info" show>
    <p class="notice">{{ notice }}</p>
    <b-list-group v-if="mode === 'list'" class="candidates">
      <b-list-group-item v-for="candidate in candidates" :key="candidate" :to="browserPath(candidate)">
        <code>{{ candidate }}</code>
      </b-list-group-item>
    </b-list-group>
    <template v-else>
      <p class="target">
        <router-link :to="browserPath(target)"><code>{{ target }}</code></router-link>
      </p>
      <p v-if="cancelled" class="cancelled">{{ $t('externalRecovery.cancelled') }}</p>
      <template v-else>
        <p class="countdown">{{ $t('externalRecovery.redirect', { seconds }, seconds) }}</p>
        <b-button size="sm" variant="secondary" @click="cancel">{{ $t('cancel') }}</b-button>
      </template>
    </template>
  </b-alert>
</template>

<script>
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';
import { dataHostRewrite } from '../utils/externalUrlRecovery.js';

// The user gets this many seconds to stop an automatic redirect.
const REDIRECT_SECONDS = 5;

export default defineComponent({
  name: 'ExternalUrlRecovery',
  props: {
    url: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // One of null, 'host', 'single' and 'list'.
      mode: null,
      rewrite: null,
      target: null,
      candidates: [],
      seconds: REDIRECT_SECONDS,
      cancelled: false,
      timer: null
    };
  },
  computed: {
    ...mapGetters(['toBrowserPath']),
    notice() {
      if (this.mode === 'host') {
        return this.$t('externalRecovery.dataHost', {
          host: this.rewrite.host,
          dataHost: this.rewrite.dataHost
        });
      }
      else if (this.mode === 'list') {
        return this.$t('externalRecovery.options');
      }
      else {
        return this.$t('externalRecovery.found');
      }
    }
  },
  watch: {
    url: {
      immediate: true,
      handler: 'recover'
    }
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    browserPath(url) {
      const path = this.toBrowserPath(url);
      return path.startsWith('/') ? path : `/${path}`;
    },
    reset() {
      this.stopTimer();
      this.mode = null;
      this.rewrite = null;
      this.target = null;
      this.candidates = [];
      this.seconds = REDIRECT_SECONDS;
      this.cancelled = false;
    },
    async recover(url) {
      this.reset();
      if (!url) {
        return;
      }
      // A website host serves no data, so send the user to the data host.
      const rewrite = dataHostRewrite(url);
      if (rewrite) {
        this.rewrite = rewrite;
        this.target = rewrite.url;
        this.mode = 'host';
        this.startTimer();
        return;
      }
      let hits = [];
      try {
        hits = await this.$store.dispatch('probeEntryDocuments', url);
      } catch (error) {
        console.error(error);
        return;
      }
      // The user can navigate away while the probes run.
      if (this.url !== url) {
        return;
      }
      if (hits.length === 1) {
        this.target = hits[0];
        this.mode = 'single';
        this.startTimer();
      }
      else if (hits.length > 1) {
        this.candidates = hits;
        this.mode = 'list';
      }
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.seconds -= 1;
        if (this.seconds <= 0) {
          const path = this.browserPath(this.target);
          this.stopTimer();
          this.$router.push(path);
        }
      }, 1000);
    },
    stopTimer() {
      if (this.timer !== null) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    cancel() {
      this.stopTimer();
      this.cancelled = true;
    }
  }
});
</script>

<style lang="scss" scoped>
@import "../theme/variables.scss";

.external-url-recovery {
  margin-top: $block-gap;

  p:last-child {
    margin-bottom: 0;
  }
}

.candidates {
  margin-bottom: 0;
}
</style>
