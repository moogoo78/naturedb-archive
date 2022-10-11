import React  from 'react';
import Autocomplete from './Autocomplete';

import { AppContext } from './App';

export default function QueryForm({state, dispatch, fetchData}) {
  const context = React.useContext(AppContext);

  const handleInput = (e, name, value) => {
    // console.log('input', e.target.value, name, value);
    dispatch({type:'UPDATE_FILTERS', name: name, value: value});
  };

  const fetchServer = (url, page=1) => {
    //dispatch({type: });
    console.log('fetch', url);
    return fetch(url, {
      method: 'GET',
    })
      .then(response => response.json())
      .then((resp) => {
        console.log('resp', resp, data, page);
      })
      .catch(error => {

      });
    };

  const handleSubmit = (e) => {
    dispatch({type: 'START_LOADING'});
    fetchData();
  }

  return (
    <div className={"card is-padding-lg is-outline"}>
      <fieldset>
        <legend>Scientific Name</legend>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">學名</div>
          <div className="column is-10">
            <Autocomplete name="taxon" label="學名" apiUrl={`${context.apiUrlPrefix}/taxa`} source="display_name" onChange={(e, name, value) => { handleInput(e, 'taxon', value)}} value={state.filters.taxon || ''}/>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Gathering</legend>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">採集者</div>
          <div className="column is-10">
            <Autocomplete name="collector_id" label="採集者" apiUrl={`${context.apiUrlPrefix}/people`} source="display_name" onChange={(e, name, value) => handleInput(e, 'collector', value) } value={state.filters.collector || ''} />
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">採集號</div>
          <div className="column is-3">
            <input className="input" type="text" name="field_number" onChange={(e)=> handleInput(e, 'field_number', e.target.value)} value={state.filters.field_number || ''}/>
          </div>
          <div className="column is-7">
            <span style={{margin:'0 20px 0 -30px'}}> - </span><input className="input" type="text" name="field_number2" onChange={(e) => handleInput(e, 'field_number2', e.target.value)}  value={state.filters.field_number2 || ''} />
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">採集日期</div>
          <div className="column is-3">
            <input className="input" type="date" name="collect_date" onChange={(e) => handleInput(e, 'collect_date', e.target.value)} value={state.filters.collect_date || ''}/>
          </div>
          <div className="column is-7">
            <span style={{margin:'0 30px 0 -30px'}}> - </span>
            <input className="input" type="date" name="collect_date2" onChange={(e) => handleInput(e, 'collect_date2', e.target.value)} value={state.filters.collect_date2 || ''}/>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Specimen</legend>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">館號</div>
          <div className="column is-10">
            <input className="input" type="text" name="accession_number" onChange={(e) => handleInput(e, 'accession_number', e.target.value)} value={state.filters.accession_number || '' }/>
          </div>
        </div>
      </fieldset>
        {/*
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">關鍵字</div>
          <div className="column is-10">
            <input className="input" type="text" name="q" onChange={handleInput} disabled />
          </div>
        </div>
         */}


        {/*
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">採集地點</div>
          <div className="column is-10">
            <input className="input" type="text" name="locality" onChange={handleInput} />
          </div>
        </div>
         */}
      <button className="button is-plain is-primary box is-margin-vertical-sm" type="button" onClick={handleSubmit}>查詢</button>
    </div>
  )
}
