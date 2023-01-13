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

/**
 * 1. find Design Definition
 * 2. construct pipeline request
 * 3. execute search request to MongoDB
 * 4. return results
 */
export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse,
) {
  const mongoDBClient = await getMongoClient();
  const searchQuery = isString(req.query.searchQuery) ? req.query.searchQuery : '';
  const designDefinition: DesignDefinition = isString(req.query.designDefinition) ? JSON.parse(req.query.designDefinition) : '';

  if (!searchQuery) {
    res.status(200).json({ results: [] });
    return;
  }

  const databaseName = designDefinition.searchIndex.databaseName;
  const collectionName = designDefinition.searchIndex.collectionName;
  const pipeline = buildPipeline(searchQuery, designDefinition);

  const searchResults = await search(mongoDBClient, databaseName, collectionName, pipeline);
  res.status(200).json({ results: searchResults });
}

const search = (client: any, databaseName: string, collectionName: string, pipeline: string) => {
  const collection = client.db(databaseName).collection(collectionName);
  return collection
      .aggregate(pipeline)
      .toArray()
      .then((results: Array<any>) => {
        return results;
      });
};

const buildPipeline = (searchQuery: string, designDefinition: DesignDefinition): any => {
  const pipeline = designDefinition.pipeline;
  const pipelineAsString = JSON.stringify(pipeline);
  const pipelineAsStringWithQuery = pipelineAsString.replace(SEARCH_QUERY_VARIABLE, searchQuery);
  const pipelineWithQuery = JSON.parse(pipelineAsStringWithQuery);

  return pipelineWithQuery;
};