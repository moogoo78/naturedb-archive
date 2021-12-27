import * as React from "react";
//import { Admin } from 'react-admin';
import { Admin, Resource, ListGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';


import PeopleIcon from '@material-ui/icons/People';
import LocalFloristIcon from '@material-ui/icons/LocalFlorist';
import CollectionsIcon from '@material-ui/icons/Collections';
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
  CollectionEdit } from './collections';
import Dashboard from './Dashboard';
import authProvider from './authProvider';

//const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');
import dataProvider from './dataProvider';

const App = () => (
  <Admin dataProvider={dataProvider} dashboard={Dashboard} authProvider={authProvider} title="NatureDB">
  <Resource name="collections" list={CollectionList} edit={CollectionEdit} create={CollectionCreate} icon={CollectionsIcon} />
  <Resource name="people" list={PeopleList} edit={PeopleEdit} create={PeopleCreate} icon={PeopleIcon} />
  </Admin>
);

export default App;
