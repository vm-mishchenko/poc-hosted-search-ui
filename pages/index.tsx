import Head from 'next/head'
import { useEffect, useState } from 'react';

function abortableFetch(url: string) {
  const controller = new AbortController();
  const signal = controller.signal;

  return {
    abort: () => controller.abort(),
    ready: fetch(url, {signal})
  };
}

let currentFetch: any;

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
        <link rel="icon" href="/favicon.ico" />
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
                {
                  searchResult.title
                }
              </p>
            </li>
          })}
        </ul>
      </main>
    </>
  )
}
