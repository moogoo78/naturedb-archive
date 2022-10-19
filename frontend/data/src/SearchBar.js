import React from 'react';

import {
  Autocomplete,
  ActionList,
  TextInputWithTokens,
} from '@primer/react';

import {
  SearchIcon,
  ChevronDownIcon,
  FeedStarIcon,
  FeedTagIcon,
  LocationIcon,
  FeedPersonIcon,
  ItalicIcon,
  ArchiveIcon,
  GearIcon,
  FilterIcon,
  ProjectIcon,
  NoteIcon,
} from '@primer/octicons-react';

import {
  SearchContext,
} from 'HASTSearch';

const SearchBar = ({tokens, onTokenRemove, onSelectedChange, onSelected}) => {
  const context = useContext(SearchContext);
  const selectedTokenIds = tokens.map(token => token.id);
  const [selectedItemIds, setSelectedItemIds] = React.useState(selectedTokenIds);
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  //const [visibility, setVisibility] = React.useState('hidden');
  const [showMenu, setShowMenu] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const itemGroups = {};
  items.forEach((x) => {
    if (!itemGroups.hasOwnProperty(x.term)) {
      itemGroups[x.term] = [];
    }
    itemGroups[x.term].push(x);
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
            fetch(`${API_URL}/search?q=${e.target.value}`)
              .then((resp) => { return resp.text() })
              .then((body) => { return JSON.parse(body) })
              .then((json) => {
                // add id as index
                const items = json.data.map( (x, i) => ({id: i, ...x}));
                setItems(items);
                setShowMenu(true);
                setLoading(false);
                console.log(items);
                setInputValue(e.target.value);
              });
          } else {
            setItems([]);
          }
        }}
      />
      <Autocomplete.Overlay
        width="xxlarge"
        onClickOutside={(e)=>{console.log('out', e);}}
        visibility={(showMenu === true) ? 'visible': 'hidden'}
      >
        <ActionList showDividers>
          {[
            {key: 'collector', label: '採集者'},
            {key: 'taxon', label: '物種'},
          ].map((group) => {
            return (
              <ActionList.Group title={group.label} key={group.key}>
              {items.map((item, index)=> {
                return (
                  <ActionList.Item key={index} onSelect={(e)=> {
                    console.log('click', index, items[index]);
                    onSelected(items[index]);
                    setShowMenu(false);
                    setInputValue('');
                  }}>
                    <ActionList.LeadingVisual>
                      {TERM_ICON_MAP[item.category]}
                    </ActionList.LeadingVisual>
                    {item.text}
                    <ActionList.Description variant="block">{`${item.term}:${item.object_id}`}</ActionList.Description>
                    <ActionList.TrailingVisual>{`${item.term}:${item.object_id}`}</ActionList.TrailingVisual>
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
