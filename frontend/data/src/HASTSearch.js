import React, { useState } from 'react';

import 'musubii/dist/musubii.min.css';

import {
  Autocomplete,
  Box,
  Button,
  Dialog as DialogV1,
  FormControl,
  Pagehead,
  TabNav,
  Text,
  TextInput,
  ThemeProvider,
  Overlay,
  Portal,
  registerPortalRoot,
  Select,
  Spinner,
  Pagination,
  TextInputWithTokens,
  Details,
  useDetails,
  useOnOutsideClick,
  UnderlineNav,
  IconButton,
  LabelGroup,
  Label,
  SegmentedControl,
  Checkbox,
  ActionMenu,
  ActionList,
  AnchoredOverlay,
} from '@primer/react';
import {Dialog} from '@primer/react/drafts';

import {
  SearchIcon,
  ChevronDownIcon,
  FeedStarIcon,
  FeedTagIcon,
  LocationIcon,
  FeedPersonIcon,
  ItalicIcon,
  ArchiveIcon,
  GearIcon,
  FilterIcon,
  ProjectIcon,
  NoteIcon,
} from '@primer/octicons-react'
import {
  useForm,
  Controller,
} from "react-hook-form";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
  FreeAutocomplete,
  FetchControllerMulti,
} from './Helpers';
import {
  getList,
  getOne,
} from './Utils';

import {
  SearchBar
} from './SearchBar';

const BASE_URL = process.env.BASE_URL;
const API_URL = process.env.API_URL;
const ADMIN_URL = process.env.ADMIN_URL;

const TERM_ICON_MAP = {
  'taxon': <ItalicIcon />,
  'collector': <FeedPersonIcon />,
  'field_number': <FeedTagIcon />,
  'country': <LocationIcon />,
  'accession_number': <ArchiveIcon />,
};
/**
via: https://hackmd.io/@c36ICNyhQE6-iTXKxoIocg/BkMEznmXU#%E9%A1%AF%E7%A4%BA%E5%9C%B0%E5%9C%96
*/
const LeafletMap = ({data}=[]) => {
  React.useEffect(() => {
    // console.log(data);
    const map = L.map('result-map', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).setView([23.181, 121.932], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    const customIcon = new L.Icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.2/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.2/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    data.forEach((x)=> {
      const marker = L.marker([parseFloat(x.latitude_decimal), parseFloat(x.longitude_decimal)], {icon: customIcon}).addTo(map).bindPopup(`<div>館號: ${x.accession_number}</div><div>採集者:${x.collector.display_name}</div><div>採集號: ${x.field_number}</div><div>採集日期: ${x.collect_date}</div><div><a href="/specimens/HAST:${x.accession_number}" target="_blank">查看</a></div>`);
    });

  }, []);
  return <div id="result-map" style={{ height: "100vh" }}></div>;
};


const reducer = (state, action) => {
  switch (action.type) {
  case 'SET_FILTER':
    if (action.isInit === true) {
      return {
        ...state,
        filter: action.filter,
        isInit: true,
      }
    } else {
      return {
        ...state,
        filter: action.filter,
      }
    }
  case 'SET_SORT':
    return {
      ...state,
      sort: action.sort,
    }
  case 'SET_LOADING':
    return {
      ...state,
      isLoading: true
    }
  case 'SET_RESULTS':
    return {
      ...state,
      results: action.results,
      pagination: {
        ...state.pagination,
        pageCount: action.pageCount,
        currentPage: action.currentPage,
      },
      isLoading: false,
    }
  case 'SET_MAP_RESULTS':
    return {
      ...state,
      map_results: action.map_results,
      isLoading: false,
      view: 'map',
    }
  case 'SET_VIEW':
    return {
      ...state,
      view: action.view,
    }
  default:
    throw new Error();
  }
};

const initialArg = {
  isLoading: false,
  isInit: false,
  filter: {
    collector: {},
    scientific_name: '',
    field_number: '',
    field_number2: '',
    collect_date: '',
    collect_date2: '',
    collect_month: '',
    locality_text: '',
    altitude: '',
    altitude2: '',
    country: '',
    state_province: '',
    county: '',
    municipality: '',
    national_park: '',
    locality: '',
    accession_number: '',
    accession_number2: '',
    taxon: {}
  },
  sort: '',
  pagination: {
    currentPage: 1,
    pageCount: 1,
    pageSize: 20,
  },
  results: null,
  map_results: null,
  view: 'table',
  //collector_options: [],
};
const TAB_LABELS = [{
  name: 'taxon',
  label: '學名',
  description: '搜尋物種中文名/學名',
}, {
  name: 'gathering',
  label: '採集資訊',
}, {
  name: 'locality',
  label: '採集地點',
}, {
  name: 'specimen',
  label: '標本',
}];

const NAMED_AREAS = [
  {'id': 1, 'name': 'country', 'label': '國家'},
  {'id': 2, 'name': 'state_province', 'label': '省/州', 'parent': 'country', 'root': 'country'},
  {'id': 3, 'name': 'county', 'label': '縣/市', 'parent': 'state_province', 'root': 'country'},
  {'id': 4, 'name': 'municipality', 'label': '鄉/鎮', 'parent': 'county', 'root': 'country'},
  {'id': 5, 'name': 'national_park', 'label': '國家公園'},
  {'id': 6, 'name': 'locality', 'label': '地名'},
];

const QueryForm = ({state, dispatch, filter}) => {
  const { register, handleSubmit, watch, control, setValue, getValues, formState: { errors } } = useForm({
    defaultValues: filter,
  });

  const onSubmit = data => {
    console.log('submit', data)

    //fetchData({filterWithId});
    const filterIds = justIds(data);
    const params = new URLSearchParams(filterIds);
    const qsList = [];
    params.forEach((value, key) => {
      qsList.push(`${key}:${value}`);
    });

    const queryString = (qsList.length > 0) ? '?q=' + qsList.join(',') : '/';
    //console.log(queryString, filterIds, filter);
    window.location.replace(queryString);
  }
  const tokens = toTokens(filter);
  // set search bar tokens
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box display="flex">
        <Box flexGrow={12} pr={1}>
          <SearchBarx
            tokens={tokens}
            onTokenRemove={(tokenId) => {
              const deleteKey = tokens[tokenId].text.split(':')[0];
              let newFilter = {...filter};
              delete newFilter[deleteKey];
              setValue(deleteKey, '');
              dispatch({type:'SET_FILTER', filter: newFilter });
            }}
            onSelectedChange={(values)=> {
              //need filer, setValue, dispatch so define here
              const value = values[values.length-1]; latest
              let newFilter = {...filter};
              console.log('search bar select: ' ,tokens, value);
              if (value !== undefined) {
                const item_id = value.item_id;
                switch (value.term) {
                case 'field_number':
                  newFilter['field_number'] = value.field_number;
                  newFilter['collector'] = [{object_id: value.collector_id, text: value.collector}];
                  setValue('field_number', value.field_number);
                  setValue('collector', [{id: value.id, text: value.collector}]);
                case 'accession_number':
                  const [k1, v1] = value.text.split(':');
                  setValue(value.category, v1);
                  newFilter[value.category] = v1;
                default:
                  console.log('vvv', value);
                  setValue(value.term, [value]);
                  newFilter[value.term] = [value];
                }
                dispatch({type:'SET_FILTER', filter: newFilter });
              }
            }}
          />
          {/* <SearchBar /> */}
        </Box>
        <Box flexGrow={0} mr={1}>
            <IconButton aria-label="Search" icon={SearchIcon} size="large"/>
        </Box>
        <Box flexGrow={1}>
          <AdvanceSearch
            form={{control, getValues, setValue}}
            onSubmit={onSubmit}
          />
        </Box>
      </Box>
    </form>
  );
};

