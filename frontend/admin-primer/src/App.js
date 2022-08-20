import React from 'react';

import {
  Box,
  Header,
  Heading,
  NavList,
  PageLayout,
  ThemeProvider,
  //StyledOcticon,
  //Avatar,
} from '@primer/react';
/*
import {
  ChecklistIcon,
  LocationIcon,
  FileMediaIcon,
} from '@primer/octicons-react';*/

import {
  Link as RouterLink,
  BrowserRouter,
  useMatch,
  useResolvedPath,
  Routes,
  Route
} from "react-router-dom";

import CollectionList from 'CollectionList';
import CollectionForm from 'CollectionForm';

// import 'musubii/dist/musubii.min.css';


const AdminHeader = () => (
  <Header>
    <Header.Item>
      <Header.Link href="#" fontSize={2}>
        <span>{process.env.ORGANIZATION_TITLE}</span>
      </Header.Link>
    </Header.Item>
    {/*
       <Header.Item full>Menu</Header.Item>
       <Header.Item mr={0}>
       <Avatar src="https://github.com/octocat.png" size={20} square alt="@octocat" />
       </Header.Item>
     */}
  </Header>
);

const NavItem = ({to, children}) => {
  const resolved = useResolvedPath(to)
  const isCurrent = useMatch({path: resolved.pathname, end: true})
  return (
    <NavList.Item as={RouterLink} to={to} aria-current={isCurrent ? 'page' : undefined}>
      {children}
    </NavList.Item>
  )
}
const AdminSidebar = () => (
  <Box
    borderWidth="1px"
    borderStyle="solid"
    borderColor="border.default"
    borderRadius={2}
    p={1}
    m={3}
    maxWidth={200}
  >
    <NavList>
      <NavItem to="/">Dashboard</NavItem>
      <NavItem to="/collections">Collections</NavItem>
      <NavItem to="/taxa">Taxa</NavItem>
      <NavItem to="/loc">Locations</NavItem>
    </NavList>
  </Box>
);

const AdminMain = () => (
    <Routes>
      {/*<Route path="/" element={<Dashboard />} />*/}
      <Route path="/collections" element={<CollectionList />} />
      <Route path="/collections/:collectionId" element={<CollectionForm />} />
      <Route path="/collections/create" element={<CollectionForm />} />
    </Routes>
)

export default function App() {
  return (
    <BrowserRouter basename={(process.env.MY_ENV === 'prod') ? '/admin' : '/'}>
      <ThemeProvider>
        <AdminHeader />
        <Box display="flex">
          <AdminSidebar />
          <Box flexGrow={1} borderColor="border.default" borderWidth={0} borderStyle="solid">
            <AdminMain />
          </Box>
        </Box>
    </ThemeProvider>
    </BrowserRouter>
  )
}

/*
      <table className="table is-border is-stripe">
        <thead>
          <tr><th>標本照/館號</th><th>物種</th><th>採集者/號/日期</th><th>採集地點</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>foo</td><td></td>
    </tr>
    </tbody>
    </table>
*/

