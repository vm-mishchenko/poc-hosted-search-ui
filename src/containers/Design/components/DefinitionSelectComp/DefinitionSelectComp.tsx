import styles from './DefinitionSelectComp.module.css';
import React from 'react';
import {
  SegmentedControl,
  SegmentedControlOption,
} from '@leafygreen-ui/segmented-control';


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
    <SegmentedControl
        name="Try"
        label="Try config"
        darkMode={true}
        value={selectedOptionValue}
        onChange={onChange}
    >
      {options.map((option) => {
        return <SegmentedControlOption key={option.title} value={option.value}>{option.title}</SegmentedControlOption>;
      })}
    </SegmentedControl>;
  </div>;
};