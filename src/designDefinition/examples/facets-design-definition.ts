import { DesignDefinition } from '../types/designDefinition';

export const facetsDesignDefinition: DesignDefinition = {
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
            "compound": {
              "filter": [
                {
                  "range": {
                    "path": "accommodates",
                    "gte": 1,
                    "lte": 2,
                  },
                },
              ],
              "should": [
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
          "facets": {
            "accommodatesFacet": {
              "type": "number",
              "path": "accommodates",
              "boundaries": [1, 4, 5],
              "default": "other",
            },
          },
        },
      },
    },
    {
      "$facet": {
        "docs": [
          { "$limit": 2 },
        ],
        "meta": [
          { "$replaceWith": "$$SEARCH_META" },
          { "$limit": 1 },
        ],
      },
    },
    {
      "$set": {
        "meta": {
          "$arrayElemAt": ["$meta", 0],
        },
      },
    },
  ],

  "ui": {
    "docFieldNamesToRender": [
      "name",
      "accommodates",
    ],
    "docTitleFieldName": "",
    "url": {
      "docFieldName": "",
      "template": "",
    },
  },
};