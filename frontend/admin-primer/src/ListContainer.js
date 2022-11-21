import React from 'react';
import {
  Autocomplete,
  IconButton,
  Box,
  Button,
  Pagehead,
  Pagination,
  Spinner,
  TextInputWithTokens,
} from '@primer/react';
import {
  SearchIcon,
} from '@primer/octicons-react';
import {
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";

import {
  getList,
} from './Utils';


const ListContext = React.createContext(null);

const initialState = {
  isLoading: false,
  isInit: false,
  filter: {},
  sort: '',
  pagination: {
    currentPage: 1,
    pageCount: 1,
    pageSize: 20,
  },
  results: null,
  checked: [],
};

const reducer = (state, action) => {
  switch (action.type) {
  case 'SET_FILTER':
    return {
      ...state,
      filter: action.filter,
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
  // case 'SET_VIEW':
  //   return {
  //     ...state,
  //     view: action.view,
  //   }
  default:
    throw new Error();
  }
};

const ListContainer = ({title, resource, SearchBox, truncFilterIdFn, getListName, renderResults, ListToolbar}) => {
  const navigate = useNavigate();
  const [state, dispatch] = React.useReducer(reducer, initialState);

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

      params['filter'] = truncFilterIdFn(currentFilter);

    if (currentSort) {
      params['sort'] = {[currentSort]: ''}; // desc or asc
    }

    // console.log('sort', sort, currentSort, params);
    //console.log('params: ', params);
    getList(getListName, params)
      .then(({ json }) => {
        console.log('results', json);
        const pageCount = Math.ceil(json.total / state.pagination.pageSize) || 1;
        const currentPage = page || 1;
        dispatch({type: 'SET_RESULTS', results: json, currentPage: currentPage, pageCount: pageCount});
      });
    };

  const handleSubmit = () => {
    // console.log(state.filter);
    fetchData(state.filter);
  };

  const onPageChange = (e, page) => {
    e.preventDefault()
    fetchData({page});
  };

  const onSortChange = (sort) => {
    dispatch({type:'SET_SORT', sort: sort })
    fetchData({sort: sort});
  };

  return (
    <>
      <ListContext.Provider value={{ state, dispatch }}>
        <Pagehead>{title}</Pagehead>
        {/* <Button onClick={(e) => { */}
        {/*   navigate(`/${resource}/create`, {replace: true}) */}
        {/* }} variant="primary">新增</Button>  */}
        <Box display="flex">
          <Box flexGrow={2} mr={2}>
            <SearchBox />
          </Box>
          <Box flexGrow={0} ml={2}>
            <IconButton aria-label="Search" icon={SearchIcon} size="large" onClick={handleSubmit}/>
          </Box>
          <Box flexGrow={0}>
            <ListToolbar />
          </Box>
        </Box>
        {(state.isLoading) ? <Box display="flex" justifyContent="center" m={4}><Spinner /></Box> : null}
        {state.results && state.isLoading === false &&
         renderResults(state.results)}
        <Pagination pageCount={state.pagination.pageCount} currentPage={state.pagination.currentPage} onPageChange={onPageChange} />
      </ListContext.Provider>
    </>
  )
};



const SearchBox = ({queryURL, formatItemsFn, renderItems, handleItemSelect, formatTokensFn}) => {
  const { state, dispatch } = React.useContext(ListContext);

  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  //const [visibility, setVisibility] = React.useState('hidden');
  const [showMenu, setShowMenu] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const tokens = formatTokensFn(state.filter);

  const onItemSelect = (item) => {
    const newFilter = handleItemSelect(state.filter, item);
    dispatch({type: 'SET_FILTER', filter: newFilter});

    setShowMenu(false);
    setInputValue('');
  };

  console.log('state', state, 'tokens', tokens);

  return (
    <Autocomplete>
      <Autocomplete.Input
        block
        loading={loading}
        as={TextInputWithTokens}
        tokens={tokens}
        onTokenRemove={(tokenId) => {
          const deleteKey = tokens[tokenId].term;
          let newFilter = {...state.filter};
          delete newFilter[deleteKey];
          dispatch({type:'SET_FILTER', filter: newFilter });
        }}
        value={inputValue}
        onChange={(e)=>{
          // console.log(e.target.value, 'input');
          if (e.target.value) {
            setLoading(true);
            const searchURL = queryURL.replace('__VALUE__', e.target.value);
            fetch(searchURL)
              .then((resp) => { return resp.text() })
              .then((body) => { return JSON.parse(body) })
              .then((json) => {
                // add id as index
                // console.log(json.data,'json');
                const items = formatItemsFn(json.data);
                setItems(items);
                setShowMenu(true);
                setLoading(false);
                // console.log(items);
                setInputValue(e.target.value);
              });
          } else {
            setItems([]);
          }
        }}
      />
      <Autocomplete.Overlay
        width="xxlarge"
        onClickOutside={(e)=>{setShowMenu(false);}}
        visibility={(showMenu === true) ? 'visible': 'hidden'}
      >
        {renderItems(items, onItemSelect)}
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

export { ListContainer, SearchBox }
