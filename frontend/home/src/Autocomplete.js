import { useState, useEffect } from "react";
import './autocomplete.css';

// inspired via: https://blog.logrocket.com/build-react-autocomplete-component/

const Autocomplete = ({ name, label, apiUrl, source, onChange }) => {
  const [data, setData]  = useState({
    optionList: [],
    selectedId: 0,
    showList: false,
    value: '',
    //isLoading: false,
  });

  const fetchServer = (url) => {
    //setData({
    //  ...data,
    //  isLoading: true,
    //});

    return fetch(url, {
      method: 'GET',
    })
      .then(response => response.json());
  }

  useEffect(()=> {
    fetchServer(apiUrl)
      .then((resp) => {
        setData({
          ...data,
          //isLoading: false,
          optionList: resp.data,
        });
      })
      .catch(error => {
        console.log(error);
      });
  }, [])

  const handleClick = (e, item) => {
    if (item === undefined) {
      setData({
        ...data,
        showList: false,
      });
    } else {
      setData({
        ...data,
        selectedId: item[0],
        value: item[1],
        showList: false,
      })
      // parent: handleInput
      onChange(e, name, item[0]);
    }
  }
  const handleKeyDown = (e) => {
    return 'TODO';
  }

  const handleBlur = (e) => {
    // TODO: will eat onClick event on suggestion items
    if (data.showList === true) {
      setData({
        ...data,
        showList: false
      });
    }
  }

  const handleChange = (e) => {
    const value = e.target.value;

    const filter = (value === '') ? '{}' : JSON.stringify({q: value});
    const filterQS = encodeURIComponent(filter);
    const rangeQS = encodeURIComponent('[0,19]')
    const url = `${apiUrl}?filter=${filterQS}&range=${rangeQS}`;

    fetchServer(url)
      .then((resp)=>{
        setData({
          ...data,
          value: value,
          optionList: resp.data,
          showList: true,
          selectedId: 0,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  const SuggestionList = () => {
    const options = [<li key="0" onClick={(e) => handleClick(e, [0, ''])}>--</li>];
    data.optionList.forEach((suggestion)=> {
      let className;
      if (suggestion.id === data.selectedId) {
        className = "suggestion-active";
      }
      options.push(
        <li className={className} key={suggestion.id} onClick={(e) => handleClick(e, [suggestion.id, suggestion[source]])}>
          {suggestion[source]}
        </li>
      );
    });
    return data.optionList.length ? (
      <ul className="suggestions">
        {options}
      </ul>
    ) : (
      <div className="no-suggestions">
        <em>{`${label} not found`}</em>
      </div>
    );
  };

  //console.log(`<Autocomplete ${label}>`, data);
  //<span style={{marginLeft: '20px;',zIndex:'100'}}>x</span>
  return (
    <>
      <input type="text" className="input" name={name} onChange={handleChange} onKeyDown={handleKeyDown} value={data.value} onFocus={() => setData({...data, showList:true})} /> 
      {data.showList && <SuggestionList />}
    </>
  );
};

export default Autocomplete;
