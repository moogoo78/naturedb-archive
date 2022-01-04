import * as React from "react";

import {
  List,
  Datagrid,
  TextField,
  DateField,
  TextInput,
  ReferenceInput,
  SelectInput,
} from 'react-admin';

const listFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <ReferenceInput source="id" label="Collector" reference="people">
  <SelectInput optionText="name" />
  </ReferenceInput>,
];

const CollectionList = props => (
  <List filters={listFilters} {...props} sort={{field: 'collection.id', order: 'DESC'}}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="collector__full_name" sortBy="person.full_name" />
  <TextField source="field_number" />
  <TextField source="latest_scientific_name" sortable={false} />
  <DateField source="collect_date" locales="zh-TW" />
  </Datagrid>
  </List>
);

export default CollectionList;
