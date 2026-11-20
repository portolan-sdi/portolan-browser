<template>
  <!-- One lane down the right of the map: the area picker at the top of it,
       the download card at the bottom. The rest of the map is spoken for --
       the notice top left, MapLibre's buttons down the right edge, the style
       picker and layer control bottom left, the attribution bottom right. -->
  <!-- Escape is caught here, on the lane, so it works from any control
       inside it: it disarms a draw first (the most likely thing a user
       wants out of), then collapses the cluster. The geocoder's own input
       uses Escape to close its listbox, so a keypress from inside the
       search box is left alone. -->
  <div class="area-download" :class="{ 'drop-active': dropActive }" @keydown.esc="onEscape">
    <!-- The cheap condition in widgets.config.js already keeps the widget
         off anything that plainly has no vector data, so reaching here with
         a refusal means the real §2.4 derivation disagreed with it. Saying
         which, on the map, beats vanishing. -->
    <p v-if="refusal" class="area-download-refusal">{{ refusal }}</p>

    <template v-else>
      <!-- 1. The on-map control cluster ------------------------------------
           Open, it is the whole area picker: a real MapLibre geocoder
           control, a draw button and an upload button, over the data they
           select from. Collapsed, it is one pill that still says the data
           can be downloaded -- the affordance that used to be buried in the
           metadata column. -->
      <div
        class="ad-tools"
        :class="{ open, attention }"
        role="group"
        :aria-label="$t('widgets.areaDownload.area.label')"
      >
        <button
          v-show="!open"
          type="button"
          class="ad-pill"
          :title="$t('widgets.areaDownload.intro', { dataset: datasetTitle })"
          @click="openTools"
        >
          <BIconDownload aria-hidden="true" />
          <span>{{ $t('widgets.areaDownload.open') }}</span>
        </button>

        <!-- v-show, not v-if: the GeocoderControl's element is appended to
             `ad-search` imperatively, so collapsing the cluster must hide
             that subtree rather than destroy it. `Transition` only adds
             classes around that toggle, so the appended element is safe.
             The reveal is eased and the collapse is instant: a fading
             panel still occupies its space, and a cluster that takes an
             extra moment to get out of the way of the map is worse than
             one that simply goes. -->
        <Transition name="ad-reveal">
          <div v-show="open" class="ad-tools-panel">
            <div class="ad-tools-head">
              <BIconDownload aria-hidden="true" />
              <strong>{{ $t('widgets.areaDownload.title') }}</strong>
              <button
                type="button"
                class="ad-icon-button ad-collapse"
                :title="$t('widgets.areaDownload.close')"
                :aria-label="$t('widgets.areaDownload.close')"
                @click="open = false"
              >
                &times;
              </button>
            </div>
            <div class="ad-tools-row">
              <!-- @cng/maplibre's GeocoderControl lands here; see mountSearch().
                   v-show, not v-if: `ref="search"` must stay resolvable so a
                   later `indexUrl` is never possible (it is not reactive --
                   see mountSearch()) and so this never races the Transition
                   above over the same element. -->
              <div v-show="indexUrl" ref="search" class="ad-search" />
              <button
                type="button"
                class="ad-button"
                :class="{ active: drawArmed }"
                :aria-pressed="String(drawArmed)"
                @click="toggleDraw"
              >
                {{ drawArmed ? $t('widgets.areaDownload.area.drawArmed') : $t('widgets.areaDownload.area.draw') }}
              </button>
              <!-- The box tool's sibling. Two buttons rather than one tool
                   with a shape dropdown: a rectangle is the common case and
                   should stay one click away. -->
              <button
                type="button"
                class="ad-button"
                :class="{ active: polygonArmed }"
                :aria-pressed="String(polygonArmed)"
                :title="$t('widgets.areaDownload.area.drawPolygonTitle')"
                @click="togglePolygonDraw"
              >
                {{ polygonArmed ? $t('widgets.areaDownload.area.drawPolygonArmed') : $t('widgets.areaDownload.area.drawPolygon') }}
              </button>
              <button
                type="button"
                class="ad-button"
                :title="$t('widgets.areaDownload.area.uploadTitle')"
                @click="$refs.upload.click()"
              >
                {{ $t('widgets.areaDownload.area.upload') }}
              </button>
              <input
                ref="upload"
                class="ad-file"
                type="file"
                accept=".geojson,.json,application/geo+json"
                @change="onUpload"
              >
            </div>
            <p class="ad-note">
              {{ dropActive
                ? $t('widgets.areaDownload.area.dropActive')
                : polygonArmed
                  ? $t('widgets.areaDownload.area.drawPolygonHint')
                  : $t('widgets.areaDownload.area.drawHint') }}
            </p>
            <p v-if="areaError" class="ad-note ad-error">{{ areaError }}</p>
          </div>
        </Transition>
      </div>

      <!-- 2. The download card --------------------------------------------
           Anchored on the map, not in the sidebar: the area it describes is
           drawn right beside it, over the data it comes from. -->
      <div v-if="area" class="ad-card" :class="{ wide: showCode }">
        <div class="ad-card-head">
          <div>
            <strong class="ad-dataset">{{ datasetTitle }}</strong>
            <span class="ad-area-name">{{ area.name }}</span>
          </div>
          <button
            type="button"
            class="ad-icon-button"
            :title="$t('widgets.areaDownload.area.clear')"
            :aria-label="$t('widgets.areaDownload.area.clear')"
            @click="clearArea"
          >
            &times;
          </button>
        </div>

        <p class="ad-area-summary">
          {{ $t('widgets.areaDownload.area.summary', { vertices: area.vertexCount.filter, bbox: formatBbox(area.bbox) }) }}
        </p>

        <!-- Editing is offered on whatever produced the area -- a search
             result's boundary, a drawn shape, an uploaded file -- because
             "nearly the right region" is the normal outcome of all three.
             The estimate follows the handles, so the row count above is
             always for the shape currently on the map. -->
        <div class="ad-area-actions">
          <button
            type="button"
            class="ad-button ad-edit-toggle"
            :class="{ active: editing }"
            :aria-pressed="String(editing)"
            :title="$t('widgets.areaDownload.area.editTitle')"
            @click="toggleEdit"
          >
            {{ editing ? $t('widgets.areaDownload.area.editDone') : $t('widgets.areaDownload.area.edit') }}
          </button>
          <span v-if="editing" class="ad-edit-hint">{{ $t('widgets.areaDownload.area.editHint') }}</span>
        </div>

        <!-- 2a. *What* to download, when the collection publishes more than
             one parquet table. Fields of the World's benchmark collections
             carry four (889 MB of field polygons next to a 1.4 MB chip
             index); taking the first silently was the wrong answer and
             refusing them all was worse. -->
        <div v-if="assetOptions.length > 1" class="ad-field">
          <label :for="`${uid}-asset`">{{ $t('widgets.areaDownload.asset.label') }}</label>
          <select :id="`${uid}-asset`" v-model="assetKey" class="ad-select">
            <option v-for="option of assetOptions" :key="option.key" :value="option.key">
              {{ assetLabel(option) }}
            </option>
          </select>
        </div>

        <!-- 2b. *When*. A time window is the cheapest filter a partitioned
             dataset has: whole files whose declared interval misses it are
             dropped before a footer is read. Measured on the live FIRMS
             mirror, for one county: 27 files and 10.2 GB read with no
             window, 1 file and 962 MB with one month named. -->
        <div v-if="timeColumn && extent" class="ad-field ad-time">
          <label class="ad-check">
            <input v-model="timeEnabled" type="checkbox" @change="onFilterChange">
            <span>{{ $t('widgets.areaDownload.time.label') }}</span>
          </label>
          <template v-if="timeEnabled">
            <div class="ad-time-row">
              <input
                v-model="timeWindow.start"
                type="date"
                class="ad-date"
                :min="extentInput.start || null"
                :max="extentInput.end || null"
                :aria-label="$t('widgets.areaDownload.time.from')"
                @change="onFilterChange"
              >
              <span class="ad-dash" aria-hidden="true">–</span>
              <input
                v-model="timeWindow.end"
                type="date"
                class="ad-date"
                :min="extentInput.start || null"
                :max="extentInput.end || null"
                :aria-label="$t('widgets.areaDownload.time.to')"
                @change="onFilterChange"
              >
            </div>
            <div class="ad-presets">
              <button
                v-for="preset of timePresets"
                :key="preset.key"
                type="button"
                class="ad-chip"
                :class="{ active: preset.active }"
                @click="applyPreset(preset)"
              >
                {{ $t(`widgets.areaDownload.time.${preset.key}`) }}
              </button>
            </div>
            <p v-if="timeInverted" class="ad-error">{{ $t('widgets.areaDownload.time.inverted') }}</p>
            <p v-else class="ad-note">{{ $t('widgets.areaDownload.time.column', { column: timeColumn }) }}</p>
          </template>
        </div>

        <!-- 2c. *Which rows*. Column predicates are applied row by row as
             the data is read, so they lower what is written without
             lowering what is fetched -- which the note below says, because
             an unchanged "read from storage" after adding one would
             otherwise look like the filter did nothing. -->
        <div v-if="filterableColumns.length > 0" class="ad-field ad-where">
          <div v-for="(row, index) of predicates" :key="row.id" class="ad-where-row">
            <select v-model="row.col" class="ad-select" :aria-label="$t('widgets.areaDownload.where.column')" @change="onPredicateColumn(row)">
              <option v-for="column of filterableColumns" :key="column.name" :value="column.name">{{ column.name }}</option>
            </select>
            <select v-model="row.op" class="ad-select ad-op" :aria-label="$t('widgets.areaDownload.where.operator')" @change="onFilterChange">
              <option v-for="op of operatorsFor(row.col)" :key="op" :value="op">{{ $t(`widgets.areaDownload.where.ops.${opKey(op)}`) }}</option>
            </select>
            <input
              v-if="!nullaryOp(row.op)"
              v-model="row.value"
              class="ad-text"
              type="text"
              :placeholder="$t('widgets.areaDownload.where.value')"
              :aria-label="$t('widgets.areaDownload.where.value')"
              @change="onFilterChange"
            >
            <button
              type="button"
              class="ad-icon-button"
              :title="$t('widgets.areaDownload.where.remove')"
              :aria-label="$t('widgets.areaDownload.where.remove')"
              @click="removePredicate(index)"
            >
              &times;
            </button>
          </div>
          <button type="button" class="ad-link-button" @click="addPredicate">
            {{ $t('widgets.areaDownload.where.add') }}
          </button>
          <p v-if="activePredicates.length > 0" class="ad-note">{{ $t('widgets.areaDownload.where.note') }}</p>
        </div>

        <!-- Rows first, then the action, then the rest. The card is at most
             a few hundred pixels tall on a hero map, so the number a user
             decides on and the buttons they press have to be above the
             fold; how many row groups it took is interesting, not decisive,
             and lives in "why this estimate". -->
        <p v-if="estimating" class="ad-status">{{ $t('widgets.areaDownload.estimate.running') }}</p>
        <dl v-else-if="estimateResult" class="estimate">
          <dt>{{ $t('widgets.areaDownload.estimate.rows') }}</dt>
          <dd>
            <span class="ad-value">{{ rowsPrimary }}</span>
            <span v-if="rowsDetail" class="ad-hedge">{{ rowsDetail }}</span>
          </dd>
          <dt>{{ $t('widgets.areaDownload.estimate.read') }}</dt>
          <dd>
            <span class="ad-value">{{ boundedPrimary(readBounded) }}</span>
            <span v-if="boundedDetail(readBounded)" class="ad-hedge">{{ boundedDetail(readBounded) }}</span>
          </dd>
        </dl>

        <ul v-if="warnings.length > 0" class="ad-warnings">
          <li v-for="(warning, index) of warnings" :key="index" class="ad-warning">{{ warning }}</li>
        </ul>
        <p v-if="estimateError" class="ad-error">{{ estimateError }}</p>
        <button
          v-if="!estimateResult && !estimating"
          type="button"
          class="ad-button"
          @click="runEstimate"
        >
          {{ $t('widgets.areaDownload.estimate.button') }}
        </button>

        <!-- The estimate already knows whether the request is over the
             ceiling, so the card says so *before* the click rather than
             after a minute of re-planning. The accept button belongs to
             the handle's gate, which only exists once a download is
             blocked on it. -->
        <div v-if="ceiling || estimateCeiling" class="ad-ceiling">
          <p>{{ $t('widgets.areaDownload.download.ceiling', { breaches: ceilingBreaches }) }}</p>
          <p v-if="!ceiling" class="ad-note">{{ $t('widgets.areaDownload.download.ceilingAhead') }}</p>
          <button v-if="ceiling" type="button" class="ad-button ad-button-warning" @click="acceptCeiling">
            {{ $t('widgets.areaDownload.download.acceptCeiling') }}
          </button>
        </div>

        <!-- Nothing to download, said as such. An estimate of zero rows
             with two format buttons under it invites a click that produces
             an empty file; and when it is the date window that emptied it
             -- which happens to the real FIRMS mirror, whose collection
             extent runs two months past its newest published file -- the
             way out is one button. -->
        <div v-if="emptyEstimate" class="ad-empty">
          <p class="ad-status">
            {{ emptyBecauseTime ? $t('widgets.areaDownload.empty.dates') : $t('widgets.areaDownload.empty.area') }}
          </p>
          <p v-if="emptyBecauseTime" class="ad-note">{{ $t('widgets.areaDownload.empty.datesHint') }}</p>
          <button v-if="emptyBecauseTime" type="button" class="ad-button" @click="useWholeRange">
            {{ $t('widgets.areaDownload.time.whole') }}
          </button>
        </div>

        <!-- Two buttons, then five more behind a toggle. Seven formats in
             one row is 200 pixels of a card that has to fit on a hero map,
             and the two the data is already in -- GeoJSON for a glance,
             GeoParquet for the same bytes back -- are what most people
             want. The rest are a click away, each saying what its own
             plugin weighs before it is fetched. -->
        <div v-else-if="estimateResult && !downloading && !result" class="ad-formats">
          <span class="ad-formats-label">{{ $t('widgets.areaDownload.download.format') }}</span>
          <button
            v-for="format of primaryFormats"
            :key="format.id"
            type="button"
            class="ad-button ad-button-primary"
            :title="format.title"
            @click="startDownload(format.id)"
          >
            {{ format.label }}<span v-if="format.size" class="ad-size">&nbsp;· {{ format.size }}</span>
          </button>
          <button
            v-if="moreFormats.length > 0"
            type="button"
            class="ad-link-button"
            :aria-expanded="String(showMoreFormats)"
            @click="showMoreFormats = !showMoreFormats"
          >
            {{ showMoreFormats ? $t('widgets.areaDownload.download.fewerFormats') : $t('widgets.areaDownload.download.moreFormats') }}
          </button>
        </div>

        <div v-if="showMoreFormats && estimateResult && !downloading && !result && !emptyEstimate" class="ad-formats ad-formats-more">
          <button
            v-for="format of moreFormats"
            :key="format.id"
            type="button"
            class="ad-button"
            :title="format.title"
            @click="startDownload(format.id)"
          >
            {{ format.label }}<span v-if="format.size" class="ad-size">&nbsp;· {{ format.size }}</span><span
              v-if="format.weight"
              class="ad-weight"
            >&nbsp;{{ format.weight }}</span>
          </button>
        </div>

        <!-- The run: a bar, the numbers behind it, and the three things a
             user can do to a running download. Pause is a real pause -- the
             engine awaits the progress hook between row groups -- so the
             button only exists while the handle is in a state that honours
             it. -->
        <div v-if="downloading" ref="outcome" class="ad-run">
          <div class="ad-progress-row">
            <div
              class="ad-progress"
              role="progressbar"
              :aria-valuenow="progressPercent === null ? undefined : progressPercent"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="$t('widgets.areaDownload.download.progressLabel')"
            >
              <div class="ad-progress-bar" :class="{ indeterminate: progressPercent === null, paused }" :style="progressStyle" />
            </div>
            <button v-if="canPause" type="button" class="ad-button" @click="pause">
              {{ $t('widgets.areaDownload.download.pause') }}
            </button>
            <button v-else-if="paused" type="button" class="ad-button" @click="resume">
              {{ $t('widgets.areaDownload.download.resume') }}
            </button>
            <button type="button" class="ad-button" :disabled="cancelling" @click="cancel">
              {{ cancelling ? $t('widgets.areaDownload.download.cancelling') : $t('widgets.areaDownload.download.cancel') }}
            </button>
          </div>
          <p class="ad-status">{{ progress }}</p>
        </div>

        <!-- The end of it: what landed where, in numbers, until the user
             asks for something else. A progress line that simply stopped
             moving is not a success state. -->
        <div v-else-if="result" ref="outcome" class="ad-done">
          <p class="ad-done-head">
            <BIconCheckCircleFill aria-hidden="true" />
            <span>{{ $t('widgets.areaDownload.download.saved', { filename: result.filename }) }}</span>
          </p>
          <dl class="estimate">
            <dt>{{ $t('widgets.areaDownload.estimate.rows') }}</dt>
            <dd>{{ formatCount(result.rows) }}</dd>
            <dt>{{ $t('widgets.areaDownload.download.size') }}</dt>
            <dd>{{ formatBytes(result.bytes) }}</dd>
            <dt>{{ $t('widgets.areaDownload.download.elapsed') }}</dt>
            <dd>{{ $t('widgets.areaDownload.download.seconds', { seconds: (result.elapsedMs / 1000).toFixed(1) }) }}</dd>
          </dl>
          <ul v-if="runWarnings.length > 0" class="ad-warnings">
            <li v-for="(warning, index) of runWarnings" :key="index" class="ad-warning">{{ warning }}</li>
          </ul>
          <p v-if="result.truncated" class="ad-warning">{{ $t('widgets.areaDownload.download.truncated', { limit: formatCount(limit) }) }}</p>
          <p v-if="result.blob" class="ad-note">{{ $t('widgets.areaDownload.download.blobNote') }}</p>
          <button type="button" class="ad-button" @click="clearOutcome">
            {{ $t('widgets.areaDownload.download.again') }}
          </button>
        </div>

        <div v-else-if="cancelled" ref="outcome" class="ad-outcome">
          <p class="ad-status">
            {{ cancelled.rows > 0
              ? $t('widgets.areaDownload.download.cancelled', { rows: formatCount(cancelled.rows) })
              : $t('widgets.areaDownload.download.cancelledEarly') }}
          </p>
          <button type="button" class="ad-button" @click="clearOutcome">
            {{ $t('widgets.areaDownload.download.dismiss') }}
          </button>
        </div>

        <div v-else-if="downloadError" ref="outcome" class="ad-outcome">
          <p class="ad-error">{{ downloadError }}</p>
          <button v-if="lastFormat" type="button" class="ad-button" @click="startDownload(lastFormat)">
            {{ $t('widgets.areaDownload.download.retry') }}
          </button>
        </div>

        <p v-else-if="notice" class="ad-status">{{ notice }}</p>

        <!-- Why the numbers are the numbers: the pruning cascade, stage by
             stage. Collapsed, because it is the answer to a question most
             users never ask -- and indispensable to the ones who do, since
             it is where "no covering column, so nothing could be pruned"
             becomes visible. -->
        <details v-if="estimateResult" class="ad-why">
          <summary>{{ $t('widgets.areaDownload.estimate.why') }}</summary>
          <ul class="ad-why-list">
            <li v-for="(line, index) of whyLines" :key="index">
              <strong>{{ stageLabel(line.stage) }}</strong>
              {{ $t('widgets.areaDownload.prune.counts', {
                before: line.before,
                after: line.after,
                unit: $t(`widgets.areaDownload.prune.${line.unit}`)
              }) }}
              <!-- The basis sentence comes from @cng/download-core, which
                   has no i18n of its own: shown verbatim as the technical
                   footnote it is, rather than paraphrased into something
                   that could drift from what the code did. -->
              <span v-if="line.basis" class="ad-basis">{{ line.basis }}</span>
            </li>
          </ul>
          <p class="ad-scanned">
            {{ $t('widgets.areaDownload.estimate.partsValue', {
              files: estimateResult.files.selected,
              filesTotal: estimateResult.files.total,
              rowGroups: estimateResult.rowGroups.selected,
              rowGroupsTotal: estimateResult.rowGroups.total,
              requests: estimateResult.requests
            }) }}
          </p>
          <p class="ad-scanned">{{ $t('widgets.areaDownload.estimate.columns', { columns: estimateResult.columns.length }) }}</p>
          <p class="ad-scanned">{{ $t('widgets.areaDownload.estimate.outputModel') }}</p>
          <p v-if="limitBinds" class="ad-scanned">{{ $t('widgets.areaDownload.estimate.limited', { limit: formatCount(limit) }) }}</p>
        </details>

        <p v-if="attribution" class="ad-attribution" :title="attribution">{{ attribution }}</p>

        <button v-if="request" type="button" class="ad-link-button code-toggle" @click="showCode = !showCode">
          {{ showCode ? $t('widgets.areaDownload.code.hide') : $t('widgets.areaDownload.code.show') }}
        </button>
        <div v-if="showCode && request" class="request-code">
          <div v-for="generator of codeGenerators" :key="generator.language">
            <h4>{{ $t(generator.labelKey) }}</h4>
            <CodeBox :generator="generator" :filters="request" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { defineComponent, markRaw } from 'vue';
