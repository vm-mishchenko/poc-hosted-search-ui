import React from 'react';
import {
  Option,
  Select,
} from '@leafygreen-ui/select';
import {
  SORT_DIRECTION,
  SortRequest,
} from '../../../../apiTypes/searchTypes';

import styles from './SortComp.module.css';

export interface SortCompProps {
  options: string[];
  selectedSort: SortRequest | null;
  onChange: (sort: SortRequest | null) => void;
}

const DEFAULT_RECOMMENDED_VALUE = 'Recommended';

const getValue = (selectedSort: SortRequest | null): string => {
  if (!selectedSort) {
    return DEFAULT_RECOMMENDED_VALUE;
  }

  return `${selectedSort.direction.toLowerCase()}-${selectedSort.path}`;
};

export const SortComp = ({ options, selectedSort, onChange }: SortCompProps) => {
  return <div className={styles.wrapper}>
    <label id="runtime-sort" className={styles.label}>
      <strong>Sort</strong>
    </label>
    <Select
        label=""
        className={styles.select}
        aria-labelledby="runtime-sort"
        allowDeselect={false}
        onChange={(selectedValue) => {
          if (selectedValue === DEFAULT_RECOMMENDED_VALUE) {
            onChange(null);
            return;
          }

          if (selectedValue.startsWith('asc-')) {
            onChange({
              path: selectedValue.slice(4),
              direction: SORT_DIRECTION.ASC,
            });
            return;
          }

          onChange({
            path: selectedValue.slice(5),
            direction: SORT_DIRECTION.DESC,
          });
        }}
        value={getValue(selectedSort)}
    >
      <Option value={DEFAULT_RECOMMENDED_VALUE} key={DEFAULT_RECOMMENDED_VALUE}>{DEFAULT_RECOMMENDED_VALUE}</Option>
      {options.map((optionName) => {
        return <>
          <Option key={`${optionName}-asc`} value={`asc-${optionName}`}>ASC: {optionName}</Option>
          <Option key={`${optionName}-desc`} value={`desc-${optionName}`}>DESC: {optionName}</Option>
        </>;
      })}
    </Select>
  </div>;
};