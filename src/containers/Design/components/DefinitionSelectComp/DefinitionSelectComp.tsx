import {
  Option,
  Select,
} from '@leafygreen-ui/select';
import styles from './DefinitionSelectComp.module.css';
import React from 'react';


export interface DefinitionSelectCompProps {
  options: DefinitionSelectOption[];
  onChange: (selectedValue: string) => void;
  selectedOptionValue: string;
}

export interface DefinitionSelectOption {
  title: string;
  value: string;
}

export const DefinitionSelectComp = ({ options, onChange, selectedOptionValue }: DefinitionSelectCompProps) => {
  return <div className={styles.wrapper}>
    <label id="design-try-definition" className={styles.label}>
      Try sample configurations:
    </label>
    <Select
        label=""
        aria-labelledby="design-try-definition"
        className={styles.select}
        allowDeselect={false}
        darkMode={true}
        onChange={onChange}
        value={selectedOptionValue}
    >
      {options.map((option) => {
        return <Option key={option.title} value={option.value}>{option.title}</Option>;
      })}
    </Select>
  </div>;
};