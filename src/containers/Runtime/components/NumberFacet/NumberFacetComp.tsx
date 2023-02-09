import { MetaFacetResponse } from '../../../../pages/api/search';
import { NumberFacet } from '../../../../pipeline/pipeline-types';
import { prettifyName } from '../../../../utils/string';
import styles from '../StringFacet/StringFacet.module.css';
import Checkbox from '@leafygreen-ui/checkbox';

export interface NumberFacetProps {
  facet: MetaFacetResponse;
  selectedRanges: Array<[number, number]>;
  onChange: (facetName: string, selectedBucketIds: Array<[number, number]>) => void;
  className?: string;
}

const stringifyRange = (range: [number, number]): string => {
  return `${range[0]} - ${range[1]}`;
};

export const NumberFacetComp = ({ facet, selectedRanges, onChange, className }: NumberFacetProps) => {
  const handleCheck = (range: [number, number], isChecked: boolean) => {
    let newSelectedRanges = [...selectedRanges];
    if (isChecked) {
      newSelectedRanges = [...newSelectedRanges, range];
    } else {
      newSelectedRanges = selectedRanges.filter((selectedRange) => {
        return stringifyRange(selectedRange) !== stringifyRange(range);
      });
    }

    onChange(facet.name, newSelectedRanges);
  };

  const facetConfig = facet.config as NumberFacet;
  let checkboxes: Array<{
    minValue: number;
    maxValue: number;
    count: number;
    isChecked: boolean;
  }> = [];
  let minIndex = 0;
  let maxIndex = 1;

  while (maxIndex <= facetConfig.boundaries.length - 1) {
    const minValue = facetConfig.boundaries[minIndex];
    const maxValue = facetConfig.boundaries[maxIndex];
    const count = facet.result.find((bucketResult) => {
      return bucketResult._id === minValue;
    })!.count;
    const isChecked = !!selectedRanges.find((selectedRange) => {
      return stringifyRange(selectedRange) === stringifyRange([minValue, maxValue]);
    });

    checkboxes.push({
      minValue,
      maxValue,
      count,
      isChecked,
    });

    minIndex++;
    maxIndex++;
  }

  return <div className={className}>
    <p className={styles.facetName}>{prettifyName(facet.name)}</p>

    <form>
      <ul className={styles.list}>
        {checkboxes.map((config) => {
          const title = `${config.minValue}-${config.maxValue}`;

          return <li key={title} className={styles.listItem}>
            <label className={styles.labelWrapper}>
              <Checkbox
                  onChange={(event) => {
                    handleCheck([config.minValue, config.maxValue], event.target.checked);
                  }}
                  label=""
                  checked={config.isChecked}
                  disabled={config.count === 0}
                  bold={false}
              />

              <div className={styles.labelName}>
                <span>{title}</span>
                <span className={styles.facetCount}>{config.count}</span>
              </div>
            </label>
          </li>;
        })}
      </ul>
    </form>
  </div>;
};
