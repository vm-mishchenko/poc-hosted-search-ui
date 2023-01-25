import { Document } from 'mongodb';
import { SearchStage } from './pipeline-types';

export const SEARCH_STAGE_NAME = '$search';

export const getSearchStageFromPipeline = (pipeline: Document[]): SearchStage => {
  return pipeline[0][SEARCH_STAGE_NAME];
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

export const appendFilterClauseInCompoundOperator = (pipeline: Document[], facetFilterClause: Document[]): Document[] => {
  const newPipeline = [...pipeline];
  const searchStage = getSearchStageFromPipeline(newPipeline);

  if (!searchStage.facet) {
    throw new Error(`Cannot find facet inside pipeline: ${newPipeline}`);
  }

  const compoundOperator: Document = searchStage.facet.operator[COMPOUND_OPERATOR_NAME];

  if (!compoundOperator) {
    throw new Error(`Cannot find compound operator: ${newPipeline}`);
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

export const COMPOUND_OPERATOR_NAME = 'compound';