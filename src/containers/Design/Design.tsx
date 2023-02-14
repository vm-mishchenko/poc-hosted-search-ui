import React, {
  useEffect,
  useState,
} from 'react';
import {
  DesignDefinition,
  NumberRangeFilter,
  UIDesignDefinition,
} from '../../designDefinition/types/designDefinition';
import {
  buildDesignDefinition,
  validateDesignDefinition,
} from '../../designDefinition/utils';
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
import {
  Tab,
  Tabs,
} from '@leafygreen-ui/tabs';
import Code from '@leafygreen-ui/code';
import { DefinitionSelectComp } from './components/DefinitionSelectComp/DefinitionSelectComp';
import { BASIC_DESIGN_DEFINITION } from '../../designDefinition/examples/basic-design-definition';
import { FACET_DESIGN_DEFINITION } from '../../designDefinition/examples/facet-design-definition';
import { FILTER_AND_SORT_DESIGN_DEFINITION } from '../../designDefinition/examples/filter-and-sort-design-definition';
import { SEARCH_RESULT_UI_DESIGN_DEFINITION } from '../../designDefinition/examples/search-result-ui-design-definition';
import { ALL_DESIGN_DEFINITION } from '../../designDefinition/examples/all-design-definition';

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

const buildDesignDefinitionInternal = (pipeline: Document[], filters: NumberRangeFilter[], sort: Array<string>, ui: UIDesignDefinition): DesignDefinition => {
  const validFilters = filters.filter((filter) => filter.path.trim().length > 0);

  return buildDesignDefinition(
      pipeline,
      validFilters,
      sort,
      ui,
  );
};

enum DESIGN_DEFINITION_EXAMPLE {
  BASIC = 'BASIC',
  FACET = 'FACET',
  FILTER_AND_SORT = 'FILTER_AND_SORT',
  SEARCH_RESULT_UI = 'SEARCH_RESULT_UI',
  ALL = 'ALL',
}

const DESIGN_DEFINITION_EXAMPLE_MAP = new Map<DESIGN_DEFINITION_EXAMPLE, DesignDefinition>([
  [DESIGN_DEFINITION_EXAMPLE.BASIC, BASIC_DESIGN_DEFINITION],
  [DESIGN_DEFINITION_EXAMPLE.FACET, FACET_DESIGN_DEFINITION],
  [DESIGN_DEFINITION_EXAMPLE.FILTER_AND_SORT, FILTER_AND_SORT_DESIGN_DEFINITION],
  [DESIGN_DEFINITION_EXAMPLE.SEARCH_RESULT_UI, SEARCH_RESULT_UI_DESIGN_DEFINITION],
  [DESIGN_DEFINITION_EXAMPLE.ALL, ALL_DESIGN_DEFINITION],
]);

const DESIGN_DEFINITION_EXAMPLE_OPTIONS = [
  {
    title: 'Basic',
    value: DESIGN_DEFINITION_EXAMPLE.BASIC,
  },
  {
    title: 'URL',
    value: DESIGN_DEFINITION_EXAMPLE.SEARCH_RESULT_UI,
  },
  {
    title: 'Filter/Sort',
    value: DESIGN_DEFINITION_EXAMPLE.FILTER_AND_SORT,
  },
  {
    title: 'Facets',
    value: DESIGN_DEFINITION_EXAMPLE.FACET,
  },
  {
    title: 'All',
    value: DESIGN_DEFINITION_EXAMPLE.ALL,
  },
];

/**
 * Create and edit design definition.
 */
export const Design = ({ onChange, designDefinition }: DesignProps) => {
  const [error, setError] = useState('');
  const [ui, setUI] = useState<UIDesignDefinition>(designDefinition.ui);
  const [pipeline, setPipeline] = useState<Document[]>(designDefinition.pipeline);
  const [filters, setFilters] = useState<NumberRangeFilter[]>(designDefinition.filters);
  const [sort, setSort] = useState<Array<string>>(designDefinition.sort);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [selectedExamplePipeline, setSelectedExamplePipeline] = useState(DESIGN_DEFINITION_EXAMPLE_OPTIONS[0].value);

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
    const newDesignDefinition = buildDesignDefinitionInternal(pipeline, filters, sort, ui);
    const encodedDesignDefinition = encode(JSON.stringify(newDesignDefinition));
    window.open(`share?designDefinition=${encodedDesignDefinition}`, '_blank');
  };

  const definitionSelected = (pValue: string) => {
    const value = pValue as DESIGN_DEFINITION_EXAMPLE;

    setSelectedExamplePipeline(value);

    const designDefinition = DESIGN_DEFINITION_EXAMPLE_MAP.get(value) as DesignDefinition;
    setError('');
    setPipeline(designDefinition.pipeline);
    setFilters(designDefinition.filters);
    setSort(designDefinition.sort);
    setUI(designDefinition.ui);
  };

  useEffect(() => {
    const newDesignDefinition = buildDesignDefinitionInternal(pipeline, filters, sort, ui);
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
        Open Search UI
      </Button>
    </div>

    {/*@ts-ignore*/}
    <Tabs setSelected={setSelectedTabIndex} selected={selectedTabIndex} darkMode={true}>
      <Tab name="Configuration">
        <br />
        <DefinitionSelectComp options={DESIGN_DEFINITION_EXAMPLE_OPTIONS} onChange={definitionSelected}
                              selectedOptionValue={selectedExamplePipeline} />
        <br />

        <ExpandableCard
            title="Search pipeline"
            description="Configure aggregation pipeline that will return search results"
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
              description="List of field names"
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
            description="Configure document fields to render"
            className={styles.card}
            darkMode={true}
        >
          <TextInput
              label="Title"
              description="Field name that will serve as Search result title"
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
              description="List of field names to render"
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
            description="Configure Search result URL"
            className={styles.card}
            darkMode={true}
        >
          <Banner className={styles.searchPipelineTitle}>
            <Badge variant="lightgray">$$URL_FIELD_NAME</Badge> variable represents document field value.

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
      </Tab>
      <Tab name="Index Definition">
        <br />
        {/*@ts-ignore*/}
        <Code darkMode={true} language={'JSON'}>
          {JSON.stringify(indexDefinition, null, 2)}
        </Code>
      </Tab>
      <Tab name="About">
        <br />
        <Banner>
          App builds Search UI based on aggregation pipeline and additional metadata.

          <p></p>

          <p>
            As the POC, the app is restricted to work with the pre-configured "
            <a
                href="https://cloud.mongodb.com/v2/618c484956d6980855ec3229#/clusters/atlasSearch/vitalii-hosted-ui?collectionName=listingsAndReviews&database=sample_airbnb&indexName=facets&view=IndexOverview"
                target="_blank"
                rel="noreferrer">{designDefinition.searchIndex.name}</a>" Search index for <a
              href="https://cloud.mongodb.com/v2/618c484956d6980855ec3229#/metrics/replicaSet/63bf37e97b4e7c4baba524c9/explorer/sample_airbnb/listingsAndReviews/find"
              target="_blank"
              rel="noreferrer">{designDefinition.searchIndex.databaseName}.{designDefinition.searchIndex.collectionName}</a> collection.
          </p>

          <p>Additional functionality we could add:</p>
          <ul>
            <li>Autocomplete</li>
            <li>Custom search index</li>
            <li>New filter types (geo, exists, regex, etc.)</li>
            <li>Suggest filters based on a field type</li>
            <li>Highlight search terms</li>
            <li>and more</li>
          </ul>
        </Banner>
      </Tab>
    </Tabs>

    {error && <div>
      Error: {error}
    </div>}
  </div>;
};
