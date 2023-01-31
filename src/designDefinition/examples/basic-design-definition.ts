import { DesignDefinition } from '../types/designDefinition';

export const basicDesignDefinition: DesignDefinition = {
  "searchIndex": {
    "name": "facets",
    "databaseName": "sample_airbnb",
    "collectionName": "listingsAndReviews",
  },
  "pipeline": [
    {
      "$search": {
        "text": {
          "query": "$$SEARCH_QUERY",
          "path": {
            "wildcard": "*",
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
      "description",
    ],
    "docTitleFieldName": "",
    "url": {
      "docFieldName": "",
      "template": "",
    },
  },
};
