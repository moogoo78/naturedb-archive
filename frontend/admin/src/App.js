import * as React from "react";
//import { Admin } from 'react-admin';
import { Admin, Resource} from 'react-admin';
//import jsonServerProvider from 'ra-data-json-server';


import PlaceIcon from '@material-ui/icons/Place';
import MapIcon from '@material-ui/icons/Map';
import CategoryIcon from '@material-ui/icons/Category';
import AccountBalanceIcon from '@material-ui/icons/AccountBalance';


//import LocalFloristIcon from '@material-ui/icons/LocalFlorist';
// mui icons
//import HikingIcon from '@material-ui/icons/Hiking';
//import YardIcon from '@material-ui/icons/Yard';


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

import collectionspecimens from './collectionspecimens';
import people from './people';
import units from './units';
import collections from './collections';
import measurementorfacts from './measurementorfacts';
import taxa from './taxa';
import identifications from './identifications';
import Dashboard from './Dashboard';

import authProvider from './authProvider';
import dataProvider from './dataProvider';
//const dataProvider = jsonServerProvider('https://jsonplaceholder.typicode.com');

const App = () => (
  <Admin authProvider={authProvider} dataProvider={dataProvider} dashboard={Dashboard} title="NatureDB">
    <Resource name="collection-specimens" {...collectionspecimens} />
    <Resource name="collections" {...collections} />
    <Resource name="units" {...units} />
    <Resource name="people" {...people} />
    <Resource name="named_areas" list={NamedAreaList} icon={PlaceIcon} />
    <Resource name="area_classes" list={AreaClassList} icon={MapIcon} />
    <Resource name="organizations" list={OrganizationList} icon={AccountBalanceIcon} />
    <Resource name="identifications" {...identifications} />
    <Resource name="measurement_or_facts" {...measurementorfacts} />
    <Resource name="datasets" list={DatasetList} icon={CategoryIcon} />
    <Resource name="taxa" {...taxa} />
  </Admin>
);

/*


*/
export default App;
