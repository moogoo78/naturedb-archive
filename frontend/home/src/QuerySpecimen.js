import React, { useState } from 'react';
import './musubii.min.css';

const apiURL = 'http://127.0.0.1:5000/api/v1/specimens';

export function QuerySpecimen() {
  const [data, setData] = useState({
    isLoading: false,
    result: null,
    errMsg: '',
    isCloseErrMsg: true,
    currentPage: 1,
  });
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    const filter = JSON.stringify(formData);
      //ange=[0%2C9]&sort=["collection.id"%2C"DESC"]'
    const filterQS = encodeURIComponent(filter);
    const rangeQS = encodeURIComponent('[0,9]')
    const url = `${apiURL}?filter=${filterQS}&range=${rangeQS}&sort=["unit.id","DESC"]`;
    console.log(apiURL);

    setData({
      ...data,
      isLoading: true,
    });
    fetch(url, {
      method: 'GET',
    })
      .then(response => response.json())
      .then((resp)=>{
        console.log('resp', resp);
        setData({
          ...data,
          isLoading: false,
          result: resp,
        });
      })
      .catch(error => {
        setData({
          ...data,
          errMsg: error.message,
          isCloseErrMsg: false,
        });
      });
  }
  /*const findAccessionNumber = (units) => {
    return (units.length > 0) ? units[0].accession_number : '';
  }*/

  const handleInput = (e) => {
    const name = e.target.name;
    const value = e.target.value
    //console.log(value, name);
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  const RenderTable = (result) => {
      return (
        <>
          <table className="table is-border is-stripe">
            <thead>
              <tr><th></th><th>館號</th><th>物種</th><th>採集者/號</th><th></th><th></th></tr>
            </thead>
            <tbody>
              {result.data.map((v, i)=>
                (<tr key={i}><td><a href={`http://localhost:5000/specimens/hast:${v.accession_number}`} className="text is-link">view</a></td><td>{ v.accession_number }</td><td>{(v.identification_last)? v.identification_last.taxon.full_scientific_name:''}</td><td><div>{ v.collection.collector.display_name } {v.collection.field_number}</div><span className="text is-dark9 font-size-xs">{v.collection.collect_date}</span>q</td><td></td><td></td></tr>)
              )}
            </tbody>
          </table>
        </>
      )
  }

  const lastPage = (data.result && data.result.total) ? Math.ceil(data.result.total / 10) : 1;
  const handlePagination = (page) => {
    console.log('page', page);
  }
  //console.log(data, 'xxx');
  return (
    <>
      <div className="card is-padding-lg is-outline">
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">關鍵字</div>
          <div className="column is-10">
            <input className="input" type="text" name="q" onChange={handleInput} />
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">學名</div>
          <div className="column is-10">
            <input className="input" type="text" name="text" placeholder="Text" />
          </div>
        </div>
        <div className="grid is-gap-horizontal-md is-padding-xs">
          <div className="column is-2 is-lg">採集號</div>
          <div className="column is-10">
            <input className="input" type="text" name="text" placeholder="Text" />
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
           (data.result) ? <RenderTable data={data.result.data} /> : null
          }
        </div>
      </div>
    </>
  )
}

/*
        <button className="button is-outline is-info" type="button" onClick={handlePagination(1)}>1</button>{(lastPage > 1) ? <> <button className="button is-outline is-primary" type="button">上一頁</button> 1 <button className="button is-outline is-primary" type="button">下一頁</button> <button className="button is-outline is-info" type="button">{result.total}</button></> : null}
*/
