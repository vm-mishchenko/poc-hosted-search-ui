// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { isString } from '../../utils';
import {
  DesignDefinition,
  NumberFacet,
  SEARCH_QUERY_VARIABLE,
  StringFacet,
} from '../../designDefinition/types/designDefinition';
import {
  getCollectionName,
  getDatabaseName,
  getFacetByName,
  validateDesignDefinition,
} from '../../designDefinition/utils';
import { runPipeline } from '../../database/runPipeline';
import { getRandomDocs } from '../../database/getRandomDocs';
import {
  FacetBucketMongoDB,
  MetaMongoDB,
} from '../../database/types';

export interface SearchResponse {
  docs: Record<string, any>[];
  meta: MetaResponse;
}

export interface MetaResponse {
  facets: Array<MetaFacetResponse>;
}

export interface MetaFacetResponse {
  name: string;
  config: NumberFacet | StringFacet;
  result: FacetBucketMongoDB[];
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

  const searchQuery = isString(req.query.searchQuery) ? req.query.searchQuery : '';
  if (!searchQuery) {
    const response = await getResponseForFirstPage(designDefinition);
    res.status(200).json(response);
    return;
  }

  const databaseName = designDefinition.searchIndex.databaseName;
  const collectionName = designDefinition.searchIndex.collectionName;
  const pipeline = buildPipeline(searchQuery, designDefinition);
  const searchResults = await runPipeline(databaseName, collectionName, pipeline);

  const response: SearchResponse = {
    docs: searchResults.docs,
    meta: mapToResponseMeta(searchResults.meta, designDefinition),
  };

  res.status(200).json(response);
}

const mapToResponseMeta = (metaMongoDB: MetaMongoDB, designDefinition: DesignDefinition): MetaResponse => {
  const facetNames = Object.keys(metaMongoDB.facet);

  const facets = facetNames.reduce((result, facetName) => {
    const facetResult = metaMongoDB.facet[facetName].buckets;
    const facetConfig = getFacetByName(facetName, designDefinition);
    const facet: MetaFacetResponse = {
      name: facetName,
      result: facetResult,
      config: facetConfig,
    };

    result.push(facet);
    return result;
  }, [] as MetaFacetResponse[]);

  return {
    facets,
  };
};

const buildPipeline = (searchQuery: string, designDefinition: DesignDefinition): Document[] => {
  const pipeline = designDefinition.pipeline;
  const pipelineAsString = JSON.stringify(pipeline);
  const pipelineAsStringWithQuery = pipelineAsString.replace(SEARCH_QUERY_VARIABLE, searchQuery);
  const pipelineWithQuery = JSON.parse(pipelineAsStringWithQuery);

  return pipelineWithQuery;
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

const getResponseForFirstPage = async (designDefinition: DesignDefinition): Promise<SearchResponse> => {
  // get first 10 results
  const docs = await getRandomDocs(getDatabaseName(designDefinition), getCollectionName(designDefinition));
  return {
    docs,
    meta: {
      facets: [],
    },
  };
};
