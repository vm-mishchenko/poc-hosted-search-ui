import React, {
  useEffect,
  useState,
} from 'react';
import {
  DesignDefinition,
  URL_FIELD_NAME_VARIABLE,
} from '../../designDefinition/types/designDefinition';
import { search } from './services/search';

const DEFAULT_TITLE_FIELD_NAME = '_id';

const getSearchResultUrl = (searchResult: Record<string, any>, designDefinition: DesignDefinition): string | null => {
  if (!designDefinition.ui.url) {
    return null;
  }

  if (designDefinition.ui.url.docFieldName) {
    if (!designDefinition.ui.url.template.includes(URL_FIELD_NAME_VARIABLE)) {
      console.warn('Potentially invalid URL configuration: URL template does not have URL_FIELD_NAME_VARIABLE whereas "designDefinition.ui.url.docFieldName" is specified.');
      return designDefinition.ui.url.template;
    }

    return designDefinition.ui.url.template.replace(URL_FIELD_NAME_VARIABLE, searchResult[designDefinition.ui.url.docFieldName]);
  }

  if (designDefinition.ui.url.template.includes(URL_FIELD_NAME_VARIABLE)) {
    console.warn(`Potentially invalid URL configuration: URL template has ${URL_FIELD_NAME_VARIABLE} variable but "designDefinition.ui.url.docFieldName" is not specified.`);
  }

  return designDefinition.ui.url.template;
};

const getSearchResultObject = (searchResult: Record<string, any>, designDefinition: DesignDefinition) => {
  const fieldNamesToRender = designDefinition.ui.docFieldNamesToRender ? designDefinition.ui.docFieldNamesToRender : [];

  if (!fieldNamesToRender.length) {
    return searchResult;
  }

  const searchResultObject = fieldNamesToRender.reduce((result: any, field: any) => {
    result[field] = searchResult[field];
    return result;
  }, {} as Record<string, any>);

  if (!Object.keys(searchResultObject).length) {
    console.warn(`Potentially invalid "designDefinition.ui.docFieldNamesToRender" configuration: No fields were selected from original "searchResult" object.`);
  }

  return searchResultObject;
};

export interface RuntimeProps {
  designDefinition: DesignDefinition;
}

export const Runtime = ({ designDefinition }: RuntimeProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    search(searchQuery, designDefinition).then((results) => {
      setSearchResults(results);
      setLoading(false);
    });
  }, [searchQuery, designDefinition]);

  const titleUI = (searchResult: Record<string, any>) => {
    let titleFieldName: string;

    if (designDefinition.ui.docTitleFieldName &&
        searchResult.hasOwnProperty(designDefinition.ui.docTitleFieldName)
    ) {
      titleFieldName = designDefinition.ui.docTitleFieldName;
    } else {
      titleFieldName = DEFAULT_TITLE_FIELD_NAME;
    }

    const url = getSearchResultUrl(searchResult, designDefinition);

    if (!url) {
      return <p>
        {searchResult[titleFieldName]}
      </p>;
    }

    return <p>
      <a href={url} target="_blank" rel="noreferrer">{searchResult[titleFieldName]}</a>
    </p>;
  };

  return (
      <div>
        <h2>Runtime</h2>

        <input value={searchQuery} type="search" onChange={(event) => {
          setSearchQuery(event.target.value);
        }} />

        <p>Loading: {loading ? 'true' : 'false'}</p>

        <p>Number of Search results: {searchResults.length}</p>

        <ul>
          {searchResults.map((searchResult: any) => {
            return <li key={searchResult._id}>
              {titleUI(searchResult)}
              <pre>
                  {JSON.stringify(getSearchResultObject(searchResult, designDefinition), null, 2)}
              </pre>
            </li>;
          })}
        </ul>
      </div>
  );
};

/**
 * Called during server side rendering.
 * Called during client navigation to get data for the page.
 */
export async function getStaticProps () {
  return {
    props: {},
  };
}
