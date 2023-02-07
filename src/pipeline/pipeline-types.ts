export const NUMBER_FACET_TYPE = 'number';
export const STRING_FACET_TYPE = 'string';

export interface NumberFacet {
  type: string,
  path: string,
  boundaries: Array<number>
}

export interface StringFacet {
  type: string,
  path: string,
  numBuckets: number;
}

export interface RangeOperator {
  path: string;
  gte?: number | string;
  lte?: number | string;
}

export interface SearchStage {
  index: string;
  facet?: Facet;
  compound?: any;
  highlight?: any;
  count?: any;
  returnStoredSource?: any;
}

export interface Facet {
  operator: Record<string, any>;
  facets: Facets;
}

export interface Facets extends Record<string, NumberFacet | StringFacet> {
}
