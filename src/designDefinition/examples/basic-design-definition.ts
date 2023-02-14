import { buildDesignDefinition } from '../utils';
import {
  NumberRangeFilter,
  UIDesignDefinition,
} from '../types/designDefinition';
import { Document } from 'mongodb';

const pipeline: Document[] = [
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
];

const filters: NumberRangeFilter[] = [];

const sort: string[] = [];

const ui: UIDesignDefinition = {
  "docFieldNamesToRender": [
    "name",
  ],
  "docTitleFieldName": "name",
  "url": {
    "docFieldName": "",
    "template": "",
  },
};

export const BASIC_DESIGN_DEFINITION = buildDesignDefinition(pipeline, filters, sort, ui);