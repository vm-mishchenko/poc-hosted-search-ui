import React from 'react';
import {
  Option,
  Select,
} from '@leafygreen-ui/select';
import {
  SORT_DIRECTION,
  SortRequest,
} from '../../../../apiTypes/searchTypes';

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
  return <Select
      label="Sort"
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
        <Option key={`${optionName}-asc`} value={`asc-${optionName}`}>{optionName} ASC</Option>
        <Option key={`${optionName}-desc`} value={`desc-${optionName}`}>{optionName} DESC</Option>
      </>;
    })}
  </Select>;
};