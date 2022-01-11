import * as React from "react";

import {
  Edit,
  EditButton,
  Button,
  //CreateButton,
  ListButton,
  TopToolbar,
  TabbedForm,
  FormTab,
  Datagrid,
  TextField,
  DateField,
  ArrayField,
  SelectField,
  FunctionField,
  ReferenceManyField,
//  SingleFieldList,
//  ChipField,
  ReferenceInput,
  TextInput,
  DateInput,
  AutocompleteInput,
  /*FormWithRedirect,*/
  /*ReferenceManyField,*/
  /*SingleFieldList,*/
  useRecordContext,
  /*ReferenceArrayField*/
} from 'react-admin';
import {Drawer, Button as MuiButton, TextField as MuiTextField} from '@material-ui/core';
import { Route } from 'react-router';
import PersonCreate from '../people';
import { Field } from 'react-final-form';
import { useField } from 'react-final-form';
import { Labeled } from 'react-admin';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { useInput } from 'react-admin';
//import MeasurementOfFactCreate from ''
/* import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
 * import { Button } from "react-admin";
 * import { Link } from 'react-router-dom'; */
import { Link } from 'react-router-dom';


import UnitQuickCreateButton from './UnitQuickCreateButton';
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
const MeasurementOrFactEditButton = ({ record }) => (
    <EditButton basePath="/measurement_or_facts" label="Edit me" record={record} />
);

// const UnitCreateButton = ({ record }) => {
//   return (
//     <Button
//       component={Link}
//       to={`/units/create?collectiod_id=${record.id}`}
//       label="Add a unit"
//       title="Add a unit"
//     >
//     </Button>
//   );
// }


// const MyTextField = (props) => {
//   const {
//     input: { name, onChange, ...rest },
//     meta: { touched, error },
//     isRequired
//   } = useInput(props);
//   console.log(props);
//   return (
//     <Labeled label="foo">
//       <MuiTextField
//         name={name}
//         label={props.label}
//         onChange={onChange}
//         error={!!(touched && error)}
//         helperText={touched && error}
//         required={isRequired}
//         {...rest}
//       />
//     </Labeled>
//     );
// }

/* const AddMeasureOrFactButton = ({ record }) => (
 *   <Button
 *     component={Link}
 *     to={{
 *       pathname: "/measurement_or_facts/create",
 *       // Here we specify the initial record for the create view
 *       state: { record: { collection_id: record.id } },
 *     }}
 *     label="Add New"
 *   >
 *     <ChatBubbleIcon />
 *   </Button>
 * ); */

        // <ArrayField source="mof_list" label="Measurement or Fact">
        //   <Datagrid>
        //     <TextField source="parameter" />
        //     <TextField source="text" />
        //   </Datagrid>
        // </ArrayField>
        // <AddMeasureOrFactButton />



const CollectionEdit = props => {
  const [open, setOpen] = React.useState(false);
  const toggle = (open) => {
    //console.log(open, 'tog');
    setOpen(open);
  }
  const [version, setVersion] = React.useState(0);
  const [version2, setVersion2] = React.useState(0);
  const handleUnitChange = React.useCallback(() => setVersion(version + 1), [version]);
  const handleIdentificationChange = React.useCallback(() => setVersion2(version2 + 1), [version2]);
  //<UnitCreateButton />
  //console.log('CollectionEdit::props', props);
  return (
  <Edit title={<PageTitle />} actions={<PageActions />} {...props}>
    <TabbedForm>
      <FormTab label="gathering">
        <TextInput disabled label="ID" source="id" />
        <ReferenceInput source="collector_id" reference="people" allowEmpty>
          <AutocompleteInput optionText="full_name" />
        </ReferenceInput>
        <TextInput source="field_number" />
        <DateInput source="collect_date" />
        <ArrayField source="units">
          <Datagrid>
            <TextField source="accession_number" />
            <TextField source="duplication_number" />
            <SelectField source="preparation_type" choices={UnitPreparationTypeChoices} />
            <DateField source="preparation_date" />
            <ArrayField source="measurement_or_facts" label="Measurement or Fact/物候">
              <Datagrid>
                {/*<TextField source="id" />*/}
                <TextField source="parameter.label" label="參數" />
                <TextField source="value" label="數值"/>
              </Datagrid>
            </ArrayField>
            <UnitEditButton />
          </Datagrid>
        </ArrayField>
        <UnitQuickCreateButton onChange={handleUnitChange} collectionId={props.id}/>
      </FormTab>
      <FormTab label="locality">
        {/*<MyTextField source="longitude_decimal" />*/}
        <TextInput source="longitude_decimal" />
        <TextInput source="latitude_decimal" />
        <TextInput source="altitude" label="alt" />
        <TextInput source="altitude2" label="alt2" />
        <ReferenceInput source="named_area_list[0].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 1}} fullWidth label="國家">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[1].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 2}} fullWidth label="省份">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[2].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 3}} fullWidth label="縣/市">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[3].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 4}} fullWidth label="鄉/鎮">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[4].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 5}} fullWidth label="國家公園">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>

        <ReferenceInput source="named_area_list[5].data.id" reference="named_areas" allowEmpty filter={{area_class_id: 6}} fullWidth label="地點">
          <AutocompleteInput optionText="name_mix" />
        </ReferenceInput>
        <TextInput source="locality_text" multiline={true} fullWidth />
      </FormTab>
      <FormTab label="MeasurementOrFact">
        {/*<MyField source="measurement_or_facts" label="mofx" />*/}
        <ArrayField source="biotope_measurement_or_facts">
          <Datagrid>
            <TextField source="parameter.label" />
            <TextField source="value" />
          </Datagrid>
        </ArrayField>
        <MeasurementOrFactEditButton />
      </FormTab>
      <FormTab label="Identification">
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
      </FormTab>
    </TabbedForm>
  </Edit>
  );
}
/*
const SexInput = props => {
    const {
        input,
        meta: { touched, error }
    } = useInput(props);

    return (
        <Select
            label="Sex"
            {...input}
        >
            <MenuItem value="M">Male</MenuItem>
            <MenuItem value="F">Female</MenuItem>
        </Select>
    );
};

const MyField = (props) => {
  const record = useRecordContext(props);
  const mof_list = record[props.source];
  return (
    <>
      <div>
        <SexInput source="sex" />
      </div>
    </>
  )
}

*/
//        <MuiButton onClick={(e)=> toggle(true)}>a</MuiButton>
//          <Drawer open={open} anchor="right" onClose={(e)=>toggle(false)}><h1>foo</h1></Drawer>
/*

-----
        <FunctionField label="mof" render={ record => {
          console.log(record.measurement_or_facts);
          return (
            <>
              {record.measurement_or_facts.map((v=>{
                console.log(v);
                return < key={v.parameter}>{v.label}</h2>
              }))}
            </>
          )
        }} />
*/
export default CollectionEdit;