import { mapState } from 'vuex';
import { estimate, blobSink, fileSystemSink, downloadRequest, onFormatState } from '@cng/download-core';
import { Geocoder } from '@cng/geocoder-core';
import { areaFromFile, attachDropTarget } from '@cng/upload-core';
// Both of these are @cng/maplibre's, reused as-is rather than
// reimplemented here:
//
//   * `createDrawTool` in `polygon` mode is the "Draw polygon" button. It
//     was briefly a local `PolygonDrawInteraction.js` in this directory,
//     written while the shared tool still refused polygon; once that
//     landed upstream the local copy was deleted rather than left to drift.
//     The box button still uses this app's older `BboxDrawInteraction`,
//     which predates the shared tool and also serves `MapSelect.vue`.
//   * `createEditTool` is the vertex editor behind "Edit shape". It owns
//     the handles, the drag/insert/delete gestures and the
//     `provenance.source: 'edited'` lineage; this widget only decides when
//     it is on and what to do with the Areas it emits.
import { addAreaLayer, GeocoderControl, createDrawTool, createEditTool } from '@cng/maplibre';
import { toAreaDocument, buildArea, VERSION } from '@cng/spec';
import BboxDrawInteraction from '../components/maps/BboxDrawInteraction.js';
import { MAP_HOST } from '../components/maps/mapHost.js';
import CodeBox from '../components/CodeBox.vue';
import BIconDownload from '~icons/bi/download';
import BIconCheckCircleFill from '~icons/bi/check-circle-fill';
import { describeDataset } from '../utils/download/descriptor.js';
import { useAppHyparquet } from '../utils/download/hyparquet.js';
import {
  temporalExtent,
  defaultWindow,
  toDateInput,
  toTimeFilter,
  windowInverted,
  DEFAULT_WINDOW_DAYS
} from '../utils/download/time.js';
import {
  formatBytes,
  formatCount,
  describeBounded,
  pruneLines,
  describeError,
  isCancellation
} from '../utils/download/present.js';
import { listFormats, pluginWeight, pickerExtension } from '../utils/download/formats.js';
import { downloadGenerators } from '../../codeGenerators.config.js';

