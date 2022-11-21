
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
import { ArticleList, ArticleForm } from 'Article';

// import 'musubii/dist/musubii.min.css';
const adminContext = {
  baseURL: process.env.BASE_URL,
  apiURL: process.env.API_URL,
};
const AdminContext = React.createContext(adminContext);


const AdminHeader = () => (
  <Header sx={{backgroundColor: '#488A99'}}>
    <Header.Item>
      <Header.Link href="#" fontSize={2} sx={{color: '#DADADA'}}>
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
    borderWidth="0px"
    borderRightWidth="1px"
    borderStyle="solid"
    borderColor="border.default"
    borderRadius={0}
    m={0}
    p={2}
    maxWidth={200}
    sx={{ background: '#F1F1F1'}}
  >
    <NavList>
      <NavItem to="/">Dashboard</NavItem>
      <NavItem to="/collections">Collections</NavItem>
      <NavItem to="/articles">Articles</NavItem>
      <NavItem to="/taxa">Taxa</NavItem>
      <NavItem to="/loc">Locality</NavItem>
    </NavList>
  </Box>
);

const AdminMain = () => (
    <Routes>
      {/*<Route path="/" element={<Dashboard />} />*/}
      <Route path="/collections" element={<CollectionList />} />
      <Route path="/collections/:collectionId" element={<CollectionForm />} />
      <Route path="/collections/create" element={<CollectionForm />} />
      <Route path="/articles" element={<ArticleList />} />
      <Route path="/articles/:articleId" element={<ArticleForm />} />
      <Route path="/articles/create" element={<ArticleForm />} />
    </Routes>
)

const Admin = () => {
  return (
    <AdminContext.Provider value={adminContext}>
      <BrowserRouter basename={(process.env.MY_ENV === 'prod') ? '/admin' : '/'}>
        <ThemeProvider>
          <AdminHeader />
          <Box
            display="flex"
            borderWidth="0px"
            borderTopWidth="1px"
            borderColor="border.default"
            borderStyle="solid"
          >
            <AdminSidebar />
            <Box flexGrow={1} borderColor="border.default" borderWidth={0} borderStyle="solid" px={3}>
              <AdminMain />
            </Box>
          </Box>
        </ThemeProvider>
      </BrowserRouter>
    </AdminContext.Provider>
  )
};

export { Admin, AdminContext };
