import * as React from "react";

import {
  List,
  Datagrid,
  TextField,
} from 'react-admin';


export const DatasetList = props => (
  <List {...props}>
  <Datagrid>
  <TextField source="id" />
  <TextField source="name" />
  <TextField source="oraganization.name" />
  </Datagrid>
  </List>
);
