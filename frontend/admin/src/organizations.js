import * as React from "react";

import {
  List,
  Datagrid,
  TextField,
} from 'react-admin';


export const OrganizationList = props => (
  <List {...props}>
  <Datagrid>
  <TextField source="id" />
  <TextField source="name" />
  <TextField source="abbreviation" />
  </Datagrid>
  </List>
);
