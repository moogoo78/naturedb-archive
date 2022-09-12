import React from 'react';
import {
  Button,
} from '@primer/react';
import {
  useNavigate,
  Link as RouterLink,
} from "react-router-dom";

export default function CollectionList() {
  const navigate = useNavigate();
  return (
    <>
    <h2>list</h2>
      <Button onClick={(e) => {
        navigate(`/collections/create`, {replace: true})
      }}>新增</Button>
    </>
  )
}
