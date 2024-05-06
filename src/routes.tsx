import React, { lazy, Suspense } from 'react';
// import Chat from "./pages/chat";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/home';

const Chat = lazy(() => import('./pages/flowchart'));
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/flowchart',
    element: (
      <Suspense>
        <Chat />
      </Suspense>
    ),
  },
]);

export default router;
