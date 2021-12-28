import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  Toolbar,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


import {
  List,
  Create,
  Datagrid,
  TextField,
  ReferenceField,
  DateField,
  EditButton,
  Edit,
  SimpleForm,
  ReferenceInput,
  SelectInput,
  TextInput,
  DateInput,
  AutocompleteInput,
  FormGroupContextProvider,
  useFormGroup,
  SelectArrayInput,
  NullableBooleanInput,
  DeleteButton,
  SaveButton,
  FormWithRedirect,
} from 'react-admin';


const collectionFilters = [
  <TextInput source="q" label="Search" alwaysOn />,
  <ReferenceInput source="id" label="Collector" reference="people">
  <SelectInput optionText="name" />
  </ReferenceInput>,
   ];

//<ReferenceField source="collector_id" reference="people">
//<TextField source="full_name" />
//</ReferenceField>cd
export const CollectionList = props => (
  <List filters={collectionFilters} {...props}>
  <Datagrid rowClick="edit">
  <TextField source="id" />
  <TextField source="collector__full_name" />
  <TextField source="field_number" />
  <TextField source="latest_scientific_name" />
  <DateField source="collect_date" locales="zh-TW" />
  </Datagrid>
  </List>
);

const AccordionSectionTitle = ({ children, name }) => {
    const formGroupState = useFormGroup(name);

    return (
        <Typography color={formGroupState.invalid && formGroupState.dirty ? 'error' : 'inherit'}>
            {children}
        </Typography>
    );
}

const segments = [
  { id: 'compulsive', name: 'Compulsive' },
  { id: 'collector', name: 'Collector' },
  { id: 'ordered_once', name: 'Ordered Once' },
  { id: 'regular', name: 'Regular' },
  { id: 'returns', name: 'Returns' },
  { id: 'reviewer', name: 'Reviewer' },
];

const MyGatheringGeo = () => (
  <Box display="flex">
  <Box flex={3} mr="0.5em">
  <TextInput source="geospatial.longitude" fullWidth />
  </Box>
  <Box flex={3} mr="0.5em" ml="0.5em">
  <TextInput source="geospatial.latitude" fullWidth />
  </Box>
  <Box flex={1} mr="0.5em" ml="0.5em">
  <TextInput source="geospatial.altitude.0" label="alt" fullWidth />
  </Box>
  <Box flex={1} ml="0.5em">
  <TextInput source="geospatial.altitude.1" label="alt2" fullWidth />
  </Box>
  </Box>
)
;
const MyGathering = () => (
  <Box display="flex">
  <Box flex={2} mr="1em">
  <Typography variant="h6" gutterBottom>Gathering</Typography>
  <Box display="flex">
  <Box flex={1} mr="0.5em">
  <ReferenceInput source="collector_id" reference="people" allowEmpty fullWidth>
  <AutocompleteInput optionText="full_name"/>
  </ReferenceInput>
  </Box>
  <Box flex={1} mr="0.5em" ml="0.5em">
  <TextInput source="field_number" fullWidth />
  </Box>
  <Box flex={1} ml="0.5em">
  <DateInput source="collect_date" fullWidth />
  </Box>
  </Box>
  <MyGatheringGeo />
  </Box>
  </Box>
);

export const CollectionEdit = props => (
  <Edit title="Collection::Edit" {...props}>
  <FormWithRedirect
  {...props}
  render={formProps => (
    <form>
    <Box p="1em">
    <MyGathering />
    </Box>
    <Toolbar>
    <Box display="flex" justifyContent="space-between" width="100%">
    <SaveButton
    saving={formProps.saving}
    handleSubmitWithRedirect={formProps.handleSubmitWithRedirect}
    />
    <DeleteButton record={formProps.record} />
    </Box>
    </Toolbar>
    </form>
  )}
  />
  </Edit>
);
/*
   <SimpleForm>
   <ReferenceInput source="collector_id" reference="people" allowEmpty>
   <AutocompleteInput optionText="full_name"/>
   </ReferenceInput>
   <TextInput source="field_number" />
   <DateInput source="collect_date" />
   </SimpleForm>

 */

/*
   <FormGroupContextProvider name="options">
   <Accordion>
   <AccordionSummary
   expandIcon={<ExpandMoreIcon />}
   aria-controls="options-content"
   id="options-header"
   >
   <AccordionSectionTitle name="options">GeoSpatial</AccordionSectionTitle>
   </AccordionSummary>
   <AccordionDetails id="options-content" aria-labelledby="options-header">
   <TextInput source="geospatial.longitude" />
   <TextInput source="geospatial.latitude" />
   </AccordionDetails>
   </Accordion>
   </FormGroupContextProvider>
 */

export const CollectionCreate = props => (
  <Create {...props}>
  <SimpleForm>
  <ReferenceInput source="userId" reference="users">
  <SelectInput optionText="name" />
  </ReferenceInput>
  <TextInput source="title" />
  <TextInput multiline source="body" />
  </SimpleForm>
  </Create>
);
