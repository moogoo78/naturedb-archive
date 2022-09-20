import React, { useState } from 'react';

import QueryForm from './QueryForm';
import { ResultView } from './ResultView';
import  HASTSearch from './HASTSearch';

import 'musubii/dist/musubii.min.css';
import 'query-specimen.css';
import { getList } from './Utils'

const HOST_URL = process.env.BASE_URL;

const AppContext = React.createContext({});


const initialState = {
  isLoading: false,
  filters: {},
  result: null,
  isHideFilters: false,
  pageSize: 20,
  pageIndex: 0,
};

function reducer(state, action) {
  switch (action.type) {
  case 'START_LOADING':
    return {
      ...state,
      isLoading: true,
    };
  case 'SET_FILTERS_DISPLAY':
    return {
      ...state,
      isHideFilters: (action.value) ? false : true,
    };
  case 'UPDATE_FILTERS':
    let tmp = {...state.filters};
    if (action.value) {
      // set every value to Array, for future more flexible query
      tmp[action.name] = [action.value];
    } else {
      delete tmp[action.name];
    }
    return {
      ...state,
      filters: tmp,
    };
  case 'SET_ROWS':
    let newState = {
      ...state,
      isLoading: false,
      isHideFilters: (action.result.data) ? true : false,
    };
    if (action.pageIndex >= 0) {
      newState.pageIndex = action.pageIndex;
    }
    if (action.pageSize) {
      newState.pageSize = action.pageSize;
    }
    if (action.result) {
      newState.result = action.result;
    }
    return newState;

  default:
    throw new Error();
  }
}
const App = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const initialContext = {
    apiUrlPrefix: `${HOST_URL}/api/v1`
  };

  const fetchData = (props) => {
    console.log(props, state);
    let params = {};
    let pageIndex = (props && props.hasOwnProperty('pageIndex')) ? props.pageIndex : state.pageIndex;
    let pageSize = (props && props.hasOwnProperty('pageSize')) ? props.pageSize : state.pageSize;
    if (props) {
      if (props.hasOwnProperty('pageSize')) {
        params['range'] = [0, pageSize];
      } else if (props.hasOwnProperty('pageIndex')) {
        params['range'] = [(pageIndex) * pageSize, (pageIndex + 1) * pageSize];
      }
    }
    else {
      pageIndex = 0;
      pageSize = 0;
    }
    // re-count total only if filter change
    if (state.result && state.result.total >= 0) {
      params['total'] = state.result.total;
    }

    // params['filter'] = state.filters;
    let filter = {...state.filters};
    if (state.filters.hasOwnProperty('collect_date') && state.filters.hasOwnProperty('collect_date2')) {
      let collectDateMerged = `${state.filters.collect_date}/${state.filters.collect_date2}`;
      filter.collect_date = [collectDateMerged];
      delete filter.collect_date2;
    }
    if (state.filters.hasOwnProperty('field_number') && state.filters.hasOwnProperty('field_number2')) {
      let fieldNumberRange = [state.filters.field_number[0], state.filters.field_number2[0]];
      filter.field_number_range = [fieldNumberRange];
      delete filter.field_number;
      delete filter.field_number2;
    }

    params['filter'] = filter;
    //const filters = JSON.stringify(state.filters);
    //const filtersQS = encodeURIComponent(filters);
    //const rangeQS = encodeURIComponent('[0,9]')
    console.log('params: ', params, pageIndex);
    getList('collections', params)
      .then(({ json }) => {
        console.log('getList', json);
        dispatch({type: 'SET_ROWS', result: json, pageIndex: pageIndex, pageSize: pageSize});
        console.log(json);
      });
  }

  console.log('🐔', state);
  return (
    <>
      <AppContext.Provider value={initialContext}>
        <HASTSearch />

      </AppContext.Provider>
    </>
  )
}

export { App, AppContext }

/*
        <a className="button is-plain is-info is-0 is-angle-right is-angle-down" type="button" href="#" onClick={(e)=> {
          if (state.isHideFilters === true) {
            dispatch({type:'SET_FILTERS_DISPLAY', value: true});
          } else if (state.isHideFilters === false) {
            dispatch({type:'SET_FILTERS_DISPLAY', value: false});
          }
        }}>顯示篩選條件</a>
        {(state.isHideFilters !== true) ? <QueryForm state={state} dispatch={dispatch} fetchData={fetchData} /> : null}
        {(state.isLoading) ? <h1 style={{ width: '150px', margin: 'auto', fontSize:'22px'}}>loading...</h1> : null}
        {(state.result !== null) ? <ResultView state={state} dispatch={dispatch} fetchData={fetchData} /> : null}
*/
