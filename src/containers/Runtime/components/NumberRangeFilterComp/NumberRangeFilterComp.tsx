import { NumberRangeFilter } from '../../../../designDefinition/types/designDefinition';
import { prettifyName } from '../../../../utils/string';
import styles from './NumberRangeFilterComp.module.css';
import TextInput from '@leafygreen-ui/text-input';
import React, { useState } from 'react';

export interface NumberRangeFilterCompProps {
  filter: NumberRangeFilter;
  selectedFilters: SelectedNumberRangeFilter;
  onChange: (selectedFilters: SelectedNumberRangeFilter) => void;
  className?: string;
}

export interface SelectedNumberRangeFilter {
  min?: number;
  max?: number;
}

export const NumberRangeFilterComp = ({ filter, selectedFilters, onChange, className }: NumberRangeFilterCompProps) => {
  const [error, setError] = useState('');

  const isFilterValid = (filter: SelectedNumberRangeFilter): boolean => {
    if (filter.max && filter.min) {
      if (filter.max < filter.min) {
        setError('Max should be less than min');
        return false;
      }
    }

    return true;
  };

  return <div className={className}>
    <p className={styles.filterName}>{prettifyName(filter.path)}</p>

    <div className={styles.inputWrapper}>
      <TextInput
          label={'Min'}
          placeholder={'Min'}
          onChange={(event) => {
            setError('');
            const min = parseInt(event.target.value);
            const newSelectedFilter: SelectedNumberRangeFilter = {};

            if (!isNaN(min)) {
              newSelectedFilter.min = min;
            }

            if (Object.hasOwn(selectedFilters, 'max')) {
              newSelectedFilter.max = selectedFilters.max;
            }

            if (isFilterValid(newSelectedFilter)) {
              onChange(newSelectedFilter);
            }

            onChange(newSelectedFilter);
          }}
          type="number"
          value={selectedFilters.min === undefined ? '' : `${selectedFilters.min}`}
          className={styles.minInput}
      />

      <TextInput
          label={'Max'}
          placeholder={'Max'}
          onChange={(event) => {
            setError('');
            const max = parseInt(event.target.value);
            const newSelectedFilter: SelectedNumberRangeFilter = {};

            if (!isNaN(max)) {
              newSelectedFilter.max = max;
            }

            if (Object.hasOwn(selectedFilters, 'min')) {
              newSelectedFilter.min = selectedFilters.min;
            }

            if (isFilterValid(newSelectedFilter)) {
              onChange(newSelectedFilter);
            }
          }}
          type="number"
          value={selectedFilters.max === undefined ? '' : `${selectedFilters.max}`}
      />
    </div>
    {error && <p className={styles.errorMessage}>{error}</p>}
  </div>;
};
