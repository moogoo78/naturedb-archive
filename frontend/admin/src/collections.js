import * as React from "react";
//import { List, Datagrid, TextField, ReferenceField } from 'react-admin';
import {
  List,
  Create,
  Datagrid,
  TextField,
  ReferenceField,
  DateField,
  EditButton,
  Edit,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  TextInput,
} from 'react-admin';

/*
const collectionFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <ReferenceInput source="userId" label="User" reference="users" allowEmpty>
  <SelectInput optionText="name" />
  </ReferenceInput>,
];
*/

//<ReferenceField source="userId" reference="users">
//<TextField source="collect_date" />
//</ReferenceField>
//filters={collectionFilters}
export const CollectionList = props => (
  <List {...props}>
  <Datagrid rowClick="edit">
    <TextField source="id" />
    <TextField source="latest_scientific_name" />
    <TextField source="collector__full_name" />
    <TextField source="field_number" />
    <DateField source="collect_date" locales="zh-TW" />
  </Datagrid>
  </List>
);

export const CollectionEdit = props => (
  <Edit {...props}>
  <SimpleForm>
  <TextInput source="id" />
  <TextInput source="title" />
  <TextInput source="body" />
  </SimpleForm>
  </Edit>
);

export const CollectionCreate = props => (
  <Create {...props}>
  <SimpleForm>
  <ReferenceInput source="userId" reference="users">
  <SelectInput optionText="name" />
  </ReferenceInput>
  <TextInput source="title" />
  <TextInput multiline source="body" />
  </SimpleForm>
  </Create>
);
