import * as React from "react";

import {
  Edit,
  EditButton,
  SaveButton,
  DeleteButton,
  //Button,
  //CreateButton,
  ListButton,
  TopToolbar,
  //TabbedForm,
  //SimpleForm,
  //FormTab,
  FormWithRedirect,
  Datagrid,
  TextField,
  DateField,
  ArrayField,
  SelectField,
  FunctionField,
  ImageField,
  //ReferenceManyField,
//  SingleFieldList,
  ReferenceInput,
  TextInput,
  DateInput,
  AutocompleteInput,
  /*FormWithRedirect,*/
  /*ReferenceManyField,*/
  /*SingleFieldList,*/
  //useRecordContext,
  /*ReferenceArrayField*/
  //useInput,
} from 'react-admin';
import {
  //Drawer,
  //Button as MuiButton,
  //TextField as MuiTextField,
  Typography,
  Box,
  Toolbar,
  Chip,
  //MenuItem,
  //Select,
} from '@material-ui/core';
//import { Route } from 'react-router';
//import { Link } from 'react-router-dom';
//import { Field } from 'react-final-form';
//import { useField } from 'react-final-form';
//import { Labeled } from 'react-admin';
//import MeasurementOfFactCreate from ''
/* import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
 * import { Button } from "react-admin";
 * import { Link } from 'react-router-dom'; */


//import PersonCreate from '../people';
//import UnitQuickCreateButton from './UnitQuickCreateButton';
import IdentificationQuickCreateButton from './IdentificationQuickCreateButton';

const UnitPreparationTypeChoices = [
  {id: 'S', name: 'specimen'},
  {id: 'T', name: 'tissue'},
  {id: 'D', name: 'DNA'},
];
//<ShowButton basePath={basePath} record={data} />
const PageActions = ({ basePath, data }) => (
  <TopToolbar>
  <ListButton basePath={basePath} label="列表"  />
  </TopToolbar>
);

const PageTitle = ({ record }) => {
    return <span>編輯 {record ? `#${record.id} :: ${record.key}` : ''}</span>;
};

const UnitEditButton = ({ record }) => (
    <EditButton basePath="/units" label="Edit Unit" record={record} />
);
const IdentificationEditButton = ({ record }) => (
    <EditButton basePath="/identifications" label="Edit" record={record} />
);
//const MeasurementOrFactEditButton = ({ record }) => (
//    <EditButton basePath="/measurement_or_facts" label="Edit me" record={record} />
//);