// Every estimate warning the packages raise, in words. Three of them carry
// numbers only and have always needed the widget to supply the sentence;
// the other four carry an English `message` from @cng/download-core, which
// is still said here instead, because a licence obligation and a "nothing
// could be pruned" explanation are both things a translated UI should say
// in its own language. Anything not listed falls back to its `message`.
const WARNING_KEYS = {
  'estimate-wide': 'widgets.areaDownload.warnings.estimateWide',
  'antimeridian-split': 'widgets.areaDownload.warnings.antimeridianSplit',
  'share-alike': 'widgets.areaDownload.warnings.shareAlike',
  'no-covering': 'widgets.areaDownload.warnings.noCovering',
  'single-row-group': 'widgets.areaDownload.warnings.singleRowGroup',
  'degraded-to-bbox': 'widgets.areaDownload.warnings.degradedToBbox',
  'no-statistics': 'widgets.areaDownload.warnings.noStatistics'
};

// The formats on offer come from `@cng/download-core`'s registry, each
// with its own bytes-per-row model -- so the size beside a button is that
// format's own estimate and not one number for all of them (GeoJSON text
// of the same rows runs roughly three times a GeoParquet file). GeoJSON
// and GeoParquet are built into core; the other five are separate packages
// registered as lazy descriptors, which is what lets a button say what its
// plugin weighs *before* anything is fetched. See
// utils/download/formats.js.

// Operators offered per column type. Numbers get comparisons, strings get
// pattern matching, everything gets equality and the two null tests. A
// shorter list than `evaluatePredicate` supports on purpose: `in`/`between`
// need more than one value box, which the card has no room for.
const NUMERIC_OPS = ['=', '!=', '>', '>=', '<', '<=', 'is_null', 'is_not_null'];
const STRING_OPS = ['=', '!=', 'ilike', 'not_like', 'is_null', 'is_not_null'];
const NULLARY_OPS = ['is_null', 'is_not_null'];

// Column types that can be filtered from the card. Geometry is the area's
// job and a struct or list has no single value to type into a box.
const UNFILTERABLE = /geometry|struct|list|map|\[\]/i;
const NUMERIC_TYPE = /int|float|double|decimal|numeric|real|bigint|smallint/i;

// How many of a format plugin's own warnings the success state shows
// before it stops listing them. Shapefile can raise one per column.
const MAX_RUN_WARNINGS = 4;

// How long after a filter change the estimate re-runs. Long enough that
// typing a date or a value does not fire one per keystroke, short enough
// that the numbers feel like they belong to the controls.
const FILTER_DEBOUNCE_MS = 400;

// How long after a vertex drag the estimate re-runs. Shorter than the filter
// debounce: a dragged corner is one deliberate gesture that has already
// ended, not a half-typed value, so the numbers should follow it closely.
const EDIT_DEBOUNCE_MS = 250;

let instanceCounter = 0;

// How close the map zooms to a selected area. Matches MapMixin's cap, which
// this widget no longer mixes in -- it draws on the page's map instead of
// making one.
const MAX_ZOOM = 16;

// How long the pill keeps drawing the eye to itself. Two slow pulses: enough
// to be noticed over the map, short enough not to become a nag.
const ATTENTION_MS = 2600;

// Below this the open cluster is a third of the map's height before
// anything has been picked, so it starts collapsed to its pill and the
// pulse does the introducing. Matches the stylesheet's own breakpoint (and
// bootstrap's `sm`), which is where the lane becomes the map's full width.
const NARROW_MAP = '(max-width: 575.98px)';

