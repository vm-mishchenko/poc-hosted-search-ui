import { DesignDefinition } from '../../../../designDefinition/types/designDefinition';
import { SearchResult } from '../SearchResult/SearchResult';

import styles from './SearchResultsComp.module.css';

export interface SearchResultsCompProps {
  searchResults: Record<string, any>[];
  designDefinition: DesignDefinition;
}

export const SearchResultsComp = ({ searchResults, designDefinition }: SearchResultsCompProps) => {
  return <ul className={styles.wrapper}>
    {searchResults.map((searchResult: any) => {
      return <li key={searchResult._id}>
        {/* eslint-disable-next-line react/jsx-no-undef */}
        <SearchResult className={styles.searchResult} searchResult={searchResult} designDefinition={designDefinition} />
      </li>;
    })}
  </ul>;
};