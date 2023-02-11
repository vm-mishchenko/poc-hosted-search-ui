import React, {
  useEffect,
  useState,
} from 'react';
import { DesignDefinition } from '../../designDefinition/types/designDefinition';
import { search } from './services/search';
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
import { SortRequest } from '../../apiTypes/searchTypes';
import TextInput from '@leafygreen-ui/text-input';
import styles from './Runtime.module.css';
import { SortComp } from './components/SortComp/SortComp';
import { ResultsCountComp } from './components/ResultCountComp/ResultsCountComp';
import { SearchResultsComp } from './components/SearchResultsComp/SearchResultsComp';
import { NoResultsComp } from './components/NoResultsComp/NoResultsComp';
import { LoadingDotComp } from './components/LoadingDotComp/LoadingDotComp';
import Icon from '@leafygreen-ui/icon';
import IconButton from '@leafygreen-ui/icon-button';
import { Code } from '@leafygreen-ui/code';


export interface RuntimeProps {
  designDefinition: DesignDefinition;
}

export const Runtime = ({ designDefinition }: RuntimeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFacets, setSelectedFacets] = useState<Map<string, any[]>>(new Map());
  const [selectedFilters, setSelectedFilters] = useState<Map<string, any>>(new Map());
  const [selectedSort, setSelectedSort] = useState<SortRequest | null>(null);
  const [searchResults, setSearchResults] = useState<Array<Record<string, any>>>([]);
  const [actualPipeline, setActualPipeline] = useState({});
  const [showPipeline, setShowPipeline] = useState(false);
  const [meta, setMeta] = useState<MetaResponse>({
    facets: [],
  });
  const [requestsInFlight, setRequestsInFlight] = useState(0);
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

  // Reset selected sort option to default when Design definition does not have such field anymore.
  useEffect(() => {
    if (selectedSort && !designDefinition.sort.includes(selectedSort.path)) {
      setSelectedSort(null);
    }
  }, [designDefinition.sort]);

  // Run search request
  useEffect(() => {
    setRequestsInFlight((currentFlights) => {
      return currentFlights + 1;
    });
    // todo-vm: clear selected facets when searchQuery was changed
    setErrorResponseMessage('');
    search(searchQuery, selectedFacets, selectedFilters, selectedSort, designDefinition).then((searchResponse) => {
      setSearchResults(searchResponse.docs);
      setMeta(searchResponse.meta);
      setActualPipeline(searchResponse.pipeline);
    }).catch((error: SearchErrorResponse) => {
      setErrorResponseMessage(error.errorMessage);
    }).finally(() => {
      setRequestsInFlight((currentFlights) => {
        return currentFlights - 1;
      });
    });
  }, [searchQuery, selectedFacets, selectedFilters, selectedSort, designDefinition]);

  const switchPipeline = () => {
    setShowPipeline(!showPipeline);
  };

  return (
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <TextInput
              label={''}
              placeholder={'Search'}
              sizeVariant="large"
              onChange={(event) => {
                setSearchQuery(event.target.value);
              }}
              type="search"
              value={searchQuery}
              autoFocus={true}
              autoComplete="off"
              className={styles.searchInput}
          />
          <LoadingDotComp className={styles.loadingDot} requestsInFlight={requestsInFlight} />

          <IconButton title={`${showPipeline ? 'Hide pipeline' : 'Show pipeline'}`}
                      aria-label={`${showPipeline ? 'Hide pipeline' : 'Show pipeline'}`}
                      onClick={switchPipeline}
                      className={`${styles.pipelineBtn} ${showPipeline && styles.pipelineBtnActive}`}>
            <Icon glyph="InfoWithCircle" />
          </IconButton>
        </header>

        {showPipeline && <div className={styles.pipelineWrapper}>
          <p>Aggregation pipeline:</p>
          {/*@ts-ignore*/}
          <Code language={'JSON'}>
            {JSON.stringify(actualPipeline, null, 2)}
          </Code>
        </div>}

        <div className={styles.contentWrapper}>
          <div className={styles.sidebar}>
            <div>
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
                    className={styles.filter}
                />;
              })}
            </div>

            <div>
              {meta.facets.map((facet) => {
                const selectedBucketIds = selectedFacets.get(facet.name) || [];

                switch (facet.config.type) {
                  case NUMBER_FACET_TYPE:
                    return <NumberFacetComp facet={facet} selectedRanges={selectedBucketIds} onChange={onFacetChange}
                                            key={facet.name} className={styles.facet} />;
                  case STRING_FACET_TYPE:
                    return <StringFacet facet={facet} selectedBucketIds={selectedBucketIds} onChange={onFacetChange}
                                        key={facet.name} className={styles.facet} />;
                  default:
                    console.warn(`Unknown facet type: ${facet.config.type}`);
                }
              })}
            </div>
          </div>

          <div className={styles.main}>
            <div className={styles.resultsHeader}>
              <ResultsCountComp resultsCount={searchResults.length} />
              <div>
                <SortComp options={designDefinition.sort} selectedSort={selectedSort} onChange={setSelectedSort} />
              </div>
            </div>

            {errorResponseMessage && <p>
              Error: {errorResponseMessage}
            </p>}

            {!searchResults.length && requestsInFlight > 0 ? 'Loading...' : ''}

            {!searchResults.length && requestsInFlight === 0 ? <NoResultsComp /> :
                <SearchResultsComp searchResults={searchResults} designDefinition={designDefinition} />}
          </div>
        </div>

        {/*<h3>Meta</h3>*/}
        {/*<pre>*/}
        {/*  {JSON.stringify(meta, null, 2)}*/}
        {/*</pre>*/}

        {/*<h3>Actual pipeline</h3>*/}
        {/*<pre>*/}
        {/*  {JSON.stringify(actualPipeline, null, 2)}*/}
        {/*</pre>*/}
      </div>
  );
};

