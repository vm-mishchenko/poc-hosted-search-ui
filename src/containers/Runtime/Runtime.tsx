import React, {
  useEffect,
  useState,
} from 'react';
import { DesignDefinition } from '../../designDefinition/types/designDefinition';
import { search } from './services/search';
import { SearchResult } from './components/SearchResult/SearchResult';
import {
  MetaResponse,
  SearchErrorResponse,
} from '../../pages/api/search';
import {
  NUMBER_FACET_TYPE,
  STRING_FACET_TYPE,
} from '../../pipeline/pipeline-types';
import { NumberFacetComp } from './components/NumberFacet/NumberFacetComp';
import { StringFacet } from './components/StringFacet/StringFacet';

export interface RuntimeProps {
  designDefinition: DesignDefinition;
}

export const Runtime = ({ designDefinition }: RuntimeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacets, setSelectedFacets] = useState<Map<string, any[]>>(new Map());
  const [searchResults, setSearchResults] = useState<Array<Record<string, any>>>([]);
  const [actualPipeline, setActualPipeline] = useState({});
  const [meta, setMeta] = useState<MetaResponse>({
    facets: [],
  });
  const [loading, setLoading] = useState(false);
  const [errorResponseMessage, setErrorResponseMessage] = useState('');

  const onFacetChange = (facetName: string, selectedBucketIds: any[]) => {
    const newSelectedFacets = new Map(selectedFacets);

    if (selectedBucketIds.length === 0) {
      newSelectedFacets.delete(facetName);
    } else {
      newSelectedFacets.set(facetName, selectedBucketIds);
    }

    setSelectedFacets(newSelectedFacets);
  };

  useEffect(() => {
    // todo-vm: clear selected facets when searchQuery was changed
    setLoading(true);
    setErrorResponseMessage('');
    search(searchQuery, selectedFacets, designDefinition).then((searchResponse) => {
      setSearchResults(searchResponse.docs);
      // todo-vm: update list of facets AND selected values based on meta
      setMeta(searchResponse.meta);
      setActualPipeline(searchResponse.pipeline);
    }).catch((error: SearchErrorResponse) => {
      setErrorResponseMessage(error.errorMessage);
    }).finally(() => {
      setLoading(false);
    });
  }, [searchQuery, selectedFacets, designDefinition]);

  return (
      <div>
        <h2>Runtime</h2>

        <input value={searchQuery} type="search" onChange={(event) => {
          setSearchQuery(event.target.value);
        }} />

        <p>Loading: {loading ? 'true' : 'false'}</p>

        <p>Number of Search results: {searchResults.length}</p>

        {errorResponseMessage && <p>
          Error: {errorResponseMessage}
        </p>}

        <h3>Facets</h3>
        <ul>
          {meta.facets.map((facet) => {
            const selectedBucketIds = selectedFacets.get(facet.name) || [];

            switch (facet.config.type) {
              case NUMBER_FACET_TYPE:
                return <NumberFacetComp facet={facet} selectedRanges={selectedBucketIds} onChange={onFacetChange}
                                        key={facet.name} />;
              case STRING_FACET_TYPE:
                return <StringFacet facet={facet} selectedBucketIds={selectedBucketIds} onChange={onFacetChange}
                                    key={facet.name} />;
              default:
                console.warn(`Unknown facet type: ${facet.config.type}`);
            }
          })}
        </ul>

        <h3>Search results</h3>

        {!searchResults.length ? 'No results' : <ul>
          {searchResults.map((searchResult: any) => {
            return <li key={searchResult._id}>
              <SearchResult searchResult={searchResult} designDefinition={designDefinition} />
            </li>;
          })}
        </ul>}

        <h3>Meta</h3>
        <pre>
          {JSON.stringify(meta, null, 2)}
        </pre>

        <h3>Actual pipeline</h3>
        <pre>
          {JSON.stringify(actualPipeline, null, 2)}
        </pre>
      </div>
  );
};

