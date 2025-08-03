import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { RootPage } from './pages/RootPage/RootPage';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { createBrowserRouter, RouterProvider } from 'react-router';
import { CreatePage } from './pages/CreatePage/CreatePage';
import { paths } from './constants';
import { UsersListPage } from './pages/UsersListPage/UsersListPage';

const queryClient = new QueryClient();

const router = createBrowserRouter([
	{
		path: paths.root,
		Component: RootPage,
	},
	{
		path: paths.usersList,
		Component: UsersListPage,
	},
	{
		path: paths.create,
		Component: CreatePage,
	},
	{
		path: paths.user,
		Component: CreatePage,
	},
]);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<LocalizationProvider dateAdapter={AdapterMoment}>
				<RouterProvider router={router} />
			</LocalizationProvider>
		</QueryClientProvider>
	</StrictMode>
);
