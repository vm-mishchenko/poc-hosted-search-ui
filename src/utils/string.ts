// nameFacet -> Name Facet
// name_facet.fooBar -> Name Facet: Foo Bar
export const prettifyName = (name: string): string => {
  const fields = name.replace(new RegExp('_', 'g'), ' ').replace(new RegExp('\\.', 'g'), ': ').split(/(?=[A-Z])/);
  return fields.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};
