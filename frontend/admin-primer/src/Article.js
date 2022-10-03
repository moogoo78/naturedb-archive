import React from 'react';
import {
  Box,
  Button,
  Label,
  Pagehead,
  FormControl,
  TextInput,
  Select,
  Spinner,
} from '@primer/react';
import {MarkdownEditor} from '@primer/react/drafts'
import {
  useForm,
  useFieldArray,
  Controller,
} from "react-hook-form";
import {
  useParams,
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";

import {
  PhokFlash,
} from 'Helpers';

import {
  getOne,
  getFormOptions,
  updateOrCreate,
} from 'Utils';

const ArticleList = () => {
  const navigate = useNavigate();
  return (
    <>
    <h2>list</h2>
      <Button onClick={(e) => {
        navigate(`/articles/create`, {replace: true})
      }}>新增</Button>
    </>
  )
};

const initialArg = {
  loading: false,
  error: '',
  data: {},
  form: {
    categories: []
  },
  flash: {
    isShow: false,
    isError: false,
    category: '',
    text: '',
  }
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT_SUCCESS':
      return {
        ...state,
        loading: false,
        data: action.data,
        form: action.form,
        error: '',
      };
    case 'SHOW_FLASH':
      return {
        ...state,
        flash: {
          ...state.flash,
          text: action.text,
          isShow: true,
          isError: (action.isError !== undefined && action.isError === true) ? true : false,
        }
      };
    case 'HIDE_FLASH':
      return {
        ...state,
        flash: {
          ...state.flash,
          isShow: false,
        }
      };
  default:
    throw new Error();
  }
};

const ArticleForm = () => {
  //const navigate = useNavigate();
  const params = useParams();
  const [value, setValuex] = React.useState('');
  const [state, dispatch] = React.useReducer(reducer, initialArg);

  React.useEffect(() => {
    let resp = null;
    if (!params.articleId) {
      resp = getFormOptions('articles');
    } else {
      resp = getOne('articles', params.articleId);
    }
    resp.then(({ json }) => {
      // console.log(json.collector);
      console.log('🐣 fetch', json);

      dispatch({type: 'INIT_SUCCESS', data: json.data, form: json.form});
    })
      .catch(error => {
        dispatch({type: 'GET_ONE_ERROR', error: error});
      });

  }, []);

  console.log('state', state);

  const renderMarkdown = async (markdown) => {
  // In production code, this would make a query to some external API endpoint to render
  return "Rendered Markdown."
  }

  const ArticleHookForm = ({defaultValues, formWidgets}) => {
    const { register, handleSubmit, watch, control, setValue, formState: { errors, dirtyFields } } = useForm({
      defaultValues: defaultValues,
    });
    const [content, setContent] = React.useState(defaultValues.content);
    const doSubmit = data => {
      console.log('submit', data);
      delete data.created;
      console.log(data);
      updateOrCreate('articles', data, data.id || null)
        .then((json) => {
          // console.log('return ', json);
          const label = (data.id) ? '儲存': '新增';
          dispatch({type: 'SHOW_FLASH', text: `${label}成功 - ${new Date()}`});

          if (!data.id) {
            //navigate(`/collections`, {replace: true});
            window.location.replace('/articles');
          } else {
            //navigate(`/collections/${data.id}`);
            window.location.replace(`/articles/${data.id}`);
          }
        })
        .catch(error => {
          dispatch({type: 'SHOW_FLASH', text: `${error}`, isError: true });
        });
    }
    return (
      <form onSubmit={handleSubmit(doSubmit)}>
        <Box
          borderWidth="0px"
          borderStyle="solid"
          borderColor="border.default"
          borderRadius={0}
          display="grid"
          gridGap={3}
        >
          <PhokFlash data={state.flash} onClose={(e) => {dispatch({type: 'HIDE_FLASH'})}}/>
          <Box display="flex">
            <Box flexGrow={1} pl={3}>{/* for align to markdown */}
              <FormControl>
                <FormControl.Label>標題</FormControl.Label>
                <Controller
                  name="subject"
                  control={control}
                  block
                  render={({ field }) => (<TextInput {...field} />)}
                />
              </FormControl>
            </Box>
          </Box>
          <Box display="flex" pl={3}>
            <Box flexGrow={1}>
              <FormControl>
                <FormControl.Label>分類</FormControl.Label>
                <Controller
                  name="category_id"
                  control={control}
                  block
                  render={({ field }) => (
                    <Select {...field}>
                      <Select.Option value="">--</Select.Option>
                      {formWidgets.categories.map((v, i)=> {
                        return <Select.Option value={v.id} key={i}>{v.label}</Select.Option>
                      })}
                    </Select>
                  )}
                />
              </FormControl>
            </Box>
          </Box>
          <Box display="flex" pl={3}>
            <Box flexGrow={1}>
              <FormControl>
                <FormControl.Label>發布日期</FormControl.Label>
                <Controller
                  name="publish_date"
                  control={control}
                  block
                  render={({ field }) => (<TextInput type="date" {...field} />)}
                />
              </FormControl>
            </Box>
          </Box>
          <Box display="flex">
            <Box flexGrow={1}>
              <Controller
                  name="content"
                  control={control}
                  block
                  render={({ field }) => (
                    <MarkdownEditor
                      value={content}
                      onRenderPreview={renderMarkdown}
                      onChange={(value) => {
                        setContent(value);
                        setValue('content', value);
                      }}
                    >
                      <MarkdownEditor.Label>內文</MarkdownEditor.Label>
                    </MarkdownEditor>
                  )}
                />
            </Box>
          </Box>
          <Box pl={3}>
            <Button type="submit" variant="outline" size="medium">{(params.articleId) ? '儲存' : '新增'}</Button>
          </Box>
        </Box>
      </form>
    )
  };

  return (
    <>
      <Pagehead>新聞/文章</Pagehead>
      <Box
        borderWidth="0px"
        borderStyle="solid"
        borderColor="border.default"
        borderRadius={2}
        p={0}
        m={0}
        display="grid"
        gridGap={3}
        sx={{maxWidth: 960}}
      >
        {(()=> {
          if (state.loading === true) {
            return <Spinner />;
          } else if (state.error) {
            return <Text color="danger.fg">{state.error}</Text>;
          } else {
            return <ArticleHookForm defaultValues={state.data} formWidgets={state.form}/>
          }
        })()}
      </Box>
    </>
  );
}

export {ArticleList, ArticleForm}
