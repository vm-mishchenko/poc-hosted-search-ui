import {
  FILTER_TYPE,
  NumberRangeFilter,
} from '../../../../designDefinition/types/designDefinition';
import {
  Option,
  Select,
} from '@leafygreen-ui/select';
import TextInput from '@leafygreen-ui/text-input';
import React from 'react';
import styles from './DesignFilterComp.module.css';
import Button from '@leafygreen-ui/button';
import IconButton from '@leafygreen-ui/icon-button';
import Icon from '@leafygreen-ui/icon';

export interface DesignFilterCompProps {
  filters: NumberRangeFilter[];
  onChanged: (newFilters: NumberRangeFilter[]) => void;
}

export const DesignFilterComp = ({ filters, onChanged }: DesignFilterCompProps) => {
  const addFilter = () => {
    const copy = [...filters];
    copy.push({
      type: FILTER_TYPE.NUMBER_RANGE,
      path: '',
    });
    onChanged(copy);
  };

  const removeFilter = (index: number) => {
    const copy = [...filters];
    copy.splice(index, 1);
    onChanged(copy);
  };

  const updatePath = (index: number, newPath: string) => {
    const copy = [...filters];
    copy[index] = {
      ...copy[index],
      path: newPath,
    };
    onChanged(copy);
  };

  return <div>
    {filters.length === 0 && <p>No filters</p>}

    {filters.length > 0 && <ul className={styles.list}>
      {filters.map((filter, index) => {
        return <li key={index} className={styles.listItem}>
          <Select
              label="Type"
              allowDeselect={false}
              defaultValue={FILTER_TYPE.NUMBER_RANGE}
              className={styles.select}
          >
            <Option value={FILTER_TYPE.NUMBER_RANGE}>Number: range</Option>
          </Select>

          <div className={styles.inputWrapper}>
            <TextInput
                label={'Path'}
                placeholder={'fieldNameA.fieldNameB'}
                onChange={(event) => {
                  updatePath(index, event.target.value);
                }}
                value={filter.path}
                autoComplete="off"
                className={styles.input}
            />

            <IconButton darkMode={true} aria-label="Remove" className={styles.removeBtn} onClick={() => {
              removeFilter(index);
            }}>
              <Icon glyph="XWithCircle" />
            </IconButton>
          </div>
        </li>;
      })}
    </ul>}

    <Button variant={'primaryOutline'} darkMode={true} onClick={addFilter}>
      Add filter
    </Button>
  </div>;
};