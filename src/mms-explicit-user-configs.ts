/**
 * Configuration User should specify in Atlas.
 */
import { INDEX_NAME } from './mms-config';

export const SEARCH_PIPELINE = (query: string) => {
  return [
    {
      $search: {
        index: INDEX_NAME,
        text: {
          query,
          path: {
            wildcard: "*"
          }
        },
      }
    },
    {
      $limit: 10
    },
  ];
};

/*
* List of document fields to render on UI.
* @optional: we could render all fields
*/
export const DOC_FIELDS_TO_RENDER = [
  '_id',
  'name',
  'description'
];

/*
* Field name that render as title
* @optional: we could show _id by default
*/
export const DOC_TITLE_FIELD_NAME = 'name';

/**
 * Parameters to construct URL.
 * @optional: we could skip showing URL on UI
 */
export const DOC_ID_FIELD_NAME = 'listing_url';
export const DOC_URL = `$DOC_ID_FIELD_NAME`;
