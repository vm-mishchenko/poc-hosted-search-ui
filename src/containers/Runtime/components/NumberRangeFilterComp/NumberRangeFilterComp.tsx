import { NumberRangeFilter } from '../../../../designDefinition/types/designDefinition';

export interface NumberRangeFilterCompProps {
  filter: NumberRangeFilter;
  selectedFilters: SelectedNumberRangeFilter;
  onChange: (selectedFilters: SelectedNumberRangeFilter) => void;
}

export interface SelectedNumberRangeFilter {
  min?: number;
  max?: number;
}

export const NumberRangeFilterComp = ({ filter, selectedFilters, onChange }: NumberRangeFilterCompProps) => {
  return <div>
    <h4>{filter.path}</h4>

    <p>
      <label>
        Min
        <input type="number" value={selectedFilters.min === undefined ? '' : selectedFilters.min} onChange={(event) => {
          const min = parseInt(event.target.value);
          const newSelectedFilter: SelectedNumberRangeFilter = {};

          if (!isNaN(min)) {
            newSelectedFilter.min = min;
          }

          if (Object.hasOwn(selectedFilters, 'max')) {
            newSelectedFilter.max = selectedFilters.max;
          }
          onChange(newSelectedFilter);
        }} />
      </label>
    </p>

    <p>
      <label>
        Max
        <input type="number" value={selectedFilters.max === undefined ? '' : selectedFilters.max} onChange={(event) => {
          const max = parseInt(event.target.value);
          const newSelectedFilter: SelectedNumberRangeFilter = {};

          if (!isNaN(max)) {
            newSelectedFilter.max = max;
          }

          if (Object.hasOwn(selectedFilters, 'min')) {
            newSelectedFilter.min = selectedFilters.min;
          }
          onChange(newSelectedFilter);
        }} />
      </label>
    </p>
  </div>;
};
