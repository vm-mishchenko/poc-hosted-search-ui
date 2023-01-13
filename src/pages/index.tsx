import React, { useState } from 'react';
import Head from 'next/head';
import { Runtime } from '../containers/Runtime/Runtime';
import styles from '../styles/Home.module.css';
import {
  DesignDefinition,
  getDefaultDesignDefinition,
} from '../designDefinition/types/designDefinition';
import { Design } from '../containers/Design/Design';

export default function Home () {
  const [designDefinition, setDesignDefinition] = useState<DesignDefinition>(getDefaultDesignDefinition);
  return <>
    <Head>
      <title>Hosted Search</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <main>
      <div className={styles.container}>
        <div className={styles.designContainer}>
          <Design onChange={setDesignDefinition} designDefinition={designDefinition} />
        </div>
        <div className={styles.runtimeContainer}>
          <Runtime designDefinition={designDefinition} />
        </div>
      </div>
    </main>
  </>;
}
