import * as React from "react";
//import { Admin } from 'react-admin';
import { Admin, Resource} from 'react-admin';
//import jsonServerProvider from 'ra-data-json-server';

import PeopleIcon from '@material-ui/icons/People';
import CollectionsIcon from '@material-ui/icons/Collections';
import PlaceIcon from '@material-ui/icons/Place';
import MapIcon from '@material-ui/icons/Map';
import AssignmentIcon from '@material-ui/icons/Assignment';
import CategoryIcon from '@material-ui/icons/Category';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';
import SearchIcon from '@material-ui/icons/Search';
import LandscapeIcon from '@material-ui/icons/Landscape';
//import LocalFloristIcon from '@material-ui/icons/LocalFlorist';
// mui icons
//import HikingIcon from '@material-ui/icons/Hiking';
//import YardIcon from '@material-ui/icons/Yard';

import {
  PeopleList,
  PeopleCreate,
  PeopleEdit
} from './people';
import {
  CollectionList,
  CollectionCreate,
  CollectionEdit
} from './collections';
import {
  NamedAreaList,
} from './named_areas';
import {
  AreaClassList,
} from './area_classes';
import {
  DatasetList,
} from './datasets';
import {
  OrganizationList,
} from './organizations';
import {
  IdentificationList,
} from './identifications';
import {
  MeasurementOrFactList,
} from './measurement_or_facts';
import Dashboard from './Dashboard';

import authProvider from './authProvider';

//const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
import dataProvider from './dataProvider';

const App = () => (
  <Admin dataProvider={dataProvider} dashboard={Dashboard} authProvider={authProvider} title="NatureDB">
  <Resource name="collections" list={CollectionList} edit={CollectionEdit} create={CollectionCreate} icon={LandscapeIcon} />
  <Resource name="units" list={CollectionList} icon={CollectionsIcon} />
  <Resource name="people" list={PeopleList} edit={PeopleEdit} create={PeopleCreate} icon={PeopleIcon} />
  <Resource name="named_areas" list={NamedAreaList} icon={PlaceIcon} />
  <Resource name="area_classes" list={AreaClassList} icon={MapIcon} />
  <Resource name="organizations" list={OrganizationList} icon={AccountBalanceIcon} />
  <Resource name="identifications" list={IdentificationList} icon={SearchIcon} />
  <Resource name="measurement_or_facts" list={MeasurementOrFactList} icon={AssignmentIcon} />
  <Resource name="datasets" list={DatasetList} icon={CategoryIcon} />
  </Admin>
);

export default App;
