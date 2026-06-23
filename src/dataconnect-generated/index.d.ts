import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateOrderData {
  order_insert: Order_Key;
}

export interface CreateOrderVariables {
  studentId: UUIDString;
  restaurantId: UUIDString;
  totalAmount: number;
  status: string;
}

export interface GetRestaurantMenuData {
  menuItems: ({
    name: string;
    price: number;
    description: string;
  })[];
}

export interface GetRestaurantMenuVariables {
  restaurantId: UUIDString;
}

export interface ListStudentOrdersData {
  orders: ({
    id: UUIDString;
    status: string;
    totalAmount: number;
    createdAt: TimestampString;
    restaurant: {
      name: string;
    };
  } & Order_Key)[];
}

export interface ListStudentOrdersVariables {
  studentId: UUIDString;
}

export interface MenuItem_Key {
  id: UUIDString;
  __typename?: 'MenuItem_Key';
}

export interface OrderItem_Key {
  id: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface Restaurant_Key {
  id: UUIDString;
  __typename?: 'Restaurant_Key';
}

export interface Student_Key {
  id: UUIDString;
  __typename?: 'Student_Key';
}

export interface UpdateOrderStatusData {
  order_update?: Order_Key | null;
}

export interface UpdateOrderStatusVariables {
  id: UUIDString;
  status: string;
}

interface CreateOrderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
  operationName: string;
}
export const createOrderRef: CreateOrderRef;

export function createOrder(vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;
export function createOrder(dc: DataConnect, vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;

interface UpdateOrderStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOrderStatusVariables): MutationRef<UpdateOrderStatusData, UpdateOrderStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateOrderStatusVariables): MutationRef<UpdateOrderStatusData, UpdateOrderStatusVariables>;
  operationName: string;
}
export const updateOrderStatusRef: UpdateOrderStatusRef;

export function updateOrderStatus(vars: UpdateOrderStatusVariables): MutationPromise<UpdateOrderStatusData, UpdateOrderStatusVariables>;
export function updateOrderStatus(dc: DataConnect, vars: UpdateOrderStatusVariables): MutationPromise<UpdateOrderStatusData, UpdateOrderStatusVariables>;

interface ListStudentOrdersRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListStudentOrdersVariables): QueryRef<ListStudentOrdersData, ListStudentOrdersVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListStudentOrdersVariables): QueryRef<ListStudentOrdersData, ListStudentOrdersVariables>;
  operationName: string;
}
export const listStudentOrdersRef: ListStudentOrdersRef;

export function listStudentOrders(vars: ListStudentOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListStudentOrdersData, ListStudentOrdersVariables>;
export function listStudentOrders(dc: DataConnect, vars: ListStudentOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListStudentOrdersData, ListStudentOrdersVariables>;

interface GetRestaurantMenuRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRestaurantMenuVariables): QueryRef<GetRestaurantMenuData, GetRestaurantMenuVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRestaurantMenuVariables): QueryRef<GetRestaurantMenuData, GetRestaurantMenuVariables>;
  operationName: string;
}
export const getRestaurantMenuRef: GetRestaurantMenuRef;

export function getRestaurantMenu(vars: GetRestaurantMenuVariables, options?: ExecuteQueryOptions): QueryPromise<GetRestaurantMenuData, GetRestaurantMenuVariables>;
export function getRestaurantMenu(dc: DataConnect, vars: GetRestaurantMenuVariables, options?: ExecuteQueryOptions): QueryPromise<GetRestaurantMenuData, GetRestaurantMenuVariables>;

