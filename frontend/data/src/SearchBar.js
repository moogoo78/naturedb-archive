import React from 'react';

import {
  Autocomplete,
  ActionList,
  TextInputWithTokens,
} from '@primer/react';

import {
  SearchContext,
} from 'HASTSearch';

const termOrder = [
  'field_number',
  'collector',
  'taxon',
  'named_area',
  'accession_number'
];

const SearchBar = ({tokens, onTokenRemove, onSelected}) => {
  const context = React.useContext(SearchContext);

  const selectedTokenIds = tokens.map(token => token.id);
  const [selectedItemIds, setSelectedItemIds] = React.useState(selectedTokenIds);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  //const [visibility, setVisibility] = React.useState('hidden');
  const [showMenu, setShowMenu] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  // Set items by term for suggestions
  const availableTermItems = [];

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

  items.forEach((x) => {
    itemGroups[x.term].items.push(x);
  });
  termOrder.forEach((term) => {
    if (itemGroups[term].items.length > 0) {
      availableTermItems.push(itemGroups[term]);
    }
  });

  return (
    <Autocomplete>
      <Autocomplete.Input
        block
        loading={loading}
        as={TextInputWithTokens}
        tokens={tokens}
        onTokenRemove={onTokenRemove}
        value={inputValue}
        onChange={(e)=>{
          // console.log(e.target.value, 'input');
          if (e.target.value) {
            setLoading(true);
            fetch(`${context.apiURL}/searchbar?q=${e.target.value}`)
              .then((resp) => { return resp.text() })
              .then((body) => { return JSON.parse(body) })
              .then((json) => {
                // add id as index
                // console.log(json.data,'json');
                const items = json.data.map( (x, i) => {
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
        <ActionList showDividers>
          {availableTermItems.map((group, groupIndex) => {
            return (
              <ActionList.Group title={group.label} key={groupIndex}>
              {group.items.map((item, itemIndex)=> {
                return (
                  <ActionList.Item key={itemIndex} onSelect={(e)=> {
                    console.log('click', item);
                    onSelected(item);
                    setShowMenu(false);
                    setInputValue('');
                  }}>
                    <ActionList.LeadingVisual>
                      {context.termIconMap[item.term]}
                    </ActionList.LeadingVisual>
                    {item.title}
                    <ActionList.Description variant="block">{item.description}</ActionList.Description>
                    <ActionList.TrailingVisual>{`${item.term}`}</ActionList.TrailingVisual>
                  </ActionList.Item>
                );
              })}
              </ActionList.Group>
            );
          })}
        </ActionList>
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

export { SearchBar };
