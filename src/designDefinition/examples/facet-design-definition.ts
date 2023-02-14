import { buildDesignDefinition } from '../utils';
import {
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
            "path": "name",
          },
        },
        "facets": {
          "accommodatesNumberFacet": {
            "type": "number",
            "path": "accommodates",
            "boundaries": [
              1,
              3,
              5,
            ],
            "default": "more",
          },
          "bedStringFacet": {
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

const filters: NumberRangeFilter[] = [];

const sort: string[] = [];

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
    "docFieldName": "",
    "template": "",
  },
};

export const FACET_DESIGN_DEFINITION = buildDesignDefinition(pipeline, filters, sort, ui);