import React from 'react';
import { createRoot } from 'react-dom/client';

//import { App } from './App';
import { HASTSearch } from './HASTSearch';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<HASTSearch />);
