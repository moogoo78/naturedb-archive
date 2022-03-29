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
  SelectInput,
  AutocompleteInput,
  /*ReferenceManyField,*/
  /*SingleFieldList,*/
  //useRecordContext,
  /*ReferenceArrayField*/
  /*useRecordContext,*/
  useInput,
} from 'react-admin';
import {
  //Drawer,
  //Button as MuiButton,
  //TextField as MuiTextField,
  Typography,
  Box,
  Toolbar,
  //Chip,
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
import { makeStyles } from '@material-ui/core/styles';

//import PersonCreate from '../people';
import UnitQuickDialog from './UnitQuickDialog';
import IdentificationQuickDialog from './IdentificationQuickDialog';

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
  //console.log(record);
    return <span>編輯 {record ? `#${record.id} :: ${record.key}` : ''}</span>;
};

const UnitEditButton = ({ record }) => (
    <EditButton basePath="/units" label="Edit Unit" record={record} />
);
//
//const IdentificationEditButton = ({ record }) => (
//    <EditButton basePath="/identifications" label="Edit" record={record} />
//);
//<IdentificationEditButton />

//const MeasurementOrFactEditButton = ({ record }) => (
//    <EditButton basePath="/measurement_or_facts" label="Edit me" record={record} />
//);

const DISPLAY_NAMED_AREAS = ['country', 'stateProvince', 'county', 'municipality'];
const NamedAreaInput = props => {
  const {
    input,
    //meta: { touched, error }
  } = useInput(props);
  //const record = useRecordContext(props);
  //console.log(input.value);
  const source = `named_area__${props.areaClass}_id`;
  const namedArea = input.value.named_area_map[props.areaClass];
  //console.log(data, 'foo', input.value[source], );
  const naIdx = DISPLAY_NAMED_AREAS.indexOf(props.areaClass);
  const parent = naIdx > 0 ? DISPLAY_NAMED_AREAS[naIdx-1] : '';

  const pid = (parent !== '') ? input.value[`named_area__${parent}_id`] : null;
  const fq = (namedArea) ? {parent_id: pid, area_class_id: namedArea.field.id} : null;
  //console.log(props, namedArea, parent, fq, parent, source);
  return (
    <ReferenceInput source={source} reference="named_areas" allowEmpty label={namedArea.field.label} filter={fq} fullWidth>
    <AutocompleteInput optionText="name_mix" />
  </ReferenceInput>
  );
};

/*
                    <ReferenceInput source="named_area__province_id" reference="named_area_provinces" allowEmpty label="省份" fullWidth>
                      <AutocompleteInput optionText="name_mix" />
                    </ReferenceInput>
*/

const useStyles = makeStyles({
  imgContainer: {
    '& img': {
      height: 100,
      width: 100,
      objectFit: "contain"
    }
  }
});

const CollectionForm = props => {
  //const [version, setVersion] = React.useState(0);
  const [version2, setVersion2] = React.useState(0);
//  const handleUnitChange = React.useCallback(() => setVersion(version + 1), [version]);
  const handleIdentificationChange = React.useCallback(() => setVersion2(version2 + 1), [version2]);
  const classes = useStyles();
  return (
    <FormWithRedirect
      {...props}
      redirect={false}
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
                    <NamedAreaInput areaClass="country"/>
                  </Box>
                  <Box flex={1} ml="0.5em" mr="0.5em">
                    <NamedAreaInput areaClass="stateProvince"/>
                  </Box>
                  <Box flex={1} ml="0.5em">
                    <NamedAreaInput areaClass="county" />
                  </Box>
                </Box>
                <Box display="flex">
                  <Box flex={1} mr="0.5em">
                    <NamedAreaInput areaClass="county"/>
                  </Box>
                  <Box flex={1} mr="0.5em" ml="0.5em">
                    <NamedAreaInput areaClass="national_park" />
                  </Box>
                  <Box flex={1} ml="0.5em">
                    <NamedAreaInput areaClass="locality" />
                  </Box>
                </Box>
                <TextInput source="locality_text" label="詳細地點" multiline fullWidth/>
                <Box display="flex">
                  <Box flex={1} mr="0.5em">
                    <TextInput source="longitude_decimal" label="經度(十進位)" fullWidth />
                  </Box>
                  <Box flex={1} mr="0.5em" ml="0.5em">
                    <TextInput source="latitude_decimal" label="緯度(十進位)" fullWidth />
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
                      <TextField source="taxon.full_scientific_name" label="學名" fullWidth />
                      <TextField source="identifier.full_name" label="鑑定者" />
                      <DateField source="date" label="鑑定日期" />
                      <TextField source="date_text" label="鑑定日期(文字格式)"/>
                      <TextField source="sequence" label="鑑定次數" />
                      <FunctionField render={record => {
                        return (
                          <IdentificationQuickDialog onChange={handleIdentificationChange} record={record}/>
                        );
                      }} />
                    </Datagrid>
                  </ArrayField>
                  <IdentificationQuickDialog onChange={handleIdentificationChange} />
                </Box>
                <Box mt="1em" />
                <Typography variant="h6" gutterBottom>植群/環境</Typography>
                <ArrayField source="biotope_measurement_or_facts">
                  <Datagrid>
                    <TextField source="parameter.label" label="項目"/>
                    <TextField source="value_en" label="value"/>
                  </Datagrid>
                </ArrayField>
              </Box>
              <Box flex={1} ml="1em">
                <Typography variant="h6" gutterBottom>標本</Typography>
                <FunctionField render={record => {
                  if (record) {
                  return (
                    <Box mt="0.5em" key={record.id}>
                      <TextInput source="accession_number" label="館號" />
                      <TextInput source="duplication_number" label="複份號"/>
                      <SelectInput source="preparation_type" choices={UnitPreparationTypeChoices} />
                      <DateInput source="preparation_date" label="壓製日期" />
                      <Box><img src={record.image_url} alt=""/></Box>
                      {/*
                      {record.transactions.map((v,i) => (
                        <Box key={i}>
                          <Typography variant="subtitle1" >[交換] dept: {v.organization_text}, type: {v.display_transaction_type}</Typography>
                        </Box>))
                      }
                       */}
                      <Typography variant="subtitle1" >物候</Typography>
                      {record.measurement_or_facts.map((v,i) => (
                        <Box key={i}>
                          <Typography variant="subtitle2" >{`${v.parameter.label}: ${v.value_en}`}</Typography>
                        </Box>))
                      }
                       */}
                    </Box>);
                  }
                }} label="unit"/>
                {/*
                <FunctionField render={record => {
                  return (
                    <UnitQuickDialog record={record} />
                  );
                }} />
                <ArrayField source="units">
                  <Datagrid>
                    <ImageField source="image_url" tiitle="照片" className={classes.imgContainer} />
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

/* for multi unit
                <FunctionField render={record => {
                  return (
                    <>
                      {(record.units) ?
                       record.units.map((unit)=>{
                         return (
                           <Box mt="0.5em" key={unit.id}>
                            <Chip label={unit.accession_number} />
                            <Box><img src={unit.image_url} alt=""/></Box>
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
*/
const CollectionEdit = props => {
  return (
    <Edit title={<PageTitle />} actions={<PageActions />} {...props}>
      <CollectionForm />
    </Edit>
  );
}

export default CollectionEdit;
