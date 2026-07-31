<template>
  <div v-if="styles.length > 0" class="map-stylepicker">
    <!-- A one-option dropdown is noise, but the legend below is not: it is the
         only thing naming the colours, and a single auto-applied style needs it
         most. So the select is gated on there being a choice, the panel is not. -->
    <select v-if="styles.length > 1" v-model="selected" :title="$t('mapping.styles.select')">
      <option v-for="(style, index) in styles" :key="style.name" :value="index">
        {{ style.title }}
      </option>
    </select>
    <div v-if="legend.length > 0" class="legend-panel">
      <button class="legend-toggle" @click="legendOpen = !legendOpen">
        {{ legendOpen ? '▾' : '▸' }} {{ $t('mapping.styles.legend') }}
      </button>
      <ul v-if="legendOpen" class="legend-items">
        <li v-for="(item, i) in legend" :key="i">
          <span class="legend-swatch" :style="{ backgroundColor: item.color }" />
          {{ item.label }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StylePicker',
  props: {
    styles: { type: Array, default: () => [] },
    activeIndex: { type: Number, default: 0 },
    legend: { type: Array, default: () => [] },
  },
  emits: ['change'],
  data() {
    return {
      selected: this.activeIndex,
      legendOpen: true,
    };
  },
  watch: {
    activeIndex(val) { this.selected = val; },
    // Only a change originating here is user intent. Comparing against the
    // prop rather than the previous value stops the parent's own update
    // echoing straight back as a `change`, which would apply every style
    // twice — a full clear and rebuild of the map's layers each time.
    selected(val) { if (val !== this.activeIndex) {this.$emit('change', val);} },
  },
};
</script>

<style lang="scss" scoped>
.map-stylepicker {
  position: absolute;
  z-index: 2;
  left: 10px;
  bottom: 70px;

  select {
    font-size: 0.85rem;
    padding: 2px 6px;
    border-radius: 2px;
    border: 1px solid #ccc;
    background: white;
    cursor: pointer;
    max-width: 200px;
  }
}

.legend-panel {
  background: white;
  border: 1px solid #ccc;
  border-radius: 2px;
  margin-top: 4px;
  max-width: 200px;
}

.legend-toggle {
  display: block;
  width: 100%;
  background: none;
  border: none;
  font-size: 0.8rem;
  padding: 2px 6px;
  cursor: pointer;
  text-align: left;
}

.legend-items {
  list-style: none;
  margin: 0;
  padding: 0 6px 4px;
  max-height: 200px;
  overflow-y: auto;

  li {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    line-height: 1.6;
  }
}

.legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}
</style>
