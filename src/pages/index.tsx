import React from 'react';
import Head from 'next/head';
import { Design } from '../containers/Design/design';
import { Runtime } from '../containers/Runtime/Runtime';
import styles from '../styles/Home.module.css';

export default function Home () {
  return <>
    <Head>
      <title>Hosted Search</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <main>
      <div className={styles.container}>
        <div className={styles.designContainer}><Design /></div>
        <div className={styles.runtimeContainer}><Runtime /></div>
      </div>
    </main>
  </>;
}
