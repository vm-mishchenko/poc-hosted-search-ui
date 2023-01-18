import {
  DesignDefinition,
  Facet,
  Facets,
  SEARCH_QUERY_VARIABLE,
  SearchStage,
} from './types/designDefinition';

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

export const validateDesignDefinition = (designDefinition: DesignDefinition): string | null => {
  if (!designDefinition.searchIndex.name) {
    return 'Specify Search Index name';
  }

  if (!designDefinition.searchIndex.name) {
    return 'Specify Database name';
  }

  if (!designDefinition.searchIndex.name) {
    return 'Specify Collection name';
  }

  if (!validatePipeline(designDefinition)) {
    return validatePipeline(designDefinition);
  }

  return null;
};

export const SEARCH_STAGE_NAME = '$search';

const validatePipeline = (designDefinition: DesignDefinition): string | null => {
  const pipeline = designDefinition.pipeline;

  if (!pipeline) {
    return 'Pipeline cannot be empty';
  }

  if (!Array.isArray(pipeline)) {
    return 'Pipeline should be list of stages';
  }

  if (!pipeline.length) {
    return 'Pipeline should have at least one "$search" stage';
  }

  const searchStage = pipeline[0];
  if (!Object.keys(searchStage).includes("$search")) {
    return 'First stage in pipeline should have only one "$search" key';
  }

  return null;
};

export const getDatabaseName = (designDefinition: DesignDefinition) => designDefinition.searchIndex.databaseName;

export const getCollectionName = (designDefinition: DesignDefinition) => designDefinition.searchIndex.collectionName;

export const getSearchStage = (designDefinition: DesignDefinition): SearchStage => {
  const error = validatePipeline(designDefinition);
  if (error) {
    throw new Error(error);
  }

  return designDefinition.pipeline[0][SEARCH_STAGE_NAME];
};

export const hasFacet = (designDefinition: DesignDefinition): boolean => {
  const searchStage = getSearchStage(designDefinition);
  return !!searchStage['facet'];
};

export const getFacet = (designDefinition: DesignDefinition): Facet => {
  const searchStage = getSearchStage(designDefinition);
  const facet = searchStage.facet;

  if (!facet) {
    throw new Error('Cannot find facets');
  }

  return facet;
};

/**
 * Return facets or throw error.
 */
export const getFacets = (designDefinition: DesignDefinition): Facets => {
  const facet = getFacet(designDefinition);
  const facets = facet?.facets;

  if (!facets) {
    throw new Error('Cannot find facets');
  }

  return facets;
};