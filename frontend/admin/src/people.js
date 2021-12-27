import * as React from "react";
//import { List, Datagrid, TextField, EmailField } from 'react-admin';
import {
  List,
  Datagrid,
  TextField,
  BooleanField,
} from 'react-admin';

export const PersonList = props => (
  <List {...props}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="full_name" />
  <TextField source="other_name" />
  <BooleanField source="is_collector" />
  <BooleanField source="is_identifier" />
  </Datagrid>
  </List>
);
