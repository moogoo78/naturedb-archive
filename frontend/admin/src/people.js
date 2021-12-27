import * as React from "react";
//import { List, Datagrid, TextField, EmailField } from 'react-admin';
import {
  List,
  Create,
  Edit,
  Datagrid,
  SimpleForm,
  BooleanField,
  TextField,
  BooleanInput,
  SelectInput,
  TextInput,
} from 'react-admin';

export const PeopleCreate = props => (
  <Edit {...props}>
  <SimpleForm>
  <TextInput source="id" />
  <TextInput source="title" />
  <TextInput source="body" />
  </SimpleForm>
  </Edit>
);

//<TextInput source="given_name" />
//<TextInput source="inherited_name" />
export const PeopleEdit = props => (
  <Edit {...props}>
  <SimpleForm>
  <TextInput source="full_name"/>
  <TextInput source="english_full_name" />
  <TextInput source="abbreviated_name" />
  <TextInput source="preferred_name" />
  <BooleanInput source="is_collector" />
  <BooleanInput source="is_identifier" />
  </SimpleForm>
  </Edit>
);

export const PeopleList = props => (
  <List {...props}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="full_name" />
  <TextField source="english_full_name" />
  <BooleanField source="is_collector" />
  <BooleanField source="is_identifier" />
  </Datagrid>
  </List>
);