const SpecimenForm = props => {
  const [version, setVersion] = React.useState(0);
  const [version2, setVersion2] = React.useState(0);
  const handleUnitChange = React.useCallback(() => setVersion(version + 1), [version]);
  const handleIdentificationChange = React.useCallback(() => setVersion2(version2 + 1), [version2]);

  return (
    <FormWithRedirect
      {...props}
      render={formProps => (
        <form>
          <Box p="1em">
            <Box display="flex">
              <Box flex={2} mr="1em">
                <Typography variant="h6" gutterBottom>採集事件</Typography>
                <Box display="flex">
                  <Box flex={2} mr="0.5em">
                    <ReferenceInput source="collector_id" reference="people" label="採集者" allowEmpty fullWidth>
                      <AutocompleteInput optionText="display_name" />
                    </ReferenceInput>
                  </Box>
                  <Box flex={1} mr="0.5em" ml="0.5em">
                    <TextInput source="field_number" label="採集號" fullWidth/>
                  </Box>
                  <Box flex={1} ml="0.5em">
                    <DateInput source="collect_date" label="採集日期" fullWidth/>
                  </Box>
                </Box>
                <Box mt="1em" />
                <Typography variant="h6" gutterBottom>採集地點</Typography>
                <Box display="flex">
                  <Box flex={1} mr="0.5em">
                    <ReferenceInput source="named_area_list[0].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 1}} label="國家" fullWidth>
                      <AutocompleteInput optionText="name" />
                    </ReferenceInput>
                  </Box>
                  <Box flex={1} ml="0.5em" mr="0.5em">
                    <ReferenceInput source="named_area_list[1].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 2}} label="省份" fullWidth>
                      <AutocompleteInput optionText="name_mix" />
                    </ReferenceInput>
                  </Box>
                  <Box flex={1} ml="0.5em">
                    <ReferenceInput source="named_area_list[2].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 3}} label="縣/市" fullWidth>
                      <AutocompleteInput optionText="name_mix" />
                    </ReferenceInput>
                  </Box>
                </Box>
                <Box display="flex">
                  <Box flex={1} mr="0.5em">
                    <ReferenceInput source="named_area_list[3].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 4}} label="鄉/鎮" fullWidth>
                      <AutocompleteInput optionText="name_mix" />
                    </ReferenceInput>
                  </Box>
                  <Box flex={1} mr="0.5em" ml="0.5em">
                    <ReferenceInput source="named_area_list[4].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 5}} label="國家公園" fullWidth>
                      <AutocompleteInput optionText="name_mix" />
                    </ReferenceInput>
                  </Box>
                  <Box flex={1} ml="0.5em">
                    <ReferenceInput source="named_area_list[5].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 6}} label="地點" fullWidth>
                      <AutocompleteInput optionText="name_mix" />
                    </ReferenceInput>
                  </Box>
                </Box>
                <TextInput source="locality_text" label="詳細地點" multiline fullWidth/>
                <Box display="flex">
                  <Box flex={1} mr="0.5em">
                    <TextInput source="longitude_decimal" fullWidth />
                  </Box>
                  <Box flex={1} mr="0.5em" ml="0.5em">
                    <TextInput source="latitude_decimal" fullWidth />
                  </Box>
                  <Box flex={1} mr="0.5em" ml="0.5em">
                    <TextInput source="altitude" label="海拔(m)" fullWidth/>
                  </Box>
                  <Box flex={1} ml="0.5em">
                    <TextInput source="altitude2" label="海拔2 (m)" fullWidth />
                  </Box>
                </Box>
                <Box mt="1em" />
                <Typography variant="h6" gutterBottom>鑑定</Typography>
                <Box display="flex">
                  <ArrayField source="identifications">
                    <Datagrid>
                      <TextField source="id" />
                      <TextField source="taxon.full_scientific_name" fullWidth />
                      <TextField source="identifier.full_name" />
                      <DateField source="date" />
                      <TextField source="date_text" />
                      <TextField source="verification_level" />
                      <IdentificationEditButton />
                    </Datagrid>
                  </ArrayField>
                  <IdentificationQuickCreateButton onChange={handleIdentificationChange} collectionId={props.id}/>
                </Box>
                <Box mt="1em" />
                <Typography variant="h6" gutterBottom>物候</Typography>
                <ArrayField source="biotope_measurement_or_facts">
                  <Datagrid>
                    <TextField source="parameter.label" />
                    <TextField source="value" />
                  </Datagrid>
                </ArrayField>
              </Box>
              <Box flex={1} ml="1em">
                <Typography variant="h6" gutterBottom>標本</Typography>
                <FunctionField render={record => {
                  console.log(record.units);
                  return (
                    <>
                      {(record.units) ?
                       record.units.map((unit)=>{
                         return (
                           <Box mt="0.5em" key={unit.id}>
                            <Chip label={unit.accession_number} />
                            <Box><img src={unit.image_url} /></Box>
                            {unit.transactions.map((v,i) => (
                              <Box key={i}>
                                <Typography variant="subtitle1" >[交換] dept: {v.organization_text}, type: {v.display_transaction_type}</Typography>
                              </Box>))
                            }
                            <Typography variant="subtitle1" >測量</Typography>
                            {unit.measurement_or_facts.map((v,i) => (
                              <Box key={i}>
                                <Typography variant="subtitle2" >{`${v.parameter.label}: ${v.value}`}</Typography>
                              </Box>))
                            }
                          </Box>)
                       })
                    : null}
                    </>);
                }} label="unit"/>
                {/*
                <ArrayField source="units">
                  <Datagrid>
                    <TextField source="accession_number" />
                    <TextField source="duplication_number" />
                    <SelectField source="preparation_type" choices={UnitPreparationTypeChoices} />
                    <DateField source="preparation_date" />
                    <ArrayField source="measurement_or_facts" label="Measurement or Fact/物候">
                      <Datagrid>
                        <TextField source="parameter.label" label="參數" />
                        <TextField source="value" label="數值"/>
                      </Datagrid>
                    </ArrayField>
                    <UnitEditButton />
                  </Datagrid>
                  </ArrayField>
         */}
              </Box>
            </Box>
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
  );
}


const SpecimenEdit = props => {
  return (
    <Edit title={<PageTitle />} actions={<PageActions />} {...props}>
      <SpecimenForm />
    </Edit>
  );
}

export default SpecimenEdit;
