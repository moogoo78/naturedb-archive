// via: react-admin/packages/ra-core/src/dataProvider/fetch.ts
const createHeadersFromOptions = (options) => {
  const requestHeaders = (options.headers ||
                          new Headers({
                            Accept: 'application/json',
  }));
  if (
    !requestHeaders.has('Content-Type') &&
    !(options && (!options.method || options.method === 'GET')) &&
    !(options && options.body && options.body instanceof FormData)
  ) {
    requestHeaders.set('Content-Type', 'application/json');
  }
  if (options.user && options.user.authenticated && options.user.token) {
    requestHeaders.set('Authorization', options.user.token);
  }
  return requestHeaders
}

const getList = (resource, params, options={}) => {
  const apiUrl = process.env.API_URL;
  let payload = {};
  if (params) {
    if (params.hasOwnProperty('range')) {
      payload['range'] = JSON.stringify(params['range']);
    }
    if (params.hasOwnProperty('total')) {
      payload['total'] = params['total'];
    }
    if (params.hasOwnProperty('filter')) {
      payload['filter'] = JSON.stringify(params['filter']);
    }
  }
  //const query = {
    // sort: JSON.stringify([field, order]),

    // filter: JSON.stringify(params.filter),
  //};
  const queryString = new URLSearchParams(payload).toString()
  const seperator = (queryString === '') ? '' : '?';
  const url = `${apiUrl}/${resource}${seperator}${queryString}`;
  const requestHeaders = createHeadersFromOptions(options);
  // console.log(url, requestHeaders);

  return fetch(url, { ...options, headers: requestHeaders })
    .then(response =>
      response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text,
      }))
    )
    .then(({ status, statusText, headers, body }) => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        // not json, no big deal
      }
      if (status < 200 || status >= 300) {
        console.log('!!! HttpError');
        /*
        return Promise.reject(
          new HttpError(
            (json && json.message) || statusText,
            status,
            json
          )
        );*/
      }
      return Promise.resolve({ status, headers, body, json });
      return json;
    }).
     catch((error) => {
       console.log('getList error', error);
     });
}

const getOne = (resource, itemId, options={}) => {
  const apiUrl = process.env.API_URL;
  const url = `${apiUrl}/${resource}/${itemId}`;
  const requestHeaders = createHeadersFromOptions(options);
  //console.log(url, requestHeaders);

  return fetch(url, { ...options, headers: requestHeaders })
    .then(response =>
      response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text,
      }))
    )
    .then(({ status, statusText, headers, body }) => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        // not json, no big deal
      }
      if (status < 200 || status >= 300) {
        console.log('!!! HttpError');
        /*
        return Promise.reject(
          new HttpError(
            (json && json.message) || statusText,
            status,
            json
          )
        );*/
      }
      return Promise.resolve({ status, headers, body, json });
      return json;
    }).
     catch((error) => {
       console.log('getOne error', error);
     });
}

const updateOrCreate = (resource, data, itemId)=> {
  const apiUrl = process.env.API_URL;
  const url = (itemId !== null) ? `${apiUrl}/${resource}/${itemId}` : `${apiUrl}/${resource}`;
  const options = {
    body: JSON.stringify(data), // must match 'Content-Type' header
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, same-origin, *omit
    method: (itemId !== null) ? 'PUT': 'POST',
    // mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // *client, no-referrer
  };
  const requestHeaders = createHeadersFromOptions(options);
  // console.log(url, requestHeaders);
  return fetch(url, { ...options, headers: requestHeaders })
    .then(response =>
      response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text,
      }))
    )
    .then(({ status, statusText, headers, body }) => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        // not json, no big deal
      }
      if (status < 200 || status >= 300) {
        console.log('!!! HttpError');
        /*
        return Promise.reject(
          new HttpError(
            (json && json.message) || statusText,
            status,
            json
          )
        );*/
      }
      return Promise.resolve({ status, headers, body, json });
      return json;
    }).
     catch((error) => {
       console.log('getOne error', error);
     });
}
const deleteOne = (resource, itemId, data)=> {
  const apiUrl = process.env.API_URL;
  const url = `${apiUrl}/${resource}/${itemId}`;
  const options = {
    method: 'DELETE',
  };
  const requestHeaders = createHeadersFromOptions(options);
  // console.log(url, requestHeaders);
  return fetch(url, { ...options, headers: requestHeaders })
    .then(response =>
      response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text,
      }))
    )
    .then(({ status, statusText, headers, body }) => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        // not json, no big deal
      }
      if (status < 200 || status >= 300) {
        console.log('!!! HttpError');
        /*
        return Promise.reject(
          new HttpError(
            (json && json.message) || statusText,
            status,
            json
          )
        );*/
      }
      return Promise.resolve({ status, headers, body, json });
      return json;
    }).
     catch((error) => {
       console.log('deleteOne error', error);
     });
}

