ideas:
- autogenerate search index definition and query based on provided mongodb
  collection
- support autocomplete
- support recent searches
- add filter by category near search box
    - ![img.png](docs/img/search-box-category.png)

implement for poc:
- add design for search results
- search pipeline
    - add button to quickly transform search query to:
        - compound
        - facet
    - add button to add string/number facet query
- show document example in Design tab
    - sampled value

limitations:
- does not support `$searchMeta` stage
    - but completely supports `facets` configured in `$search` stage
