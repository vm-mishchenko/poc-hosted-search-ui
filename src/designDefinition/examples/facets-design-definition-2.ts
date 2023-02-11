import {
  DesignDefinition,
  FILTER_TYPE,
} from '../types/designDefinition';
import { buildDesignDefinition } from '../utils';

const pipeline = [
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
];

const filters = [
  {
    type: FILTER_TYPE.NUMBER_RANGE,
    path: "bedrooms",
  },
  {
    type: FILTER_TYPE.NUMBER_RANGE,
    path: "review_scores.review_scores_accuracy",
  },
];

const sort: string[] = [];

const ui = {
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
};

export const facetsDesignDefinition2: DesignDefinition = buildDesignDefinition(
    pipeline,
    filters,
    sort,
    ui,
);
