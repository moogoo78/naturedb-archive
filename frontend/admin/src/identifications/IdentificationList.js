import * as React from "react";

import {
  List,
  EditButton,
  Datagrid,
  TextField,
} from 'react-admin';

const IdentificationList = props => (
  <List {...props}>
  <Datagrid>
  <TextField source="id" />
  <TextField source="scientific_name.full_scientific_name" />
  <TextField source="identifier.display_name" />
  <TextField source="date" />
  <TextField source="verification_level" />
  <EditButton />
  </Datagrid>
  </List>
);

export default IdentificationList;