// An on-map widget, not a panel. It renders inside the `map-overlay` hook
// (so its DOM is a child of the map container) and draws on the page's real
// map, which it gets from the injected map host -- see
// src/components/maps/mapHost.js and docs/widgets.md.
//
// That is why the area picker here is @cng/maplibre's GeocoderControl and
// not a bootstrap-vue-next form: the adapter's controls were written to be
// mounted on a map, and now there is a map to mount them on. The user sees
// the area they picked outlined over the actual data, which is the whole
// point of putting the tool on the map.
export default defineComponent({
  name: 'AreaDownload',
  components: {
    BIconDownload,
    BIconCheckCircleFill,
    CodeBox
  },
  inject: {
    mapHost: { from: MAP_HOST, default: null }
  },
  props: {
    // The geocoder's names index, as a `cnmw-index/1.0` manifest URL.
    // `null` (settable via the app's `areaSearchIndexUrl` config option)
    // hides the search box entirely -- no Geocoder is constructed and no
    // request is made for it -- leaving draw, upload and download working.
    // Vue skips type/default handling for an explicit `null` on a
    // non-required prop, so passing it through unchanged is enough.
    indexUrl: {
      type: String,
      default: 'https://data.source.coop/portolan-mirrors/geoboundaries-catalog/names/index.json'
    },
    // Restricts the format buttons offered to this list of ids (any of
    // `src/utils/download/formats.js`'s FORMAT_ORDER: 'geojson',
    // 'geoparquet', 'gpkg', 'flatgeobuf', 'shapefile', 'csv', 'esrijson').
    // `null` or an empty array offers every registered format, which is
    // the default (the app's `areaDownloadFormats` config option).
    allowedFormats: {
      type: Array,
      default: null
    },
    // Attribute filters applied to every request, as @cng Predicates.
    where: {
      type: Array,
      default: () => []
    },
    // Hard row cap on a download. The ceiling is a separate, louder thing.
    limit: {
      type: Number,
      default: 100000
    },
    // How the finished file reaches the disk. `'picker'` always asks the
    // File System Access API for a destination, `'anchor'` always writes a
    // Blob and clicks it, `'auto'` prefers the picker where it exists. Either
    // way the save starts without the user clicking a rendered link.
    directSave: {
      type: String,
      default: 'auto',
      validator: value => ['auto', 'picker', 'anchor'].includes(value)
    }
  },
  data() {
    instanceCounter += 1;
    return {
      uid: `ad${instanceCounter}`,
      open: true,
      attention: false,
      area: null,
      areaError: '',
      dropActive: false,
      drawArmed: false,
      // The polygon tool is a second armed mode beside the box one. Two
      // flags rather than one `activeTool` string because the template's
      // two buttons each want their own pressed state, and only one of the
      // two can ever be true (arming either disarms the other).
      polygonArmed: false,
      // "Edit shape" is a toggle, not a one-shot: the handles stay up until
      // the user is done nudging them.
      editing: false,
      // Which parquet table of a multi-asset collection is being
      // downloaded. `null` means "whatever the derivation would pick",
      // which is the first one.
      assetKey: null,
      timeEnabled: false,
      timeWindow: { start: '', end: '' },
      predicates: [],
      predicateSeq: 0,
      estimateResult: null,
      estimating: false,
      estimateError: '',
      downloading: false,
      downloadState: '',
      progress: '',
      progressPercent: null,
      downloadError: '',
      cancelling: false,
      // The three terminal states, each its own thing rather than a
      // progress line that stopped moving: `result` is the file that
      // landed, `cancelled` is what had been read when the user stopped
      // it, `downloadError` is why nothing landed.
      result: null,
      cancelled: null,
      // Warnings a format plugin raised while writing -- Shapefile's
      // column renames and field overflows, which are only knowable once
      // the data has been seen.
      runWarnings: [],
      // Bumped whenever a format plugin may have finished loading; see
      // `formatChoices`.
      formatsVersion: 0,
      showMoreFormats: false,
      lastFormat: '',
      // A sentence about something that did not happen and was nobody's
      // fault -- the save dialog being dismissed is the only one so far.
      notice: '',
      ceiling: null,
      // Resolves the `startDownload` loop's wait while `requestHandle` is
      // `blocked` on the ceiling -- set only for that wait's lifetime, and
      // called by `acceptCeiling()`/`cancel()` with which way the user
      // went. See `startDownload`'s doc comment for why this exists.
      ceilingGate: null,
      showCode: false,
      request: null,
      geocoder: null,
      indexAttribution: [],
      codeGenerators: markRaw(downloadGenerators.map(Generator => new Generator()))
    };
  },
  computed: {
    ...mapState(['data']),
    support() {
      return describeDataset(this.data, { assetKey: this.assetKey });
    },
    descriptor() {
      return this.support.supported ? this.support.descriptor : null;
    },
    // --- what to download ----------------------------------------------
    assetOptions() {
      return this.support.assets || [];
    },
    // The table the chosen asset declares, which is what the filters below
    // are built from. A multi-asset collection declares one per asset; a
    // single-asset one declares it at the top level; an asset that declares
    // nothing gets its table inferred from the parquet footer by
    // `estimate()`, in which case there is nothing to offer here.
    tableColumns() {
      return this.descriptor?.table?.columns || [];
    },
    filterableColumns() {
      const geometryColumn = this.descriptor?.table?.geometryColumn;
      return this.tableColumns.filter(column => {
        if (!column?.name || column.name === geometryColumn) {
          return false;
        }
        return !UNFILTERABLE.test(column.type || '');
      });
    },
    // --- when ----------------------------------------------------------
    timeColumn() {
      return this.descriptor?.table?.timeColumn || '';
    },
    extent() {
      return temporalExtent(this.support.json);
    },
    extentInput() {
      return {
        start: toDateInput(this.extent?.start),
        end: toDateInput(this.extent?.end)
      };
    },
    timeInverted() {
      return windowInverted(this.timeWindow);
    },
    timePresets() {
      const whole = this.extentInput;
      const days = [DEFAULT_WINDOW_DAYS, 365];
      const presets = days.map(count => {
        const window = defaultWindow(this.extent, { days: count }) || whole;
        return { key: count === DEFAULT_WINDOW_DAYS ? 'last30' : 'lastYear', window };
      });
      presets.push({ key: 'whole', window: whole });
      return presets.map(preset => ({
        ...preset,
        active: preset.window.start === this.timeWindow.start && preset.window.end === this.timeWindow.end
      }));
    },
    // --- which rows ----------------------------------------------------
    // Only the rows a user has finished typing: a predicate with no value
    // is a half-built thought, not a filter, and sending it would change
    // the estimate to something the card cannot explain.
    activePredicates() {
      return this.predicates
        .filter(row => row.col && row.op && (NULLARY_OPS.includes(row.op) || String(row.value).trim() !== ''))
        .map(row => (NULLARY_OPS.includes(row.op)
          ? { col: row.col, op: row.op }
          : { col: row.col, op: row.op, value: this.coerceValue(row) }));
    },
    datasetTitle() {
      return this.descriptor?.title || this.data?.id || '';
    },
    refusal() {
      if (this.support.supported) {
        return '';
      }
      return this.support.message
        ? this.$t('widgets.areaDownload.unsupportedReason', { reason: this.support.message })
        : this.$t('widgets.areaDownload.unsupported');
    },
    attribution() {
      const entries = this.descriptor?.attribution || [];
      const parts = entries.map(entry => [entry.text, entry.license].filter(Boolean).join(' · '));
      for (const entry of this.indexAttribution) {
        parts.push([entry.text, entry.license].filter(Boolean).join(' · '));
      }
      return parts.filter(Boolean).join(' | ');
    },
    progressStyle() {
      return this.progressPercent === null ? {} : { width: `${this.progressPercent}%` };
    },
    // One line per warning, not one paragraph of all of them: a licence
    // obligation and "this estimate is wide" are different kinds of thing
    // and reading them as one run-on sentence loses both.
    warnings() {
      return (this.estimateResult?.warnings || []).map(warning => this.warningText(warning));
    },
    // --- the estimate, said honestly (O12) ------------------------------
    rowsBounded() {
      return describeBounded(this.estimateResult?.rows, formatCount);
    },
    readBounded() {
      return describeBounded(this.estimateResult?.readBytes, formatBytes);
    },
    // The row cap is a different kind of number from the model's own
    // bounds: when `capBounded` has pushed the estimate up against the
    // limit, "≈100,000 (0 – 100,000)" claims a measurement where the truth
    // is "as many as the limit allows". So that case says "up to" and
    // points at the limit, and only the un-capped cases get the model's
    // own hedge.
    rowsPrimary() {
      if (!this.rowsBounded) {
        return '';
      }
      if (this.limitBinds && this.rowsBounded.estimate === this.rowsBounded.max) {
        return this.$t('widgets.areaDownload.estimate.upTo', { value: this.rowsBounded.max });
      }
      return this.boundedPrimary(this.rowsBounded);
    },
    rowsDetail() {
      if (!this.rowsBounded) {
        return '';
      }
      if (this.limitBinds && this.rowsBounded.estimate === this.rowsBounded.max) {
        return this.$t('widgets.areaDownload.estimate.theLimit');
      }
      return this.boundedDetail(this.rowsBounded);
    },
    whyLines() {
      return pruneLines(this.estimateResult);
    },
    // Did the row cap, rather than the data, decide the number on screen?
    // Then the number means "at most this", and saying so is the difference
    // between an estimate and a coincidence.
    limitBinds() {
      const rows = this.estimateResult?.rows;
      return Boolean(rows && this.limit !== undefined && rows.max >= this.limit);
    },
    // An estimate whose own upper bound is zero: there is nothing in this
    // request, whatever the format buttons would otherwise suggest.
    emptyEstimate() {
      return Boolean(this.estimateResult && this.estimateResult.rows.max === 0);
    },
    // ...and the date window is why, which the cascade says outright: a
    // stage that went to zero is the one that emptied the request.
    emptyBecauseTime() {
      if (!this.emptyEstimate || !this.timeEnabled) {
        return false;
      }
      return (this.estimateResult.prune || []).some(
        stage => (stage.stage === 'part-time' || stage.stage === 'row-group-stats') && stage.after === 0
      );
    },
    // What the estimate says about the ceiling, before anything has been
    // clicked. `download()` checks it again with the real format's byte
    // model, so this can differ slightly from the gate -- it is a warning,
    // not the refusal itself.
    estimateCeiling() {
      const ceiling = this.estimateResult?.ceiling;
      return ceiling?.exceeded ? ceiling : null;
    },
    ceilingBreaches() {
      return ((this.ceiling || this.estimateCeiling)?.breaches || [])
        .map(breach => this.$t(`widgets.areaDownload.breaches.${breach}`))
        .join(', ');
    },
    // Each format's own byte model from the registry, beside its own
    // button. One "output size" row for all of them was a number that was
    // wrong for whichever one you picked: GeoJSON text of the same rows
    // runs roughly three times a GeoParquet file, and a Shapefile's DBF
    // several times that again.
    formatChoices() {
      // `formatsVersion` is the dependency that makes this recompute when
      // a lazy plugin finishes loading: the registry's load state is not
      // reactive, so without it a format would keep advertising a weight
      // it has already paid.
      void this.formatsVersion;
      const rows = this.estimateResult?.rows;
      const schema = (this.estimateResult?.columns || []).map(name => ({ name, type: 'unknown' }));
      // `allowedFormats` (the app's `areaDownloadFormats` config option)
      // restricts the offer to these ids; null or empty means "all of
      // them", which is also what today's behaviour without the prop set
      // must stay identical to.
      const available = Array.isArray(this.allowedFormats) && this.allowedFormats.length > 0
        ? listFormats().filter(entry => this.allowedFormats.includes(entry.id))
        : listFormats();
      return available.map(entry => {
        const bounded = rows && entry.estimateBytes
          ? describeBounded(entry.estimateBytes(schema, rows), formatBytes)
          : null;
        // What this format's plugin still has to fetch. Shown before the
        // click, which is the only moment it can change anyone's mind: a
        // 340 KB wasm is worth knowing about, and worth not fetching for
        // the user who wanted GeoParquet.
        const weight = pluginWeight(entry);
        return {
          id: entry.id,
          label: entry.label,
          size: bounded ? this.boundedPrimary(bounded) : '',
          weight: weight ? this.$t('widgets.areaDownload.download.weight', { bytes: formatBytes(weight) }) : '',
          // The two that need nothing are the ones most people want, and
          // they look it.
          primary: entry.id === 'geojson' || entry.id === 'geoparquet',
          title: [
            bounded
              ? this.$t('widgets.areaDownload.download.sizeHint', {
                format: entry.label,
                min: bounded.min,
                max: bounded.max
              })
              : entry.label,
            weight ? this.$t('widgets.areaDownload.download.weightHint', { bytes: formatBytes(weight) }) : ''
          ].filter(Boolean).join(' — ')
        };
      });
    },
    primaryFormats() {
      return this.formatChoices.filter(format => format.primary);
    },
    moreFormats() {
      return this.formatChoices.filter(format => !format.primary);
    },
    // --- the run -------------------------------------------------------
    paused() {
      return this.downloadState === 'paused';
    },
    canPause() {
      return this.downloadState === 'running';
    },
    // Whether the finished bytes go straight to a file the user named.
    // Under automation the native dialog is skipped: a WebDriver session
    // cannot dismiss a modal the page did not draw, so a test would hang on
    // it instead of getting a file.
    //
    // What this skips is NOT just the dialog -- it is the whole sink.
    // `false` here means `blobSink()` and the anchor; `true` means
    // `fileSystemSink()` and a `FileSystemWritableFileStream`, which is a
    // different destination with a different commit. So no test that runs
    // under WebDriver exercises the picker path, and a commit bug in that
    // sink once shipped past this whole suite (0-byte files under a card
    // reporting 7.3 MB). The
    // regression test for it lives in @cng/download-core, driving a real
    // OPFS writable, because that is the layer that can be tested headless.
    usePicker() {
      if (this.directSave === 'anchor' || typeof window.showSaveFilePicker !== 'function') {
        return false;
      }
      return this.directSave === 'picker' || !navigator.webdriver;
    }
  },
  watch: {
    // A different table means different columns, a possibly different time
    // column and a different estimate. Everything derived from the old one
    // has to go, including the filters the user built against columns that
    // may not exist in the new one.
    assetKey() {
      this.predicates = [];
      this.initTimeWindow();
      this.resetDownload();
      this.estimateResult = null;
      this.estimateError = '';
      this.runEstimate();
    }
  },
  created() {
    this.map = null;
    this.areaLayer = null;
    this.bboxDraw = null;
    this.polygonDraw = null;
    this.editTool = null;
    this.editTimer = null;
    this.searchControl = null;
    this.handle = null;
    this.detachDrop = null;
    this.unsubscribeMap = null;
    this.unsubscribeStyle = null;
    this.dropTimer = null;
    this.attentionTimer = null;
    this.filterTimer = null;
    this.startedAt = 0;
    this.lastProgressRows = 0;
    this.blobUrls = [];
    this._estimateToken = 0;
    // Push, not poll (design doc §3.4 amendment, "format load state was
    // pull-only"): `formats()`/`formatLoadState()` are pull-only, and a
    // lazy format's state moves asynchronously underneath a UI that has
    // already rendered. Bumping `formatsVersion` here -- `formatChoices`'s
    // only dependency on it -- on every registration and load transition
    // (`'idle'` → `'loading'` → `'loaded'`/`'failed'`) means a format that
    // fails to load shows that in the picker the moment it fails, not only
    // after whatever `startDownload` happened to be running settles.
    this.unsubscribeFormatState = onFormatState(() => {
      this.formatsVersion += 1;
    });
  },
  async mounted() {
    if (!this.support.supported || !this.mapHost) {
      if (!this.mapHost) {
        console.warn('AreaDownload needs the map-overlay hook: no map host was provided.');
      }
      return;
    }
    // On a phone the open cluster plus a card is most of the map. The pill
    // is the same affordance in 36 pixels, and the pulse below says it is
    // there.
    this.open = !window.matchMedia?.(NARROW_MAP).matches;
    // The picker binds to `assetKey`, so it has to name the asset the
    // derivation actually chose rather than `null`, or the select renders
    // with nothing selected while the card describes the first table.
    this.assetKey = this.support.assetKey || null;
    // Before the first estimate, so the first one already carries the
    // window: on a 26-year archive, running it over everything first and
    // then narrowing is a minute of range requests nobody asked for.
    this.initTimeWindow();
    await useAppHyparquet();
    this.unsubscribeMap = this.mapHost.onMap(map => this.bindMap(map));
    // Re-stacking the layer list either drops what this widget added (a
    // basemap `setStyle`) or buries it (the collection's own GL style, whose
    // data layers go in below the basemap's labels and therefore above
    // anything added before them). The host says when it happened; without
    // this the outline either never appears or appears under the data.
    this.unsubscribeStyle = this.mapHost.onStyleReload(() => this.attachMapLayers());
    this.flashAttention();
  },
  beforeUnmount() {
    this.handle?.cancel('widget unmounted');
    // Otherwise a widget unmounted while `blocked` on the ceiling leaves
    // `startDownload`'s wait loop awaiting a gate nobody will ever signal.
    this.ceilingGate?.('cancel');
    this.unsubscribeMap?.();
    this.unsubscribeStyle?.();
    this.unsubscribeFormatState?.();
    this.geocoder?.close();
    this.releaseMap();
    clearTimeout(this.dropTimer);
    clearTimeout(this.attentionTimer);
    clearTimeout(this.filterTimer);
    for (const url of this.blobUrls) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls = [];
  },
  methods: {
    // --- the map -------------------------------------------------------
    bindMap(map) {
      this.releaseMap();
      this.map = map ? markRaw(map) : null;
      if (!this.map) {
        return;
      }
      this.attachMapLayers();
      this.mountSearch();
      // Dropping a file on the map is the same gesture as dropping it on an
      // upload box, and the map is what the user is looking at.
      this.detachDrop = attachDropTarget(
        this.map.getContainer(),
        ({ area, warnings }) => this.onUploaded(area, warnings),
        { onError: error => { this.areaError = this.formatError(error); } }
      );
      const container = this.map.getContainer();
      container.addEventListener('dragover', this.onDragOver);
      container.addEventListener('drop', this.onDropEnd);
    },
    releaseMap() {
      if (this.detachDrop) {
        this.detachDrop();
        this.detachDrop = null;
      }
      if (this.map) {
        const container = this.map.getContainer();
        container.removeEventListener('dragover', this.onDragOver);
        container.removeEventListener('drop', this.onDropEnd);
      }
      if (this.searchControl) {
        this.searchControl.onRemove();
        this.searchControl = null;
      }
      if (this.$refs.search) {
        this.$refs.search.replaceChildren();
      }
      this.bboxDraw?.destroy();
      this.bboxDraw = null;
      this.polygonDraw?.remove();
      this.polygonDraw = null;
      this.stopEditing();
      this.drawArmed = false;
      this.polygonArmed = false;
      this.areaLayer = null;
      this.map = null;
    },
    // Idempotent: called when the map arrives and again on every re-stacking
    // of the layer list, which either dropped what this added or pushed data
    // layers above it. Removing first is what makes the re-add a *raise*:
    // `addAreaLayer` leaves existing layers alone, so without the remove the
    // outline would stay wherever it already was in the stack.
    attachMapLayers() {
      if (!this.map) {
        return;
      }
      this.areaLayer?.remove();
      this.areaLayer = markRaw(addAreaLayer(this.map, {
        id: 'area-download',
        // Amber, not the app's blue: the outline has to read over whatever
        // the collection's own style paints underneath it, and Portolan's
        // sequential ramps are blues and purples.
        lineColor: '#e5a100',
        lineWidth: 3,
        fillColor: '#e5a100',
        // Barely there on purpose: the area is a frame around the data, and
        // the user is here to look at the data inside it.
        fillOpacity: 0.07
      }));
      const wasArmed = this.drawArmed;
      const wasPolygonArmed = this.polygonArmed;
      this.bboxDraw?.destroy();
      this.bboxDraw = markRaw(new BboxDrawInteraction(this.map, extent => this.areaFromExtent(extent)));
      this.drawArmed = this.bboxDraw.setArmed(wasArmed);
      this.polygonDraw?.remove();
      this.polygonDraw = markRaw(createDrawTool(this.map, {
        tools: ['polygon'],
        id: 'area-download-draw',
        names: { drawn: this.$t('widgets.areaDownload.area.drawnName') }
      }));
      // `on('area')` hands back a finished Area built by @cng/spec, so
      // unlike the box tool there is no extent to turn into one here.
      this.polygonDraw.on('area', ({ area }) => {
        this.polygonArmed = false;
        this.setArea(area);
      });
      this.polygonDraw.on('cancel', () => { this.polygonArmed = false; });
      this.polygonDraw.on('disarmed', () => { this.polygonArmed = false; });
      if (wasPolygonArmed) {
        this.polygonDraw.arm('polygon');
      }
      this.polygonArmed = this.polygonDraw.armed;
      // The draw rectangle is only the rubber band of a drag in progress.
      // Once there is an area, the amber outline *is* that box, and drawing
      // a dashed blue one over it says nothing extra.
      if (this.area) {
        this.areaLayer.setArea(this.area);
      }
      // A style reload drops every source and layer added from outside, the
      // editor's handles among them -- so switching basemap mid-edit would
      // otherwise leave the toggle saying "Done editing" over a map with
      // nothing to drag. Rebuild the editor on the area as it now stands,
      // keeping the edits already made.
      if (this.editing) {
        const edited = this.area;
        this.stopEditing();
        this.applyArea(edited);
        this.startEditing();
      }
    },
    // @cng/maplibre's GeocoderControl, built as a MapLibre IControl: it
    // takes the real map, reads the real viewport to bias ranking, and
    // brings its own combobox a11y. Its element goes into this widget's
    // cluster rather than a MapLibre corner container (which is all
    // `map.addControl` would do with it) so that it sits beside the draw and
    // upload buttons as one tool, instead of stacking above them.
    mountSearch() {
      // No gazetteer configured (`indexUrl: null`): no GeocoderControl, no
      // Geocoder, no fetch -- draw/upload/download are unaffected, since
      // none of them go through this method.
      if (!this.indexUrl || !this.$refs.search || this.searchControl) {
        return;
      }
      const control = new GeocoderControl({
        geocoder: this.ensureGeocoder(),
        placeholder: this.$t('widgets.areaDownload.area.placeholder'),
        limit: 8,
        // This widget owns the single outline layer and the single fit, for
        // all three ways of picking an area; the control must not add a
        // second one of each.
        outline: false,
        fitBounds: false,
        // The card carries attribution, where it sits beside the dataset's.
        showAttribution: false
      });
      this.$refs.search.appendChild(control.onAdd(this.map));
      control.on('select', ({ area }) => this.setArea(area));
      control.on('upgrade', ({ area }) => this.upgradeArea(area));
      control.on('error', error => { this.areaError = this.formatError(error); });
      this.searchControl = markRaw(control);
    },
    ensureGeocoder() {
      if (!this.geocoder) {
        const geocoder = new Geocoder({
          indexUrl: this.indexUrl,
          limit: 8,
          // `'both'` hands back the display-simplified outline at once and
          // finishes the full-resolution filter geometry in the background.
          // Without it the download would filter on the simplified outline,
          // which is drawn deliberately *outward* of the true boundary -- so
          // it would over-select at the edges. Set on the Geocoder rather
          // than per select() call, because GeocoderControl owns the call.
          // `upgradeDisplay` swaps the *visible* outline to the
          // full-resolution geometry too once that background fetch lands
          // (via the control's 'upgrade' event -> upgradeArea below).
          // Without it the drawn outline stays simplified forever, which
          // reads as "the full-detail load did nothing" next to the
          // "full detail loaded" notice.
          geometry: { resolution: 'both', upgradeDisplay: true }
        });
        // The index carries its own licence (the geoBoundaries index is
        // CC-BY) and only knows it once loaded. Copy it into reactive state:
        // reading `geocoder.attribution` off the markRaw'd object would
        // leave the credit off the page until some unrelated render happened
        // to pick it up.
        geocoder.on('state', ({ state }) => {
          if (state === 'ready') {
            this.indexAttribution = [...geocoder.attribution];
          }
        });
        this.geocoder = markRaw(geocoder);
      }
      return this.geocoder;
    },

    // --- the cluster ---------------------------------------------------
    openTools() {
      this.open = true;
      this.attention = false;
      this.$nextTick(() => this.searchControl?.focus());
    },
    // One pass of a slow glow on the pill when a downloadable collection
    // loads, so the affordance is noticed once without becoming furniture.
    // Honoured as a no-op under prefers-reduced-motion by the stylesheet.
    flashAttention() {
      this.attention = true;
      this.attentionTimer = setTimeout(() => { this.attention = false; }, ATTENTION_MS);
    },
    toggleDraw() {
      if (!this.bboxDraw) {
        return;
      }
      // Two armed tools at once would race for the same clicks, and the
      // user only ever means one of them.
      this.disarmPolygon();
      this.drawArmed = this.bboxDraw.setArmed(!this.drawArmed);
    },
    togglePolygonDraw() {
      if (!this.polygonDraw) {
        return;
      }
      this.drawArmed = this.bboxDraw?.setArmed(false) ?? false;
      if (this.polygonDraw.armed) {
        this.polygonDraw.disarm();
      } else {
        this.polygonDraw.arm('polygon');
      }
      this.polygonArmed = this.polygonDraw.armed;
    },
    disarmPolygon() {
      this.polygonDraw?.disarm();
      this.polygonArmed = false;
    },

    // --- editing an existing area ----------------------------------------
    toggleEdit() {
      if (this.editing) {
        this.stopEditing();
      } else {
        this.startEditing();
      }
    },
    startEditing() {
      if (!this.map || !this.area || this.editing) {
        return;
      }
      // Arming a draw tool and editing at the same time means two things
      // competing for a click on the map.
      this.drawArmed = this.bboxDraw?.setArmed(false) ?? false;
      this.disarmPolygon();
      // The editor draws its own outline and handles, so the static amber
      // outline underneath would just be a second copy of the same ring
      // lagging a frame behind every drag.
      this.areaLayer?.setArea(null);
      this.editTool = markRaw(createEditTool(this.map, this.area, { id: 'area-download-edit' }));
      // Every gesture that changes the ring emits a fresh, fully-built Area
      // with `provenance.source: 'edited'` and a re-derived `filterGeometry`
      // -- so the estimate below, and any download started after it, filter
      // on the shape the user is actually looking at.
      this.editTool.on('change', ({ area }) => this.onEdited(area));
      this.editing = true;
    },
    stopEditing() {
      clearTimeout(this.editTimer);
      this.editTimer = null;
      this.editTool?.remove();
      this.editTool = null;
      if (this.editing) {
        this.editing = false;
        // Hand the ring back to the static outline.
        this.areaLayer?.setArea(this.area);
      }
    },
    // A drag emits on mouseup, but a user nudging three corners in a row
    // would otherwise start three estimates. Debounced on the same timer
    // idiom the filter controls use.
    onEdited(area) {
      this.area = markRaw(area);
      this.resetDownload();
      clearTimeout(this.editTimer);
      this.editTimer = setTimeout(() => this.runEstimate(), EDIT_DEBOUNCE_MS);
    },
    onEscape(event) {
      // The geocoder's combobox owns Escape for closing its listbox.
      if (event.target?.closest?.('.ad-search')) {
        return;
      }
      if (this.drawArmed) {
        this.drawArmed = this.bboxDraw?.setArmed(false) ?? false;
        return;
      }
      // The polygon tool handles its own Escape (mid-draw it has vertices to
      // throw away), so by the time one reaches here it is already disarmed
      // -- but a stray flag would leave the button stuck looking active.
      if (this.polygonArmed) {
        this.disarmPolygon();
        return;
      }
      // Escape leaves the editor before it collapses the cluster: the
      // handles are the most recent thing the user opted into.
      if (this.editing) {
        this.stopEditing();
        return;
      }
      if (this.open) {
        this.open = false;
      }
    },
    onDragOver() {
      this.dropActive = true;
      clearTimeout(this.dropTimer);
      // `dragleave` fires crossing every child of the map, so the hint would
      // flicker. A timer that the continuous `dragover` keeps resetting is
      // steady, and it also clears itself if the pointer leaves the window.
      this.dropTimer = setTimeout(() => { this.dropActive = false; }, 150);
    },
    onDropEnd() {
      clearTimeout(this.dropTimer);
      this.dropActive = false;
      this.open = true;
    },
    areaFromExtent(extent) {
      this.drawArmed = Boolean(this.bboxDraw?.armed);
      if (!extent) {
        this.clearArea();
        return;
      }
      const [west, south, east, north] = extent;
      const ring = [[west, south], [east, south], [east, north], [west, north], [west, south]];
      this.setArea(buildArea({
        name: this.$t('widgets.areaDownload.area.drawnName'),
        geometry: { type: 'Polygon', coordinates: [ring] },
        source: 'draw',
        features: []
      }));
    },
    async onUpload(event) {
      const input = event.target;
      const file = input.files?.[0];
      if (!file) {
        return;
      }
      this.areaError = '';
      try {
        const { area, warnings } = await areaFromFile(file);
        this.onUploaded(area, warnings);
      } catch (error) {
        this.areaError = this.formatError(error);
      } finally {
        // So picking the same file twice in a row still fires `change`.
        input.value = '';
      }
    },
    onUploaded(area, warnings = []) {
      this.setArea(area);
      this.areaError = warnings.length > 0
        ? this.$t('widgets.areaDownload.area.uploadWarnings', {
          warnings: warnings.map(warning => warning.code).join(', ')
        })
        : '';
    },

    // --- the area ------------------------------------------------------
    // A new area: everything computed from the old one is now wrong, and the
    // estimate for the new one starts at once. Metadata-only, so it costs a
    // few range requests and no row data -- cheap enough that making the
    // user press a button for it was the wrong trade.
    setArea(area) {
      // A brand-new area from search/draw/upload: the editor open over the
      // old one is editing a shape that no longer exists.
      this.stopEditing();
      // Re-add first, which raises the outline above whatever has been
      // stacked over it since. MapView announces the re-stackings it knows
      // about, but StacMapLayer also re-binds the active style on its own
      // when assets finish loading, and that is not a MapView event.
      this.attachMapLayers();
      this.applyArea(area);
      this.resetDownload();
      this.areaError = '';
      this.areaLayer?.fit({ padding: 60, maxZoom: MAX_ZOOM });
      // The rubber band has done its job; the outline takes over.
      this.bboxDraw?.setExtent(null);
      this.runEstimate();
    },
    // The same area at full resolution, arriving from the geocoder's
    // background upgrade. It must not clear the estimate: the upgrade lands
    // whenever the boundary file finishes loading, which can be after the
    // estimate has already been shown, and taking a result away because
    // something finished in the background is indefensible. The numbers stay
    // valid: the upgrade can only *tighten* the picture -- with
    // `upgradeDisplay` the bbox is re-derived from the full geometry, which
    // sits inside the outward-buffered display one -- and the download
    // rebuilds its request from `this.area`, so it filters on the
    // full-resolution geometry.
    //
    // Dropped, not applied, when the user has moved on from the selection
    // this upgrade belongs to: a draw/upload/edit builds a *new* Area (fresh
    // id), and applying the stale geocoder area here would silently discard
    // their shape. Same mid-edit, where the id still matches: applyArea
    // would re-show the static outline that startEditing deliberately
    // removed, a frame behind the editor's own ring.
    upgradeArea(area) {
      if (this.editing || this.area?.id !== area.id) {
        return;
      }
      this.applyArea(area);
    },
    applyArea(area) {
      this.area = markRaw(area);
      this.areaLayer?.setArea(area);
    },
    clearArea() {
      this.stopEditing();
      this._estimateToken += 1;
      this.area = null;
      this.areaError = '';
      this.estimateResult = null;
      this.estimateError = '';
      this.estimating = false;
      this.showCode = false;
      this.request = null;
      this.areaLayer?.setArea(null);
      this.bboxDraw?.setExtent(null);
      this.searchControl?.clear();
      this.resetDownload();
    },

    // --- the filters ---------------------------------------------------
    // A label a user can choose between: the asset's own title, then what
    // it costs to say yes to it. Row counts and file sizes come from the
    // asset's `table:row_count`/`file:size`, so they are free -- no request
    // is made to put a number in a dropdown.
    assetLabel(option) {
      const parts = [option.title];
      if (option.rowCount !== undefined) {
        parts.push(this.$t('widgets.areaDownload.asset.rows', { rows: formatCount(option.rowCount) }));
      }
      if (option.bytes !== undefined) {
        parts.push(formatBytes(option.bytes));
      }
      if (option.aggregate) {
        parts.push(this.$t('widgets.areaDownload.asset.aggregate'));
      }
      if (option.overview) {
        parts.push(this.$t('widgets.areaDownload.asset.overview'));
      }
      return parts.length > 1 ? `${parts[0]} (${parts.slice(1).join(', ')})` : parts[0];
    },
    // The window the card opens with: the last 30 days of the declared
    // extent, and only when the extent is wide enough for that to mean
    // anything (see utils/download/time.js). A dataset whose extent is a
    // single season comes up whole.
    initTimeWindow() {
      const window = this.timeColumn ? defaultWindow(this.extent) : null;
      this.timeEnabled = Boolean(window);
      this.timeWindow = window || { start: this.extentInput.start, end: this.extentInput.end };
    },
    applyPreset(preset) {
      this.timeWindow = { ...preset.window };
      this.onFilterChange();
    },
    // The way out of an empty window, with no wait for the debounce: the
    // user has already decided.
    useWholeRange() {
      clearTimeout(this.filterTimer);
      this.timeWindow = { start: this.extentInput.start, end: this.extentInput.end };
      this.runEstimate();
    },
    addPredicate() {
      const column = this.filterableColumns[0];
      if (!column) {
        return;
      }
      this.predicateSeq += 1;
      this.predicates.push({
        id: this.predicateSeq,
        col: column.name,
        op: this.operatorsFor(column.name)[0],
        value: ''
      });
    },
    removePredicate(index) {
      this.predicates.splice(index, 1);
      this.onFilterChange();
    },
    // A new column can invalidate the operator (`ilike` on a number), so
    // the row keeps its operator only when the new column still offers it.
    onPredicateColumn(row) {
      const allowed = this.operatorsFor(row.col);
      if (!allowed.includes(row.op)) {
        row.op = allowed[0];
      }
      this.onFilterChange();
    },
    columnType(name) {
      return this.tableColumns.find(column => column.name === name)?.type || '';
    },
    isNumericColumn(name) {
      return NUMERIC_TYPE.test(this.columnType(name));
    },
    operatorsFor(name) {
      return this.isNumericColumn(name) ? NUMERIC_OPS : STRING_OPS;
    },
    nullaryOp(op) {
      return NULLARY_OPS.includes(op);
    },
    // `>=` is not an i18n key. The operators are named by what they mean,
    // so a translation can say "is at least" where that reads better.
    opKey(op) {
      return {
        '=': 'eq',
        '!=': 'ne',
        '>': 'gt',
        '>=': 'ge',
        '<': 'lt',
        '<=': 'le',
        ilike: 'contains',
        not_like: 'notLike',
        is_null: 'isNull',
        is_not_null: 'isNotNull'
      }[op] || 'eq';
    },
    // `ilike` is a pattern operator, and a user typing `wheat` means
    // "contains wheat", not "is exactly wheat" -- so the wildcards are
    // added here rather than asked for. A number column's value is coerced
    // to a number, because `compareScalar` compares `'5' > 10` as strings.
    coerceValue(row) {
      const value = String(row.value).trim();
      if (row.op === 'ilike' || row.op === 'not_like') {
        return value.includes('%') ? value : `%${value}%`;
      }
      if (this.isNumericColumn(row.col)) {
        const number = Number(value);
        return Number.isNaN(number) ? value : number;
      }
      return value;
    },
    // Any filter change re-estimates, debounced: the numbers belong to the
    // controls, and an estimate the user has to ask for is an estimate they
    // will not get (which is why the first one runs by itself too).
    onFilterChange() {
      clearTimeout(this.filterTimer);
      this.filterTimer = setTimeout(() => this.runEstimate(), FILTER_DEBOUNCE_MS);
    },

    // --- estimate ------------------------------------------------------
    buildFilter() {
      const time = this.timeEnabled && !this.timeInverted ? toTimeFilter(this.timeWindow) : null;
      return {
        spec: 'cng-filter/1.0',
        spatial: { mode: this.area ? 'intersects' : 'bbox' },
        // The prop's predicates are the deployment's; the card's are the
        // user's. Both apply, ANDed, which is what `FilterSpec.where` is.
        where: [...this.where, ...this.activePredicates],
        ...(time ? { time } : {}),
        limit: this.limit
      };
    },
    boundedPrimary(described) {
      if (!described) {
        return '';
      }
      if (described.kind === 'exact') {
        return described.estimate;
      }
      // O12: when the model has little to go on, the range *is* the answer
      // and the point estimate is the footnote. The other way round reads
      // as a measurement.
      if (described.kind === 'wide') {
        return this.$t('widgets.areaDownload.estimate.span', { min: described.min, max: described.max });
      }
      return this.$t('widgets.areaDownload.estimate.approx', { value: described.estimate });
    },
    boundedDetail(described) {
      if (!described || described.kind === 'exact') {
        return '';
      }
      if (described.kind === 'wide') {
        return this.$t('widgets.areaDownload.estimate.likely', { value: described.estimate });
      }
      return this.$t('widgets.areaDownload.estimate.bounds', { min: described.min, max: described.max });
    },
    /** `row-group-bbox` -> `rowGroupBbox`, for the narration's i18n keys. */
    stageKey(stage) {
      return String(stage).replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    },
    // The cascade's stage names come from @cng/download-core, which is
    // free to grow one. A stage this app has no sentence for is shown by
    // its own name rather than as a missing-key path.
    stageLabel(stage) {
      const key = `widgets.areaDownload.prune.${this.stageKey(stage)}`;
      return this.$te(key) ? this.$t(key) : stage;
    },
    phaseLabel(phase) {
      const key = `widgets.areaDownload.download.phases.${phase}`;
      return this.$te(key) ? this.$t(key) : phase;
    },
    formatCount,
    formatBytes,
    async runEstimate() {
      if (!this.area || !this.descriptor) {
        return;
      }
      // Areas can be replaced faster than an estimate finishes (type, pick,
      // pick again). Only the newest one may write to the card.
      const token = ++this._estimateToken;
      this.estimating = true;
      this.estimateResult = null;
      this.estimateError = '';
      try {
        const result = await estimate(this.descriptor, this.area, this.buildFilter());
        if (token !== this._estimateToken) {
          return;
        }
        this.estimateResult = markRaw(result);
        this.updateRequest('geoparquet');
      } catch (error) {
        if (token !== this._estimateToken) {
          return;
        }
        this.estimateError = this.formatError(error);
      } finally {
        if (token === this._estimateToken) {
          this.estimating = false;
        }
      }
    },
    updateRequest(format) {
      const filter = this.buildFilter();
      this.request = markRaw({
        spec: 'cng-request/1.0',
        dataset: this.descriptor,
        filter: this.area ? { ...filter, area: toAreaDocument(this.area) } : filter,
        output: this.outputFor(format),
        generator: {
          name: 'portolan-browser/AreaDownload',
          version: VERSION,
          at: new Date().toISOString()
        }
      });
    },
    // The registry knows each format's extension and media type, including
    // Shapefile's two-part `shp.zip`, so neither is hardcoded here.
    formatEntry(format) {
      return listFormats().find(entry => entry.id === format);
    },
    outputFor(format) {
      const base = (this.descriptor?.id || 'download').replace(/[^\w.-]+/g, '-');
      const entry = this.formatEntry(format);
      return {
        spec: 'cng-output/1.0',
        format,
        filename: `${base}.${entry?.extension || format}`
      };
    },

    // --- download ------------------------------------------------------
    async startDownload(format) {
      if (this.downloading) {
        return;
      }
      const output = this.outputFor(format);

      // The save dialog has to open inside this click's own activation
      // window. Anything awaited before it -- the hyparquet-writer import,
      // the first range request -- spends that activation and the browser
      // throws instead of asking. So: destination first, bytes second.
      let handle = null;
      if (this.usePicker) {
        const entry = this.formatEntry(format);
        try {
          handle = await window.showSaveFilePicker({
            suggestedName: output.filename,
            types: [{
              description: entry?.label || format,
              accept: {
                [entry?.mediaType || 'application/octet-stream']: [pickerExtension(entry?.extension || format)]
              }
            }]
          });
        } catch (error) {
          if (error?.name === 'AbortError') {
            this.notice = this.$t('widgets.areaDownload.download.dismissed');
            return;
          }
          // Any other picker failure (a browser that has the function but
          // refuses the call) is not worth a dead end: write a Blob instead.
          handle = null;
        }
      }

      this.resetDownload();
      this.downloading = true;
      this.lastFormat = format;
      this.progressPercent = null;
      this.progress = this.$t('widgets.areaDownload.download.planning');
      this.startedAt = Date.now();
      this.updateRequest(format);
      try {
        // GeoParquet output needs hyparquet-writer, loaded on demand so a
        // GeoJSON download never pays for it.
        await useAppHyparquet({ writer: format === 'geoparquet' });
        const sink = handle ? await fileSystemSink({ handle }) : blobSink();
        // Routed through downloadRequest() so the thing that runs is the
        // same serialized request the code panel shows. If they ever
        // diverge, the snippet is a lie.
        const requestHandle = downloadRequest(this.request, this.area, { sink });
        this.handle = markRaw(requestHandle);
        requestHandle.on('progress', event => this.onProgress(event));
        // A format plugin can only say some things once it has seen the
        // data: Shapefile renames a column that is over dBase's
        // ten-character limit, drops the time off a date, overflows a
        // numeric field. Those arrive as `warning` events and belong with
        // the file they describe, not in a console nobody opens.
        requestHandle.on('warning', warning => this.addRunWarning(warning));
        // `pause`/`resume` are only meaningful while the handle says it is
        // running, and only the handle knows -- it moves through
        // planning/blocked/running/paused/done on its own.
        requestHandle.on('state', ({ state }) => { this.downloadState = state; });
        requestHandle.on('ceiling', event => {
          this.ceiling = markRaw(event.estimate.ceiling);
        });
        // See `awaitDownloadResult`'s doc comment: a ceiling breach rejects
        // `requestHandle.result` rather than this `await` hanging forever,
        // and that method is what waits out the user's decision and, on
        // acceptance, picks up the continued run's promise.
        const result = await this.awaitDownloadResult(requestHandle);
        if (!handle) {
          this.saveBlob(sink.blob, result.filename);
        }
        this.progress = '';
        this.result = markRaw({
          filename: result.filename,
          rows: result.rows,
          bytes: result.bytes,
          format,
          truncated: result.truncated,
          // Not `result.elapsedMs`: download-core reports the *estimate's*
          // elapsed time there (download.js builds the result with
          // `elapsedMs: est.elapsedMs`), which on a long read is the one
          // number a user would never mean by "how long did that take".
          elapsedMs: Date.now() - this.startedAt,
          // Whether the bytes went through a Blob rather than to a file the
          // user named, which decides whether "saved" means "in your
          // Downloads folder" or "where you said".
          blob: !handle
        });
      } catch (error) {
        this.progress = '';
        // `|| this.cancelling`, and not only the CANCELLED code, because a
        // cancel that lands *inside* a row-group read comes back wearing
        // the wrong hat: aborting the signal rejects the in-flight range
        // request, and download-core's `readRows` wraps any throw from
        // hyparquet as `DATASET_UNRESOLVED` ("this dataset's files could
        // not be read"), which is a lie about a file the user stopped
        // reading on purpose. Measured on the FIRMS 2020 item; worth
        // fixing upstream in parquet-io.js, where the abort is visible.
        if (isCancellation(error) || this.cancelling) {
          // A cancel is an outcome, not a failure: say what had been read
          // when it stopped, and that nothing was kept. download-core's
          // sinks do the keeping-nothing part -- the Blob sink drops its
          // chunks and the file-system sink removes the partial file where
          // the browser lets it.
          this.cancelled = markRaw({ rows: this.lastProgressRows || 0 });
        } else {
          this.downloadError = this.formatError(error);
        }
      } finally {
        this.downloading = false;
        this.cancelling = false;
        this.downloadState = '';
        this.progressPercent = null;
        this.handle = null;
        // No manual `formatsVersion` bump needed here any more: the
        // `onFormatState` subscription (`created()`) already bumped it the
        // moment this run's format plugin actually finished loading or
        // failed to -- which is also *before* this `finally` runs, not
        // after, for a lazy format whose `load()` this very call triggered.
        // The card scrolls -- on a hero map the filters and the estimate
        // are already more than fits -- so what just happened is brought to
        // where the user is looking instead of being left below the fold,
        // under the button they pressed.
        this.$nextTick(() => this.$refs.outcome?.scrollIntoView({ block: 'nearest' }));
      }
    },
    // The no-File-System-Access path, and still a direct download: the
    // anchor is created, clicked and thrown away in one go, so the browser
    // starts saving without the user having to find and click a link.
    saveBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      this.blobUrls.push(url);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.rel = 'noopener';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      // Revoking straight away can cut the save off before the browser has
      // taken the bytes; beforeUnmount revokes whatever is left.
      setTimeout(() => {
        URL.revokeObjectURL(url);
        this.blobUrls = this.blobUrls.filter(entry => entry !== url);
      }, 60000);
    },
    // Rows and bytes, not just a moving bar: on a dataset with no bbox
    // covering the bar can sit at 4% for a minute, and "2,118 rows matched,
    // 240 MB read" is the difference between that and a hung page.
    onProgress(event) {
      if (event.phase === 'reading' && event.rowGroupsTotal > 0) {
        this.progressPercent = Math.min(100, Math.round((event.rowGroupsDone / event.rowGroupsTotal) * 100));
        this.lastProgressRows = event.rowsMatched;
        this.progress = this.$t('widgets.areaDownload.download.reading', {
          done: formatCount(event.rowGroupsDone),
          total: formatCount(event.rowGroupsTotal),
          rows: formatCount(event.rowsMatched),
          bytes: formatBytes(event.bytesRead)
        });
      } else if (event.phase === 'loading-format') {
        // The one moment this widget fetches code: a format plugin the
        // user just picked. Named, because "loading..." over a 340 KB wasm
        // on a slow connection is the kind of silence that reads as a
        // broken button.
        this.progress = this.$t('widgets.areaDownload.download.loadingFormat', {
          format: this.formatEntry(event.format)?.label || event.format
        });
      } else {
        this.progress = this.phaseLabel(event.phase);
      }
    },
    // `requestHandle.result` REJECTS with `CeilingExceededError` (code
    // `CEILING_EXCEEDED`) the moment the handle goes `blocked`, rather than
    // hanging forever (design doc §3.4's "blocked handles reject"
    // amendment) -- so a ceiling breach reaching here is not a failure
    // `startDownload`'s `catch` should see. It is a pause: the `ceiling`
    // listener already showed the box, so this waits for the user's
    // decision (`acceptCeiling()`/`cancel()`, which signal `this.ceilingGate`)
    // and either recurses on the continued run's promise or rethrows.
    //
    // Recursion, not a loop, because ESLint's `no-await-in-loop` is right in
    // general and this is the one place in this file an awaited retry is
    // the actual design, not an accident -- a plain function sidesteps the
    // rule instead of suppressing it, and this can only ever recurse once
    // (one `download()` call plans one estimate, so there is at most one
    // ceiling breach per handle).
    //
    // Accepting calls `handle.acceptCeiling()`, which synchronously installs
    // a *fresh* deferred -- so re-reading `requestHandle.result` (a live
    // getter, not the promise this call's first `await` captured) after the
    // gate resolves hands back the continued run's promise rather than the
    // already-rejected one. Cancelling leaves that original rejection alone
    // (it's already settled; design doc: "the promise keeps its
    // `CEILING_EXCEEDED`") and `requestHandle.state` becomes `'cancelled'`,
    // so this simply rethrows its own already-caught error, and the outer
    // `catch` in `startDownload` recognizes it as a cancellation via
    // `this.cancelling` (set by `cancel()` before it signals the gate), not
    // the error code.
    async awaitDownloadResult(requestHandle) {
      try {
        return await requestHandle.result;
      } catch (error) {
        if (error?.code !== 'CEILING_EXCEEDED' || requestHandle.state !== 'blocked') {
          throw error;
        }
        const decision = await new Promise(resolve => { this.ceilingGate = resolve; });
        this.ceilingGate = null;
        if (decision !== 'accept') {
          throw error; // cancel(): already called handle.cancel() and set this.cancelling.
        }
        this.ceiling = null;
        return this.awaitDownloadResult(requestHandle);
      }
    },
    acceptCeiling() {
      // Order matters: `handle.acceptCeiling()` synchronously installs the
      // continued run's fresh deferred (so `requestHandle.result` already
      // points at it) *before* `startDownload`'s wait loop resumes --
      // signalling the gate second guarantees that ordering rather than
      // relying on it by luck.
      this.handle?.acceptCeiling();
      this.ceiling = null;
      this.ceilingGate?.('accept');
    },
    pause() {
      this.handle?.pause();
    },
    resume() {
      this.handle?.resume();
    },
    cancel() {
      if (!this.handle || this.cancelling) {
        return;
      }
      // The button says what it is doing: `cancel()` awaits the run's own
      // unwinding (the engine only checks the signal between row groups),
      // so on a big row group there is a second or two where a button that
      // still said "Cancel" would look ignored.
      this.cancelling = true;
      this.handle.cancel('cancelled by user');
      // No-op when nothing is waiting on it (the common case: cancelling a
      // `running` download). While `blocked` on the ceiling, this is what
      // wakes `startDownload`'s wait loop so it rethrows the ceiling
      // rejection instead of waiting for a decision that already happened.
      this.ceilingGate?.('cancel');
    },
    clearOutcome() {
      this.result = null;
      this.cancelled = null;
      this.downloadError = '';
      this.notice = '';
      this.progress = '';
    },
    resetDownload() {
      this.ceiling = null;
      this.ceilingGate = null;
      this.progress = '';
      this.progressPercent = null;
      this.downloadError = '';
      this.downloadState = '';
      this.cancelling = false;
      this.lastProgressRows = 0;
      this.result = null;
      this.cancelled = null;
      this.runWarnings = [];
      this.notice = '';
    },

    // --- formatting ----------------------------------------------------
    formatBbox(bbox) {
      return bbox.map(value => value.toFixed(3)).join(', ');
    },
    // The error taxonomy's rule is that the `code` is the API and the
    // message is for humans and may be reworded. So every code this widget
    // can reach is reworded into a sentence that says what happened and,
    // where there is one, what to do about it. The thrown message is kept
    // as the title attribute's worth of detail only when there is no key
    // for the code -- a raw `NETWORK: Couldn't fetch parquet file: https://…`
    // is a stack trace with a colon in it, not an explanation.
    // A warning in words. The ones that carry only numbers get their
    // sentence from the locale; the ones a format plugin raises carry
    // their own English `message` (there is no i18n inside the @cng
    // packages), which is better than printing a code.
    warningText(warning) {
      const key = WARNING_KEYS[warning.code];
      if (key) {
        return this.$t(key, {
          ratio: Math.round(warning.ratio || 0),
          boxes: warning.boxes,
          files: warning.files,
          licenses: (warning.attribution || []).map(entry => entry.license).join(', ')
        });
      }
      return warning.message || warning.code;
    },
    // `download()` re-emits every estimate warning as a `warning` event
    // before the run starts, and those are already on screen above -- so
    // only what the *format* raised is collected here, deduplicated (a
    // writer can raise the same one per row) and capped, because twelve
    // lines of "field renamed" would bury the file they are about.
    addRunWarning(warning) {
      const fromEstimate = new Set((this.estimateResult?.warnings || []).map(entry => entry.code));
      if (fromEstimate.has(warning.code)) {
        return;
      }
      const text = this.warningText(warning);
      if (this.runWarnings.includes(text) || this.runWarnings.length >= MAX_RUN_WARNINGS) {
        return;
      }
      this.runWarnings = [...this.runWarnings, text];
    },
    formatError(error) {
      const described = describeError(error);
      if (described.key) {
        return this.$t(described.key, { message: described.message });
      }
      return described.code ? `${described.code}: ${described.message}` : described.message;
    }
  }
});

