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

const listFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <ReferenceInput source="area_class_id" label="AreaClass" reference="area_classes">
  <SelectInput optionText="label" />
  </ReferenceInput>,
];

/* export const PeopleCreate = props => (
 *   <Create {...props}>
 *   <SimpleForm>
 *   <TextInput source="full_name"/>
 *   <TextInput source="full_name_en" />
 *   <TextInput source="abbreviated_name" />
 *   <TextInput source="preferred_name" />
 *   <BooleanInput source="is_collector" />
 *   <BooleanInput source="is_identifier" />
 *   </SimpleForm>
 *   </Create>
 * );
 * 
 * //<TextInput source="given_name" />
 * //<TextInput source="inherited_name" />
 * export const PeopleEdit = props => (
 *   <Edit {...props}>
 *   <SimpleForm>
 *   <TextInput source="full_name"/>
 *   <TextInput source="full_name_en" />
 *   <TextInput source="abbreviated_name" />
 *   <TextInput source="preferred_name" />
 *   <BooleanInput source="is_collector" />
 *   <BooleanInput source="is_identifier" />
 *   </SimpleForm>
 *   </Edit>
 * ); */

export const NamedAreaList = props => (
  <List filters={listFilters} {...props}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="name" />
  <TextField source="name_en" />
  <TextField source="area_class.label" />
  </Datagrid>
  </List>
);
