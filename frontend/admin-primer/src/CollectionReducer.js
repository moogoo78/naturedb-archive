const initialArg = {
  loading: true,
  error: '',
  data: {},
  helpers: {},
  flash: {
    isShow: false,
    isError: false,
    category: '',
    text: '',
  }
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
    case 'SHOW_FLASH':
      console.log(action.isError, 'eueueu');
      return {
        ...state,
        flash: {
          ...state.flash,
          text: action.text,
          isShow: true,
          isError: (action.isError !== undefined && action.isError === true) ? true : false,
        }
      }
    case 'HIDE_FLASH':
      return {
        ...state,
        flash: {
          ...state.flash,
          isShow: false,
        }
      }
    default:
      throw new Error();
  }
}

export { initialArg, reducer }