</script>

<style lang="scss" scoped>
@import "../theme/variables.scss";

// Everything here lives over the map, inside the `map-overlay` hook's
// pointer-events-none canvas. Each piece of chrome claims pointer events
// back for itself; the gaps between them stay pannable map.
//
// One lane down the right of the map: the area picker at the top of it, the
// download card at the bottom, and never the two overlapping -- the lane is
// a flex column, so a tall card scrolls instead of growing into the picker.
// Everywhere else is spoken for. The top left
// is MapView's notice lane (`.map-textcontrol`, which says why a layer did
// not draw and must not be covered by a control, or cover one). The bottom
// left is StylePicker (`bottom: 70px`, with a legend that grows upward from
// there) and LayerControl (`bottom: 30px`). The far right edge is MapLibre's
// own navigation buttons, 29px wide at `right: 10px` -- which is what the
// 52px inset here clears -- and the compact attribution button sits in the
// very bottom right corner, which is what the card's `bottom` clears.
//
// `--sb-map-overlay-top` is the hook's contract for where the usable top of
// the map is: the hero layouts pull the map up under the site header and
// raise it, so this starts below the header rather than behind it.
// The lane itself: a column pinned to the right of the map, with the picker
// at its top and the card at its bottom. A column rather than two
// independently anchored boxes, because a tall card and an open picker would
// otherwise grow into each other.
.area-download {
  position: absolute;
  top: var(--sb-map-overlay-top, 10px);
  right: 52px;
  bottom: 36px;
  max-width: calc(100% - 62px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.5rem;
  pointer-events: none;
  font-size: 0.875rem;
}

.ad-tools,
.ad-card,
.area-download-refusal {
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.96);
  border-radius: $border-radius;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  max-width: 100%;
}

