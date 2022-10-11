
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
    if (params.hasOwnProperty('sort')) {
      payload['sort'] = JSON.stringify(params['sort']);
    }
    if (params.hasOwnProperty('view')) {
      payload['view'] = params.view;
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
       return Promise.reject(error);
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

export {
  getList,
  getOne,
}
