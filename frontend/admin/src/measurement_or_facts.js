import * as React from "react";

import {
  List,
  Datagrid,
  TextField,
} from 'react-admin';


export const MeasurementOrFactList = props => (
  <List {...props}>
  <Datagrid>
  <TextField source="id" />
  </Datagrid>
  </List>
);
