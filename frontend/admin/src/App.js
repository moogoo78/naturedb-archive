import * as React from "react";
//import { Admin } from 'react-admin';
import { Admin, Resource} from 'react-admin';
//import jsonServerProvider from 'ra-data-json-server';

import PeopleIcon from '@material-ui/icons/People';
import CollectionsIcon from '@material-ui/icons/Collections';
import PlaceIcon from '@material-ui/icons/Place';
import MapIcon from '@material-ui/icons/Map';
import AssignmentIcon from '@material-ui/icons/Assignment';
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
import Dashboard from './Dashboard';
import authProvider from './authProvider';

//const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
import dataProvider from './dataProvider';

const App = () => (
  <Admin dataProvider={dataProvider} dashboard={Dashboard} authProvider={authProvider} title="NatureDB">
  <Resource name="collections" list={CollectionList} edit={CollectionEdit} create={CollectionCreate} icon={AssignmentIcon} />
  <Resource name="units" list={CollectionList} icon={CollectionsIcon} />
  <Resource name="people" list={PeopleList} edit={PeopleEdit} create={PeopleCreate} icon={PeopleIcon} />
  <Resource name="named_areas" list={NamedAreaList} icon={PlaceIcon} />
  <Resource name="area_classes" list={AreaClassList} icon={MapIcon} />
  </Admin>
);

export default App;
