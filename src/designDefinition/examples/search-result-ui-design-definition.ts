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
    "template": "https://www.google.com/search?q=$$URL_FIELD_NAME",
    "docFieldName": "name",
  },
};

export const SEARCH_RESULT_UI_DESIGN_DEFINITION = buildDesignDefinition(pipeline, filters, sort, ui);