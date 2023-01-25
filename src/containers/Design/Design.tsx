import React, { useState } from 'react';
import { DesignDefinition } from '../../designDefinition/types/designDefinition';
import styles from './Design.module.css';
import { validateDesignDefinition } from '../../designDefinition/utils';

export interface DesignProps {
  designDefinition: DesignDefinition;
  onChange: (newDesignDefinition: DesignDefinition) => void;
}

/**
 * Create and edit design definition.
 */
export const Design = ({ designDefinition, onChange }: DesignProps) => {
  const [error, setError] = useState('');

  const onDesignDefinitionChanged = (newDesignDefinitionAsString: string) => {
    setError('');
    try {
      const newDesignDefinition = JSON.parse(newDesignDefinitionAsString);
      const error = validateDesignDefinition(newDesignDefinition);

      if (error) {
        setError(error);
        return;
      }

      onChange(newDesignDefinition);
    } catch (e) {
      setError('Cannot parse Design Definition');
    }
  };

  return <div>
    <h2>Design time</h2>

    <p>Design definition:</p>
    <textarea defaultValue={JSON.stringify(designDefinition, null, 2)}
              onChange={(event) => {
                onDesignDefinitionChanged(event.target.value);
              }}
              className={styles.textarea}
    >
    </textarea>

    {error && <div>
      Error: {error}
    </div>}
  </div>;
};
