import React, {
  useEffect,
  useState,
} from 'react';
import { DesignDefinition } from '../designDefinition/types/designDefinition';
import { Runtime } from '../containers/Runtime/Runtime';
import { decode } from '../utils/base64';
import Head from 'next/head';
import styles from '../styles/Share.module.css';

const DESIGN_DEFINITION_URL_QUERY_NAME = 'designDefinition';

const Share = () => {
  const [designDefinition, setDesignDefinition] = useState<DesignDefinition | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === "undefined") {
      /* we're on the server */
      return;
    }

    /* we're on the client */
    const urlSearchParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlSearchParams.entries());

    try {
      const decodedDesignDefinition = decode(params[DESIGN_DEFINITION_URL_QUERY_NAME]);
      const designDefinitionFromUrl = JSON.parse(decodedDesignDefinition) as DesignDefinition;
      setDesignDefinition(designDefinitionFromUrl);
    } catch (e) {
      setError('Invalid URL');
    }
  }, []);

  if (error) {
    return error;
  }

  if (!designDefinition) {
    return null;
  }

  return <>
    <Head>
      <title>Search UI</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <main>
      <div className={styles.wrapper}>
        <Runtime designDefinition={designDefinition} />
      </div>
    </main>
  </>;
};

export default Share;
