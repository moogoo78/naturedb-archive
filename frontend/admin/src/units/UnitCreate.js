import * as React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
} from 'react-admin';

const UnitCreate = props => (
  <Create {...props}>
  <SimpleForm>
  <TextInput source="accession_number" />
  </SimpleForm>
  </Create>
);

export default UnitCreate;
