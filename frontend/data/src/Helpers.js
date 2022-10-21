import React, { useState } from 'react';

import {
  Autocomplete,
  AnchoredOverlay,
  Box,
  Button,
  Portal,
  Text,
  TextInput,
  TextInputWithTokens,
  registerPortalRoot,
  Pagination,
} from '@primer/react';
import {
  XIcon,
} from '@primer/octicons-react'

import {
  getList,
} from './Utils';


//const FetchControllerMulti = React.forwardRef((props, ref) => {
const FetchControllerMulti = (props) => {
  // console.log(props.name, props.value, 'multi');
  const scrollContainerRef = React.useRef(null);
  const [tokens, setTokens] = React.useState(props.value || []);
  const selectedTokenIds = tokens.map(token => token.id);
  const [selectedItemIds, setSelectedItemIds] = React.useState(selectedTokenIds);
  // const [filterText, setFilterText] = React.useState('');
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  let selectionVariant = (props.multiple) ? 'multiple' : 'single'; // default: multiple
  const onTokenRemove = tokenId => {
    const values = tokens.filter(token => token.id !== tokenId);
    setTokens(values);
    setSelectedItemIds(selectedItemIds.filter(id => id !== tokenId));
    props.setValue(props.name, values, {shouldDirty: true});
  };

  const onSelectedChange = newlySelectedItems => {
    //console.log(props, 'ref', newlySelectedItems);
    if (selectionVariant === 'single' && newlySelectedItems.length > 1) {
      return
    }

    if (!Array.isArray(newlySelectedItems)) {
      return
    }

    setSelectedItemIds(newlySelectedItems.map(item => item.id));

    if (newlySelectedItems.length < selectedItemIds.length) {
      const newlySelectedItemIds = newlySelectedItems.map(({id}) => id);
      const removedItemIds = selectedTokenIds.filter(id => !newlySelectedItemIds.includes(id));

      for (const removedItemId of removedItemIds) {
        onTokenRemove(removedItemId);
      }

      return
    }

    const newTokens = newlySelectedItems.map(({id, text}) => ({id, text}));
    setTokens(newTokens);
    props.setValue(props.name, newTokens, {shouldDirty: true});
    //mySetValue(newTokens);
  };

  const fetchData = (q) => {
    setLoading(true);
    const filter = { q: q, ...props.queryFilter };
    const formValues = props.getValues();

    // append filter with parent_id
    //if (props.name === 'family') {
    //}
    if (props.name === 'genus') {
      if (formValues.family) {
        filter['parent_id'] = formValues.family[0].id;
      }
    }
    if (props.name === 'species') {
      if (formValues.genus) {
        filter['parent_id'] = formValues.genus[0].id;
      }
      else if (formValues.family) {
        filter['parent_id'] = formValues.family[0].id;
      }
    }


    if (props.name === 'state_province') {
      if (formValues.country) {
        filter['parent_id'] = formValues.country[0].id;
      }
    }
    if (props.name === 'county') {
      if (formValues.county) {
        filter['parent_id'] = formValues.state_province[0].id;
      }
    }
    if (props.name === 'municipality') {
      if (formValues.county) {
        filter['parent_id'] = formValues.county[0].id;
      }
    }
    console.log('fetch', props.name, filter);
    getList(props.fetchResourceName, {filter: filter})
      .then(({json}) => {
        const items = json.data.map( x => ({id: x.id, text: x.display_name}));
        setItems(items);
        setLoading(false);
      });
  };

  return (
    <Autocomplete>
      <Box display="flex" flexDirection="column" height="100%" width="100%">
        <Box flexGrow={1}>
          <Autocomplete.Input
            block
            loading={loading}
            as={TextInputWithTokens}
            tokens={tokens}
            onTokenRemove={onTokenRemove}
            ref={props.refx}
            name={props.name}
            onChange={(e)=>{
              //setFilterText(e.target.value);
              fetchData(e.target.value);
            }}/>
        </Box>
    <Box flexGrow={1} ref={scrollContainerRef} sx={{maxHeight: '143px', overflowY: 'auto', backgroundColor:'#e4e4c9'}}>
          <Autocomplete.Menu
            items={items}
            selectedItemIds={selectedItemIds}
            onSelectedChange={onSelectedChange}
            //onOpenChange={(isOpen)=>{
            //  if (isOpen === true && tokens.length === 0) {
                //fetchData(''); // will cause infinite refresh
            //  }
            //}}
            selectionVariant={selectionVariant}
            aria-labelledby="autocompleteLabel-customInput"
            customScrollContainerRef={scrollContainerRef}
            filterFn={ x => x }
          />
        </Box>
      </Box>
    </Autocomplete>
  )
//});
};

