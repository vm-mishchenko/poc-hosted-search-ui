import {
  NumberRangeFilter,
  UIDesignDefinition,
} from '../types/designDefinition';
import { Document } from 'mongodb';
import { buildDesignDefinition } from '../utils';

const pipeline: Document[] = [
  {
    "$search": {
      "index": "facets",
      "facet": {
        "operator": {
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

const filters: NumberRangeFilter[] = [];

const sort: string[] = [];

const ui: UIDesignDefinition = {
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
};

export const facetsDesignDefinition = buildDesignDefinition(pipeline, filters, sort, ui);
