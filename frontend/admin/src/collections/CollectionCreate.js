import * as React from "react";

import {
  Datagrid,
  TextField,
  ReferenceField,
  DateField,
  CreateButton,
  Create,
  SimpleForm,
  ReferenceInput,
  TextInput,
  DateInput,
  AutocompleteInput,
  FormGroupContextProvider,
  useFormGroup,
  /*FormWithRedirect,*/
  ReferenceManyField,
  ChipField,
  SingleFieldList,
  ArrayField,
  FunctionField,
  TopToolbar,
  ListButton,
  TabbedForm,
  FormTab,
  useRecordContext,
  ReferenceArrayField
} from 'react-admin';

//<ShowButton basePath={basePath} record={data} />
const PageActions = ({ basePath, data }) => (
  <TopToolbar>
  <ListButton basePath={basePath} label="列表"  />
  </TopToolbar>
);

const PageTitle = ({ record }) => {
    return <span>Post {record ? `"${record.id}"` : ''}</span>;
};

const CollectionCreate = props => (
  <Create title={<PageTitle />} actions={<PageActions />} {...props}>
  <TabbedForm>
  <FormTab label="gathering">
  <TextInput disabled label="ID" source="id" />
  <ReferenceInput source="collector_id" reference="people" allowEmpty>
  <AutocompleteInput optionText="full_name"/>
  </ReferenceInput>
  <TextInput source="field_number" />
  <DateInput source="collect_date" />
  <ArrayField source="units" fieldKey="id">
  <Datagrid>
  <TextField source="id" />
  <TextField source="accession_number" />
  <ArrayField source="mof_list">
  <Datagrid>
  <TextField source="parameter" />
  <TextField source="text" />
  </Datagrid>
  </ArrayField>
  </Datagrid>
  </ArrayField>
  <ArrayField source="mof_list">
  <Datagrid>
  <TextField source="parameter" />
  <TextField source="text" />
  </Datagrid>
  </ArrayField>
  </FormTab>
  <FormTab label="locality">
  <TextInput source="longitude" />
  <TextInput source="latitude" />
  <TextInput source="altitude" label="alt" />
  <TextInput source="altitude2" label="alt2" />
  <ReferenceInput source="named_area_country_id" reference="named_areas" allowEmpty filter={{area_class_id: 1}}>
  <AutocompleteInput optionText="name_mix"/>
  </ReferenceInput>
  <ReferenceInput source="named_area_province_id" reference="named_areas" allowEmpty filter={{area_class_id: 2}}>
  <AutocompleteInput optionText="name_mix"/>
  </ReferenceInput>
  <ReferenceInput source="named_area_hsien_id" reference="named_areas" allowEmpty filter={{area_class_id: 3}}>
  <AutocompleteInput optionText="name_mix"/>
  </ReferenceInput>
  <ReferenceInput source="named_area_town_id" reference="named_areas" allowEmpty filter={{area_class_id: 4}}>
  <AutocompleteInput optionText="name_mix"/>
  </ReferenceInput>
  <ReferenceInput source="named_area_park_id" reference="named_areas" allowEmpty filter={{area_class_id: 5}}>
  <AutocompleteInput optionText="name_mix"/>
  </ReferenceInput>
  <ReferenceInput source="named_area_locality_id" reference="named_areas" allowEmpty filter={{area_class_id: 6}}>
  <AutocompleteInput optionText="name_mix"/>
  </ReferenceInput>
  <TextInput source="locality_text" />
  </FormTab>
  <FormTab label="Identification">
  <ArrayField source="identifications">
  <Datagrid>
  <TextField source="id" />
  <TextField source="scientific_name.full_scientific_name" fullWidth />
  <TextField source="identifier.full_name" />
  <DateField source="date" />
  <TextField source="date_text" />
  <TextField source="verification_level" />
  </Datagrid>
  </ArrayField>
  </FormTab>
  </TabbedForm>
  </Create>
);

export default CollectionCreate;
