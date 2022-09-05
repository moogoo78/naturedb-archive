import React from 'react';

import {
  Button,
  Details,
  IconButton,
  useDetails,
} from '@primer/react';

import {
  TrashIcon,
} from '@primer/octicons-react';

const Confirm = ({onOk}) => {
  const {getDetailsProps, setOpen} = useDetails({closeOnOutsideClick: true})
    return (
      <Details {...getDetailsProps()}>
        <IconButton as="summary" icon={TrashIcon} />
        確定刪除 ?
        <Button variant="danger" type="button" onClick={() => {
          setOpen(false);
          onOk();
        }}>刪除</Button>
        <Button type="button" onClick={() => {
          setOpen(false);
        }}>取消</Button>
      </Details>
    )
}

export { Confirm }
