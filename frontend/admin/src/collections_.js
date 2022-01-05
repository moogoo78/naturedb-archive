import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  Toolbar,
  Paper,
} from '@material-ui/core';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
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
  ReferenceManyField,
  ChipField,
  SingleFieldList,
  ArrayField,
  FunctionField,
  TopToolbar,
  ListButton,
  TabbedForm,
  FormTab,
  NumberInput,
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
  number,
  regex,
  email,
  choices,
  BooleanInput,
  //ShowButto
  useRecordContext,
  ReferenceArrayField
} from 'react-admin';


//<ShowButton basePath={basePath} record={data} />
const EditActions = ({ basePath, data }) => (
  <TopToolbar>
  <ListButton basePath={basePath} label="列表"  />
  </TopToolbar>
);

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

/* const AccordionSectionTitle = ({ children, name }) => {
 *     const formGroupState = useFormGroup(name);
 * 
 *     return (
 *         <Typography color={formGroupState.invalid && formGroupState.dirty ? 'error' : 'inherit'}>
 *             {children}
 *         </Typography>
 *     );
 * } */



/**
   <Typography variant="h5" gutterBottom>Gathering</Typography>
 */

const PageTitle = ({ record }) => {
    return <span>Post {record ? `"${record.id}"` : ''}</span>;
};

const UnitsField = ({record, source}) => {
  return (
    <>
    <h1>{record.units[0].accession_number}</h1>
        {record.units.map(item => (
          <TextField key={item.id} source="accession_number" record={record}/>
        ))}
    </>
  )
}

UnitsField.defaultProps = {
    addLabel: true
};

const UnitEditButton = ({ record }) => (
    <EditButton basePath="/units" label="Edit Unit" record={record} />
);

export const CollectionEdit = props => (
  <Edit title={<PageTitle />} actions={<EditActions />} {...props}>
  <TabbedForm>
  <FormTab label="gathering">
  <TextInput disabled label="ID" source="id" />
  <ReferenceInput source="collector_id" reference="people" allowEmpty allowEmpty>
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
  <UnitEditButton />
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
  <TextInput source="altitude.0" label="alt" />
  <TextInput source="altitude.1" label="alt2" />
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
  </Edit>
);
/*
   <SimpleForm>

   <ReferenceInput source="collector_id" reference="people" allowEmpty allowEmpty>
   <AutocompleteInput optionText="full_name"/>
   </ReferenceInput>
   <TextInput source="field_number" />
   <DateInput source="collect_date" />
   <Typography variant="h6" gutterBottom>Gathering: locality</Typography>
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
   <TextInput source="geospatial.longitude" />
   <TextInput source="geospatial.latitude" />
   <Box display="flex">
   <Box flex={1} mr="0.5em">
   <TextInput source="geospatial.altitude.0" label="alt" fullWidth />
   </Box>
   <Box flex={1} ml="0.5em">
   <TextInput source="geospatial.altitude.1" label="alt2" fullWidth />
   </Box>
   </Box>
   <Typography variant="h5" gutterBottom>Units</Typography>
   <ArrayField source="units">
   <SingleFieldList>
   <Paper><TextField source="accession_number" /></Paper>
   </SingleFieldList>
   </ArrayField>
   </SimpleForm>
 */


/*
   <ArrayField source="units">
   <SingleFieldList>
   <TextField source="accession_number" />
   </SingleFieldList>
   </ArrayField>
 */

/*
   多欄


   const MyGatheringGeo1 = () => (
   <Box display="flex">
   <Box flex={1}>
   <ReferenceInput source="named_area_country_id" reference="named_areas" allowEmpty fullWidth filter={{area_class_id: 1}}>
   <AutocompleteInput optionText="name_mix"/>
   </ReferenceInput>
   </Box>
   <Box>
   <ReferenceInput source="named_area_province_id" reference="named_areas" allowEmpty fullWidth filter={{area_class_id: 2}}>
   <AutocompleteInput optionText="name_mix"/>
   </ReferenceInput>
   </Box>
   <Box>
   <ReferenceInput source="named_area_hsien_id" reference="named_areas" allowEmpty fullWidth filter={{area_class_id: 3}}>
   <AutocompleteInput optionText="name_mix"/>
   </ReferenceInput>
   </Box>
   <Box>
   <ReferenceInput source="named_area_town_id" reference="named_areas" allowEmpty fullWidth filter={{area_class_id: 4}}>
   <AutocompleteInput optionText="name_mix"/>
   </ReferenceInput>
   </Box>
   <Box>
   <ReferenceInput source="named_area_park_id" reference="named_areas" allowEmpty fullWidth filter={{area_class_id: 5}}>
   <AutocompleteInput optionText="name_mix"/>
   </ReferenceInput>
   </Box>
   <Box>
   <ReferenceInput source="named_area_locality_id" reference="named_areas" allowEmpty fullWidth filter={{area_class_id: 6}}>
   <AutocompleteInput optionText="name_mix"/>
   </ReferenceInput>
   </Box>
   </Box>
   );

   const MyGatheringGeo2 = () => (
   <Box display="flex">
   <Box>
   <TextInput source="locality_text" fullWidth/>
   </Box>
   <Box flex={1} mr="0.5em">
   <TextInput source="geospatial.longitude" fullWidth />
   </Box>
   <Box flex={1} mr="0.5em" ml="0.5em">
   <TextInput source="geospatial.latitude" fullWidth />
   </Box>
   <Box flex={1} mr="0.5em" ml="0.5em">
   <TextInput source="geospatial.altitude.0" label="alt" fullWidth />
   </Box>
   <Box flex={1} ml="0.5em">
   <TextInput source="geospatial.altitude.1" label="alt2" fullWidth />
   </Box>
   </Box>
   );

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
   <MyGatheringGeo1 />
   <MyGatheringGeo2 />
   </Box>
   </Box>
   );
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
