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
  <List filters={listFilters} {...props}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="collector__full_name" />
  <TextField source="field_number" />
  <TextField source="latest_scientific_name" />
  <DateField source="collect_date" locales="zh-TW" />
  </Datagrid>
  </List>
);

export default CollectionList;
