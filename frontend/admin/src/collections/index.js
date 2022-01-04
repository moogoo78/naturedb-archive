import LandscapeIcon from '@material-ui/icons/Landscape';

import CollectionList from './CollectionList';
import CollectionCreate from './CollectionCreate';
import CollectionEdit from './CollectionEdit';

const item =  {
  create: CollectionCreate,
  edit: CollectionEdit,
  list: CollectionList,
//  show: CommentShow,
  icon: LandscapeIcon,
};
export default item;
