import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { deleteUser, fetchUsers } from '../../api';
import moment from 'moment';
import { Link } from 'react-router';
import { paths } from '../../constants';

export const RootPage = () => {
	const queryClient = useQueryClient();
	const [page] = useState(1);
	const [fromDate] = useState(moment.utc().format('DD-MM'));
	const [toDate] = useState(moment.utc().add('days', 7).format('DD-MM'));
	const pageSize = 10;

	const { data, isFetching } = useQuery({
		queryKey: ['usersRoot', { fromDate, toDate, page }],
		queryFn: () =>
			fetchUsers({
				fromDate,
				toDate,
				page,
				pageSize,
			}),
	});

	const mutation = useMutation({
		mutationFn: deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['usersRoot'] });
		},
	});

	return (
		<div>
			<h1 id="tabelLabel">Users</h1>
			<h2>
				<Link to={paths.create}>Create user</Link>
			</h2>
			<h2>
				<Link to={paths.usersList}>See all users</Link>
			</h2>
			{isFetching ? (
				<p>Loading ....</p>
			) : (
				<>
					<h3>Today's birthdays</h3>
					<div>
						{data?.onFromDate.map((user) => (
							<p key={user.id}>
								<Link to={`/users/${user.id}`}>
									<span>
										{user.name} {moment.utc(user.birthDay).format('DD-MM-YYYY')}
									</span>
								</Link>
								<button
									onClick={() => {
										mutation.mutate(user.id);
									}}
								>
									X
								</button>
							</p>
						))}
					</div>
					<h3>Incoming birthdays (in 7 days)</h3>
					<div>
						{data?.beforeToDate.map((user) => (
							<p key={user.id}>
								<Link to={`/users/${user.id}`}>
									<span>
										{user.name} {moment.utc(user.birthDay).format('DD-MM-YYYY')}
									</span>
								</Link>
								<button
									onClick={() => {
										mutation.mutate(user.id);
									}}
								>
									X
								</button>
							</p>
						))}
					</div>
				</>
			)}
		</div>
	);
};
