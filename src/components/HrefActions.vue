<template>
  <div>
    <b-button-group class="actions" :vertical="vertical" :size="size" v-if="href">
      <b-button variant="danger" v-if="requiresAuth" tag="a" tabindex="0" :id="`popover-href-${id}-btn`" @click="handleAuthButton">
        <b-icon-lock /> {{ $t('authentication.required') }}
      </b-button>
      <b-button v-if="canDownload && !requiresAuth" variant="primary" v-bind="downloadProps" v-on="downloadEvents">
        <b-spinner v-if="loading" small />
        <b-icon-box-arrow-up-right v-else-if="browserCanOpenFile" />
        <b-icon-download v-else />
        {{ buttonText }}
      </b-button>
      <CopyButton variant="primary" :copyText="href" :title="href">
        {{ copyButtonText }}
      </CopyButton>
      <b-button v-if="hasShowButton && !requiresAuth" @click="show" variant="primary">
        <b-icon-eye class="me-1" />
        <template v-if="isThumbnail">{{ $t('assets.showThumbnail') }}</template>
        <template v-else>{{ $t('assets.showOnMap') }}</template>
      </b-button>
      <b-button v-for="action of actions" :key="action.id" variant="primary" v-bind="action.btnOptions" @click="action.onClick">
        <component v-if="action.icon" :is="action.icon" class="me-1" />
        {{ action.text }}
      </b-button>
    </b-button-group>

    <b-popover
      v-if="auth.length > 1" click focus
      :id="`popover-href-${id}`" class="href-auth-methods" :target="`popover-href-${id}-btn`"
      :title="$t('authentication.chooseMethod')" teleport-to="#stac-browser" :boundary-padding="10"
    >
      <b-list-group>
        <AuthSchemeItem v-for="(method, i) in auth" :key="i" :method="method" @authenticate="startAuth" />
      </b-list-group>
    </b-popover>
  </div>
</template>


<script>
import { defineAsyncComponent } from 'vue';

import Description from './Description.vue';
import Utils from '../utils';
import { size, URI } from 'stac-js/src/utils.js';
import { mapGetters, mapState } from 'vuex';
import AssetActions from '../../assetActions.config';
import LinkActions from '../../linkActions.config';
import AuthUtils from './auth/utils';
import { Asset } from 'stac-js';
import { browserProtocols } from 'stac-js/src/http';
import { svgMediaType, zarrMediaTypes } from 'stac-js/src/mediatypes';
import { isMapRenderableAsset } from '../utils/mapAssets.js';
import { fetchableAssetHref } from '../utils/fetchableHref.js';

const disableDownloadTypes = [...zarrMediaTypes];

let i = 0;

