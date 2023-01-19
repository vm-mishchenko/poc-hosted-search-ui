export interface MetaMongoDB {
  facet: Record<string, { buckets: Array<FacetBucketMongoDB> }>;
}

export interface FacetBucketMongoDB {
  _id: number,
  count: number
}
