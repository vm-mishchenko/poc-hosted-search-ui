import { getMongoClient } from './client';

/*
* Return random 10 documents
*/
export const getRandomDocs = async (databaseName: string, collectionName: string) => {
  const mongoDBClient = await getMongoClient();
  const collection = mongoDBClient.db(databaseName).collection(collectionName);
  return collection.aggregate([
    {
      $search: {
        queryString: {
          query: "*:*",
          defaultPath: "does-not-exists",
        },
      },
    },
    {
      $limit: 10,
    },
  ]).toArray();
};
