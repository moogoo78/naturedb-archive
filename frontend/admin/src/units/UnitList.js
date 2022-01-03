import * as React from "react";

import {
  List,
  Datagrid,
  TextField,
  TextInput,
  ReferenceInput,
  SelectInput,
} from 'react-admin';

const listFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <ReferenceInput source="area_class_id" label="AreaClass" reference="area_classes">
  <SelectInput optionText="label" />
  </ReferenceInput>,
];

const UnitList = props => (
  <List filters={listFilters} {...props}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="accession_number" />
  </Datagrid>
  </List>
);

export default UnitList;
