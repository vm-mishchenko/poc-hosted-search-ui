## ideas:
- autogenerate search index definition and query based on provided mongodb
  collection
- support autocomplete
- support recent searches
- filter across search results
- add filter by category near search box
    - ![img.png](docs/img/search-box-category.png)
- show document example in Design tab
    - sampled value

## implement for poc:
- none

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