const AdvanceSearch = ({form, onSubmit}) => {
  //console.log('adv', state, form);
  const [isOpen, setIsOpen] = React.useState(false);
  const [tabnav, setTabnav] = React.useState('taxon');

  const { control, setValue, getValues } = form;

  const openDialog = React.useCallback((e) => {
    e.preventDefault();
    setIsOpen(true);
  }, [setIsOpen]);
  const closeDialog = React.useCallback(() => setIsOpen(false), [setIsOpen]);

  const HastQuery = React.forwardRef((props, ref) => (
    <FetchControllerMulti setValue={setValue} refx={ref} getValues={getValues} {...props} />
  ));

  return (
    <>
      <Button onClick={openDialog} size="large">進階搜尋</Button>
      {isOpen && (
        <Dialog
          title="進階搜尋"
          /* subtitle={ */
          /*   <> */
          /*     This is a <b>description</b> of the dialog. */
          /*   </> */
        /* } */
          footerButtons={[{content: '搜尋', onClick: ()=>{
            onSubmit(form.getValues());
            setIsOpen(false);
          }}]}
          onClose={closeDialog}
        >
          {/* <Text fontFamily="sans-serif">Some content</Text> */}
          <TabNav aria-label="Main">
            {TAB_LABELS.map((tab, tabIndex) => {
              return (
                  <TabNav.Link key={tabIndex} href="" selected={(tabnav === tab.name) ? 'selected' : null} onClick={(e)=>{
                    e.preventDefault();
                    setTabnav(tab.name);
                  }}>
                    {tab.label}
                  </TabNav.Link>
              )
            })}
          </TabNav>
          {(tabnav === 'taxon') ?
           <>
             <Box display="flex" pt={3}>
               <Box flexGrow={1}>
                 <FormControl>
                   <FormControl.Label>中文名或學名</FormControl.Label>
                   <Controller
                     name="scientific_name"
                     control={control}
                     render={({
                       field,
                       fieldState,
                       formState,
                     }) => {
                       return <HastQuery fetchResourceName="taxa" single {...field} />;
                     }}
                   />
                 </FormControl>
               </Box>
             </Box>
             <Box
               display="flex"
               borderWidth="3px"
               borderStyle="dashed"
               borderColor="border.default"
               borderRadius={2}
               p={2}
               my={2}
             >
               <Box flexGrow={1}>
                 <FormControl>
                   <FormControl.Label>科名</FormControl.Label>
                   <Controller
                     name="family"
                     control={control}
                     render={({
                       field,
                       fieldState,
                       formState,
                     }) => (<HastQuery fetchResourceName="taxa" queryFilter={{ rank: 'family' }} single {...field} />)}
                   />
                 </FormControl>
                 <FormControl>
                   <FormControl.Label>屬名</FormControl.Label>
                   <Controller
                     name="genus"
                     control={control}
                     render={({
                       field,
                       fieldState,
                       formState,
                     }) => {
                       return (<HastQuery fetchResourceName="taxa" queryFilter={{ rank: 'genus' }} single {...field} />)
                     }}
                   />
                 </FormControl>
                 <FormControl>
                   <FormControl.Label>種名</FormControl.Label>
                   <Controller
                     name="species"
                     control={control}
                     render={({
                       field,
                       fieldState,
                       formState,
                     }) => (<HastQuery fetchResourceName="taxa" queryFilter={{ rank: 'species' }} multiple {...field} />)}
                   />
                 </FormControl>
               </Box>
             </Box>
           </>: null }
          {(tabnav === 'gathering') ?
           <>
             <Box display="flex" pt={3}>
               <Box flexGrow={1}>
                 <FormControl>
                   <FormControl.Label>採集者</FormControl.Label>
                   <Controller
                     name="collector"
                     control={control}
                     render={({
                       field,
                       fieldState,
                       formState,
                     }) => {
                       return <HastQuery fetchResourceName="people" queryFilter={{ collector_id: 1 }} {...field} />;
                     }}
                   />
                 </FormControl>
               </Box>
             </Box>
             <Box display="flex" pt={2}>
               <Box flexGrow={1} pr={2}>
                 <FormControl>
                   <FormControl.Label>採集號</FormControl.Label>
                   <Controller
                     name="field_number"
                     control={control}
                     render={({
                       field,
                     }) => (<TextInput block {...field} />)}
                   />
                 </FormControl>
               </Box>
               <Box flexGrow={1}>
                 <FormControl>
                   <FormControl.Label>採集號2</FormControl.Label>
                   <Controller
                     name="field_number2"
                     control={control}
                     render={({
                       field,
                     }) => (<TextInput block {...field} />)}
                   />
                 </FormControl>
               </Box>
             </Box>
             <Box display="flex" pt={2}>
               <Box flexGrow={1} pr={2}>
                 <FormControl>
                   <FormControl.Label>採集日期</FormControl.Label>
                   <Controller
                     name="collect_date"
                     control={control}
                     render={({
                       field,
                     }) => (<TextInput type="date" block {...field} />)}
                   />
                 </FormControl>
               </Box>
               <Box flexGrow={1}>
                 <FormControl>
                   <FormControl.Label>採集日期2</FormControl.Label>
                   <Controller
                     name="collect_date2"
                     control={control}
                     render={({
                       field,
                     }) => (<TextInput block type="date" {...field} />)}
                   />
                 </FormControl>
               </Box>
             </Box>
             <Box display="flex" pt={2}>
               <Box flexGrow={1}>
                 <FormControl>
                   <FormControl.Label>採集月份</FormControl.Label>
                   <Controller
                     name="collect_month"
                     control={control}
                     render={({
                       field,
                     }) => (
                       <Select {...field} >
                         <Select.Option value="">--</Select.Option>
                         <Select.Option value="1">一月</Select.Option>
                         <Select.Option value="2">二月</Select.Option>
                         <Select.Option value="3">三月</Select.Option>
                         <Select.Option value="4">四月</Select.Option>
                         <Select.Option value="5">五月</Select.Option>
                         <Select.Option value="6">六月</Select.Option>
                         <Select.Option value="7">七月</Select.Option>
                         <Select.Option value="8">八月</Select.Option>
                         <Select.Option value="9">九月</Select.Option>
                         <Select.Option value="10">十月</Select.Option>
                         <Select.Option value="11">十一月</Select.Option>
                         <Select.Option value="12">十二月</Select.Option>
                       </Select>)}
                   />
                 </FormControl>
               </Box>
             </Box>
           </>
           : null }
          {(tabnav === 'locality') ?
           <>
             <Box display="flex" pt={3}>
               <Box flexGrow={1}>
                 <FormControl>
                   <FormControl.Label>詳細地名</FormControl.Label>
                   <Controller
                     name="locality_text"
                     control={control}
                     render={({
                       field,
                     }) => (<TextInput block {...field} />)}
                   />
                 </FormControl>
               </Box>
             </Box>
             <Box
               display="grid"
               gridTemplateColumns="1fr 1fr"
               gridGap={3}
               borderWidth="3px"
               borderStyle="dashed"
               borderColor="border.default"
               borderRadius={2}
               p={2}
               my={2}
             >
               {NAMED_AREAS.map((namedArea, naIndex) => {
                 return (
                   <Box key={naIndex}>
                     <FormControl>
                       <FormControl.Label>{namedArea.label}</FormControl.Label>
                       <Controller
                         name={namedArea.name}
                         control={control}
                         render={({
                           field,
                         }) => {
                           return (<HastQuery
                   fetchResourceName="named_areas"
                 queryFilter={{ area_class_id: namedArea.id }}
                 single
                        {...field} />)}}
                       />
                     </FormControl>
                   </Box>);
               })}
             </Box>
             <Box display="flex" pt={2}>
               <Box flexGrow={1} pr={2}>
                 <FormControl>
                   <FormControl.Label>條件</FormControl.Label>
                   <Controller
                     name="altitude_condiction"
                     control={control}
                     render={({
                       field,
                     }) => (
                       <Select {...field} >
                         <Select.Option value="eq">{"="}</Select.Option>
                         <Select.Option value="gte">{">="}</Select.Option>
                         <Select.Option value="lte">{"<="}</Select.Option>
                         <Select.Option value="between">Between</Select.Option>
                       </Select> )}
                   />
                 </FormControl>
               </Box>
               <Box flexGrow={1} pr={2}>
                 <FormControl>
                   <FormControl.Label>海拔</FormControl.Label>
                   <Controller
                     name="altitude"
                     control={control}
                     render={({
                       field,
                     }) => (<TextInput block {...field} />)}
                   />
                 </FormControl>
               </Box>
               <Box flexGrow={1}>
                 <FormControl>
                   <FormControl.Label>海拔2</FormControl.Label>
                   <Controller
                     name="altitude2"
                     control={control}
                     render={({
                       field,
                     }) => (<TextInput block {...field} />)}
                   />
                 </FormControl>
               </Box>
             </Box>
           </> : null }
          {(tabnav === 'specimen') ?
           <>
             <Box display="flex">
               <Box flexGrow={1} pr={2}>
                 <FormControl>
                   <FormControl.Label>館號</FormControl.Label>
                   <Controller
                     name="accession_number"
                     control={control}
                     render={({
                       field,
                     }) => (<TextInput block {...field} />)}
                   />
                 </FormControl>
               </Box>
               <Box flexGrow={1}>
                 <FormControl>
                   <FormControl.Label>館號2</FormControl.Label>
                   <Controller
                     name="accession_number2"
                     control={control}
                     render={({
                       field,
                     }) => (<TextInput block {...field} />)}
                   />
                 </FormControl>
               </Box>
             </Box>
           </> : null }
        </Dialog>
      )}
    </>
  )
}
const SearchBarz = () => {


//  const [state, dispatch] = useReducer(reducer, initialState)
    const [tokens, setTokens] = React.useState([
    {text: 'zero', id: 0},
    {text: 'one', id: 1},
    {text: 'two', id: 2},
    {text: 'three', id: 3},
    {text: 'four', id: 4},
    {text: 'five', id: 5},
    {text: 'six', id: 6},
    {text: 'seven', id: 7}
    ]);

  const SearchInput = React.forwardRef((props, ref) => (
    <TextInputWithTokens
      preventTokenWrapping
      block
      tokens={[{text: 'zero', id: 0}, {text: 'six', id: 6}]}
    /*onTokenRemove={onTokenRemove}*/
      onChange={(e) => {
        console.log('eee', e.target.value);
        if (e.target.value) {
          /*setV(e.target.value);*/
        }
      }}
    />
  ));

  const SearchOverlay = () => {
    return (
      <Overlay />
    )
  };
  return (
    <>
      {/* <SearchInput ref={anchorRef} /> */}
      {/* <SearchOverlay /> */}
    </>
  )
};

