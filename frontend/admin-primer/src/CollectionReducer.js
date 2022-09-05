const initialArg = {
  loading: true,
  error: '',
  data: {},
  helpers: {},
};

const reducer = (state, action) => {
  switch (action.type) {
  case 'GET_ONE_SUCCESS':
    return {
      ...state,
      loading: false,
      data: action.data,
      helpers: action.helpers,
      form: action.form,
      error: ''
    }
  case 'GET_ONE_ERROR':
    return {
      ...state,
      loading: false,
      error: action.error,
    }
  default:
    throw new Error();
  }
}

export { initialArg, reducer }
