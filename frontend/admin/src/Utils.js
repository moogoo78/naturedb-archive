
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
  //const apiUrl = process.env.REACT_APP_API_URL;
  const apiUrl = 'http://127.0.0.1:5000/api/v1';
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
  console.log(url, requestHeaders);

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
  //const apiUrl = process.env.REACT_APP_API_URL;
  const apiUrl = 'http://127.0.0.1:5000/api/v1';
  const url = `${apiUrl}/${resource}/${itemId}`;
  const requestHeaders = createHeadersFromOptions(options);
  console.log(url, requestHeaders);

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
  console.log(dd, ddFloat,minuteFloat, [degree, minute, second]);
  return [direction, degree, minute, second];
}

const convertDMSToDD = (ddms) => {
  /* arguments: degree, minute, second
   */
  // console.log(ddms);
  return ddms[0] * (parseFloat(ddms[1]) + parseFloat(ddms[2]) / 60 + parseFloat(ddms[3]) / 3600);
}
export {getList, getOne, convertDDToDMS, convertDMSToDD}