.ad-tools {
  flex: 0 0 auto;
  // The geocoder's input and the two buttons are one row: wrapping them
  // reads as three unrelated controls. Shrinking to the pill on collapse
  // then happens in place, because the column is right-aligned.
  width: max-content;

  &:not(.open) {
    background: none;
    box-shadow: none;
  }
}

.ad-tools-panel {
  padding: 0.5rem;
}

.ad-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 0;
  border-radius: 2rem;
  padding: 0.4rem 0.9rem;
  font-weight: 600;
  color: white;
  background: $primary;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3);

  &:hover,
  &:focus-visible {
    background: darken($primary, 8%);
  }
}

// One pass of a slow glow when a downloadable collection loads: noticed
// once, not a nag. Nothing moves, so it cannot push the map around.
@keyframes ad-attention {
  0%, 100% { box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3); }
  50% { box-shadow: 0 1px 6px rgba(0, 0, 0, 0.3), 0 0 0 8px rgba($primary, 0.28); }
}

@keyframes ad-attention-panel {
  0%, 100% { box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25); }
  50% { box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25), 0 0 0 7px rgba($primary, 0.25); }
}

.ad-tools.attention {
  &:not(.open) .ad-pill {
    animation: ad-attention 1.3s ease-in-out 2;
  }

  &.open {
    animation: ad-attention-panel 1.3s ease-in-out 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ad-tools.attention,
  .ad-tools.attention .ad-pill {
    animation: none;
  }

  .ad-reveal-enter-active {
    transition: none;
  }
}

// Opening the cluster: a short ease out of the pill it grew from. Closing
// is instant -- see the template.
.ad-reveal-enter-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform-origin: top right;
}

