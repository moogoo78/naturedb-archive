
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
  }
  //const query = {
    // sort: JSON.stringify([field, order]),

    // filter: JSON.stringify(params.filter),
  //};
  const queryString = new URLSearchParams(payload).toString()
  const url = `${apiUrl}/${resource}?${queryString}`;
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

export {getList, getOne}
