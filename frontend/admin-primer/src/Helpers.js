import React from 'react';

import {
  Box,
  Button,
  Details,
  Flash,
  IconButton,
  StyledOcticon,
  Label,
  useDetails,
} from '@primer/react';

import {
  CheckIcon,
  TrashIcon,
  XIcon,
} from '@primer/octicons-react';

const PhokFlash = ({ data, onClose }) => {
  return (
    <>
      {(data && data.isShow === true) ?
       <Flash variant={(data.isError === true) ? "danger": "success"}>
         <StyledOcticon icon={CheckIcon} />
         { data.text }
         <Label sx={{ position: 'absolute', top: 1, right: 1 }} onClick={onClose}>X</Label>
       </Flash>
       : null}
    </>
  );
}

const Confirm = ({onOk, appendText=''}) => {
  const {getDetailsProps, setOpen} = useDetails({closeOnOutsideClick: true})
    return (
      <Details {...getDetailsProps()}>
        <IconButton as="summary" icon={TrashIcon} />
        {`確定刪除？${appendText} `}
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

export { Confirm, PhokFlash}
