import {
  NumberRangeFilter,
  UIDesignDefinition,
} from '../types/designDefinition';
import { Document } from 'mongodb';
import { buildDesignDefinition } from '../utils';

const pipeline: Document[] = [
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
];

const filters: NumberRangeFilter[] = [];

const sort: string[] = [];

const ui: UIDesignDefinition = {
  "docFieldNamesToRender": [
    "name",
  ],
  "docTitleFieldName": "",
  "url": {
    "docFieldName": "",
    "template": "",
  },
};

export const COMPOUND_DESIGN_DEFINITION = buildDesignDefinition(pipeline, filters, sort, ui);