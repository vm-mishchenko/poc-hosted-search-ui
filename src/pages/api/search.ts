// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { isString } from '../../utils';
import {
  DesignDefinition,
  SEARCH_QUERY_VARIABLE,
} from '../../designDefinition/types/designDefinition';
import { getMongoClient } from '../../database/client';
import {
  Document,
  MongoClient,
} from 'mongodb';
import {
  getCollectionName,
  getDatabaseName,
  hasFacet,
  validateDesignDefinition,
} from '../../designDefinition/utils';

export interface SearchResponse {
  docs: Record<string, any>[];
  meta: Meta;
}

export interface Meta {
  facet?: Array<MetaFacet>;
}

export interface MetaFacet {
  buckets: Array<{
    _id: number,
    count: number
  }>;
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
    designDefinition = extractDesignDefinition(req, res);
  } catch (error: any) {
    res.status(400).json({ errorMessage: error.message } as any);
    return;
  }

  const searchQuery = isString(req.query.searchQuery) ? req.query.searchQuery : '';
  if (!searchQuery) {
    const response = await getResponseForFirstPage(designDefinition);
    res.status(200).json(response);
  }

  const databaseName = designDefinition.searchIndex.databaseName;
  const collectionName = designDefinition.searchIndex.collectionName;
  const pipeline = buildPipeline(searchQuery, designDefinition);
  const pipelineHasFacets = hasFacet(designDefinition);

  const mongoDBClient = await getMongoClient();
  const searchResults = await runPipeline(mongoDBClient, databaseName, collectionName, pipeline);

  let response: SearchResponse;
  if (pipelineHasFacets) {
    response = searchResults[0] as SearchResponse;
  } else {
    response = {
      docs: searchResults,
      meta: {},
    };
  }

  res.status(200).json(response);
}

const runPipeline = (client: MongoClient, databaseName: string, collectionName: string, pipeline: Document[]) => {
  const collection = client.db(databaseName).collection(collectionName);
  return collection.aggregate(pipeline).toArray();
};

const buildPipeline = (searchQuery: string, designDefinition: DesignDefinition): any => {
  const pipeline = designDefinition.pipeline;
  const pipelineAsString = JSON.stringify(pipeline);
  const pipelineAsStringWithQuery = pipelineAsString.replace(SEARCH_QUERY_VARIABLE, searchQuery);
  const pipelineWithQuery = JSON.parse(pipelineAsStringWithQuery);

  return pipelineWithQuery;
};

const buildMetaPipeline = () => {
};

const extractDesignDefinition = (req: NextApiRequest, res: NextApiResponse): DesignDefinition => {
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
    meta: {},
  };
};

/*
* Return random 10 documents
*/
const getRandomDocs = async (databaseName: string, collectionName: string) => {
  const mongoDBClient = await getMongoClient();
  const collection = mongoDBClient.db(databaseName).collection(collectionName);
  return collection.aggregate([{ $sample: { size: 10 } }]).toArray();
};
