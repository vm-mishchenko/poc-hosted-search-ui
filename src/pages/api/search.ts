// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { Document } from 'mongodb';
import { isString } from '../../utils';
import {
  DesignDefinition,
  SEARCH_QUERY_VARIABLE,
} from '../../designDefinition/types/designDefinition';
import {
  getFacetByName,
  getFacets,
  getSearchIndexName,
  getSearchStage,
  hasFacetOperator,
  validateDesignDefinition,
} from '../../designDefinition/utils';
import { runPipelineNew } from '../../database/runPipeline';
import {
  FacetBucketMongoDB,
  MetaMongoDB,
} from '../../database/types';
import {
  addLimitStage,
  appendFilterClauseInCompoundOperator,
  COMPOUND_OPERATOR_NAME,
  findStage,
  getFacetOperatorNameFromPipeline,
  getSearchStageFromPipeline,
  wrapOperatorInCompound,
} from '../../pipeline/pipeline';
import {
  NUMBER_FACET_TYPE,
  NumberFacet,
  RangeOperator,
  STRING_FACET_TYPE,
  StringFacet,
} from '../../pipeline/pipeline-types';
import { SelectedNumberRangeFilter } from '../../containers/Runtime/components/NumberRangeFilterComp/NumberRangeFilterComp';
import {
  SORT_DIRECTION,
  SortRequest,
} from '../../apiTypes/searchTypes';

// Response
export interface SearchResponse {
  docs: Record<string, any>[];
  meta: MetaResponse;
  pipeline: Document[];
}

export interface MetaResponse {
  facets: Array<MetaFacetResponse>;
}

export interface MetaFacetResponse {
  name: string;
  config: NumberFacet | StringFacet;
  result: FacetBucketMongoDB[];
  selectedBucketIds: string[];
}

export interface SearchErrorResponse {
  errorMessage: string;
}

/**
 * 1. find Design Definition
 * 2. construct pipeline request
 * 3. execute search request to MongoDB
 * 4. return results
 */
