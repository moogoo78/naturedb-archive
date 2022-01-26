import React, { useState } from 'react';
import './musubii.min.css';

const apiURL = 'http://127.0.0.1:5000/api/v1/specimens';

export function QuerySpecimen() {

  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(null);
  const [errMsg,setErrMsg] = useState(null);

  const handleSubmit = (e) => {
    const filter = JSON.stringify(formData);
      //ange=[0%2C9]&sort=["collection.id"%2C"DESC"]'
    const filterQS = encodeURIComponent(filter);
    const rangeQS = encodeURIComponent('[0,9]')
    const url = `${apiURL}?filter=${filterQS}&range=${rangeQS}`;
    console.log(apiURL);
    setErrMsg({...errMsg, isLoading: true});
    fetch(url, {
      method: 'GET',
    })
      .then(response => response.json())
      .then((resp)=>{
        console.log(resp);
        //setRows(resp.data);
        setResult(resp);
        setErrMsg({
          ...errMsg,
          isLoading: false,
          isClose: true,
        })
      } )
      .catch(error => {
        setErrMsg({
          message: error.message,
          isClose: false,
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

  if (errMsg && errMsg.isLoading) {
    return (<h1>loading...</h1>)
  } else {
    return (
      <>
        <div className="card is-padding-lg is-outline">
          <div className="grid is-gap-horizontal-md">
            <div className="column is-2 is-lg">關鍵字</div>
            <div className="column is-10">
              <input className="input" type="text" name="q" onChange={handleInput} />
            </div>
          </div>
          <div className="grid is-gap-horizontal-md">
            <div className="column is-2 is-lg">學名</div>
            <div className="column is-10">
              <input className="input" type="text" name="text" placeholder="Text" />
            </div>
          </div>
          <div className="grid is-gap-horizontal-md">
            <div className="column is-2 is-lg">採集號</div>
            <div className="column is-10">
              <input className="input" type="text" name="text" placeholder="Text" />
            </div>
          </div>
          <button className="button is-plain is-primary" type="button" onClick={handleSubmit}>查詢</button>
          { (errMsg && errMsg.message) ?
            <div className="alert is-danger is-tail-top-left" onClick={()=>setErrMsg(null)}>
              <i aria-hidden="true" className="fas fa-times is-danger is-fit is-margin-right-xxs"></i>
              <span className="ytext is-danger">{errMsg.message}</span>
            </div>: ''}
          <div className="box is-padding-vertical-md is-margin-top-md">
            <table className="table is-border is-stripe">
              <thead>
                <tr><th></th><th>館號</th><th>採集者</th><th>採集號</th><th>物種</th><th>採集日期</th></tr>
              </thead>
              <tbody>
                {(result) ? result.data.map((v, i)=>
                  (<tr key={i}><td><a href={`http://localhost:5000/specimens/hast:${v.accession_number}`} className="text is-link">view</a></td><td>{ v.accession_number }</td><td>{ v.collection.collector.display_name }</td><td>{v.collection.field_number}</td><td>{(v.identification_last)? v.identification_last.taxon.full_scientific_name:''}</td><td>{v.collection.collect_date}</td></tr>)
                )
                  : null}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )
  }
}
