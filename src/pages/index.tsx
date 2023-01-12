import Head from 'next/head'
import { useEffect, useState } from 'react';
import {
  DOC_FIELDS_TO_RENDER,
  DOC_ID_FIELD_NAME,
  DOC_TITLE_FIELD_NAME,
  DOC_URL,
} from '../mms-explicit-user-configs';

function abortableFetch(url: string) {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    abort: () => controller.abort(),
    ready: fetch(url, {signal})
  };
}

let currentFetch: any;

const getSearchResultUrl = (searchResult: any) => {
  return DOC_URL.replace('$DOC_ID_FIELD_NAME', searchResult[DOC_ID_FIELD_NAME]);
}

const getSearchResultObject = (searchResult: any) => {
  return DOC_FIELDS_TO_RENDER.reduce((result: any, field: any) => {
    result[field] = searchResult[field];
    return result;
  }, {} as any);
}

const search = async (query: string) => {
  if (!!currentFetch) {
    currentFetch.abort();
    currentFetch = null;
  }

  const searchParams = new URLSearchParams();
  searchParams.append('searchQuery', query.trim());
  const url  = `/api/search?${searchParams}`;
  currentFetch = abortableFetch(url);

  const response = await currentFetch.ready;
  currentFetch = null;
  const data = await response.json();
  return data.results;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const onSearchInputChanged = (query: string) => {
    setSearchQuery(query);
  }

  useEffect(() => {
    setLoading(true);
    search(searchQuery).then((results) => {
      setSearchResults(results);
      setLoading(false);
    });
  }, [searchQuery]);

  return (
    <>
      <Head>
        <title>Hosted Search</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/Users/vitalii.mishchenko/Documents/experiments/poc-hosted-search-ui/public/favicon.ico" />
      </Head>
      <main>
        <input value={searchQuery} type="search" onChange={(event) => {
          onSearchInputChanged(event.target.value);
        }} />

        <p>Loading: {loading ? 'true': 'false'}</p>

        <p>Number of Search results: {searchResults.length}</p>

        <ul>
          {searchResults.map((searchResult: any) => {
            return <li key={searchResult.id}>
              <p>
                <a href={getSearchResultUrl(searchResult)} target="_blank" rel="noreferrer">{searchResult[DOC_TITLE_FIELD_NAME]}</a>
              </p>
              <pre>
                  {JSON.stringify(getSearchResultObject(searchResult), null, 2)}
              </pre>
            </li>
          })}
        </ul>
      </main>
    </>
  )
}
