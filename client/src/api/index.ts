import axios, { type AxiosResponse } from 'axios';

const mainApi = axios.create({
	baseURL: 'http://localhost:5055',
});

export type User = { id: number; name: string; birthDay: string; imageUrl: string | null };

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

export const createUser = async (data: FormData) =>
	mainApi
		.post<CreateUserRequest, AxiosResponse<User>>('api/users', data, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		.then((res) => res.data);

export const updateUser = async (data: FormData) =>
	mainApi
		.put<CreateUserRequest, AxiosResponse<User>>('api/users', data, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
		.then((res) => res.data);

export const deleteUser = async (id: number) => mainApi.delete(`api/users/${id}`).then((res) => res.data);
