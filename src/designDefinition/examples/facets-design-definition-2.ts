import { DesignDefinition } from '../types/designDefinition';

export const facetsDesignDefinition2: DesignDefinition = {
  "searchIndex": {
    "name": "facets",
    "databaseName": "sample_airbnb",
    "collectionName": "listingsAndReviews",
  },
  "pipeline": [
    {
      "$search": {
        "index": "facets",
        "facet": {
          "operator": {
            "text": {
              "query": "$$SEARCH_QUERY",
              "path": {
                "wildcard": "*",
              },
            },
          },
          "facets": {
            "accommodatesFacet": {
              "type": "number",
              "path": "accommodates",
              "boundaries": [
                1,
                3,
                5,
              ],
              "default": "more",
            },
            "bedTypesFacet": {
              "type": "string",
              "path": "bed_type",
              "numBuckets": 3,
            },
          },
        },
      },
    },
    {
      "$limit": 10,
    },
  ],
  "ui": {
    "docFieldNamesToRender": [
      "name",
      "bed_type",
      "accommodates",
    ],
    "docTitleFieldName": "",
    "url": {
      "docFieldName": "",
      "template": "",
    },
  },
};
