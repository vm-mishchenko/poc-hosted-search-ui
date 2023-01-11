// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { COLLECTION_NAME, DATABASE_NAME, DB_CONNECTION, DB_PASSWORD, DB_USER, INDEX_NAME } from '../../mms-config';
import { isString } from '../../utils';

const MongoClient = require("mongodb").MongoClient;
const MONGODB_CONNECTION_PATH = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_CONNECTION}`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const mongoDBClient = await MongoClient.connect(MONGODB_CONNECTION_PATH);
  const searchQuery = isString(req.query.searchQuery) ? req.query.searchQuery : '';

  if (!searchQuery) {
    res.status(200).json({ results: [] });
    return;
  }

  const searchResults = await search(mongoDBClient, searchQuery);
  res.status(200).json({ results: searchResults })
}

const search  = (client: any, query: string) => {
  const searchQuery = {
    index: INDEX_NAME,
    text: {
      query,
      path: "title"
    },
  };

  const collection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
  const pipeline = [
    {
      $search: searchQuery,
    },
    {
      $limit: 10
    },
  ];

  return collection
      .aggregate(pipeline)
      .toArray()
      .then((results: Array<any>) => {
        return results;
      });
}