export default {
  name: 'HrefActions',
  components: {
    AuthSchemeItem: defineAsyncComponent(() => import('./AuthSchemeItem.vue')),
    BPopover: defineAsyncComponent(() => import('bootstrap-vue-next').then(m => m.BPopover)),
    CopyButton: defineAsyncComponent(() => import('./CopyButton.vue')),
    Description,
  },
  props: {
    data: {
      type: Object,
      required: true
    },
    isAsset: {
      type: Boolean,
      default: false
    },
    vertical: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['sm', 'md', 'lg'].includes(value)
    },
    shown: {
      type: Boolean,
      default: false
    },
    auth: {
      type: Array,
      default: () => ([])
    }
  },
  emits: ['show'],
  data() {
    return {
      id: i++,
      tileUrlTemplate: null
    };
  },
  computed: {
    ...mapState(['downloads', 'requestHeaders', 'buildTileUrlTemplate', 'useTileLayerAsFallback']),
    ...mapGetters(['getRequestUrl', 'isExternalUrl']),
    ...mapGetters('auth', ['isLoggedIn']),
    loading() {
      // The store keys a download by the URL it fetches, which is the resolved
      // one — the same as `href` for an asset the browser can fetch directly.
      return Boolean(this.downloads[this.fetchableHref]);
    },
    requiresAuth() {
      return !this.isLoggedIn && this.auth.length > 0;
    },
    tileRendererType() {
      if (this.tileUrlTemplate && !this.useTileLayerAsFallback) {
        return 'server';
      }
      else {
        return 'client';
      }
    },
    // External services can't receive header-based credentials, so the
    // external viewer actions won't work for data that requires them.
    requiresHeaderCredentials() {
      if (typeof this.data.href !== 'string') {
        return false;
      }
      return size(this.requestHeaders) > 0 && !this.isExternalUrl(this.data.getAbsoluteUrl());
    },
    actions() {
      if (this.requiresAuth || this.requiresHeaderCredentials) {
        return [];
      }
      return Object.entries(this.isAsset ? AssetActions : LinkActions)
        .map(([id, plugin]) => new plugin(this.data, this, id))
        .filter(plugin => plugin.show);
    },
    canShow() {
      // We need to know the type, otherwise we don't even try to show it
      if (typeof this.data?.type !== 'string') {
        return false;
      }
      // If the tile renderer is a tile server, the buildTileUrlTemplate function decides which assets it supports
      else if (this.tileRendererType === 'server') {
        return true;
      }
      // Only http(s) links and relative links are supported
      else if (!this.isBrowserProtocol) {
        return false;
      }
      // Otherwise, only what the MapLibre StacMapLayer can render gets the
      // button: COGs, PMTiles, XYZ vector tiles, TileJSON, and GeoParquet.
      // Browser images, SVG, GeoJSON, and Zarr have no renderer there, and a
      // button that tears down the shown layers to draw nothing is worse
      // than no button.
      else if (isMapRenderableAsset(this.data)) {
        return true;
      }
      return false;
    },
    hasShowButton() {
      return this.isAsset && this.canShow && !this.shown;
    },
    canDownload() {
      return this.isAsset && this.isBrowserProtocol && !disableDownloadTypes.includes(this.data?.type);
    },
    downloadEvents() {
      if (this.canDownload && this.useAltDownloadMethod) {
        return {
          click: (event) => {
            event.preventDefault();
            this.altDownload();
          }
        };
      }
      return {};
    },
    downloadProps() {
      if (this.canDownload && !this.useAltDownloadMethod) {
        const props = {
          href: this.fetchableHref,
          target: '_blank',
        };
        if (!this.browserCanOpenFile) {
          props.download = Utils.assetFilename(this.data);
        }
        return props;
      }
      return {};
    },
    useAltDownloadMethod() {
      if (!this.isBrowserProtocol || !window.isSecureContext) {
        return false;
      }
      else if (typeof this.data.method === 'string' && this.data.method.toUpperCase() !== 'GET') {
        return true;
      }
      else if (size(this.data.headers) > 0 || size(this.requestHeaders) > 0) {
        return true;
      }
      return false;
    },
    protocol() {
      // The scheme that decides what the buttons can do is the one of the URL
      // they would act on. For an `s3://` asset with an https alternate that
      // is the alternate; for one without, it stays the asset's own href, so
      // the button still names the source it cannot read from.
      const url = this.fetchableHref || this.href;
      if (typeof url === 'string') {
        if (url) {
          let match = url.match(/^(\w+):\/\//);
          if (match) {
            return match[1].toLowerCase();
          }
        }
      }
      return null;
    },
    isBrowserProtocol() {
      return !this.protocol || browserProtocols.includes(this.protocol);
    },
    isThumbnail() {
      if (this.isAsset) {
        return this.data.isPreview && this.data.canBrowserDisplayImage();
      }
      else {
        return this.data.rel === 'preview' && this.data.canBrowserDisplayImage();
      }
    },
    // The href as the catalog states it: what the page displays and what the
    // copy button copies, whatever scheme it uses.
    href() {
      if (typeof this.data.href !== 'string') {
        return null;
      }
      return this.getRequestUrl(this.data.getAbsoluteUrl());
    },
    // The href the browser can actually fetch: the asset's own when it is
    // http(s), otherwise its https alternate (Portolan v0.3), otherwise null.
    // Everything that downloads, opens or renders the asset uses this one.
    fetchableHref() {
      if (typeof this.data.href !== 'string') {
        return null;
      }
      const url = fetchableAssetHref(this.data);
      return url === null ? null : this.getRequestUrl(url);
    },
    // What the download is asked for. Normally the asset itself; for an asset
    // whose own href the browser cannot fetch it is a clone carrying the
    // resolved href, so the alternative download path (see altDownload) reads
    // the https alternate rather than the `s3://` store. The store applies
    // getRequestUrl itself, so the clone carries the raw resolved href.
    downloadLink() {
      const url = fetchableAssetHref(this.data);
      if (url === null || url === this.data.href || url === this.data.getAbsoluteUrl?.()) {
        return this.data;
      }
      const link = new Asset(this.data);
      link.href = url;
      return link;
    },
    from() {
      return this.protocolName(this.protocol);
    },
    browserCanOpenFile() {
      if (this.useAltDownloadMethod)  {
        return false;
      }
      // SVG files opened in the browser can run scripts, so they are downloaded instead
      if (this.data.isType(svgMediaType)) {
        return false;
      }
      if (this.data.canBrowserDisplayImage()) {
        return true;
      }
      else if (typeof this.data?.type === 'string') {
        switch(this.data.type.toLowerCase()) {
          case 'text/html':
          case 'application/xhtml+xml':
          case 'text/plain':
          case 'application/pdf':
            return true;
        }
      }
      return false;
    },
    buttonText() {
      if (this.browserCanOpenFile && this.isBrowserProtocol) {
        return this.$t('open');
      }
      let where = (!this.isBrowserProtocol && this.from) ? 'withSource' : 'generic';
      return this.$t(`assets.download.${where}`, {source: this.from});
    },
    copyButtonText() {
      let where = (!this.isBrowserProtocol && this.from) ? 'withSource' : 'generic';
      return this.$t(`assets.copyUrl.${where}`, {source: this.from});
    }
  },
  watch: {
    data: {
      immediate: true,
      async handler(data) {
        this.tileUrlTemplate = null;
        if (!this.isAsset || !this.buildTileUrlTemplate) {
          return;
        }
        try {
          const url = await this.buildTileUrlTemplate(data);
          // Ignore stale results if the asset changed in the meantime
          if (this.data === data) {
            this.tileUrlTemplate = url;
          }
        } catch (error) {
          console.error(error);
        }
      }
    }
  },
  methods: {
    async altDownload() {
      if (!window.isSecureContext) {
        window.location.href = this.fetchableHref;
        return;
      }

      await this.$store.dispatch('altDownload', { link: this.downloadLink });
    },
    protocolName(protocol) {
      if (typeof protocol !== 'string') {
        return '';
      }
      switch(protocol.toLowerCase()) {
        case 's3':
          try {
            const parsed = URI(this.href);
            const key = `protocol.s3.${parsed.domain()}`;
            if (this.$te(key)) {
              return this.$t(key);
            }
          } catch {
            // Fall back to the default
          }
          return this.$t('protocol.s3.default');
        case 'abfs':
        case 'abfss':
          return this.$t('protocol.azure');
        case 'gcs':
          return this.$t('protocol.gcs');
        case 'ftp':
          return this.$t('protocol.ftp');
        case 'oss':
          return this.$t('protocol.oss');
        case 'file':
          return this.$t('protocol.file');
      }
      return '';
    },
    show() {
      // Clone the asset to change the href. The MapLibre map adds no credentials,
      // so fetchableHref carries the auth query parameters from getRequestUrl —
      // and resolves an `s3://` asset to the alternate the map can read.
      const data = new Asset(this.data);
      data.href = this.fetchableHref;
      this.$emit('show', data);
    },
    handleAuthButton() {
      if (this.auth.length === 1) {
        this.startAuth(this.auth[0]);
      }
    },
    async startAuth(method) {
      if (AuthUtils.isSupported(method, this.$store.state)) {
        await this.$store.dispatch('config', { authConfig: method });
        await this.$store.dispatch('auth/requestLogin');
      }
      else {
        const name = this.$t(`authentication.schemeTypes.${method.type}`, method);
        const message = this.$t('authentication.unsupportedLong', {method: name});
        this.$store.commit('showGlobalError', {
          error: new Error(message),
          message: this.$t('authentication.unsupported')
        });
      }
    }
  }
};
</script>

<style lang="scss">
#stac-browser .href-auth-methods .popover-body {
  padding: 0;
}
</style>
