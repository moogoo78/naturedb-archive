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
} from '@primer/react';
import {Dialog} from '@primer/react/drafts';

import {
  SearchIcon,
  ChevronDownIcon,
} from '@primer/octicons-react'
import {
  useForm,
  Controller,
} from "react-hook-form";

import {
  FreeAutocomplete,
  FetchControllerMulti,
} from './Helpers';
import {
  getList,
  getOne,
} from './Utils';

const BASE_URL = process.env.BASE_URL;

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
  case 'SET_RESULT_VIEW':
    return {
      ...state,
      resultView: action.view,
    }
  default:
    throw new Error();
  }
};

const initialArg = {
  isLoading: false,
  isInit: false,
  filter: {
    collector: [],
    common_name: '',
    family: '',
    genus: '',
    species: '',
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
  },
  pagination: {
    currentPage: 1,
    pageCount: 1,
    pageSize: 20,
  },
  results: null,
  resultView: 'table',
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

  // console.log(filter, 'form init filter', getValues());
  const onSubmit = data => {
    console.log('submit', data)

    //fetchData({filterWithId});
    const filterIds = getFilterWithId(data);
    const params = new URLSearchParams(filterIds);
    const qsList = [];
    params.forEach((value, key) => {
      qsList.push(`${key}:${value}`);
    });
    const queryString = qsList.join(',');
    window.location.replace(`?q=${queryString}`);
  };

  // set search bar tokens
  const tokens = [];
  let counter = 0;
  for (const [key, value] of Object.entries(filter)) {
    if (typeof(value) === 'object') {
      if (value.length > 0) {
        value.forEach( x => {
          tokens.push( {id:counter, text: `${key}:${x.text}`} );
          counter++;
        });
      }
    }
    else if (value) {
      tokens.push( {id:counter, text: `${key}:${value}`} );
      counter++;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box display="flex">
        <Box flexGrow={12} pr={1}>
          <SearchBar tokens={tokens} onTokenRemove={(tokenId)=>{
            const deleteKey = tokens[tokenId].text.split(':')[0];
            let newFilter = {...filter};
            delete newFilter[deleteKey];
            setValue(deleteKey, '');
            dispatch({type:'SET_FILTER', filter: newFilter });
          }} />
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
            //dispatch({type:'SET_DATA', name:'common_name', value: form.getValues().common_name});
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
                     name="common_name"
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
                   <FormControl.Label>地名</FormControl.Label>
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
                     name="condiction"
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

const SearchBar = ({tokens, onTokenRemove}) => {
  return (
    <TextInputWithTokens
      block
      tokens={tokens}
      onTokenRemove={onTokenRemove}
    />
  );
};

const getFilterWithId = (data) => {
  const filterIds = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof(value) === 'object'){
      if (value.length > 0) {
        filterIds[key] = [];
        value.forEach( x => {
          filterIds[key].push( x.id );
        });
      }
    }
    else if (value) {
      filterIds[key] = value;
    }
  }
  return filterIds;
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
      family: 'taxa',
      genus: 'taxa',
      species: 'taxa',
      country: 'named_area',
      state_province: 'named_area',
      municipality: 'named_area',
      national_park: 'named_area',
      locality: 'named_area'
    };
    const needFetch = [];
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
          filter[needFetch[i].key] = [{id: v.json.id, text: v.json.display_name}];
        });

        //const filterIds = getFilterWithId(filter);
        fetchData({filter});
        dispatch({type: 'SET_FILTER', filter: filter, isInit: true});
      }
    );
  }, []);

  const fetchData = ({page, filter}) => {
    dispatch({type:'SET_LOADING'});
    const params = {};
    const currentFilter = filter || state.filter;

    if (page) {
      params['range'] = [(page-1) * state.pagination.pageSize, page * state.pagination.pageSize];
    } else {
      params['range'] = [0, state.pagination.pageSize];
    }

    params['filter'] = getFilterWithId(currentFilter);
    //console.log('params: ', params);
    getList('explore', params)
      .then(({ json }) => {
        console.log('results', json);
        const pageCount = Math.ceil(json.total / state.pagination.pageSize) || 1;
        const currentPage = page || 1;
        dispatch({type: 'SET_RESULTS', results: json, currentPage: currentPage, pageCount: pageCount});
      });
    };

  const onPageChange = (e, page) => {
    e.preventDefault()
    fetchData({page});
  };

  console.log('hastsearch', state);

  return (
    <ThemeProvider>
      <Pagehead>Search HAST specimens{/*Search 120,000 of the HAST's specimens*/}</Pagehead>
      { state.isInit && <QueryForm state={state} dispatch={dispatch} filter={state.filter}/> }
      {(state.isLoading) ? <Box display="flex" justifyContent="center" m={4}><Spinner /></Box> : null}
      {state.results && state.isLoading === false &&
       <Box mt={2}>{/*
         <UnderlineNav aria-label="Main">
           <UnderlineNav.Link href="#" selected>
             表格
           </UnderlineNav.Link>
           <UnderlineNav.Link href="#">標籤</UnderlineNav.Link>
           <UnderlineNav.Link href="#">照片</UnderlineNav.Link>
         </UnderlineNav>
                    */}
         {/*
         <SegmentedControl aria-label="Results view" onChange={ (selectedIndex) => {
           dispatch({type: 'SET_RESULT_VIEW', view: ['table', 'list', 'gallery'][selectedIndex]});
         }}>
           <SegmentedControl.Button selected={state.resultView === 'table'}>表格</SegmentedControl.Button>
           <SegmentedControl.Button selected={state.resultView === 'list'}>條列</SegmentedControl.Button>
           <SegmentedControl.Button selected={state.resultView === 'gallery'}>照片</SegmentedControl.Button>
         </SegmentedControl>
          */}
         <Box my={4}>
           <ResultView results={state.results} pagination={state.pagination}/>
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

const ResultView = ({results, pagination}) => {
  const [checked, setChecked] = React.useState(Array(20).fill(false));

  return (
    <>
    <Box my={2}>
      <Text>{results.total.toLocaleString()} 筆 - 查詢時間: {results.elapsed.toFixed(2)} seconds (total: {results.elapsed_count.toFixed(2)}, mapping: {results.elapsed_mapping})</Text>
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
              <td>{(i+1)+(pagination.currentPage-1)*pagination.pageSize}</td>
              {/*<UnitCells units={v.units}/>*/}
            <td><a href={`/specimens/HAST:${v.accession_number}`} className="text is-link"> <img src={v.image_url} style={{height: '75px'}} /></a></td>
              <td><a href={`/specimens/HAST:${v.accession_number}`} className="text is-link"> {v.accession_number || ''}</a></td>
              <td>{scientificName}<br/>{commonName}</td>
              <td>{ v.collector?.display_name } {v.field_number}</td>
              <td><span className="text is-dark9 font-size-xs">{ v.collect_date }</span></td>
              <td>{ namedAreas.join('/') }</td>
            </tr>);
        })}
      </tbody>
          </table>
    </>
  )
};
