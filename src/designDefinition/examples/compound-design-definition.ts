import { DesignDefinition } from '../types/designDefinition';

export const compoundDesignDefinition: DesignDefinition = {
  "searchIndex": {
    "name": "facets",
    "databaseName": "sample_airbnb",
    "collectionName": "listingsAndReviews",
  },
  "pipeline": [
    {
      "$search": {
        "compound": {
          "must": [
            {
              "text": {
                "query": "$$SEARCH_QUERY",
                "path": {
                  "wildcard": "*",
                },
              },
            },
          ],
        },
      },
    },
    {
      "$limit": 10,
    },
  ],
  "ui": {
    "docFieldNamesToRender": [],
    "docTitleFieldName": "",
    "url": {
      "docFieldName": "",
      "template": "",
    },
  },
};