const getFormOptions = (resource, options={}) => {
  const apiUrl = process.env.API_URL;
  const url = `${apiUrl}/${resource}/form`;
  const requestHeaders = createHeadersFromOptions(options);
  // console.log(url, requestHeaders);

  return fetch(url, { ...options, headers: requestHeaders })
    .then(response =>
      response.text().then(text => ({
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        body: text,
      }))
    )
    .then(({ status, statusText, headers, body }) => {
      let json;
      try {
        json = JSON.parse(body);
      } catch (e) {
        // not json, no big deal
      }
      if (status < 200 || status >= 300) {
        console.log('!!! HttpError');
        /*
        return Promise.reject(
          new HttpError(
            (json && json.message) || statusText,
            status,
            json
          )
        );*/
      }
      return Promise.resolve({ status, headers, body, json });
      return json;
    }).
     catch((error) => {
       console.log('getFormOptions error', error);
     });
}

const convertDDToDMS = (dd) => {
  /* arguments: decimal degree
   */
  const direction = (parseFloat(dd) >=0) ? 1 : -1;
  const ddFloat = Math.abs(parseFloat(dd));
  const degree = Math.floor(ddFloat);
  const minuteFloat = (ddFloat - degree) * 60;
  const minute = Math.floor(minuteFloat);
  const secondFloat = ((minuteFloat - minute) * 60);
  const second = parseFloat(secondFloat.toFixed(4));
  //console.log(dd, ddFloat,minuteFloat, [degree, minute, second]);
  return [direction, degree, minute, second];
}

const convertDMSToDD = (ddms) => {
  /* arguments: degree, minute, second
   */
  // console.log(ddms);
  return ddms[0] * (parseFloat(ddms[1]) + parseFloat(ddms[2]) / 60 + parseFloat(ddms[3]) / 3600);
}

const dateToYMD = (dateTime) => {
  // const dateString = dateTime.toISOString().split('T')[0];
  //const x = dateString.split('-');
  //return `${x[0]}-${x[1]}-${x[2]}`;
  const dateString = dateTime.toLocaleDateString('en-GB',  { timeZone: 'Asia/Taipei' })
  const x = dateString.split('/');
  return `${x[2]}-${x[1]}-${x[0]}`;
}

const YMDToDate = (YMD) => {
  const x = YMD.split('-')
  const y = parseInt(x[0], 10);
  const m = parseInt(x[1], 10) - 1;
  const d = parseInt(x[2], 10);
  return new Date(y, m, d); // *note* Date will just return "string"
}

const formatDate = (date) => {
  if (date === null || date === '') {
    return null;
  } else if (date instanceof Date && !isNaN(date)) {
    // console.log(date.toLocaleDateString(), date.toISOString(), date, date.toLocaleDateString('zh-TW',  { timeZone: 'UTC' }), date.getTimezoneOffset(), date.toLocaleDateString('en-GB',  { timeZone: 'Asia/Taipei' }));
    return dateToYMD(date);
  } else if (typeof date === 'string' && date.split('-').length > 1){
    try {
      const goodDate = YMDToDate(date);
      return dateToYMD(goodDate);
    } catch(error) {
      console.error('formatDate: string input error => ', error);
      return null;
    }
  }
}

export {
  getList,
  getOne,
  updateOrCreate,
  deleteOne,
  getFormOptions,
  convertDDToDMS,
  convertDMSToDD,
  dateToYMD,
  YMDToDate,
  formatDate,
}

/*
const Placeholder = ({label, height, width}) => (
  <Box
    width={width}
    height={height}
    borderWidth="1px"
    borderStyle="solid"
    borderColor="border.default"
    borderRadius={2}
    p={2}
    height={(height) ? `${height}px` : null}
    width={(width) ? `${width}px` : null}
    sx={{
      bg: ['neutral.subtle', 'accent.subtle', 'success.subtle', 'attention.subtle', 'danger.subtle']
    }}
  >
    {label}
  </Box>
);
//          <Placeholder label="aoeu" width="200" />
*/
