import * as React from "react";

import {
  List,
  Datagrid,
  BooleanField,
  BooleanInput,
  TextInput,
  TextField,
} from 'react-admin';

const listFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <BooleanInput source="is_collector" />,
  <BooleanInput source="is_identifier" />,
];

const PersonList = props => (
  <List filters={listFilters} {...props}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="full_name" />
  <TextField source="full_name_en" />
  <BooleanField source="is_collector" />
  <BooleanField source="is_identifier" />
  </Datagrid>
  </List>
);

export default PersonList;
