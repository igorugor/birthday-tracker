import { useEffect, useRef, useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createUser, getUserById, updateUser } from '../../api';
import moment from 'moment';
import { useNavigate, useParams } from 'react-router';
import { paths } from '../../constants';

import './CreatePage.css';

export const CreatePage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const nameRef = useRef<HTMLInputElement>(null);
	const imageRef = useRef<HTMLInputElement>(null);

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
			className="create-page"
			onSubmit={(e) => {
				e.preventDefault();

				if (nameRef.current && birthday) {
					const formData = new FormData();
					formData.append('name', nameRef.current.value);
					formData.append('birthday', birthday);

					if (imageRef.current?.files) {
						formData.append('image', imageRef.current.files[0]);
					}

					if (id) {
						formData.append('id', id);
						updateUserMutation.mutate(formData);
					} else {
						createUserMutation.mutate(formData);
					}
				}
			}}
		>
			<h1 id="tabelLabel">{id ? 'Edit' : 'Create'} User</h1>
			{id && data?.imageUrl && (
				<>
					<h6>Текущий аватар: </h6>
					<img src={data.imageUrl} width={80} height={80} />
				</>
			)}
			<label htmlFor="image">Аватар</label>
			<input type="file" ref={imageRef} name="image" accept="image/*" />
			<label htmlFor="name">Имя</label>
			<input name="name" ref={nameRef} />
			<label>Дата рождения</label>
			<DatePicker
				value={birthday ? moment(birthday) : null}
				onChange={(value) => {
					if (moment.isMoment(value)) {
						setBirthday(moment(value).utc(true).toISOString());
					}
				}}
			/>
			<button type="submit">Сохранить</button>
		</form>
	);
};
