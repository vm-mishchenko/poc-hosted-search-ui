import {
  DesignDefinition,
  FILTER_TYPE,
} from '../types/designDefinition';

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
  "filters": [
    {
      type: FILTER_TYPE.NUMBER_RANGE,
      path: "bedrooms",
    },
    {
      type: FILTER_TYPE.NUMBER_RANGE,
      path: "review_scores.review_scores_accuracy",
    },
  ],
  "sort": [],
  "ui": {
    "docFieldNamesToRender": [
      "name",
      "bed_type",
      "accommodates",
      "bedrooms",
      "review_scores.review_scores_accuracy",
    ],
    "docTitleFieldName": "",
    "url": {
      "docFieldName": "",
      "template": "",
    },
  },
};
