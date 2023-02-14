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
        "path": "name",
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

export const BASIC_DESIGN_DEFINITION = buildDesignDefinition(pipeline, filters, sort, ui);