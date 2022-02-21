import CollectionsIcon from '@material-ui/icons/Collections';

import SpecimenList from './CollectionSpecimenList';
import SpecimenEdit from './CollectionSpecimenEdit';
//import CollectionCreate from './CollectionCreate';
//import CollectionEdit from './CollectionEdit';

const item =  {
  //create: CollectionCreate,
  edit: SpecimenEdit,
  list: SpecimenList,
//  show: CommentShow,
  icon: CollectionsIcon,
  options: {
    label: 'CollectionSpecimens',
  }
};
export default item;