const SearchBary = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const openOverlay = React.useCallback(() => setIsOpen(true), [setIsOpen])
    const closeOverlay = React.useCallback(() => setIsOpen(false), [setIsOpen])
  const noButtonRef = React.useRef(null)
  const anchorRef = React.useRef(null)
  const [tokens, setTokens] = React.useState([
    {text: 'zero', id: 0},
    {text: 'one', id: 1},
    {text: 'two', id: 2},
    {text: 'three', id: 3},
    {text: 'four', id: 4},
    {text: 'five', id: 5},
    {text: 'six', id: 6},
    {text: 'seven', id: 7}
    ])
  return(
    <>
      <TextInputWithTokens
        preventTokenWrapping
        block
        tokens={[{text: 'zero', id: 0}, {text: 'six', id: 6}]}
    /*onTokenRemove={onTokenRemove}*/
        onChange={(e) => {
          console.log('eee', e.target.value);
          if (e.target.value) {
            setOpen(true);
            console.log(anchorRef.current, 'uc');
          }
        }}
        ref={anchorRef}
        autoFocus
      />
      <ActionMenu
        onOpenChange={(x)=> {
        console.log(x, 'xx');
        }}
        open={open}
        anchorRef={anchorRef}
      >
        {/* <ActionMenu.Anchor> */}
        {/* </ActionMenu.Anchor> */}
        <ActionMenu.Overlay
          width="xxlarge"
          onEscape={(e) => {
            console.log(e, 'esc');
            setOpen(false);
          }}
          onClickOutside={(e)=> {
            console.log(e, 'out');
            setOpen(false);
          }}
        >
    <ActionList showDividers>
      <ActionList.Group title="Live query">
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <SearchIcon />
          </ActionList.LeadingVisual>
          repo:github/memex,github/github
        </ActionList.Item>
      </ActionList.Group>
      <ActionList.Divider />
      <ActionList.Group title="Layout" variant="subtle">
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <NoteIcon />
          </ActionList.LeadingVisual>
          Table
          <ActionList.Description variant="block">
            Information-dense table optimized for operations across teams
          </ActionList.Description>
        </ActionList.Item>
        <ActionList.Item role="listitem">
          <ActionList.LeadingVisual>
            <ProjectIcon />
          </ActionList.LeadingVisual>
          Board
          <ActionList.Description variant="block">Kanban-style board focused on visual states</ActionList.Description>
        </ActionList.Item>
      </ActionList.Group>
      <ActionList.Divider />
      <ActionList.Group>
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <FilterIcon />
          </ActionList.LeadingVisual>
          Save sort and filters to current view
        </ActionList.Item>
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <FilterIcon />
          </ActionList.LeadingVisual>
          Save sort and filters to new view
        </ActionList.Item>
      </ActionList.Group>
      <ActionList.Divider />
      <ActionList.Group>
        <ActionList.Item>
          <ActionList.LeadingVisual>
            <GearIcon />
          </ActionList.LeadingVisual>
          View settings
        </ActionList.Item>
      </ActionList.Group>
    </ActionList>
  </ActionMenu.Overlay>
</ActionMenu>
    </>);
}
const SearchBarx = ({tokens, onTokenRemove, onSelectedChange}) => {
  const selectedTokenIds = tokens.map(token => token.id);
  const [selectedItemIds, setSelectedItemIds] = React.useState(selectedTokenIds);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [visibility, setVisibility] = React.useState('hidden');

  const itemGroups = {};
  items.forEach((x) => {
    if (!itemGroups.hasOwnProperty(x.term)) {
      itemGroups[x.term] = [];
    }
    itemGroups[x.term].push(x);
  });
  return (
    <Autocomplete>
      <Autocomplete.Input
        block
        loading={loading}
        as={TextInputWithTokens}
        tokens={tokens}
        onTokenRemove={onTokenRemove}
        onChange={(e)=>{
          // console.log(e.target.value, 'input');
          if (e.target.value) {
            setLoading(true);
            fetch(`${API_URL}/search?q=${e.target.value}`)
              .then((resp) => { return resp.text() })
              .then((body) => { return JSON.parse(body) })
              .then((json) => {
                // add id as index
                const items = json.data.map( (x, i) => ({id: i,             leadingVisual: TERM_ICON_MAP[x.term], ...x}));
                setItems(items);
                setVisibility('visible');
                setLoading(false);
                console.log(items);
              });

          } else {
            setItems([]);
          }
        }}
      />
      <Autocomplete.Overlay
        width="xxlarge"
        onClickOutside={(e)=>{console.log('out', e);}}
        visibility={visibility}
      >
        <ActionList showDividers>
          {[
            {key: 'collector', label: '採集者'},
            {key: 'taxon', label: '物種'},
          ].map((group) => {
            return (
              <ActionList.Group title={group.label} key={group.key}>
              {items.map((item, index)=> {
                return (
                  <ActionList.Item key={index} onSelect={(e)=> {
                    console.log('click', index, items[index]);
                    setVisibility('hidden');
                  }}>
                    <ActionList.LeadingVisual>
                      {TERM_ICON_MAP[item.term]}
                    </ActionList.LeadingVisual>
                    {item.text}
                    <ActionList.Description variant="block">{`${item.term}:${item.object_id}`}</ActionList.Description>
                    <ActionList.TrailingVisual>{`${item.term}:${item.object_id}`}</ActionList.TrailingVisual>
                  </ActionList.Item>
                );
              })}
              </ActionList.Group>
            );
          })}
        </ActionList>
        {/* <Autocomplete.Menu */}
        {/*   items={items} */}
        {/*   selectedItemIds={selectedItemIds} */}
        {/*   onSelectedChange={onSelectedChange} */}
        {/*   selectionVariant="multiple" */}
        {/*   aria-labelledby="autocompleteLabel-searchbar" */}
        {/*   filterFn={ x => x } */}
        {/* /> */}
      </Autocomplete.Overlay>
    </Autocomplete>
  )
};

