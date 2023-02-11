import {
  DesignDefinition,
  NumberRangeFilter,
  UIDesignDefinition,
} from './types/designDefinition';
import { getSearchStageFromPipeline } from '../pipeline/pipeline';
import {
  Facet,
  Facets,
  NumberFacet,
  SearchStage,
  StringFacet,
} from '../pipeline/pipeline-types';
import { Document } from 'mongodb';

export const buildDesignDefinition = (pipeline: Document[], filters: NumberRangeFilter[], sort: Array<string>, ui: UIDesignDefinition): DesignDefinition => {
  return {
    searchIndex: {
      name: "facets",
      databaseName: "sample_airbnb",
      collectionName: "listingsAndReviews",
    },
    pipeline,
    filters,
    sort,
    ui,
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

  const pipelineError = validatePipeline(designDefinition);
  if (pipelineError) {
    return pipelineError;
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

  return getSearchStageFromPipeline(designDefinition.pipeline);
};

export const hasFacetOperator = (designDefinition: DesignDefinition): boolean => {
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

/**
 * Return facets or throw error.
 */
export const getFacetByName = (facetName: string, designDefinition: DesignDefinition): NumberFacet | StringFacet => {
  const facets = getFacets(designDefinition);
  if (!facets.hasOwnProperty(facetName)) {
    throw new Error(`Cannot find facet with name: ${facetName}`);
  }

  return facets[facetName];
};

export const getSearchIndexName = (designDefinition: DesignDefinition): string => {
  return designDefinition.searchIndex.name || "default";
};
