import * as React from "react";

import {
  List,
  Datagrid,
  TextField,
} from 'react-admin';


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

export const AreaClassList = props => (
  <List {...props}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="name" />
  <TextField source="label" />
  </Datagrid>
  </List>
);
