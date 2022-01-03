import PeopleIcon from '@material-ui/icons/People';

import PersonList from './PersonList';
import PersonCreate from './PersonCreate';
import PersonEdit from './PersonEdit';

const item =  {
  create: PersonCreate,
  edit: PersonEdit,
  list: PersonList,
//  show: CommentShow,
  icon: PeopleIcon,
};
export default item;