export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse<SearchResponse>,
) {
  let designDefinition: DesignDefinition;
  try {
    designDefinition = extractDesignDefinition(req);
  } catch (error: any) {
    res.status(400).json({ errorMessage: error.message } as any);
    return;
  }

  let selectedFacets: Map<string, string[]>;
  try {
    if (isString(req.query.selectedFacets)) {
      selectedFacets = new Map(JSON.parse(req.query.selectedFacets));
    } else {
      selectedFacets = new Map();
    }
  } catch (error: any) {
    res.status(400).json({ errorMessage: error.message } as any);
    return;
  }

  let selectedFilters: Map<string, any>;
  try {
    if (isString(req.query.selectedFilters)) {
      selectedFilters = new Map(JSON.parse(req.query.selectedFilters));
    } else {
      selectedFilters = new Map();
    }
  } catch (error: any) {
    res.status(400).json({ errorMessage: error.message } as any);
    return;
  }

  let sort: SortRequest | undefined;
  try {
    if (isString(req.query.sort)) {
      sort = JSON.parse(req.query.sort);
    }
  } catch (error: any) {
    res.status(400).json({ errorMessage: error.message } as any);
    return;
  }

  const searchQuery = isString(req.query.searchQuery) ? req.query.searchQuery : '';
  const databaseName = designDefinition.searchIndex.databaseName;
  const collectionName = designDefinition.searchIndex.collectionName;

  try {
    const {
      docs,
      pipeline,
    } = await queryDocuments(searchQuery, selectedFacets, selectedFilters, sort, designDefinition, databaseName, collectionName);
    const meta = await queryMeta(searchQuery, selectedFacets, selectedFilters, sort, designDefinition, databaseName, collectionName);

    const response: SearchResponse = {
      docs,
      meta,
      pipeline,
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(400).json({ errorMessage: error.message } as any);
  }
}

const queryDocuments = async (searchQuery: string, selectedFacets: Map<string, string[]>, selectedFilters: Map<string, any>, sort: SortRequest | undefined, designDefinition: DesignDefinition, databaseName: string, collectionName: string): Promise<{
  docs: Record<string, any>[],
  pipeline: Document[],
}> => {
  const pipeline = buildPipeline(searchQuery, selectedFacets, selectedFilters, sort, designDefinition);
  const docs = await runPipelineNew(databaseName, collectionName, pipeline);
  return {
    docs,
    pipeline,
  };
};

const queryMeta = async (searchQuery: string, selectedFacets: Map<string, string[]>, selectedFilters: Map<string, any>, sort: SortRequest | undefined, designDefinition: DesignDefinition, databaseName: string, collectionName: string): Promise<MetaResponse> => {
  if (!hasFacetOperator(designDefinition)) {
    return {
      facets: [],
    };
  }

  const pipeline = buildFacetPipeline(searchQuery, selectedFacets, selectedFilters, sort, designDefinition);
  const documents = await runPipelineNew(databaseName, collectionName, pipeline);

  // https://www.mongodb.com/docs/atlas/atlas-search/facet/#examples
  const meta = {
    facet: documents[0]['facet'],
  };

  return mapToResponseMeta(meta, selectedFacets, designDefinition);
};

const mapToResponseMeta = (metaMongoDB: MetaMongoDB, selectedFacets: Map<string, string[]>, designDefinition: DesignDefinition): MetaResponse => {
  const facetNames = Object.keys(metaMongoDB.facet);

  const facets = facetNames.reduce((result, facetName) => {
    const facetResult = metaMongoDB.facet[facetName].buckets;
    const facetConfig = getFacetByName(facetName, designDefinition);
    const selectedBucketIds = selectedFacets.get(facetName) || [];
    const facet: MetaFacetResponse = {
      name: facetName,
      result: facetResult,
      config: facetConfig,
      selectedBucketIds,
    };

    result.push(facet);
    return result;
  }, [] as MetaFacetResponse[]);

  return {
    facets,
  };
};

const buildPipeline = (searchQuery: string, selectedFacets: Map<string, string[]>, selectedFilters: Map<string, any>, sort: SortRequest | undefined, designDefinition: DesignDefinition): Document[] => {
  // todo-vm: I believe you could do better!
  let finalPipeline: Document[];

  if (searchQuery.length) {
    const pipeline = designDefinition.pipeline;
    const pipelineAsString = JSON.stringify(pipeline);
    const pipelineAsStringWithQuery = pipelineAsString.replace(SEARCH_QUERY_VARIABLE, searchQuery);
    const pipelineWithQuery = JSON.parse(pipelineAsStringWithQuery);
    const pipelineWithFacetFilter = addSelectedFacetsAsFilter(pipelineWithQuery, designDefinition, selectedFacets);
    const pipelineWithFacetAndFilters = addSelectedFilter(pipelineWithFacetFilter, designDefinition, selectedFilters);

    finalPipeline = sort ? addSortStage(pipelineWithFacetAndFilters, designDefinition, sort) : pipelineWithFacetAndFilters;
  } else {
    // todo-vm: try to use original pipeline when there is no query. Maybe add additional should phase?
    const searchIndexName = getSearchIndexName(designDefinition);

    if (hasFacetOperator(designDefinition)) {
      const facets = getFacets(designDefinition);
      const pipeline = [
        {
          $search: {
            index: searchIndexName,
            facet: {
              operator: {
                compound: {
                  must: [
                    {
                      queryString: {
                        query: "*:*",
                        defaultPath: "does-not-exists",
                      },
                    },
                  ],
                },
              },
              facets: facets,
            },
          },
        },
        {
          $limit: 10,
        },
      ];

      const pipelineWithFacetFilter = addSelectedFacetsAsFilter(pipeline, designDefinition, selectedFacets);
      const pipelineWithFacetAndFilters = addSelectedFilter(pipelineWithFacetFilter, designDefinition, selectedFilters);

      finalPipeline = sort ? addSortStage(pipelineWithFacetAndFilters, designDefinition, sort) : pipelineWithFacetAndFilters;
    } else {
      const pipeline = [
        {
          $search: {
            index: searchIndexName,
            queryString: {
              query: "*:*",
              defaultPath: "does-not-exists",
            },
          },
        },
        {
          $limit: 10,
        },
      ];
      const pipelineWithFacetAndFilters = addSelectedFilter(pipeline, designDefinition, selectedFilters);
      finalPipeline = sort ? addSortStage(pipelineWithFacetAndFilters, designDefinition, sort) : pipelineWithFacetAndFilters;
    }
  }

  const limitStages = findStage(finalPipeline, '$limit');

  if (limitStages.length === 0) {
    finalPipeline = addLimitStage(finalPipeline, 10);
  }

  return finalPipeline;
};

/**
 * Returns $searchMeta pipeline based on original pipeline from design definition.
 */
const buildFacetPipeline = (searchQuery: string, selectedFacets: Map<string, string[]>, selectedFilters: Map<string, any>, sort: SortRequest | undefined, designDefinition: DesignDefinition): Document[] => {
  const originalSearchStage = getSearchStage(designDefinition);
  const metaDesignDefinition: DesignDefinition = {
    ...designDefinition,
    pipeline: [
      {
        $search: originalSearchStage,
      },
    ],
  };

  const pipeline = buildPipeline(searchQuery, selectedFacets, selectedFilters, sort, metaDesignDefinition);
  const metaSearchStage = getSearchStageFromPipeline(pipeline);
  const metaSearchPipeline = [
    {
      // replace $search to $searchMeta
      $searchMeta: metaSearchStage,
    },
  ];

  return metaSearchPipeline;
};

const addSelectedFacetsAsFilter = (pipeline: Document[], designDefinition: DesignDefinition, selectedFacets: Map<string, string[]>): Document[] => {
  if (selectedFacets.size === 0) {
    return pipeline;
  }

  // if there is selected facets, I assume pipeline uses "facet" operator
  const facetOperatorName = getFacetOperatorNameFromPipeline(pipeline);

  let finalPipeline = pipeline;
  if (facetOperatorName !== COMPOUND_OPERATOR_NAME) {
    finalPipeline = wrapOperatorInCompound(finalPipeline);
  }

  const filterClause = buildFilterClauseFromFacets(selectedFacets, designDefinition);
  finalPipeline = appendFilterClauseInCompoundOperator(finalPipeline, filterClause);

  return finalPipeline;
};

const addSelectedFilter = (pipeline: Document[], designDefinition: DesignDefinition, selectedFilters: Map<string, any>): Document[] => {
  if (selectedFilters.size === 0) {
    return pipeline;
  }

  let finalPipeline = wrapOperatorInCompound(pipeline);
  const filterClause = buildFilterClauseFromFilters(selectedFilters, designDefinition);
  finalPipeline = appendFilterClauseInCompoundOperator(finalPipeline, filterClause);
  return finalPipeline;
};

const addSortStage = (pipeline: Document[], designDefinition: DesignDefinition, sort: SortRequest): Document[] => {
  let finalPipeline = wrapOperatorInCompound(pipeline);
  const sortStage = buildSortStage(sort);
  finalPipeline.push(sortStage);
  return finalPipeline;
};

const buildSortStage = (sort: SortRequest): Document => {
  return {
    $sort: {
      // todo-vm: does it work for nested fields, e.g. "review.accuracy"?
      [sort.path]: sort.direction === SORT_DIRECTION.ASC ? 1 : -1,
    },
  };
};

const buildFilterClauseFromFacets = (selectedFacets: Map<string, any[]>, designDefinition: DesignDefinition): Document[] => {
  const filterClause = Array.from(selectedFacets.keys())
      // filter out facets without selected values
      .filter((facetName) => {
        const selectedFacetValues = selectedFacets.get(facetName);
        return selectedFacetValues && selectedFacetValues.length > 0;
      })
      .map((facetName) => {
        const facetConfig = getFacetByName(facetName, designDefinition);
        const selectedFacetValues = selectedFacets.get(facetName);

        if (!selectedFacetValues) {
          throw new Error(`Selected facet should have at least one value: "${selectedFacetValues}"`);
        }

        switch (facetConfig.type) {
          case  STRING_FACET_TYPE:
            return {
              text: {
                path: facetConfig.path,
                query: selectedFacetValues.join(', '),
              },
            };
          case  NUMBER_FACET_TYPE:
            const range = selectedFacetValues[0];
            return {
              range: {
                path: facetConfig.path,
                gte: range[0],
                lt: range[1],
              },
            };
          default:
            throw new Error(`Cannot recognize facet type: "${facetConfig.type}"`);
        }
      });

  return filterClause;
};

const buildFilterClauseFromFilters = (selectedFilters: Map<string, any>, designDefinition: DesignDefinition): Document[] => {
  const filterClause = designDefinition.filters
      // filter out filters without selected values
      .filter((filterConfig) => {
        const filterKey = `${filterConfig.type}-${filterConfig.path}`;
        return selectedFilters.has(filterKey);
      })
      .map((filterConfig) => {
        const range: RangeOperator = {
          path: filterConfig.path,
        };

        const filterKey = `${filterConfig.type}-${filterConfig.path}`;
        const selectedValue: SelectedNumberRangeFilter = selectedFilters.get(filterKey);

        if (selectedValue.min) {
          range.gte = selectedValue.min;
        }

        if (selectedValue.max) {
          range.lte = selectedValue.max;
        }

        return { range };
      });

  return filterClause;
};

const extractDesignDefinition = (req: NextApiRequest): DesignDefinition => {
  let designDefinition: DesignDefinition;

  if (req.query.designDefinition && isString(req.query.designDefinition)) {
    try {
      designDefinition = JSON.parse(req.query.designDefinition);
    } catch (e) {
      throw new Error('Cannot parse Design Definition.');
    }
  } else {
    throw new Error('Design definition is required.');
  }

  if (validateDesignDefinition(designDefinition)) {
    throw new Error(`Design Definition is invalid: ${validateDesignDefinition(designDefinition)}`);
  }

  return designDefinition;
};
