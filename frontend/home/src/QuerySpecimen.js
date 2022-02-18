import React, { useState } from 'react';
import './musubii.min.css';
import Autocomplete from './Autocomplete';

const apiUrlPrefix = 'http://127.0.0.1:5000/api/v1';
const apiUrl = `${apiUrlPrefix}/specimens`;

export function QuerySpecimen() {
  const [data, setData] = useState({
    isLoading: false,
    result: null,
    errMsg: '',
    isCloseErrMsg: true,
    currentPage: 1,
  });
  const [formData, setFormData] = useState({});


  const fetchServer = (url, page=1) => {
    setData({
      ...data,
      isLoading: true,
    });
    console.log('fetch', url);
    return fetch(url, {
      method: 'GET',
    })
      .then(response => response.json())
      .then((resp) => {
        console.log('resp', resp, data, page);
        setData({
          ...data,
          isLoading: false,
          result: resp,
          currentPage: page,
        });
      })
      .catch(error => {
        setData({
          ...data,
          errMsg: error.message,
          isCloseErrMsg: false,
        });
      });
  };

  const handleSubmit = (e) => {
    const filter = JSON.stringify(formData);
    const filterQS = encodeURIComponent(filter);
    const rangeQS = encodeURIComponent('[0,9]')
    const url = `${apiUrl}?filter=${filterQS}&range=${rangeQS}&sort=["unit.id","DESC"]`;
    return fetchServer(url);
  }

  const handleInput = (e, name, value) => {
    const getName = (name === undefined && e.target.name) ? e.target.name : name;
    const getValue = (value === undefined && e.target.value) ? e.target.value : value;

    console.log(getName, getValue);
    setFormData({
      ...formData,
      [getName]: getValue,
    });
  }

  const lastPage = (data.result && data.result.total) ? Math.ceil(data.result.total / 10) : 1;

  const handlePagination = (page) => {
    let p = Math.max(1, page);
    p = Math.min(p, lastPage);

    const start = (page-1) * 10;
    const end = start + 9;
    const filter = JSON.stringify(formData);
    const filterQS = encodeURIComponent(filter);
    const rangeQS = encodeURIComponent(`[${start},${end}]`);
    const url = `${apiUrl}?filter=${filterQS}&range=${rangeQS}&sort=["unit.id","DESC"]`;

    return fetchServer(url, p)
  }

  const RenderTable = ({result, currentPage}) => {
    //console.log(result);
      return (
        <>
          <div>found: {result.total.toLocaleString()} in {result.elapsed.toFixed(2)} seconds</div>
          <table className="table is-border is-stripe">
            <thead>
              <tr><th></th><th>館號</th><th>物種</th><th>採集者/號</th><th></th><th></th></tr>
            </thead>
            <tbody>
              {result.data.map((v, i)=>
                (<tr key={i}><td><a href={`http://localhost:5000/specimens/hast:${v.accession_number}`} className="text is-link">view</a></td><td>{ v.accession_number }</td><td>{(v.identification_last)? v.identification_last.taxon.full_scientific_name:''}</td><td><div>{ v.collection.collector.display_name } {v.collection.field_number}</div><span className="text is-dark9 font-size-xs">{v.collection.collect_date}</span></td><td></td><td></td></tr>)
              )}
            </tbody>
          </table>
          <div className="is-padding-vertical-lg">
            <button className="button is-outline is-info" type="button" onClick={(e)=>handlePagination(1)}>1</button>{(lastPage > 1) ? <> <button className="button is-outline is-primary" type="button" onClick={(e)=>handlePagination(currentPage-1)}>上一頁</button> {currentPage} <button className="button is-outline is-primary" type="button" onClick={(e)=>handlePagination(currentPage+1)}>下一頁</button> <button className="button is-outline is-info" type="button" onClick={(e)=>handlePagination(lastPage)}>{lastPage}</button></> : null}
          </div>
        </>
      )
  }

  console.log('render', data);

  return (
    <>
      <div className="card is-padding-lg is-outline">
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">關鍵字</div>
          <div className="column is-10">
            <input className="input" type="text" name="q" onChange={handleInput} disabled />
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">學名</div>
          <div className="column is-10">
            <input className="input" type="text" name="text" placeholder="Text" />
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">採集者</div>
          <div className="column is-10">
            <Autocomplete name="collector_id" label="採集者" apiUrl={`${apiUrlPrefix}/people`} source="display_name" onChange={handleInput} value={formData.collector_id}/>
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">採集號</div>
          <div className="column is-3">
            <input className="input" type="text" name="field_number" onChange={handleInput} />
          </div>
          <div className="column is-7">
            <span style={{margin:'0 20px 0 -30px'}}> - </span><input className="input" type="text" name="field_number2" onChange={handleInput}  value={formData.field_number2} />
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">採集日期</div>
          <div className="column is-10">
            <input className="input" type="text" name="collect_date" onChange={handleInput} />
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">採集地點</div>
          <div className="column is-10">
            <input className="input" type="text" name="locality_text" onChange={handleInput} />
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">館號</div>
          <div className="column is-10">
            <input className="input" type="text" name="accession_number" onChange={handleInput} />
          </div>
        </div>
        <button className="button is-plain is-primary" type="button" onClick={handleSubmit}>查詢</button>
        { (data.errMsg) ?
          <div className="alert is-danger is-tail-top-left" onClick={()=>setData({...data, isCloseErrMsg: true})}>
            <i aria-hidden="true" className="fas fa-times is-danger is-fit is-margin-right-xxs"></i>
            <span className="ytext is-danger">{data.errMsg}</span>
          </div>
          : ''
        }
        <div className="box is-padding-vertical-md is-margin-top-md">
          {(data.isLoading) ? <h1>loading...</h1> :
           (data.result) ? <RenderTable result={data.result} currentPage={data.currentPage}/> : null
          }
        </div>
      </div>
    </>
  )
}
