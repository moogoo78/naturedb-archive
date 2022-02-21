import * as React from "react";

import {
  SimpleForm,
  Edit,
  TopToolbar,
  ListButton,
  TextInput,
  DateInput,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
} from 'react-admin';
//      <ListButton basePath={`/collection-specimens/${record.id}`} label="CollectionSpecimen"/>
const PageActions = ({ basePath, data }) => {
  console.log(basePath, data);
  return (
    <TopToolbar>

    </TopToolbar>
  );
}


const IdentificationEdit = props => (
  <Edit actions={<PageActions />} {...props}>
    <SimpleForm>
      <ReferenceInput source="taxon_id" reference="taxa" label="學名" allowEmpty fullWidth>
        <AutocompleteInput optionText="display_name"/>
      </ReferenceInput>
      <ReferenceInput source="identifier_id" reference="people" allowEmpty>
        <AutocompleteInput optionText="display_name"/>
      </ReferenceInput>
      <DateInput source="date" />
      <TextInput source="date_text" />
      <NumberInput source="sequence" label="鑑定次數"/>
    </SimpleForm>
  </Edit>
);
//      <NumberInput source="verification_level" />
export default IdentificationEdit;