.ad-reveal-enter-from {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.ad-tools-head {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.4rem;
  color: $dark;

  strong {
    flex: 1 1 auto;
  }
}

.ad-tools-row {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.ad-search {
  // The GeocoderControl's own stylesheet sizes the input; its listbox is
  // absolutely positioned against this box.
  position: relative;
}

.ad-file {
  display: none;
}

.ad-note {
  margin: 0.4rem 0 0;
  font-size: 0.75rem;
  color: $secondary;
  max-width: 24rem;
}

// --- the download card, at the bottom of the lane ---------------------
.ad-card {
  // `min-height: 0` is what lets the flex column scroll it rather than let
  // it grow into the picker above: the estimate and the code panel together
  // are taller than a hero map.
  flex: 0 1 auto;
  min-height: 0;
  width: 21rem;
  overflow-y: auto;
  padding: 0.6rem 0.7rem;

  &.wide {
    width: 34rem;
  }
}

.ad-card-head {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  > div {
    flex: 1 1 auto;
    min-width: 0;
  }
}

.ad-dataset {
  display: block;
  color: $dark;
}

.ad-area-name {
  display: block;
  color: $primary;
  font-weight: 600;
}

.ad-area-summary {
  margin: 0.15rem 0 0.4rem;
  font-size: 0.75rem;
  color: $secondary;
}

.ad-area-actions {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  margin-bottom: 0.5rem;
}

.ad-edit-toggle {
  flex: 0 0 auto;
}

// The hint only exists while the editor is open, so it wraps under the
// button rather than widening the card.
.ad-edit-hint {
  flex: 1 1 0;
  min-width: 0;
  font-size: 0.7rem;
  line-height: 1.25;
  color: $secondary;
}

.ad-icon-button {
  border: 0;
  background: none;
  line-height: 1;
  font-size: 1.1rem;
  color: $secondary;
  padding: 0 0.2rem;

  &:hover {
    color: $dark;
  }
}

.estimate {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.1rem 0.6rem;
  margin: 0 0 0.4rem;
  font-size: 0.8rem;

  dt {
    font-weight: 600;
    white-space: nowrap;
  }

  dd {
    margin: 0;
  }
}

// The number a decision is made on, and the hedge that keeps it honest.
// The hedge is deliberately quieter and never on its own line: a range
// under its own estimate reads as two numbers rather than one answer.
.ad-value {
  font-variant-numeric: tabular-nums;
}

.ad-hedge {
  margin-left: 0.3rem;
  color: $secondary;
  font-size: 0.72rem;
  white-space: nowrap;
}

// --- the refine controls ----------------------------------------------
// One stack of labelled rows between the area and the estimate: what to
// download, over what dates, matching what. Each row re-estimates on
// change, so they are the only things in the card that move a number.
.ad-field {
  margin: 0 0 0.45rem;
  font-size: 0.75rem;
  color: $dark;

  > label {
    display: block;
    margin-bottom: 0.15rem;
    font-weight: 600;
    color: $secondary;
  }
}

.ad-select,
.ad-text,
.ad-date {
  max-width: 100%;
  border: 1px solid $border-color;
  border-radius: $border-radius;
  background: white;
  color: $dark;
  padding: 0.1rem 0.25rem;
  font-size: 0.75rem;
  font-family: inherit;
}

.ad-select {
  width: 100%;
}

.ad-check {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: 600;
  color: $secondary;
  margin: 0;
}

.ad-time-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.2rem;
}

.ad-date {
  flex: 1 1 auto;
  min-width: 0;
}

.ad-dash {
  color: $secondary;
}

.ad-presets {
  display: flex;
  gap: 0.25rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}

.ad-chip {
  border: 1px solid $border-color;
  border-radius: 1rem;
  background: white;
  color: $secondary;
  padding: 0.05rem 0.45rem;
  font-size: 0.7rem;

  &:hover {
    border-color: $primary;
    color: $primary;
  }

  &.active {
    border-color: $primary;
    background: rgba($primary, 0.12);
    color: $primary;
    font-weight: 600;
  }
}

.ad-where-row {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-bottom: 0.2rem;

  .ad-select {
    flex: 1 1 auto;
    min-width: 0;
  }

  .ad-op {
    flex: 0 0 auto;
    width: auto;
  }

  .ad-text {
    flex: 1 1 4rem;
    min-width: 0;
  }
}

// --- the outcomes ------------------------------------------------------
.ad-run,
.ad-outcome,
.ad-done,
.ad-empty {
  margin-top: 0.3rem;
}

.ad-empty .ad-status {
  color: $dark;
  font-weight: 600;
}

.ad-done-head {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0 0 0.3rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: $success;
  word-break: break-all;
}

.ad-warnings {
  list-style: none;
  margin: 0;
  padding: 0;
}

// --- "why this estimate" ----------------------------------------------
.ad-why {
  margin-top: 0.4rem;
  font-size: 0.75rem;

  summary {
    color: $primary;
    cursor: pointer;
  }
}

.ad-why-list {
  list-style: none;
  margin: 0.25rem 0 0.25rem;
  padding: 0;

  li {
    margin-bottom: 0.2rem;
    line-height: 1.3;
  }
}

.ad-basis {
  display: block;
  color: $secondary;
  font-size: 0.7rem;
}

.ad-size {
  font-weight: 400;
  opacity: 0.85;
}

// What the plugin for this format still has to fetch, on the button that
// would fetch it. Quieter than the output size: it is a one-off cost, and
// the output size is the recurring one.
.ad-weight {
  font-weight: 400;
  font-size: 0.7rem;
  opacity: 0.7;
}

.ad-button {
  border: 1px solid $primary;
  border-radius: $border-radius;
  background: white;
  color: $primary;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  white-space: nowrap;

  &:hover,
  &.active {
    background: $primary;
    color: white;
  }
}

.ad-button-primary {
  background: $primary;
  color: white;

  &:hover {
    background: darken($primary, 8%);
  }
}

.ad-button-warning {
  border-color: $warning;
  color: darken($warning, 15%);

  &:hover {
    background: $warning;
    color: $dark;
  }
}

.ad-formats {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.2rem;
  flex-wrap: wrap;
}

// The five that are not GeoJSON or GeoParquet, once asked for: one per
// line, because each carries its own size and, until it is loaded, its own
// weight.
.ad-formats-more {
  align-items: stretch;
  flex-direction: column;
  gap: 0.25rem;
}

.ad-formats-label {
  font-size: 0.75rem;
  color: $secondary;
}

.ad-progress-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.4rem 0;
}

