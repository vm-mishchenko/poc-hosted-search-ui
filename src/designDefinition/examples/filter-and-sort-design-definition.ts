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
    "docFieldName": "",
    "template": "",
  },
};

export const FILTER_AND_SORT_DESIGN_DEFINITION = buildDesignDefinition(pipeline, filters, sort, ui);