//import LandscapeIcon from '@material-ui/icons/Landscape';
import CollectionsIcon from '@material-ui/icons/Collections';

import CollectionList from './CollectionList';
import CollectionCreate from './CollectionCreate';
import CollectionEdit from './CollectionEdit';

const item =  {
  create: CollectionCreate,
  edit: CollectionEdit,
  list: CollectionList,
//  show: CommentShow,
  icon: CollectionsIcon,
};
export default item;
