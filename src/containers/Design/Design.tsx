import React, {
  useEffect,
  useState,
} from 'react';
import {
  DesignDefinition,
  NumberRangeFilter,
  UIDesignDefinition,
} from '../../designDefinition/types/designDefinition';
import { validateDesignDefinition } from '../../designDefinition/utils';
import ExpandableCard from '@leafygreen-ui/expandable-card';
import Editor from '@monaco-editor/react';
import { Document } from 'mongodb';
import Banner from '@leafygreen-ui/banner';
import Badge from '@leafygreen-ui/badge';
import styles from './Design.module.css';
import TextInput from '@leafygreen-ui/text-input';
import Button from '@leafygreen-ui/button';
import { encode } from '../../utils/base64';

export interface DesignProps {
  designDefinition: DesignDefinition;
  onChange: (newDesignDefinition: DesignDefinition) => void;
}

const indexDefinition = {
  "mappings": {
    "dynamic": true,
    "fields": {
      "accommodates": [
        {
          "type": "numberFacet",
        },
        {
          "type": "number",
        },
      ],
      "bed_type": [
        {
          "analyzer": "lucene.keyword",
          "searchAnalyzer": "lucene.keyword",
          "type": "string",
        },
        {
          "type": "stringFacet",
        },
      ],
    },
  },
};

const buildDesignDefinition = (pipeline: Document[], filters: NumberRangeFilter[], sort: Array<string>, ui: UIDesignDefinition): DesignDefinition => {
  return {
    "searchIndex": {
      "name": "facets",
      "databaseName": "sample_airbnb",
      "collectionName": "listingsAndReviews",
    },
    pipeline,
    filters,
    sort,
    ui,
  };
};

/**
 * Create and edit design definition.
 */
export const Design = ({ onChange, designDefinition }: DesignProps) => {
  const [error, setError] = useState('');
  const [ui, setUI] = useState<UIDesignDefinition>(designDefinition.ui);
  const [pipeline, setPipeline] = useState<Document[]>(designDefinition.pipeline);
  const [filters, setFilters] = useState<NumberRangeFilter[]>(designDefinition.filters);
  const [sort, setSort] = useState<Array<string>>(designDefinition.sort);

  const onPipelineChange = (newPipelineAsString: string = "{}") => {
    setError('');

    try {
      const newPipeline = JSON.parse(newPipelineAsString);
      setPipeline(newPipeline);
    } catch (e) {
      setError('Cannot parse Aggregation pipeline.');
    }
  };

  const onFilterChange = (filtersAsString: string = "{}") => {
    setError('');

    try {
      const filters = JSON.parse(filtersAsString);
      setFilters(filters);
    } catch (e) {
      setError('Cannot parse Aggregation pipeline.');
    }
  };

  const openRuntime = () => {
    const newDesignDefinition = buildDesignDefinition(pipeline, filters, sort, ui);
    const encodedDesignDefinition = encode(JSON.stringify(newDesignDefinition));
    window.open(`share?designDefinition=${encodedDesignDefinition}`, '_blank');
  };

  useEffect(() => {
    const newDesignDefinition = buildDesignDefinition(pipeline, filters, sort, ui);
    const error = validateDesignDefinition(newDesignDefinition);

    if (error) {
      setError(error);
      return;
    }

    onChange(newDesignDefinition);
  }, [pipeline, ui, filters, sort]);

  return <div className={styles.wrapper}>
    <div className={styles.header}>
      <h2 className={styles.title}>Design search interface</h2>
      <Button variant={'primary'} darkMode={true} onClick={openRuntime} disabled={error.length > 0}>
        Open Search
      </Button>
    </div>

    <ExpandableCard
        title="Search pipeline"
        description="Should return search result documents. Can have any stages."
        className={styles.card}
        darkMode={true}
    >
      <Banner className={styles.searchPipelineTitle}>
        <Badge variant="lightgray">$$SEARCH_QUERY</Badge> variable will be replaced with the user search query in
        Runtime.
      </Banner>

      <Editor
          height="500px"
          width={"99%"}
          defaultLanguage="json"
          onChange={onPipelineChange}
          theme={'vs-dark'}
          value={JSON.stringify(pipeline, null, 2)}
      />
      {error && <Banner variant="danger">{error}</Banner>}
    </ExpandableCard>

    <ExpandableCard
        title="Filters"
        description="Configure search filters"
        className={styles.card}
        darkMode={true}
    >
      <Editor
          height="300px"
          width={"99%"}
          defaultLanguage="json"
          onChange={onFilterChange}
          theme={'vs-dark'}
          value={JSON.stringify(filters, null, 2)}
      />
    </ExpandableCard>

    <ExpandableCard
        title="Sort"
        description="Configure sort fields"
        className={styles.card}
        darkMode={true}
    >
      <TextInput
          label="Sort fields"
          description="List of document fields to sort on"
          placeholder="name1, name2, ..."
          onChange={event => {
            setSort(event.target.value ? event.target.value.split(', ') : []);
          }}
          value={sort?.join(', ')}
      />
    </ExpandableCard>

    <ExpandableCard
        title="Search Result UI"
        description="Configure how search results will be rendered"
        className={styles.card}
        darkMode={true}
    >
      <h3>Fields</h3>
      <TextInput
          label="Title field name"
          description="Document field name that will serve as Search result title"
          placeholder="Document field name"
          onChange={event => {
            setUI({
              ...ui,
              docTitleFieldName: event.target.value,
            });
          }}
          value={ui.docTitleFieldName}
      />
      <p>
        <TextInput
            label="Fields to render"
            description="List of documents field to render"
            placeholder="name1, name2, ..."
            onChange={event => {
              setUI({
                ...ui,
                docFieldNamesToRender: event.target.value ? event.target.value.split(', ') : [],
              });
            }}
            value={ui.docFieldNamesToRender?.join(', ')}
        />
      </p>

      <h3>URL</h3>
      <p>
        Use <Badge variant="lightgray">$$URL_FIELD_NAME</Badge> variable as a placeholder that will be replaced with the
        document field value in Runtime.
      </p>

      <p>
        <TextInput
            label="URL template"
            description="URL template for a search results, e.g. https://www.google.com/search?q=$$URL_FIELD_NAME"
            placeholder="https://www.google.com/searchq=$$URL_FIELD_NAME"
            onChange={event => {
              setUI({
                ...ui,
                url: {
                  ...ui.url,
                  template: event.target.value,
                },
              });
            }}
            value={ui.url?.template}
        />
      </p>
      <p>
        <TextInput
            label="Field name for $$URL_FIELD_NAME"
            description="Specify document field name that replace $$URL_FIELD_NAME in Runtime"
            placeholder="Field name"
            onChange={event => {
              setUI({
                ...ui,
                url: {
                  ...ui.url!,
                  docFieldName: event.target.value,
                },
              });
            }}
            value={ui.url?.docFieldName}
        />
      </p>
    </ExpandableCard>

    <ExpandableCard
        title="Index Definition"
        description="Configure how search results will be rendered"
        className={styles.card}
        darkMode={true}
    >
      <pre>
          {JSON.stringify(indexDefinition, null, 2)}
        </pre>
    </ExpandableCard>

    <ExpandableCard
        title="Design definition"
        description="Resulted Design Definition"
        className={styles.card}
        darkMode={true}
    >
      <Editor
          height="500px"
          width={"99%"}
          defaultLanguage="json"
          theme={'vs-dark'}
          value={JSON.stringify(designDefinition, null, 2)}
      />
    </ExpandableCard>

    {error && <div>
      Error: {error}
    </div>}
  </div>;
};
