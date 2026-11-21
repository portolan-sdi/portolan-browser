// Emit the serialized `DownloadRequest` for what the download widget is
// about to do (the @cngeo design doc's §2.3 wire format).
//
// WHY THIS DOES NOT EXTEND CodeGenerator
//
// The design doc puts the download widget's reproducibility seam in
// `codeGenerators.config.js`, and that is where these are registered -- but
// the existing `CodeGenerator` base class models one specific thing: a STAC
// API *item search*, taken as `new Gen(catalogHref, searchLink)` and
// rendered from `generate(searchFilters)` into a per-language tab in the
// search view's "Example code" modal. A download request is not a search
// against a search link, and the widget is not on the search view, so
// subclassing it would mean inheriting a constructor that wants a search
// link we do not have, and appearing as an extra tab in a modal where it
// has no inputs to render from.
//
// These generators therefore keep the *shape* of the house interface
// (`language`, `outputFile`, `highlightLanguage`, and a one-argument
// `generate`) so the existing CodeBox/CodeHighlighted components can render
// them unchanged, but they take a DownloadRequest instead of search filters
// and are registered under a separate export.

export default class DownloadRequestGenerator {
  get language() {
    return 'json';
  }

  // The host renders the label; the generator only names its key, so
  // this module stays importable without the app's i18n bootstrap.
  get labelKey() {
    return 'widgets.areaDownload.code.request';
  }

  get highlightLanguage() {
    return 'json';
  }

  get outputFile() {
    return 'download-request.json';
  }

  get installDependencies() {
    return null;
  }

  /**
   * @param {object} request a `cng-request/1.0` DownloadRequest
   * @returns {string}
   */
  generate(request) {
    if (!request) {
      return '';
    }
    return `${JSON.stringify(request, null, 2)}\n`;
  }
}
