import { MetaFacetResponse } from '../../../../pages/api/search';

export interface FacetProps {
  facet: MetaFacetResponse;
  selectedBucketIds: string[];
  onChange: (facetName: string, selectedBucketIds: string[]) => void;
}

export const Facet = ({ facet, selectedBucketIds, onChange }: FacetProps) => {
  const handleCheck = (bucketId: string, isChecked: boolean) => {
    let newSelectedBucketIds = [...selectedBucketIds];
    if (isChecked) {
      newSelectedBucketIds = [...newSelectedBucketIds, bucketId];
    } else {
      newSelectedBucketIds.splice(selectedBucketIds.indexOf(bucketId), 1);
    }

    onChange(facet.name, newSelectedBucketIds);
  };

  return <div>
    <h4>{facet.name}</h4>

    <form>
      <ul>
        {facet.result.map((facetBucket) => {
          const checked = selectedBucketIds.includes(`${facetBucket._id}`);

          return <li key={facetBucket._id}>
            <label>
              {facetBucket._id} ({facetBucket.count})
              <input type="checkbox" checked={checked} onChange={(event) => {
                handleCheck(`${facetBucket._id}`, event.target.checked);
              }} />
            </label>
          </li>;
        })}
      </ul>
    </form>
  </div>;
};
