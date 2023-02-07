ideas:
- autogenerate search index definition and query based on provided mongodb
  collection

implement:
- show document example in Design tab
    - sampled value
- [functional] support autocomplete
- [functional] support sorting
- [functional] support filters based on operators:
    - exists
    - range
        - number
        - dates
- search pipeline
    - add button to quickly transform search query to:
        - compound
        - facet
    - add button to add string/number facet query
- add design for search results

limitations:
- does not support `$searchMeta` stage
    - but completely supports `facets` configured in `$search` stage
