import React, {
  useEffect,
  useState,
} from 'react';
import { DesignDefinition } from '../../designDefinition/types/designDefinition';
import { search } from './services/search';
import { SearchResult } from './components/SearchResult/SearchResult';
import { SearchErrorResponse } from '../../pages/api/search';

export interface RuntimeProps {
  designDefinition: DesignDefinition;
}

export const Runtime = ({ designDefinition }: RuntimeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<Record<string, any>>>([]);
  const [meta, setMeta] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [errorResponseMessage, setErrorResponseMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setErrorResponseMessage('');
    search(searchQuery, designDefinition).then((searchResponse) => {
      setSearchResults(searchResponse.docs);
      setMeta(searchResponse.meta);
    }).catch((error: SearchErrorResponse) => {
      setErrorResponseMessage(error.errorMessage);
    }).finally(() => {
      setLoading(false);
    });
  }, [searchQuery, designDefinition]);

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

        <ul>
          {searchResults.map((searchResult: any) => {
            return <li key={searchResult._id}>
              <SearchResult searchResult={searchResult} designDefinition={designDefinition} />
            </li>;
          })}
        </ul>
      </div>
  );
};

