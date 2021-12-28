import * as React from "react";

import {
  List,
  Create,
  Edit,
  Datagrid,
  SimpleForm,
  BooleanField,
  TextField,
  ReferenceInput,
  BooleanInput,
  SelectInput,
  TextInput,
} from 'react-admin';

const peopleFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <BooleanInput source="is_collector" />,
  <BooleanInput source="is_identifier" />,
];

export const PeopleCreate = props => (
  <Create {...props}>
  <SimpleForm>
  <TextInput source="full_name"/>
  <TextInput source="full_name_en" />
  <TextInput source="abbreviated_name" />
  <TextInput source="preferred_name" />
  <BooleanInput source="is_collector" />
  <BooleanInput source="is_identifier" />
  </SimpleForm>
  </Create>
);

//<TextInput source="given_name" />
//<TextInput source="inherited_name" />
export const PeopleEdit = props => (
  <Edit {...props}>
  <SimpleForm>
  <TextInput source="full_name"/>
  <TextInput source="full_name_en" />
  <TextInput source="abbreviated_name" />
  <TextInput source="preferred_name" />
  <BooleanInput source="is_collector" />
  <BooleanInput source="is_identifier" />
  </SimpleForm>
  </Edit>
);

export const PeopleList = props => (
  <List filters={peopleFilters} {...props}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="full_name" />
  <TextField source="full_name_en" />
  <BooleanField source="is_collector" />
  <BooleanField source="is_identifier" />
  </Datagrid>
  </List>
);
