import * as React from "react";

import {
  List,
  Datagrid,
  EditButton,
  BooleanInput,
  TextInput,
  TextField,
} from 'react-admin';

const listFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <BooleanInput source="is_identifier" />,
];

const ScientificNameList = props => (
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

export default ScientificNameList;
