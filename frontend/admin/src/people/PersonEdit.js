import * as React from "react";

import {
  Edit,
  SimpleForm,
  BooleanInput,
  TextInput,
} from 'react-admin';

const PersonEdit = props => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="full_name"/>
      <TextInput source="full_name_en" />
      <TextInput source="abbreviated_name" />
      <TextInput source="preferred_name" />
      <BooleanInput source="is_collector" />
      <BooleanInput source="is_identifier" />
    </SimpleForm>
  </Edit>
);

export default PersonEdit;
