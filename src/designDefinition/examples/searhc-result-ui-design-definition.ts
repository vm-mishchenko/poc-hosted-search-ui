import { buildDesignDefinition } from '../utils';
import {
  FILTER_TYPE,
  NumberRangeFilter,
  UIDesignDefinition,
} from '../types/designDefinition';
import { Document } from 'mongodb';

const pipeline: Document[] = [
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

const filters: NumberRangeFilter[] = [
  {
    "type": FILTER_TYPE.NUMBER_RANGE, "path": "beds",
  },
  {
    "type": FILTER_TYPE.NUMBER_RANGE,
    "path": "bedrooms",
  },
];

const sort: string[] = [
  "beds",
  "bedrooms",
];

const ui: UIDesignDefinition = {
  "docFieldNamesToRender": [
    "_id",
    "name",
    "beds",
    "bedrooms",
    "accommodates",
    "bed_type",
  ],
  "docTitleFieldName": "name",
  "url": {
    "template": "https://www.google.com/search?q=$$URL_FIELD_NAME",
    "docFieldName": "name",
  },
};

export const SEARCH_RESULT_UI_DESIGN_DEFINITION = buildDesignDefinition(pipeline, filters, sort, ui);