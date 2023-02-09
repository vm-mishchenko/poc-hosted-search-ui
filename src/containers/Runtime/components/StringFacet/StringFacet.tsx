import { MetaFacetResponse } from '../../../../pages/api/search';
import { prettifyName } from '../../../../utils/string';
import Checkbox from '@leafygreen-ui/checkbox';
import styles from './StringFacet.module.css';

export interface StringFacetProps {
  facet: MetaFacetResponse;
  selectedBucketIds: string[];
  onChange: (facetName: string, selectedBucketIds: string[]) => void;
  className?: string;
}

export const StringFacet = ({ facet, selectedBucketIds, onChange, className }: StringFacetProps) => {
  const handleCheck = (bucketId: string, isChecked: boolean) => {
    let newSelectedBucketIds = [...selectedBucketIds];
    if (isChecked) {
      newSelectedBucketIds = [...newSelectedBucketIds, bucketId];
    } else {
      newSelectedBucketIds.splice(selectedBucketIds.indexOf(bucketId), 1);
    }

    onChange(facet.name, newSelectedBucketIds);
  };

  return <div className={className}>
    <p className={styles.facetName}>{prettifyName(facet.name)}</p>

    <form>
      <ul className={styles.list}>
        {facet.result.map((facetBucket) => {
          const checked = selectedBucketIds.includes(`${facetBucket._id}`);

          return <li key={facetBucket._id} className={styles.listItem}>
            <label className={styles.labelWrapper}>
              <Checkbox
                  onChange={(event) => {
                    handleCheck(`${facetBucket._id}`, event.target.checked);
                  }}
                  label=""
                  checked={checked}
                  bold={false}
              />
              <div className={styles.labelName}>
                <span>{facetBucket._id}</span>
                <span className={styles.facetCount}>{facetBucket.count}</span>
              </div>
            </label>
          </li>;
        })}
      </ul>
    </form>
  </div>;
};
