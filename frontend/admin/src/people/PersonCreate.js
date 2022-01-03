import * as React from "react";

import {
  Create,
  SimpleForm,
  BooleanInput,
  TextInput,
} from 'react-admin';

const PersonCreate = props => (
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

export default PersonCreate;