.ad-progress {
  flex: 1 1 auto;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: $light;
  overflow: hidden;
}

.ad-progress-bar {
  height: 100%;
  width: 0;
  background: $primary;
  transition: width 0.2s linear;

  &.indeterminate {
    width: 40%;
    animation: ad-indeterminate 1.1s ease-in-out infinite;
  }

  // A paused run is a stopped bar, not a slow one: the stripes say "this
  // is not moving because you said so" without any motion at all.
  &.paused {
    animation: none;
    background: repeating-linear-gradient(
      45deg,
      rgba($primary, 0.75),
      rgba($primary, 0.75) 4px,
      rgba($primary, 0.35) 4px,
      rgba($primary, 0.35) 8px
    );
  }
}

@keyframes ad-indeterminate {
  0% { margin-left: -40%; }
  100% { margin-left: 100%; }
}

.ad-status,
.ad-attribution,
.ad-scanned,
.ad-warning,
.ad-error {
  margin: 0.3rem 0 0;
  font-size: 0.75rem;
}

.ad-scanned {
  color: $secondary;
}

.ad-status {
  color: $secondary;
}

// A licence obligation, so it is always on screen -- but a full citation
// with a DOI is four lines of a card that is mostly numbers. Clamped, with
// the whole thing in the tooltip and written verbatim into the downloaded
// file by download-core either way.
.ad-attribution {
  color: $secondary;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ad-warning {
  color: darken($warning, 20%);
}

.ad-error {
  color: $danger;
}

.ad-ceiling {
  margin: 0.3rem 0;
  padding: 0.35rem 0.4rem;
  border-radius: $border-radius;
  background: rgba($warning, 0.15);
  font-size: 0.75rem;

  p {
    margin: 0 0 0.3rem;
  }
}

.ad-link-button {
  border: 0;
  background: none;
  padding: 0;
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: $primary;
  text-decoration: underline;
}

.request-code {
  margin-top: 0.4rem;

  h4 {
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
  }
}

// --- the refusal -------------------------------------------------------
.area-download-refusal {
  margin: 0;
  padding: 0.3rem 0.6rem;
  color: $secondary;
  font-size: 0.8rem;
}

// A drop is aimed at the map, so the map is what acknowledges it.
.area-download.drop-active .ad-tools.open {
  outline: 2px dashed $primary;
  outline-offset: 2px;
}

// --- narrow screens ----------------------------------------------------
// A 21rem card in a lane inset 52px from the right needs about 400px of
// map to exist in. Below that the lane becomes the full width of the map
// (still clearing MapLibre's buttons on the right), the card and the tools
// stretch to it, and the card is capped at half the map's height so the
// area picker above it is never pushed off the top. The breakpoint is
// bootstrap's `sm`, which is where this app's own layout reflows.
//
// The tools row wraps here on purpose: at this width a search box, a draw
// button and an upload button in one line leaves nothing of any of them.
@media (max-width: 575.98px) {
  .area-download {
    left: 10px;
    right: 52px;
    bottom: 30px;
    max-width: none;
    align-items: stretch;
    // Not `space-between`: at this width the bottom of the map belongs to
    // the style picker and its legend, which grow upward from `bottom:
    // 70px` and would sit on top of a card pinned to the bottom. The card
    // follows the tools down from the top instead, and scrolls inside
    // whatever height is left.
    justify-content: flex-start;
  }

  .ad-tools {
    width: auto;
  }

  .ad-card {
    width: auto;
    // Not the whole column: the legend under the style picker grows up
    // from the bottom left, and a card that filled the map would bury it.
    max-height: 45%;

    &.wide {
      width: auto;
    }
  }

  .ad-note {
    max-width: none;
  }

  // The code panel is a developer's tool and a horizontal scroller; on a
  // phone-width card it would be the whole card. The toggle stays, so the
  // request is still reachable, but it opens without widening anything.
  .request-code {
    overflow-x: auto;
  }
}
</style>
