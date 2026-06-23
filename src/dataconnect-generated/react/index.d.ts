import { CreateOrderData, CreateOrderVariables, UpdateOrderStatusData, UpdateOrderStatusVariables, ListStudentOrdersData, ListStudentOrdersVariables, GetRestaurantMenuData, GetRestaurantMenuVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateOrder(options?: useDataConnectMutationOptions<CreateOrderData, FirebaseError, CreateOrderVariables>): UseDataConnectMutationResult<CreateOrderData, CreateOrderVariables>;
export function useCreateOrder(dc: DataConnect, options?: useDataConnectMutationOptions<CreateOrderData, FirebaseError, CreateOrderVariables>): UseDataConnectMutationResult<CreateOrderData, CreateOrderVariables>;

export function useUpdateOrderStatus(options?: useDataConnectMutationOptions<UpdateOrderStatusData, FirebaseError, UpdateOrderStatusVariables>): UseDataConnectMutationResult<UpdateOrderStatusData, UpdateOrderStatusVariables>;
export function useUpdateOrderStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateOrderStatusData, FirebaseError, UpdateOrderStatusVariables>): UseDataConnectMutationResult<UpdateOrderStatusData, UpdateOrderStatusVariables>;

export function useListStudentOrders(vars: ListStudentOrdersVariables, options?: useDataConnectQueryOptions<ListStudentOrdersData>): UseDataConnectQueryResult<ListStudentOrdersData, ListStudentOrdersVariables>;
export function useListStudentOrders(dc: DataConnect, vars: ListStudentOrdersVariables, options?: useDataConnectQueryOptions<ListStudentOrdersData>): UseDataConnectQueryResult<ListStudentOrdersData, ListStudentOrdersVariables>;

export function useGetRestaurantMenu(vars: GetRestaurantMenuVariables, options?: useDataConnectQueryOptions<GetRestaurantMenuData>): UseDataConnectQueryResult<GetRestaurantMenuData, GetRestaurantMenuVariables>;
export function useGetRestaurantMenu(dc: DataConnect, vars: GetRestaurantMenuVariables, options?: useDataConnectQueryOptions<GetRestaurantMenuData>): UseDataConnectQueryResult<GetRestaurantMenuData, GetRestaurantMenuVariables>;
