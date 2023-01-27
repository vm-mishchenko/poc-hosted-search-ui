export const NUMBER_FACET_TYPE = 'number';

export interface NumberFacet {
  type: string,
  path: string,
  boundaries: Array<number>
}

export const STRING_FACET_TYPE = 'string';

export interface StringFacet {
  type: string,
  path: string,
  numBuckets: number;
}

export interface SearchStage {
  index: string;
  facet?: Facet;
}

export interface Facet {
  operator: Record<string, any>;
  facets: Facets;
}

export interface Facets extends Record<string, NumberFacet | StringFacet> {
}