const justIds = (data) => {
  const filterIds = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof(value) === 'object'){
      if (value.length > 0) {
        value.forEach( x => {
          console.log(x, 'eoua');
          let normKey = (['family', 'genus', 'species'].indexOf(key)>=0) ? 'taxon': key;
          if (!filterIds.hasOwnProperty(normKey)) {
            filterIds[normKey] = [];
          }
          filterIds[normKey].push( x.object_id || x.id );
        });
      }
    }
    else if (value) {
      filterIds[key] = value;
    }
  }
  return filterIds;
};

const toTokens = (filter) => {
  const tokens = [];
  let counter = 0;
  for (const [key, value] of Object.entries(filter)) {
    if (typeof(value) === 'object') {
      if (value.length > 0) {
        value.forEach( x => {
          tokens.push( {
            id:counter,
            text: `${key}:${x.text}`,
            term: x.term,
            object_id: x.id,
          });
          counter++;
        });
      }
    }
    else if (value) {
      tokens.push( {id:counter, text: `${key}:${value}`} );
      counter++;
    }
  }
  console.log('to tokens:', filter, tokens);
  return tokens;
};

export default function HASTSearch() {

  const [state, dispatch] = React.useReducer(reducer, initialArg);

  React.useEffect(()=> {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const q = urlParams.get('q');
    const filter = {};
    // need fetch
    const fetchMap = {
      collector: 'people',
      scientific_name: 'taxa',
      family: 'taxa',
      genus: 'taxa',
      species: 'taxa',
      taxon: 'taxa',
      country: 'named_areas',
      state_province: 'named_areas',
      municipality: 'named_areas',
      national_park: 'named_areas',
      locality: 'named_areas'
    };
    const needFetch = [];
    if (q) {
      q.split(',').forEach( x => {
        const [key, value] = x.split(':');
        if (fetchMap[key]) {
          needFetch.push({
            key: key,
            resource: fetchMap[key],
            item_id: value});
        } else {
          filter[key] = value;
        }
      });

      Promise.all(needFetch.map( x => getOne(x.resource, x.item_id))).then(
        (results) => {
          results.forEach( (v, i) => {
            filter[needFetch[i].key] = [{id: v.json.id, text: v.json.display_name, term: needFetch[i].key, object_id: v.json.id}];
          });
          fetchData({filter});
          const defaultFilter = {
            ...initialArg.filter,
            ...filter,
          };
          dispatch({type: 'SET_FILTER', filter: defaultFilter, isInit: true});
        }
      );
    } else {
      dispatch({type: 'SET_FILTER', filter: initialArg.filter, isInit: true});
    }
  }, []);

  const fetchData = ({page, filter, sort, view=''}) => {
    dispatch({type:'SET_LOADING'});

    const params = {};
    const currentFilter = filter || state.filter;
    const currentSort = sort || state.sort;

    if (page) {
      params['range'] = [(page-1) * state.pagination.pageSize, page * state.pagination.pageSize];
    } else {
      params['range'] = [0, state.pagination.pageSize];
    }

    params['filter'] = justIds(currentFilter);

    if (currentSort) {
      params['sort'] = {[currentSort]: ''}; // desc or asc
    }

    if (view === 'map') {
      params['view'] = 'map';
      params['range'] = [0, 500];
    }
    // console.log('sort', sort, currentSort, params);
    //console.log('params: ', params);
    getList('explore', params)
      .then(({ json }) => {
        console.log('results', json);

        if (view === 'map') {
          dispatch({type: 'SET_MAP_RESULTS', map_results: json });
        } else {
          const pageCount = Math.ceil(json.total / state.pagination.pageSize) || 1;
          const currentPage = page || 1;
          dispatch({type: 'SET_RESULTS', results: json, currentPage: currentPage, pageCount: pageCount});
        }
      });
    };

  const onPageChange = (e, page) => {
    e.preventDefault()
    fetchData({page});
  };

  const onSortChange = (sort) => {
    dispatch({type:'SET_SORT', sort: sort })
    fetchData({sort: sort});
  }
  console.log('hastsearch', state);

  return (
    <ThemeProvider>
      <Pagehead>Search HAST specimens{/*Search 120,000 of the HAST's specimens*/}</Pagehead>
      { state.isInit && <QueryForm state={state} dispatch={dispatch} filter={state.filter} /> }
      {(state.isLoading) ? <Box display="flex" justifyContent="center" m={4}><Spinner /></Box> : null}
      {state.results && state.isLoading === false &&
       <Box mt={2}>
         {/* <UnderlineNav aria-label="Main"> */}
         {/*   <UnderlineNav.Link href="#" selected={state.view === 'table'}>表格</UnderlineNav.Link> */}
         {/*   <UnderlineNav.Link href="#" selected={state.view === 'gallery'}>圖片</UnderlineNav.Link> */}
         {/*   <UnderlineNav.Link href="#" selected={state.view === 'map'}>地圖</UnderlineNav.Link> */}
         {/* </UnderlineNav> */}
         <SegmentedControl aria-label="Results view" onChange={ (selectedIndex) => {
           const view = ['table', 'gallery', 'map'][selectedIndex];
           if (view === 'map') {
             fetchData({view:'map'});
           } else {
             dispatch({type: 'SET_VIEW', view: view});
           }
         }}>
           <SegmentedControl.Button selected={state.view === 'table'}>表格</SegmentedControl.Button>
           <SegmentedControl.Button selected={state.view === 'gallery'}>標本照</SegmentedControl.Button>
           <SegmentedControl.Button selected={state.view === 'map'}>地圖</SegmentedControl.Button>
         </SegmentedControl>
         <Box my={4}>
           <ResultView results={state.results} pagination={state.pagination} onSortChange={onSortChange} sort={state.sort} view={state.view} mapResults={state.map_results} />
         </Box>
         <Pagination pageCount={state.pagination.pageCount} currentPage={state.pagination.currentPage} onPageChange={onPageChange} />
       </Box>}
    </ThemeProvider>
  );
}


