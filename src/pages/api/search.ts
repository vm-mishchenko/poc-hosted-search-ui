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
  hasFacet,
  validateDesignDefinition,
} from '../../designDefinition/utils';
import { runPipeline } from '../../database/runPipeline';
import {
  FacetBucketMongoDB,
  MetaMongoDB,
} from '../../database/types';
import {
  appendFilterClauseInCompoundOperator,
  COMPOUND_OPERATOR_NAME,
  getFacetOperatorNameFromPipeline,
} from '../../pipeline/pipeline';
import {
  NUMBER_FACET_TYPE,
  NumberFacet,
  STRING_FACET_TYPE,
  StringFacet,
} from '../../pipeline/pipeline-types';

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

  const searchQuery = isString(req.query.searchQuery) ? req.query.searchQuery : '';
  const databaseName = designDefinition.searchIndex.databaseName;
  const collectionName = designDefinition.searchIndex.collectionName;
  const pipeline = buildPipeline(searchQuery, selectedFacets, designDefinition);
  const searchResults = await runPipeline(databaseName, collectionName, pipeline);

  const response: SearchResponse = {
    docs: searchResults.docs,
    meta: mapToResponseMeta(searchResults.meta, selectedFacets, designDefinition),
    pipeline,
  };

  res.status(200).json(response);
}

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

const buildPipeline = (searchQuery: string, selectedFacets: Map<string, string[]>, designDefinition: DesignDefinition): Document[] => {
  if (searchQuery.length) {
    const pipeline = designDefinition.pipeline;
    const pipelineAsString = JSON.stringify(pipeline);
    const pipelineAsStringWithQuery = pipelineAsString.replace(SEARCH_QUERY_VARIABLE, searchQuery);
    const pipelineWithQuery = JSON.parse(pipelineAsStringWithQuery);
    const pipelineWithFacetFilter = addSelectedFacetsAsFilter(pipelineWithQuery, designDefinition, selectedFacets);
    return pipelineWithFacetFilter;
  } else {
    const searchIndexName = getSearchIndexName(designDefinition);

    if (hasFacet(designDefinition)) {
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
          $facet: {
            "docs": [
              {
                "$limit": 2,
              },
            ],
            "meta": [
              {
                "$replaceWith": "$$SEARCH_META",
              },
              {
                "$limit": 1,
              },
            ],
          },
        },
        {
          $set: {
            meta: {
              $arrayElemAt: [
                "$meta",
                0,
              ],
            },
          },
        },
        {
          $limit: 10,
        },
      ];

      const pipelineWithFacetFilter = addSelectedFacetsAsFilter(pipeline, designDefinition, selectedFacets);

      return pipelineWithFacetFilter;
    } else {
      return [
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
    }
  }
};

const addSelectedFacetsAsFilter = (pipeline: Document[], designDefinition: DesignDefinition, selectedFacets: Map<string, string[]>): Document[] => {
  if (selectedFacets.size === 0) {
    return pipeline;
  }

  // if there is selected facets, I assume pipeline uses "facet" operator
  const facetOperatorName = getFacetOperatorNameFromPipeline(pipeline);

  let finalPipeline = pipeline;
  if (facetOperatorName === COMPOUND_OPERATOR_NAME) {
    const filterClause = buildFilterClause(selectedFacets, designDefinition);
    finalPipeline = appendFilterClauseInCompoundOperator(finalPipeline, filterClause);
  } else {
  }

  return finalPipeline;
};

const buildFilterClause = (selectedFacets: Map<string, any[]>, designDefinition: DesignDefinition): Document[] => {
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
