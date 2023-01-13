import { DesignDefinition } from '../../../designDefinition/types/designDefinition';
import { SearchResponse } from '../../../pages/api/search';

let currentFetch: any;

const abortableFetch = (url: string) => {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    abort: () => controller.abort(),
    ready: fetch(url, { signal }),
  };
};

export const search = async (searchQuery: string, designDefinition: DesignDefinition): Promise<SearchResponse> => {
  // abort previous in-flight request
  if (!!currentFetch) {
    currentFetch.abort();
    currentFetch = null;
  }

  // construct query parameters
  const searchParams = new URLSearchParams();
  searchParams.append('searchQuery', searchQuery.trim());
  searchParams.append('designDefinition', JSON.stringify(designDefinition));

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
