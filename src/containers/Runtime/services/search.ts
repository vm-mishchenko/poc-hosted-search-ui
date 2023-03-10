import { DesignDefinition } from '../../../designDefinition/types/designDefinition';
import { SearchResponse } from '../../../pages/api/search';
import { SortRequest } from '../../../apiTypes/searchTypes';

let currentFetch: any;

const abortableFetch = (url: string) => {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    abort: () => controller.abort(),
    ready: fetch(url, { signal }),
  };
};

export const search = async (searchQuery: string, selectedFacets: Map<string, string[]>, selectedFilters: Map<string, any>, selectedSort: SortRequest | null, designDefinition: DesignDefinition): Promise<SearchResponse> => {
  // abort previous in-flight request
  if (!!currentFetch) {
    currentFetch.abort();
    currentFetch = null;
  }

  // construct query parameters
  const searchParams = new URLSearchParams();
  searchParams.append('searchQuery', searchQuery.trim());
  searchParams.append('selectedFacets', JSON.stringify(Array.from(selectedFacets.entries())));
  searchParams.append('selectedFilters', JSON.stringify(Array.from(selectedFilters.entries())));
  searchParams.append('designDefinition', JSON.stringify(designDefinition));
  selectedSort && searchParams.append('sort', JSON.stringify(selectedSort));

  // construct url
  const url = `/api/search?${searchParams}`;
  currentFetch = abortableFetch(url);

  // send request
  const response = await currentFetch.ready;
  currentFetch = null;
  const data = await response.json();

  if (response.status >= 400 && response.status < 600) {
    return Promise.reject(data);
  }

  return data;
};
