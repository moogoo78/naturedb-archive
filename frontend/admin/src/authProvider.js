const apiUrl = 'http://127.0.0.1:5000/api/v1/auth';

const authProvider = {
  login: ({ username, password }) =>  {
    const request = new Request(apiUrl, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
      credentials: 'same-origin'
    });
    return fetch(request)
      .then(response => {
        //if (response.status < 200 || response.status >= 300) {
        //  throw new Error(response.statusText);
        //}
        console.log(response, 'resp');
        if (response.ok) {
          return response.json();
        }
        return Promise.reject(response);
      })
      .then(auth => {
        localStorage.setItem('auth', JSON.stringify(auth));
      })
      .catch((error) => {
        // why 401 不會到 checkError 會到這..
        console.log('login error', error)
        //throw new Error('Network error')
      });
  },
  checkError: (error) => {
    console.log(error, 'checkError')
    const status = error.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth');
      return Promise.reject();
    }
    return Promise.resolve();
  },
  checkAuth: () => {
    return localStorage.getItem('auth')
      ? Promise.resolve()
      : Promise.reject({message: 'login.required'});
  },
  logout: () => {
    localStorage.removeItem('auth');
    return Promise.resolve();
  },
  getPermissions: () => {
    // Required for the authentication to work
    return Promise.resolve();
  },
  getIdentity: () => Promise.resolve(),
};

export default authProvider;
