import React from 'react';
import {
  DesignDefinition,
  URL_FIELD_NAME_VARIABLE,
} from '../../../../designDefinition/types/designDefinition';

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

const titleUI = (searchResult: Record<string, any>, designDefinition: DesignDefinition) => {
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

export interface SearchResultProps {
  searchResult: Record<string, any>;
  designDefinition: DesignDefinition;
}

export const SearchResult = ({ searchResult, designDefinition }: SearchResultProps) => {
  return <div>
    {titleUI(searchResult, designDefinition)}

    <pre>
      {JSON.stringify(getSearchResultObject(searchResult, designDefinition), null, 2)}
    </pre>
  </div>;
};