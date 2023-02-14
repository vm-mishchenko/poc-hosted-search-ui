import React, { useMemo } from 'react';
import {
  DesignDefinition,
  URL_FIELD_NAME_VARIABLE,
} from '../../../../designDefinition/types/designDefinition';
import styles from './SearchResult.module.css';
import dynamic from 'next/dynamic';

const DynamicReactJson = dynamic(import('react-json-view'), { ssr: false });

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
    return <p className={styles.title}>
      <b>
        {searchResult[titleFieldName]}
      </b>
    </p>;
  }

  return <p className={styles.title}>
    <b>
      <a href={url} target="_blank" rel="noreferrer">{searchResult[titleFieldName]}</a>
    </b>
  </p>;
};

const resolvePath = (object: Record<string, any>, path: string, defaultValue: any): any => {
  return path
      .split('.')
      .reduce((o, p) => o ? o[p] : defaultValue, object);
};

const getSearchResultObject = (searchResult: Record<string, any>, designDefinition: DesignDefinition): Record<string, any> => {
  const fieldNamesToRender = designDefinition.ui.docFieldNamesToRender ? designDefinition.ui.docFieldNamesToRender : [];

  if (!fieldNamesToRender.length) {
    return searchResult;
  }

  const searchResultObject = fieldNamesToRender.reduce((result: any, fieldName: string) => {
    // fieldName might be nested, e.g. review.accuracy
    const value = resolvePath(searchResult, fieldName, '');
    result[fieldName] = value;
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
  className?: string;
}

export const SearchResult = ({ searchResult, designDefinition, className }: SearchResultProps) => {
  const result = useMemo(() => {
    return getSearchResultObject(searchResult, designDefinition);
  }, [searchResult, designDefinition]);

  const collapsed = Object.keys(result).length === Object.keys(searchResult).length;

  return <div className={`${className} ${styles.wrapper}`}>
    {titleUI(searchResult, designDefinition)}

    <DynamicReactJson collapseStringsAfterLength={40}
                      collapsed={collapsed}
                      src={result}
                      displayDataTypes={false}
                      name={null}
                      theme="rjv-default" />
  </div>;
};
