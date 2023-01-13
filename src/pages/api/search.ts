// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { isString } from '../../utils';
import {
  DesignDefinition,
  SEARCH_QUERY_VARIABLE,
  validateDesignDefinition,
} from '../../designDefinition/types/designDefinition';
import { getMongoClient } from '../../database/client';
import {
  Document,
  MongoClient,
} from 'mongodb';

export interface SearchResponse {
  docs: Record<string, any>[];
  meta: Array<any>;
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
  const searchQuery = isString(req.query.searchQuery) ? req.query.searchQuery : '';
  if (!searchQuery) {
    res.status(200).json({ docs: [], meta: [] });
    return;
  }

  let designDefinition: DesignDefinition;
  if (req.query.designDefinition && isString(req.query.designDefinition)) {
    try {
      designDefinition = JSON.parse(req.query.designDefinition);
    } catch (e) {
      res.status(400).json({ errorMessage: 'Cannot parse Design Definition.' } as any);
      return;
    }
  } else {
    res.status(400).json({ errorMessage: 'Design definition is required.' } as any);
    return;
  }

  if (validateDesignDefinition(designDefinition)) {
    res.status(400).json({ errorMessage: `Design Definition is invalid: ${validateDesignDefinition(designDefinition)}` } as any);
    return;
  }

  const databaseName = designDefinition.searchIndex.databaseName;
  const collectionName = designDefinition.searchIndex.collectionName;
  const pipeline = buildPipeline(searchQuery, designDefinition);
  const pipelineHasFacets = hasFacets(pipeline);

  const mongoDBClient = await getMongoClient();
  const searchResults = await search(mongoDBClient, databaseName, collectionName, pipeline);

  let response: SearchResponse;
  if (pipelineHasFacets) {
    response = searchResults[0] as SearchResponse;
  } else {
    response = {
      docs: searchResults,
      meta: [],
    };
  }

  res.status(200).json(response);
}

const search = (client: MongoClient, databaseName: string, collectionName: string, pipeline: Document[]) => {
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

const hasFacets = (pipeline: Document[]): boolean => {
  const searchStage = pipeline[0];
  return !!searchStage['$search']['facet'];
};
