import * as React from "react";

import {
  List,
  Datagrid,
  EditButton,
  BooleanInput,
  TextInput,
  TextField,
  SelectInput,
} from 'react-admin';

const RANK_CHOICES = [
  {id: 'family', name: 'Family'},
  {id: 'genus', name: 'Genus'},
  {id: 'species', name: 'Species'}
];
const listFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <SelectInput source="rank" label="Rank" choices={RANK_CHOICES} />,
  <BooleanInput source="is_identifier" />,
];

const TaxonList = props => (
  <List filters={listFilters} {...props}>
  <Datagrid>
  <TextField source="id" />
  <TextField source="rank" />
  <TextField source="full_scientific_name" />
  <TextField source="common_name" />
  <EditButton />
  </Datagrid>
  </List>
);

export default TaxonList;
