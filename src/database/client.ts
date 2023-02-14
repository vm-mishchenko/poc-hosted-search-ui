import { MongoClient } from 'mongodb';

import {
  DB_CONNECTION,
  DB_PASSWORD,
  DB_USER,
} from '../mms-config';

const MONGODB_CONNECTION_PATH = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_CONNECTION}`;

let mongoClient: MongoClient;

export const getMongoClient = async () => {
  if (!mongoClient) {
    console.log('Mongodb: connected');
    mongoClient = await MongoClient.connect(MONGODB_CONNECTION_PATH);
  }

  return mongoClient;
};
