import styles from './ResultNumberComp.module.css';

export interface ResultsCountCompProps {
  resultsCount: number;
}

export const ResultsCountComp = ({ resultsCount }: ResultsCountCompProps) => {
  if (resultsCount < 2) {
    return <p className={styles.wrapper}>
      Showing <strong>{resultsCount}</strong> result
    </p>;
  }

  return <p className={styles.wrapper}>
    Showing <strong>{resultsCount}</strong> results
  </p>;
};