/*
const UnitCells = ({units}) => {
  if (units.length === 1) {
    return (
      <>
        <td>
          <img src={units[0].image_url || ''} width="45" />
        </td>
        <td>
          {(units[0].accession_number) ? <a href={`/specimens/HAST:${units[0].accession_number}`} className="text is-link"> {units[0].accession_number || ''}</a> : null}
        </td>
      </>
    )
  } else if (units.length > 1) {
    return (
      <>
      <td>
      {units.map((unit, unit_index) => {
        return (
          <li className="item" key={unit_index}>
          <img src={unit.image_url || ''} width="45" />
          </li>
        );
      })}
      </td>
        <td>
          <ul className="list is-disc">
            {units.map((unit, unit_index) => {
              return (
                <li className="item" key={unit_index}>
                  {(unit.accession_number) ? <a href={`/specimens/HAST:${unit.accession_number}`} className="text is-link"> {unit.accession_number || ''}</a> : null}
                </li>
              );
            })}
          </ul>
        </td>
      </>
    )
  }
};
*/

const ResultView = ({results, pagination, onSortChange, sort, view, mapResults, foo}) => {
  const [checked, setChecked] = React.useState(Array(20).fill(false));
  const sortMap = {
    created: '新增日期',
    taxon: '學名',
    collect_number: '採集號',
    collect_date: '採集日期',
  }
  return (
    <>
      {(view !== 'map') ?
       <>
       <Box my={2}>
         <Text>{results.total.toLocaleString()} 筆 - 查詢時間: {results.elapsed.toFixed(2)} seconds (total: {results.elapsed_count.toFixed(2)}, mapping: {results.elapsed_mapping.toFixed(2)})</Text>
       </Box>
       {/*
          <Box my={2}>
          Filter by:
          <LabelGroup>
          <Label>科名/Family</Label>
          <Label outline>屬名/Genus</Label>
          <Label outline>採集者</Label>
          </LabelGroup>
          </Box>*/}
       <Box display="flex" justifyContent="space-between" py={2}>
      <Box>
        <Button onClick={(e)=> {
          const unitIds = [];
          checked.forEach( (v, i) => {
              if (v === true) {
                unitIds.push(results.data[i].unit_id);
              }
            });
            const ids = unitIds.join(',');
            window.open(`${BASE_URL}/print-label?ids=${ids}`, '_blank');
          }}>列印標籤</Button>
        </Box>
        <Box>
          <ActionMenu>
            <ActionMenu.Button>排序: {(sort ==='') ? '採集號' : sortMap[sort]}</ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList selectionVariant="single">
                <ActionList.Item selected={(sort === 'collect_number' || sort === '') ? true : false} onSelect={e => onSortChange('collect_number')}>採集者/號</ActionList.Item>
                <ActionList.Item selected={(sort === 'collect_date') ? true : false} onSelect={e => onSortChange('collect_date')}>採集日期</ActionList.Item>
                <ActionList.Item selected={(sort === 'taxon') ? true : false} onSelect={e => onSortChange('taxon')}>學名</ActionList.Item>
                <ActionList.Item selected={(sort === 'created') ? true : false} onSelect={e => onSortChange('created')}>新增日期</ActionList.Item>
                {/*
                   <ActionList.Divider />
                   <ActionList.Item variant="danger">Delete file</ActionList.Item>
                */}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
       </Box>
       </Box>
       </> : null}
      {(view === 'table') ?
       <table className="table is-border is-stripe">
         <thead>
           <tr className="box is-paint"><th><Checkbox id="checkbox-all" onChange={(e)=>{
             setChecked(Array(20).fill(e.target.checked)); // TODO: default page size
           }}/></th><th>#</th><th>標本照</th><th>館號</th><th>物種</th><th>採集號</th><th>採集日期</th><th>採集地點</th></tr>
         </thead>
         <tbody>
           {results.data.map((v, i) => {
             let scientificName = '';
             let commonName = '';
             if (v.taxon) {
               const nameList = v.taxon.split('|');
               if (nameList.length > 1) {
                 scientificName = nameList[0];
                 commonName = nameList[1];
               }
             }
             const namedAreas = v.named_areas.map(x => x.name);
             return (
               <tr key={i}>
                 <td>
                   <Checkbox id={`checkbox-${i}`} checked={checked[i]} onChange={(e) => {
                     const index = parseInt(e.target.id.split('-')[1], 10);
                     const newState = [...checked];
                     newState[index] = true;
                     setChecked(newState);
                   }}/>
                 </td>
                 <td>{(i+1)+(pagination.currentPage-1)*pagination.pageSize}<div><a href={`${ADMIN_URL}/collections/${v.collection_id}`} target="_blank" className="text is-link is-xs">edit</a></div></td>
                 {/*<UnitCells units={v.units}/>*/}
                 <td><a href={`${BASE_URL}/specimens/HAST:${v.accession_number}`} className="text is-link"> <img src={v.image_url} style={{height: '75px'}} /></a></td>
                 <td><a href={`${BASE_URL}/specimens/HAST:${v.accession_number}`} className="text is-link"> {v.accession_number || ''}</a></td>
                 <td>{scientificName}<br/>{commonName}</td>
                 <td>{ v.collector?.display_name } {v.field_number}<div>{scientificName}</div></td>
                 <td><span className="text is-dark9 font-size-xs">{ v.collect_date }</span></td>
                 <td>
                   <div>{ namedAreas.join('/') }</div>
                   <div>{v.locality_text}</div>
                   <div><>海拔: {v.altitude}{(v.altitude2) ? ` -  ${v.altitude2}`:''}</></div>
                   <div>經緯度: {v.longitude_decimal}, {v.latitude_decimal}</div>
                 </td>
               </tr>);
           })}
         </tbody>
       </table>
       : null}
      {(view === 'gallery') ?
       <>
         <div className="grid is-gap-md">
           {results.data.map((v, i) => {
             let scientificName = '';
             if (v.taxon) {
               const nameList = v.taxon.split('|');
               if (nameList.length > 1) {
                 scientificName = nameList[0];
               }
             }
             const namedAreas = v.named_areas.map(x => x.name);
             return (
               <div className="column is-3" key={i}>
                 <div>
                   <a href={`${BASE_URL}/specimens/HAST:${v.accession_number}`} className="text is-link">
               <img src={v.image_url.replace('_s', '_m')} style={{height: '350px'}} />
                   </a>
                   <div className="is-sm">{scientificName}</div>
                   <div className="is-sm">{ v.collector?.display_name } {v.field_number}</div>
                   <div className="is-sm">{(v.collect_date) ? v.collect_date : null}</div>
                   <div className="is-sm badge is-plain">{v.accession_number}</div>
                   <div className="is-sm">{ namedAreas.join('/') }</div>
                 </div>
               </div>);
           })}
         </div>
       </>
       : null}
      {(view === 'map' && mapResults) ?
       <>
         {(mapResults.data.length >= 500) ? <Text>(只顯示 500 筆內的點位)</Text> : null}
         <LeafletMap data={mapResults.data} />
       </>
       : null}
    </>
  )
};
