import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { deleteUser, fetchUsers } from '../../api';
import moment from 'moment';
import { Link } from 'react-router';
import { paths } from '../../constants';

import './RootPage.css';

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
		<div className="page">
			<h1 id="tabelLabel">Пользователи</h1>
			<h2>
				<Link to={paths.create}>Добавить пользователя</Link>
			</h2>
			<h2>
				<Link to={paths.usersList}>Полный список пользователей</Link>
			</h2>
			{isFetching ? (
				<p>Загрузка ....</p>
			) : (
				<>
					<h3>Отмечают ДР сегодня</h3>
					<div className="users-container">
						{data?.onFromDate.map((user) => (
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
					<h3>Ближайшие ДР (в течение 7 дней)</h3>
					<div className="users-container">
						{data?.beforeToDate.map((user) => (
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
				</>
			)}
		</div>
	);
};
