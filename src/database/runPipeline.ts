import { Document } from 'mongodb';
import { getMongoClient } from './client';
import { MetaMongoDB } from './types';

export interface PipelineResult {
  docs: Record<string, any>[],
  meta: MetaMongoDB
}

export const runPipelineNew = async (databaseName: string, collectionName: string, pipeline: Document[]): Promise<Record<string, any>[]> => {
  const client = await getMongoClient();
  const collection = client.db(databaseName).collection(collectionName);
  return await collection.aggregate(pipeline).toArray();
};

export const runPipeline = async (databaseName: string, collectionName: string, pipeline: Document[]): Promise<PipelineResult> => {
  const client = await getMongoClient();
  const collection = client.db(databaseName).collection(collectionName);
  const result = await collection.aggregate(pipeline).toArray();

  if (result.length === 1 && result[0].hasOwnProperty('meta') && result[0].hasOwnProperty('docs')) {
    return result[0] as PipelineResult;
  } else {
    return {
      docs: result,
      meta: {
        facet: {},
      },
    };
  }
};
