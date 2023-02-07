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
import { NumberRangeFilterComp } from './components/NumberRangeFilterComp/NumberRangeFilterComp';

export interface RuntimeProps {
  designDefinition: DesignDefinition;
}

export const Runtime = ({ designDefinition }: RuntimeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacets, setSelectedFacets] = useState<Map<string, any[]>>(new Map());
  const [selectedFilters, setSelectedFilters] = useState<Map<string, any>>(new Map());
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

  const onFilterChange = (filterKey: string, selectedValue: any) => {
    const newSelectedFilers = new Map(selectedFilters);

    if (Object.keys(selectedValue).length === 0) {
      newSelectedFilers.delete(filterKey);
    } else {
      newSelectedFilers.set(filterKey, selectedValue);
    }

    setSelectedFilters(newSelectedFilers);
  };

  useEffect(() => {
    // todo-vm: clear selected facets when searchQuery was changed
    setLoading(true);
    setErrorResponseMessage('');
    search(searchQuery, selectedFacets, selectedFilters, designDefinition).then((searchResponse) => {
      setSearchResults(searchResponse.docs);
      setMeta(searchResponse.meta);
      setActualPipeline(searchResponse.pipeline);
    }).catch((error: SearchErrorResponse) => {
      setErrorResponseMessage(error.errorMessage);
    }).finally(() => {
      setLoading(false);
    });
  }, [searchQuery, selectedFacets, selectedFilters, designDefinition]);

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

        <h3>Filters</h3>
        <ul>
          {designDefinition.filters.map((filter) => {
            const filterKey = `${filter.type}-${filter.path}`;
            const selectedFilterValues = selectedFilters.get(filterKey) || {};
            return <NumberRangeFilterComp
                onChange={(value) => {
                  onFilterChange(filterKey, value);
                }}
                selectedFilters={selectedFilterValues}
                key={filterKey}
                filter={filter}
            />;
          })}
        </ul>

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

