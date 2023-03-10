import React, { useState } from 'react';
import Head from 'next/head';
import { Runtime } from '../containers/Runtime/Runtime';
import styles from '../styles/Home.module.css';
import { DesignDefinition } from '../designDefinition/types/designDefinition';
import { Design } from '../containers/Design/Design';
import { BASIC_DESIGN_DEFINITION } from '../designDefinition/examples/basic-design-definition';

const Home = () => {
  const [designDefinition, setDesignDefinition] = useState<DesignDefinition>(BASIC_DESIGN_DEFINITION);
  return <>
    <Head>
      <title>Hosted Search</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <main>
      <div className={styles.container}>
        <div className={styles.designContainer}>
          <Design designDefinition={designDefinition} onChange={setDesignDefinition} />
        </div>
        <div className={styles.runtimeContainer}>
          <Runtime designDefinition={designDefinition} />
        </div>
      </div>
    </main>
  </>;
};

export default Home;