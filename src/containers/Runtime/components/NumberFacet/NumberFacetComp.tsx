import { MetaFacetResponse } from '../../../../pages/api/search';
import { NumberFacet } from '../../../../pipeline/pipeline-types';

export interface NumberFacetProps {
  facet: MetaFacetResponse;
  selectedRanges: Array<[number, number]>;
  onChange: (facetName: string, selectedBucketIds: Array<[number, number]>) => void;
}

const stringifyRange = (range: [number, number]): string => {
  return `${range[0]} - ${range[1]}`;
};

export const NumberFacetComp = ({ facet, selectedRanges, onChange }: NumberFacetProps) => {
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

  return <div>
    <h4>{facet.name}</h4>

    <form>
      <ul>
        {checkboxes.map((config) => {
          const title = `${config.minValue}-${config.maxValue}`;

          return <li key={title}>
            <label>
              {title} ({config.count})
              <input type="checkbox" checked={config.isChecked} disabled={config.count === 0} onChange={(event) => {
                handleCheck([config.minValue, config.maxValue], event.target.checked);
              }} />
            </label>
          </li>;
        })}
      </ul>
    </form>
  </div>;
};
