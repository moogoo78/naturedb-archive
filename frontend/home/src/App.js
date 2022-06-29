import React, { useState } from 'react';

import QueryForm from './QueryForm';
import { ResultView } from './ResultView';

import 'musubii/dist/musubii.min.css';
import 'query-specimen.css';

const HOST_URL = process.env.BASE_URL;

const AppContext = React.createContext({});


const initialState = {
  isLoading: false,
  filters: {},
  result: null,
  isHideFilters: false,
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
    if (action.pageIndex) {
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
  console.log('🐔', state);
  return (
    <>
      <AppContext.Provider value={initialContext}>
        <a className="button is-plain is-info is-0 is-angle-right is-angle-down" type="button" href="#" onClick={(e)=> {
          if (state.isHideFilters === true) {
            dispatch({type:'SET_FILTERS_DISPLAY', value: true});
          } else if (state.isHideFilters === false) {
            dispatch({type:'SET_FILTERS_DISPLAY', value: false});
          }
        }}>顯示篩選條件</a>
        {(state.isHideFilters !== true) ? <QueryForm state={state} dispatch={dispatch} /> : null}
        {(state.isLoading) ? <h1 style={{ width: '150px', margin: 'auto', fontSize:'22px'}}>loading...</h1> : null}
        {(state.result !== null) ? <ResultView state={state} /> : null}
      </AppContext.Provider>
    </>
  )
}

export { App, AppContext }
