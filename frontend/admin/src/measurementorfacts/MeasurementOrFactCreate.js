import * as React from "react";

import {
  Create,
  SimpleForm,
  TextInput,
  //SelectInput,
} from 'react-admin';

//<SelectInput source="paremeter" choices={} />
const MeasurementOrFactCreate = props => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="collection_id" />
      <TextInput source="text"/>
    </SimpleForm>
  </Create>
);

export default MeasurementOrFactCreate;
