import React from 'react';
import {
  ActionMenu,
  ActionList,
  Box,
  Button,
  Checkbox,
  Text,
} from '@primer/react';
import {
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";

import {
  AdminContext,
} from './App';
import {
  getCookie,
  setCookie,
} from './Utils';

import {
  SearchBox,
  ListContainer
} from './ListContainer';


/*
    collector: '',
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
*/

const CollectionSearchBox = () => {
  const context = React.useContext(AdminContext);
  const availableTermItems = [];

  const termLabel = {
    field_number: '採集號',
    collector: '採集者',
    taxon: '學名',
    named_area: '地點',
    accession_number: '館號',
  };

  const formatItemsFn = (data) => {
    const items = data.map( (x, i) => {
      const item = { id: x.id, term: x.term };
      let title = '';
      let descr = '';
      switch(x.term) {
      case 'collector':
        item['title'] = x.display_name;
        item['text'] = x.display_name;
        item['description'] = (x.abbreviated_name) ? `abbr. ${x.abbreviated_name}`: '';
        break;
      case 'taxon':
        item['title'] = `${x.full_scientific_name} ${x.common_name}`;
        item['text'] = x.display_name;
        item['description'] = `${x.rank}`;
        item['filterKey'] = x.rank;
        break;
      case 'named_area':
        item['title'] = x.display_name;
        item['text'] = x.display_name;
        item['description'] = `${x.area_class.label} (${x.area_class.name})`;
        item['filterKey'] = x.area_class.name;
        break;
      case 'field_number':
        item['title'] = `${(x.collector) ? x.collector.display_name:''} ${x.field_number}`;
        item['description'] = '';
        item['collector'] = x.collector;
        item['field_number'] = x.field_number;
        break;
      case 'accession_number':
        item['title'] = `HAST:${x.accession_number}`;
        item['text'] = x.accession_number;
        item['description'] = '';
        break;
      }
      return item;
    });
    return items;
  };

  const formatTokensFn = (filter) => {
  const tokens = [];
  let counter = 0;
  for (const [key, value] of Object.entries(filter)) {
    if (typeof(value) === 'object') {
      if (value.length > 0) {
        value.forEach( x => {
          tokens.push( {
            id:counter,
            text: `${termLabel[key]}:${x.text}`,
            term: x.term,
          });
          counter++;
        });
      }
    }
    else if (value) {
      tokens.push( {id:counter, text: `${termLabel[key]}:${value}`} );
      counter++;
    }
  }
  // console.log('to tokens:', filter, tokens);
    return tokens;
  };

  const renderItems = (items, onItemSelect) => {
    const itemGroups = {
      collector: {
        label: '採集者',
        items: [],
      },
      taxon: {
        label: '物種',
        items: [],
    },
      named_area: {
        label: '地點',
        items: [],
      },
      field_number: {
        label: '採集號',
      items: [],
      },
      accession_number: {
        label: '館號',
        items: [],
      }
    };
    const termOrder = [
      'field_number',
      'collector',
      'taxon',
      'named_area',
      'accession_number'
    ];
    items.forEach((x) => {
      itemGroups[x.term].items.push(x);
    });

    termOrder.forEach((term) => {
      if (itemGroups[term].items.length > 0) {
        availableTermItems.push(itemGroups[term]);
      }
    });

    return (
      <ActionList showDividers>
        {availableTermItems.map((group, groupIndex) => {
          return (
            <ActionList.Group title={group.label} key={groupIndex}>
              {group.items.map((item, itemIndex)=> {
                return (
                  <ActionList.Item key={itemIndex} onSelect={(e)=> {
                    console.log('click', item);
                    onItemSelect(item);
                  }}>
                    {/* <ActionList.LeadingVisual> */}
                    {/*   {context.termIconMap[item.term]} */}
                    {/* </ActionList.LeadingVisual> */}
                    {item.title}
                    <ActionList.Description variant="block">{item.description}</ActionList.Description>
                    <ActionList.TrailingVisual>{`${termLabel[item.term]}`}</ActionList.TrailingVisual>
                  </ActionList.Item>
                );
              })}
            </ActionList.Group>
          );
        })}
      </ActionList>
    );
  };

  const handleItemSelect = (filter, item) => {
    const newFilter = {...filter};
    if (['collector', 'taxon', 'named_area'].indexOf(item.term) >= 0) {
      const normKey = (item.term === 'collector') ? 'collector' : item.filterKey;
      //setValue(normKey, [item]);
      newFilter[normKey] = [item];
    } else if (item.term === 'field_number') {
      newFilter['field_number'] = item.field_number;
      newFilter['collector'] = [{text: item.collector.display_name, ...item.collector}];
      //setValue('field_number', item.field_number);
      //setValue('collector', [item.collector]);
    } else {
      //setValue(item.term, item.text);
      newFilter[item.term] = item.text;
    }
    return newFilter;
  };

  return (
    <SearchBox
      queryURL={`${context.apiURL}/searchbar?q=__VALUE__`}
      formatItemsFn={formatItemsFn}
      renderItems={renderItems}
      handleItemSelect={handleItemSelect}
      formatTokensFn={formatTokensFn}
    />
  );
};

export default function CollectionList() {
  const navigate = useNavigate();
  const context = React.useContext(AdminContext);
  const [check, setCheck] = React.useState([]);

  const getMyStar = () => {
    const saved = localStorage.getItem('mystar');
    const values = JSON.parse(saved);
    return values || [];
  }
  const setMyStar = () => {
    const values = getMyStar();
    let newStar = [...values];
    for (const i in check) {
      if (!values.includes(check[i])) {
        newStar.push(check[i]);
      }
    }
    console.log(check, values, newStar);
    localStorage.setItem('mystar', JSON.stringify(newStar));
    alert('已放入列印暫存');
  };
  const clearMyStar = () => {
    localStorage.removeItem('mystar');
    alert('已清除列印暫存');
  };

  const truncFilterIdFn = (data) => {
    const filterIds = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof(value) === 'object'){
        if (value.length > 0) {
          value.forEach( x => {
            let normKey = key;
            if (['family', 'genus', 'species'].indexOf(key) >=0) {
              normKey = 'taxon';
            } else if (['country', 'stateProvince', 'county', 'municipality', 'national_park', 'locality'].indexOf(key) >=0) {
              normKey = 'named_area';
            }
            if (!filterIds.hasOwnProperty(normKey)) {
              filterIds[normKey] = [];
            }
            filterIds[normKey].push( x.id );
          });
        }
      }
      else if (value) {
        filterIds[key] = value;
      }
    }
    return filterIds;
  };

  const renderResults = (results) => {
    return (
      <>
        <Button onClick={ e => { setMyStar();}}>勾選項目加入列印暫存</Button>
        <Box display="grid" gridTemplateColumns="1fr" gridGap={0}>
          {results.data.map((v, i) => {
            let scientificName = '';
            let commonName = '';
            if (v.taxon_text) {
              const nameList = v.taxon_text.split('|');
              if (nameList.length > 1) {
                scientificName = nameList[0];
                commonName = nameList[1];
              }
            }
            const namedAreas = v.named_areas.map(x => x.name);
            return (
              <Box p={3} borderColor="border.default" borderWidth={0} borderBottomWidth={1} borderStyle="solid" key={i}>
                <Checkbox id={`checkbox-${i}`} onChange={(e)=> {
                  if (check.indexOf(v.unit_id) < 0) {
                    setCheck([...check, v.unit_id]);
                  }
                }}/>
                <Box display="flex">
                  <Box mr={3}>
                    {v.image_url ? <a href={`${context.baseURL}/specimens/HAST:${v.accession_number}`} className="text is-link"> <img src={v.image_url} /></a> : null}
                  </Box>
                  <Box>
                    <Text>{scientificName}</Text>
                    <Text ml={2}>{commonName}</Text>
                    <div>HAST:{v.accession_number}</div>
                    <div>{ v.collector?.display_name } {v.field_number}, {v.collect_date}</div>
                    <div>{ namedAreas.join(' ') }</div>
                    <div>{v.locality_text}</div>
                    <div><>海拔: {v.altitude}{(v.altitude2) ? ` -  ${v.altitude2}`:''}</></div>
                    <div>經緯度: {v.longitude_decimal}, {v.latitude_decimal}</div>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </>
    );
  };

  const CollectionToolbar = () => {
    return (
      <Box display="flex" justifyContent="flex-end" m={2}>
        <Box>
        <ActionMenu>
          <ActionMenu.Button>Action</ActionMenu.Button>
          <ActionMenu.Overlay>
            <ActionList>
              {/* <ActionList.Item onSelect={ e => { setMyStar(); }}>勾選項目加入列印暫存</ActionList.Item> */}
              <ActionList.Item onSelect={ e => { navigate(`/collections/create`, {replace: true}) }}>新增項目</ActionList.Item>
              <ActionList.Item onSelect={ e => {
                const printList = getMyStar();
                if (printList.length > 0) {
                  window.open(`${context.baseURL}/print-label?ids=${printList.join(',')}`, '_blank');
                }
              }}>列印</ActionList.Item>
              <ActionList.Divider />
              <ActionList.Item onSelect={ e => { clearMyStar(); }} variant="danger">清除列印暫存</ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Box>
      </Box>
    );
  };
  // console.log('chk', check);
  return (
    <ListContainer
      title="資料列表"
      resource="collections"
      SearchBox={CollectionSearchBox}
      truncFilterIdFn={truncFilterIdFn}
      getListName="explore"
      renderResults={renderResults}
      ListToolbar={CollectionToolbar}
    />
  )
}
