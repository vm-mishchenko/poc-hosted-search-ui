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
import { DesignFilterComp } from './components/DesignFilterComp/DesignFilterComp';

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
    filters: filters.filter((filter) => filter.path.trim().length > 0),
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

  const onFilterChange = (newFilters: NumberRangeFilter[]) => {
    setFilters(newFilters);
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
        <Badge variant="lightgray">$$SEARCH_QUERY</Badge> variable represents user search query.
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
      <DesignFilterComp filters={filters} onChanged={onFilterChange} />
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
          autoComplete={'off'}
      />
    </ExpandableCard>

    <ExpandableCard
        title="Search Result Fields"
        description="Configure how search results will be rendered"
        className={styles.card}
        darkMode={true}
    >
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
          autoComplete={'off'}
          className={styles.input}
      />
      <TextInput
          label="Fields to render"
          description="List of documents field to render"
          placeholder="name1, name2, ..."
          autoComplete={'off'}
          onChange={event => {
            setUI({
              ...ui,
              docFieldNamesToRender: event.target.value ? event.target.value.split(', ') : [],
            });
          }}
          value={ui.docFieldNamesToRender?.join(', ')}
          className={styles.input}
      />
    </ExpandableCard>

    <ExpandableCard
        title="Search Result URL"
        description="Configure how search results will be rendered"
        className={styles.card}
        darkMode={true}
    >
      <Banner className={styles.searchPipelineTitle}>
        <Badge variant="lightgray">$$URL_FIELD_NAME</Badge> variable represents document field value, e.g.

        <p>https://www.google.com/search?q=$$URL_FIELD_NAME</p>
      </Banner>

      <TextInput
          label="URL template"
          description="URL template for a search results"
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
          autoComplete={'off'}
          className={styles.input}
      />
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
          autoComplete={'off'}
          className={styles.input}
      />
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