const FreeAutocomplete = React.forwardRef((props, ref) => (
  <Autocomplete>
    <AutocompleteWithContextInternal
      fwdRef={ref}
      items={props.items}
      value={props.value}
      setValue={props.setValue}
      name={props.name}
    />
  </Autocomplete>
));

const AutocompleteWithContextInternal = ((props) => {
  const autocompleteContext = React.useContext(Autocomplete.Context);

  if (autocompleteContext === null) {
    throw new Error('AutocompleteContext returned null values')
  }

  const { setInputValue } = autocompleteContext;
  const [filterText, setFilterText] = React.useState(props.value)

  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState((props.value) ? [props.value] : []);
  const [selected, setSelected] = React.useState((props.value) ? props.value : null);
  //console.log(props, selected, items);
  //console.log('sel', selected, props);

  return (
    <Autocomplete.Context.Provider
      value={{...autocompleteContext, autocompleteSuggestion: '', setAutocompleteSuggestion: () => false}}
    >
        <Autocomplete.Input
          block
          loading={loading}
          name={props.name}
          ref={props.fwdRef}
          value={filterText}
          onChange={(e) => {
            setLoading(true);
            const filter = { q: e.target.value, ...props.queryFilter };
            //getList(props.fetchResourceName, {filter: filter})
            //  .then(({json}) => {
            //    const items = json.data.map( x => ({id: x.id, text: x.display_name}));
            //    setItems(items);
            //    setLoading(false);
            //  });
          }}
          trailingAction={
            <TextInput.Action
              onClick={() => {
                setSelected(null);
                //props.setValue(props.name, null, {shouldDirty: true});
              }}
              icon={XIcon}
              aria-label="Clear input"
              sx={{color: 'fg.subtle'}}
            />
          }
          value={(selected) ? selected.text : ''}
        />
        <Autocomplete.Overlay width="xxlarge">
          <Autocomplete.Menu
            items={items}
            selectedItemIds={(selected) ? [selected.id]: []}
            selectionVariant="single"
            onSelectedChange={(values)=>{
              setSelected(values[0]);
              //if (props.afterSelect) {
              //    props.afterSelect(values[0].id);
              //  }
              //props.setValue(props.name, values[0], {shouldDirty: true});
            }}
            filterFn={(x) => x} // filter occurred in backend server
          />
        </Autocomplete.Overlay>
      </Autocomplete.Context.Provider>
  );
});

const SciName = ({taxon, name, fontSize='16px', fontWeight}) => {
  if (name) {
    const styles = {
      fontSize,
      fontWeight
    };

    const parts = name.split(' ');
    //const author = [...parts].splice(2).join(' ');
    const author = parts.slice(2).join(' ');
    // stupid way
    if(name.indexOf(' var. ') > 0) {
      const infraIndex = parts.indexOf('var.');
      const a1 = parts.slice(2, 3);
      const infraEpithet = parts.slice(4, 5);
      const a2 = parts.slice(5).join(' ');

      return (<><Text sx={{ fontStyle: 'italic', ...styles}}>{`${parts[0]} ${parts[1]}`}</Text><Text sx={{...styles}}>{` ${a1} `}</Text><Text sx={{ ...styles }}>{" var. "}</Text><Text sx={{ fontStyle: 'italic', ...styles}}>{`${infraEpithet} `}</Text><Text sx={{...styles}}>{a2}</Text></>);
    } else if (parts.length >= 2 && author) {
      return (<><Text sx={{ fontStyle: 'italic', ...styles }}>{`${parts[0]} ${parts[1]}`}</Text> <Text sx={{ ...styles }}>{author}</Text></>);
    } else if(parts.length === 1) {
      return (<Text sx={{ fontStyle: 'italic', ...styles}}>{`${parts[0]}`}</Text>);
    }
  } else if (taxon) {
    // TODO
  }
};

export { FreeAutocomplete, FetchControllerMulti, SciName }
