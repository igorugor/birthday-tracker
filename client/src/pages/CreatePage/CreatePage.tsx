import { useEffect, useRef, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, getUserById, updateUser } from '../../api';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router';
import { paths } from '../../constants';

export const CreatePage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const nameRef = useRef<HTMLInputElement>(null);

	const [birthday, setBirthday] = useState<string | null>(null);

	const { data } = useQuery({
		queryKey: ['getUser', { id }],
		queryFn: () => {
			if (id) {
				return getUserById(Number(id));
			}

			return null;
		},
	});

	const createUserMutation = useMutation({
		mutationFn: createUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['usersRoot'] });
			navigate(paths.root, {
				replace: true,
			});
		},
	});

	const updateUserMutation = useMutation({
		mutationFn: updateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['usersRoot'] });
			navigate(paths.root, {
				replace: true,
			});
		},
	});

	useEffect(() => {
		if (data && nameRef.current) {
			const { name, birthDay } = data;

			nameRef.current.value = name;
			setBirthday(birthDay);
		}
	}, [data]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();

				if (nameRef.current && birthday) {
					if (id) {
						updateUserMutation.mutate({
							id: Number(id),
							name: nameRef.current.value,
							birthday,
						});
					} else {
						createUserMutation.mutate({
							name: nameRef.current.value,
							birthday,
						});
					}
				}
			}}
		>
			<h1 id="tabelLabel">Create User</h1>
			<input name="name" ref={nameRef} />
			<DatePicker
				value={birthday ? moment(birthday) : null}
				onChange={(value) => {
					if (moment.isMoment(value)) {
						setBirthday(moment(value).utc(true).toISOString());
					}
				}}
			/>
			<button type="submit">Submit</button>
		</form>
	);
};
