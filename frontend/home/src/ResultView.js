import React from 'react';

const getSimpleLocality = (namedAreaMap) => {
  const LocalityHierarchy = ['country', 'stateProvince', 'municipality', 'county'];
  const namedAreaList = [];
  for (let i=0; i<LocalityHierarchy.length;i++) {
    const value = namedAreaMap[LocalityHierarchy[i]].value;
    if (namedAreaList.length < 4 && value !== '') {
      namedAreaList.push(value.name_best);
    }
  }
  return namedAreaList.join(' ');
}

const UnitCells = ({units}) => {
  if (units.length <= 1) {
    return (
      <>
        <td>
          <img src={units[0].image_url || ''} width="75" />{(units[0].accession_number) ? <a href={`/specimens/HAST:${units[0].accession_number}`} className="text is-link"> {units[0].accession_number || ''}</a> : null}
        </td>
      </>
    )
  } else if (units.length > 1) {
    return (
      <>
        <td>
          <ul className="list is-disc">
            {units.map((unit, unit_index) => {
              return (
                <li className="item" key={unit_index}>
                  <img src={unit.image_url || ''} width="75" />{(unit.accession_number) ? <a href={`/specimens/HAST:${unit.accession_number}`} className="text is-link"> {unit.accession_number || ''}</a> : null}
                </li>
              );
            })}
          </ul>
        </td>
      </>
    )
  }
  /*
            const acList = v.units.map((u) => [u.a]);
          let acList = [];
          let imgList = [];
          let idList = [];
          for (const u of v.units) {
            idList.push(u.id);
            if (u.accession_number) {
              acList.push(u.accession_number);
            }
            if (u.image_url) {
              imgList.push(u.image_url);
            }
          }
*/

}

const ResultView = ({state, dispatch, fetchData}) => {
  console.log(state);

  const handlePageChange = (event, pageIndex) => {
    console.log(pageIndex, state.pageIndex);
    dispatch({type: 'START_LOADING'});
    fetchData({pageIndex:pageIndex});
  }

  return (
    <>
    <div>found: {state.result.total.toLocaleString()} 採集 in {state.result.elapsed.toFixed(2)} seconds</div>
    <table className="table is-border is-stripe">
      <thead>
        <tr><th>標本照/館號</th><th>物種</th><th>採集者/號/日期</th><th>採集地點</th></tr>
      </thead>
      <tbody>
        {state.result.data.map((v, i) => {
          return (
            <tr key={i}>
              <UnitCells units={v.units}/>
              <td>{v.last_taxon_text || ''}<br/>{ v.last_taxon_common_name }</td>
              <td><div>{ v.collector.display_name } {v.field_number}</div><span className="text is-dark9 font-size-xs">{ v.collect_date }</span></td>
              <td>{ v.named_areas }</td>
            </tr>);
        })}
      </tbody>
    </table>
      <button className="button is-plain" type="button" onClick={(e) => handlePageChange(e, state.pageIndex-1)}>&lt;</button>{"[ "+ (state.pageIndex+1) +" / " + Math.ceil(state.result.total / state.pageSize ) + " ]"}<button className="button is-plain" type="button" onClick={(e) => handlePageChange(e, state.pageIndex+1)}>&gt;</button>
    </>
  );
}

export { ResultView };
