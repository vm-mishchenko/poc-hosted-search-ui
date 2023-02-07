import { Document } from 'mongodb';
import { SearchStage } from './pipeline-types';

export const SEARCH_STAGE_NAME = '$search';

export const getSearchStageFromPipeline = (pipeline: Document[]): SearchStage => {
  return pipeline[0][SEARCH_STAGE_NAME];
};

export const hasFacetOperatorInPipeline = (pipeline: Document[]): boolean => {
  const searchStage = getSearchStageFromPipeline(pipeline);
  return !!(searchStage[FACET_OPERATOR_NAME]);
};

export const hasCompoundOperatorInFacetPipeline = (pipeline: Document[]): boolean => {
  const searchStage = getSearchStageFromPipeline(pipeline);
  return !!(searchStage[FACET_OPERATOR_NAME]?.operator[COMPOUND_OPERATOR_NAME]);
};

export const hasCompoundOperatorInPipeline = (pipeline: Document[]): boolean => {
  const searchStage = getSearchStageFromPipeline(pipeline);
  return !!(searchStage[COMPOUND_OPERATOR_NAME]);
};

// todo-vm: prettify me and add types!
export const wrapOperatorInCompound = (pipeline: Document[]): Document[] => {
  const hasFacetOperator = hasFacetOperatorInPipeline(pipeline);
  const copy = [...pipeline];
  const restStages = copy.splice(1);
  let searchStage: SearchStage;

  if (hasFacetOperator) {
    if (hasCompoundOperatorInFacetPipeline(pipeline)) {
      return pipeline;
    }

    const facetOperatorName = getFacetOperatorNameFromPipeline(pipeline);

    searchStage = { ...getSearchStageFromPipeline(copy) };
    const originalOperator = searchStage.facet!.operator[facetOperatorName];
    searchStage.facet!.operator = {
      compound: {
        must: [
          { [facetOperatorName]: originalOperator },
        ],
      },
    };
  } else {
    if (hasCompoundOperatorInPipeline(pipeline)) {
      return pipeline;
    }

    const { index, highlight, returnStoredSource, count, ...operator } = { ...getSearchStageFromPipeline(copy) };
    searchStage = {
      index,
      highlight,
      returnStoredSource,
      count,
      compound: {
        must: [
          operator,
        ],
      },
    };
  }

  return [
    {
      [SEARCH_STAGE_NAME]: searchStage,
    },
    ...restStages,
  ];
};

export const getFacetOperatorNameFromPipeline = (pipeline: Document[]): string => {
  const searchStage = getSearchStageFromPipeline(pipeline);

  if (!searchStage.facet) {
    throw new Error(`Cannot find facet inside pipeline: ${pipeline}`);
  }

  const operatorName = Object.keys(searchStage.facet.operator)[0];

  if (!operatorName) {
    throw new Error(`Cannot find operator name inside facet: ${searchStage.facet.operator}`);
  }

  return operatorName;
};

/**
 * Compound operator could be
 * - on top level, or
 * - inside facet.operator
 */
export const appendFilterClauseInCompoundOperator = (pipeline: Document[], facetFilterClause: Document[]): Document[] => {
  const newPipeline = [...pipeline];
  const searchStage = getSearchStageFromPipeline(newPipeline);
  const hasFacetOperator = hasFacetOperatorInPipeline(pipeline);
  let compoundOperator: Document;

  if (hasFacetOperator) {
    compoundOperator = searchStage.facet!.operator[COMPOUND_OPERATOR_NAME];

    if (!compoundOperator) {
      throw new Error(`Cannot find compound operator: ${newPipeline}`);
    }
  } else {
    compoundOperator = searchStage[COMPOUND_OPERATOR_NAME];

    if (!compoundOperator) {
      throw new Error(`Cannot find compound inside pipeline: ${newPipeline}`);
    }
  }

  const filterClause: Document[] | undefined = compoundOperator[COMPOUND_CLAUSES.filter];

  if (!filterClause) {
    compoundOperator[COMPOUND_CLAUSES.filter] = facetFilterClause;
  } else {
    filterClause.unshift(...facetFilterClause);
  }

  return newPipeline;
};

enum COMPOUND_CLAUSES {
  filter = 'filter'
}

export const FACET_OPERATOR_NAME = 'facet';
export const COMPOUND_OPERATOR_NAME = 'compound';