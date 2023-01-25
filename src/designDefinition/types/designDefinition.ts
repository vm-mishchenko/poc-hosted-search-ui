/**
 * Configuration User should specify in Atlas.
 */
export interface DesignDefinition {
  /*
  * Id that uniquely identifies Design Definition
  */
  _id?: string;

  searchIndex: {
    // search index name
    name: string;
    databaseName: string;
    collectionName: string;
  };

  pipeline: Record<string, any>[];

  ui: UIDesignDefinition;
}

export interface NumberFacet {
  type: string,
  path: string,
  boundaries: Array<number>
}

export interface StringFacet {
  type: string,
  path: string,
  numBuckets: number;
}

export interface SearchStage {
  index: string;
  facet?: Facet;
}

export interface Facet {
  operator: Record<string, any>;
  facets: Facets;
}

export interface Facets extends Record<string, NumberFacet | StringFacet> {
}

export const SEARCH_QUERY_VARIABLE = '$$SEARCH_QUERY';
export const URL_FIELD_NAME_VARIABLE = '$$URL_FIELD_NAME';

export interface UIDesignDefinition {
  /*
  * List of document fields to render on UI.
  * @optional: we could render all fields by default
  */
  docFieldNamesToRender?: Array<string>,

  /*
  * Runtime render this field as a title for each Search result
  * @optional: we could render "_id" field by default
  */
  docTitleFieldName?: string;

  /**
   * Parameters to construct URL.
   * @optional: we could skip showing URL on UI
   */
  url?: {
    template: string;
    docFieldName?: string
  }
}
