import * as React from "react";

import {
  SimpleForm,
  Edit,
  TextInput,
  DateInput,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
} from 'react-admin';

const IdentificationEdit = props => (
  <Edit {...props}>
    <SimpleForm>
      <ReferenceInput source="scientific_name_id" reference="scientific_names" allowEmpty fullWidth>
        <AutocompleteInput optionText="display_name"/>
      </ReferenceInput>
      <ReferenceInput source="identifier_id" reference="people" allowEmpty>
        <AutocompleteInput optionText="display_name"/>
      </ReferenceInput>
    <DateInput source="date" />
    <TextInput source="date_text" />
    <NumberInput source="verification_level" />
  </SimpleForm>
  </Edit>
);

export default IdentificationEdit;
