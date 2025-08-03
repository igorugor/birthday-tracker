import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { deleteUser, fetchUsers } from '../../api';
import moment from 'moment';
import { Link } from 'react-router';
import { BirthdayPicker } from '../../BirthdayPicker';

import './UsersListPage.css';

export const UsersListPage = () => {
	const queryClient = useQueryClient();
	const [page, setPage] = useState(1);
	const [fromDate, setFromDate] = useState('');
	const [toDate, setToDate] = useState('');

	const [dayFrom, setDayFrom] = useState<number>(1);
	const [monthFrom, setMonthFrom] = useState<number>(1);

	const [dayTo, setDayTo] = useState<number>(31);
	const [monthTo, setMonthTo] = useState<number>(12);

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
		if (dayFrom && monthFrom) {
			setFromDate(`${dayFrom < 10 ? '0' + dayFrom : dayFrom}-${monthFrom < 10 ? '0' + monthFrom : monthFrom}`);
		}

		if (dayTo && monthTo) {
			setToDate(`${dayTo < 10 ? '0' + dayTo : dayTo}-${monthTo < 10 ? '0' + monthTo : monthTo}`);
		}
	}, [dayFrom, dayTo, monthFrom, monthTo]);

	return (
		<div className="users-page">
			<h1 color="black" id="tabelLabel">
				Список пользователей
			</h1>
			<BirthdayPicker
				dayFrom={dayFrom}
				dayTo={dayTo}
				monthFrom={monthFrom}
				monthTo={monthTo}
				onDayFromChange={(value) => {
					setDayFrom(value);
				}}
				onDayToChange={(value) => {
					setDayTo(value);
				}}
				onMonthFromChange={(value) => {
					setMonthFrom(value);
				}}
				onMonthToChange={(value) => {
					setMonthTo(value);
				}}
			/>
			<div className="buttons">
				<button
					disabled={page === 1}
					onClick={() => {
						setPage((prev) => prev - 1);
					}}
				>
					Пред.
				</button>
				<button
					disabled={[...(data?.beforeToDate ?? []), ...(data?.onFromDate ?? [])].length < pageSize}
					onClick={() => {
						setPage((prev) => prev + 1);
					}}
				>
					След.
				</button>
			</div>
			{isFetching && <p>Loading ...</p>}
			{!isFetching && !data && <p>No data present or error Occured</p>}
			{!isFetching && data && (
				<div className="users-container">
					{[...data.onFromDate, ...data.beforeToDate].map((user) => (
						<p key={user.id} className="user-field">
							{user.imageUrl ? (
								<img src={user.imageUrl} width={80} height={80} />
							) : (
								<h6>Аватар отсутствует</h6>
							)}
							<Link to={`/users/${user.id}`}>
								<span>Имя: {user.name}</span>
								<br />
								<span>Дата рождения: {moment.utc(user.birthDay).format('DD-MM-YYYY')}</span>
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
			)}
		</div>
	);
};
