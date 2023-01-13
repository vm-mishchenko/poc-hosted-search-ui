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

  pipeline: object;

  ui: UIDesignDefinition;
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

export const getDefaultDesignDefinition = (): DesignDefinition => {
  return {
    searchIndex: {
      name: 'default',
      databaseName: 'sample_airbnb',
      collectionName: 'listingsAndReviews',
    },

    pipeline: [
      {
        $search: {
          text: {
            query: SEARCH_QUERY_VARIABLE,
            path: {
              wildcard: "*",
            },
          },
        },
      },
      {
        $limit: 10,
      },
    ],

    ui: {
      docFieldNamesToRender: [],
      docTitleFieldName: '',
      url: {
        docFieldName: '',
        template: '',
      },
    },
  };
};

export const isDesignDefinitionValid = (designDefinition: DesignDefinition): string | null => {
  if (!designDefinition.searchIndex.name) {
    return 'Specify Search Index name';
  }

  if (!designDefinition.searchIndex.name) {
    return 'Specify Database name';
  }

  if (!designDefinition.searchIndex.name) {
    return 'Specify Collection name';
  }

  return null;
};
