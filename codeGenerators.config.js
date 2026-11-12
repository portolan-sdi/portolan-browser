import PythonGenerator from './src/codegen/PythonGenerator.js';
import JavaScriptGenerator from './src/codegen/JavaScriptGenerator.js';
import RGenerator from './src/codegen/RGenerator.js';
import CSharpGenerator from './src/codegen/CSharpGenerator.js';
import CurlGenerator from './src/codegen/CurlGenerator.js';
import GoGenerator from './src/codegen/GoGenerator.js';
import JavaGenerator from './src/codegen/JavaGenerator.js';
import RustGenerator from './src/codegen/RustGenerator.js';
import DownloadRequestGenerator from './src/codegen/DownloadRequestGenerator.js';
import DuckDbSqlGenerator from './src/codegen/DuckDbSqlGenerator.js';

/**
 * All available code generators, ordered by display preference.
 * Python is first as the most common STAC client language.
 */
export default [
  CSharpGenerator,
  CurlGenerator,
  GoGenerator,
  JavaGenerator,
  JavaScriptGenerator,
  PythonGenerator,
  RGenerator,
  RustGenerator
];

export const defaultGenerator = PythonGenerator;

/**
 * Generators for the "Download data" widget's request panel, kept separate
 * from the list above.
 *
 * The default export is consumed by SearchCode.vue, which builds every
 * entry as `new Gen(catalogHref, searchLink)` and renders one tab per
 * language from the STAC API *search* filters. A download request has no
 * search link and is not on the search view, so putting these in that array
 * would add tabs to the example-code modal that have nothing to render.
 * They implement the same generator interface (`language`, `outputFile`,
 * `highlightLanguage`, `generate`), so CodeBox.vue renders them unchanged.
 */
export const downloadGenerators = [
  DownloadRequestGenerator,
  DuckDbSqlGenerator
];
