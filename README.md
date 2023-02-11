## ideas:
- autogenerate search index definition and query based on provided mongodb
  collection
- support autocomplete
- support recent searches
- add filter by category near search box
    - ![img.png](docs/img/search-box-category.png)

## implement for poc:
- provide some pre-configured pipeline examples
- explain to which cluster UI is connected now
- show error properly
    - in design time
    - in runtime
- search pipeline
    - add button to quickly transform search query to:
        - compound
        - facet
    - add button to add string/number facet query
- show document example in Design tab
    - sampled value

## limitations:
- does not support `$searchMeta` stage
    - but completely supports `facets` configured in `$search` stage

## deployment

build app
```shell
docker build -t hosted-search-ui .
```

run app locally
```shell
# won't work without ENV variables
docker run -p 8080:3000 hosted-search-ui
# open locally
http://localhost:8080
```
