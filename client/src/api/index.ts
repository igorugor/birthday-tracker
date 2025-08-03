import axios, { type AxiosResponse } from 'axios';

const mainApi = axios.create({
	baseURL: 'http://localhost:5055',
});

export type User = { id: number; name: string; birthDay: string };

export type FetchUsersParams = {
	fromDate?: string;
	toDate?: string;
	page?: number;
	pageSize?: number;
};

export type FetchUsersResponse = {
	onFromDate: User[];
	beforeToDate: User[];
};

export const fetchUsers = async (params: FetchUsersParams) =>
	mainApi
		.get<FetchUsersParams, AxiosResponse<FetchUsersResponse>>('api/users', {
			params,
		})
		.then((res) => res.data);

export const getUserById = async (id: number) =>
	mainApi.get<number, AxiosResponse<User>>(`api/users/${id}`).then((res) => res.data);

interface CreateUserRequest {
	id?: number;
	name: string;
	birthday: string;
}

export const createUser = async ({ name, birthday }: CreateUserRequest) =>
	mainApi.post<CreateUserRequest, AxiosResponse<User>>('api/users', { name, birthday }).then((res) => res.data);

export const updateUser = async ({ id, name, birthday }: CreateUserRequest) =>
	mainApi
		.put<CreateUserRequest, AxiosResponse<User>>(`api/users/${id}`, { id, name, birthday })
		.then((res) => res.data);

export const deleteUser = async (id: number) => mainApi.delete(`api/users/${id}`).then((res) => res.data);
