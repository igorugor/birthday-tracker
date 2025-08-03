import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { deleteUser, fetchUsers } from '../../api';
import moment from 'moment';
import { Link } from 'react-router';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export const UsersListPage = () => {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [fromDate, setFromDate] = useState(moment.utc().startOf('year').format('DD-MM'));
	const [toDate, setToDate] = useState(moment.utc().format('DD-MM'));
	const pageSize = 10;

	const { data, isFetching } = useQuery({
		queryKey: ['usersList', { fromDate, toDate, page }],
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
			queryClient.invalidateQueries({ queryKey: ['usersList'] });
		},
	});

	useEffect(() => {
		setPage(1);
	}, [toDate, fromDate]);

	return (
		<div>
			<h1 id="tabelLabel">Users List</h1>
			<DatePicker
				format="DD-MM"
				value={fromDate ? moment(fromDate) : null}
				onChange={(value) => {
					if (moment.isMoment(value)) {
						setFromDate(moment(value).utc(true).format('DD-MM'));
					}
				}}
			/>
			<DatePicker
				format="DD-MM"
				value={toDate ? moment(toDate) : null}
				onChange={(value) => {
					if (moment.isMoment(value)) {
						setToDate(moment(value).utc(true).format('DD-MM'));
					}
				}}
			/>
			<button
				disabled={page === 1}
				onClick={() => {
					setPage((prev) => prev - 1);
				}}
			>
				Prev
			</button>
			<button
				onClick={() => {
					setPage((prev) => prev + 1);
				}}
			>
				Next
			</button>
			{isFetching && <p>Loading ...</p>}
			{!isFetching && !data && <p>No data present or error Occured</p>}
			{!isFetching && data && (
				<>
					<div>
						{[...data.onFromDate, ...data.beforeToDate].map((user) => (
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
