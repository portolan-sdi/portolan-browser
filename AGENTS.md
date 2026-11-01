<!-- ops-sync:begin — synced from portolan-sdi/portolan-ops. Edit there, not here. -->
# Portolan agent norms

All agents MUST read this document before starting work, with no exceptions, ever. (Claude Code does not read `AGENTS.md` but imports this file via a one-line `CLAUDE.md`.) Most of this content is synced downstream from `portolan-ops`. Put repo-specific instructions in `AGENTS.md`, never in `CLAUDE.md`, which the sync overwrites.

## Ground rules

Agents MUST read the complete contents of [norms](https://github.com/portolan-sdi/portolan-ops/blob/main/norms) and [policies](https://github.com/portolan-sdi/portolan-ops/blob/main/policies/) before starting work, with no exceptions, ever.

The [portolan-spec](https://github.com/portolan-sdi/portolan-spec) repo is the absolute ground truth for the Portolan spec. All other tools are downstream of it.

Before documenting any command, flag, or API, verify that it exists.

Use conventional commits always.

All tickets and PRs MUST follow the [templates](https://github.com/portolan-sdi/portolan-ops/blob/main/templates/).

GitHub applies issue forms only in the web UI. With `gh issue create`, write each form field as a `### <field label>` heading, in the form's order. Include `### Priority` with one of `P0` to `P3` from the [priority rubric](https://github.com/portolan-sdi/portolan-ops/blob/main/norms/repos.md#priority). Pass the form's type label with `--label`, and pass the body with `--body-file`. The writing hook denies a body that skips its form, and issue governance flags one.

## Org-wide facts

The canonical homepage is <https://www.portolan-sdi.org/>. Canonical URLs live in [copy/urls.md](https://github.com/portolan-sdi/portolan-ops/blob/main/copy/urls.md). Do not hardcode variants.

Community discussion happens in the [Portolan Google Group](https://groups.google.com/g/portolan) and the [Portolan channel](https://cloudnativegeo.slack.com/archives/C0A1JBH9529) in Cloud-Native Geo Slack. Planning happens in [org-level GitHub projects](https://github.com/orgs/portolan-sdi/projects/1).

Files between `ops-sync` markers are synced from [portolan-ops](https://github.com/portolan-sdi/portolan-ops). They are overwritten on every sync run. To change one, edit it in portolan-ops.

One canonical home per fact. If a value like a color, URL, or policy line exists in portolan-ops, link to it rather than copying it.
<!-- ops-sync:end -->

# Repo-specific instructions

<!-- Add instructions for this repo below. The block above is overwritten by
     sync. This file is the only home for repo-specific agent rules: CLAUDE.md
     carries the import and nothing else. -->

## Upstream sync policy

This repo is a fork of [radiantearth/stac-browser](https://github.com/radiantearth/stac-browser). The fork replaces the OpenLayers map stack with MapLibre. Upstream files whose only consumers are the OpenLayers stack stay in the tree on purpose. A delete would create a modify/delete conflict on every future upstream sync. Known inert carriers, kept as of October 2026:

- `src/utils.js` `restoreUrlTemplateParams` (no callers)
- `tests/e2e/map-layer-options.spec.js` and `tests/e2e/zarr-display-limit.spec.js` (fully skipped, they drive ol-stac APIs)
- `tests/manual/display-limit/collection.json` (fixture for the skipped specs)
- `mapping.displayLimit.*` and `mapping.focusHint` locale keys
- `src/theme/map.scss` (imported by nothing)

Do not delete these files. Do not wire new code to them. Map options that the MapLibre stack does not implement carry a note in `docs/options.md`.

Dark mode is out of scope for the fork's map components. The default config enforces the light color mode. Upstream dark-mode styling for map controls is not ported.
