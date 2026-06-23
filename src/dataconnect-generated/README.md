# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListStudentOrders*](#liststudentorders)
  - [*GetRestaurantMenu*](#getrestaurantmenu)
- [**Mutations**](#mutations)
  - [*CreateOrder*](#createorder)
  - [*UpdateOrderStatus*](#updateorderstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListStudentOrders
You can execute the `ListStudentOrders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listStudentOrders(vars: ListStudentOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListStudentOrdersData, ListStudentOrdersVariables>;

interface ListStudentOrdersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListStudentOrdersVariables): QueryRef<ListStudentOrdersData, ListStudentOrdersVariables>;
}
export const listStudentOrdersRef: ListStudentOrdersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listStudentOrders(dc: DataConnect, vars: ListStudentOrdersVariables, options?: ExecuteQueryOptions): QueryPromise<ListStudentOrdersData, ListStudentOrdersVariables>;

interface ListStudentOrdersRef {
  ...
  (dc: DataConnect, vars: ListStudentOrdersVariables): QueryRef<ListStudentOrdersData, ListStudentOrdersVariables>;
}
export const listStudentOrdersRef: ListStudentOrdersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listStudentOrdersRef:
```typescript
const name = listStudentOrdersRef.operationName;
console.log(name);
```

### Variables
The `ListStudentOrders` query requires an argument of type `ListStudentOrdersVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListStudentOrdersVariables {
  studentId: UUIDString;
}
```
### Return Type
Recall that executing the `ListStudentOrders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListStudentOrdersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListStudentOrders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listStudentOrders, ListStudentOrdersVariables } from '@dataconnect/generated';

// The `ListStudentOrders` query requires an argument of type `ListStudentOrdersVariables`:
const listStudentOrdersVars: ListStudentOrdersVariables = {
  studentId: ..., 
};

// Call the `listStudentOrders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listStudentOrders(listStudentOrdersVars);
// Variables can be defined inline as well.
const { data } = await listStudentOrders({ studentId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listStudentOrders(dataConnect, listStudentOrdersVars);

console.log(data.orders);

// Or, you can use the `Promise` API.
listStudentOrders(listStudentOrdersVars).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

### Using `ListStudentOrders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listStudentOrdersRef, ListStudentOrdersVariables } from '@dataconnect/generated';

// The `ListStudentOrders` query requires an argument of type `ListStudentOrdersVariables`:
const listStudentOrdersVars: ListStudentOrdersVariables = {
  studentId: ..., 
};

// Call the `listStudentOrdersRef()` function to get a reference to the query.
const ref = listStudentOrdersRef(listStudentOrdersVars);
// Variables can be defined inline as well.
const ref = listStudentOrdersRef({ studentId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listStudentOrdersRef(dataConnect, listStudentOrdersVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.orders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.orders);
});
```

## GetRestaurantMenu
You can execute the `GetRestaurantMenu` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRestaurantMenu(vars: GetRestaurantMenuVariables, options?: ExecuteQueryOptions): QueryPromise<GetRestaurantMenuData, GetRestaurantMenuVariables>;

interface GetRestaurantMenuRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRestaurantMenuVariables): QueryRef<GetRestaurantMenuData, GetRestaurantMenuVariables>;
}
export const getRestaurantMenuRef: GetRestaurantMenuRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRestaurantMenu(dc: DataConnect, vars: GetRestaurantMenuVariables, options?: ExecuteQueryOptions): QueryPromise<GetRestaurantMenuData, GetRestaurantMenuVariables>;

interface GetRestaurantMenuRef {
  ...
  (dc: DataConnect, vars: GetRestaurantMenuVariables): QueryRef<GetRestaurantMenuData, GetRestaurantMenuVariables>;
}
export const getRestaurantMenuRef: GetRestaurantMenuRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRestaurantMenuRef:
```typescript
const name = getRestaurantMenuRef.operationName;
console.log(name);
```

### Variables
The `GetRestaurantMenu` query requires an argument of type `GetRestaurantMenuVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRestaurantMenuVariables {
  restaurantId: UUIDString;
}
```
### Return Type
Recall that executing the `GetRestaurantMenu` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRestaurantMenuData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetRestaurantMenuData {
  menuItems: ({
    name: string;
    price: number;
    description: string;
  })[];
}
```
### Using `GetRestaurantMenu`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRestaurantMenu, GetRestaurantMenuVariables } from '@dataconnect/generated';

// The `GetRestaurantMenu` query requires an argument of type `GetRestaurantMenuVariables`:
const getRestaurantMenuVars: GetRestaurantMenuVariables = {
  restaurantId: ..., 
};

// Call the `getRestaurantMenu()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRestaurantMenu(getRestaurantMenuVars);
// Variables can be defined inline as well.
const { data } = await getRestaurantMenu({ restaurantId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRestaurantMenu(dataConnect, getRestaurantMenuVars);

console.log(data.menuItems);

// Or, you can use the `Promise` API.
getRestaurantMenu(getRestaurantMenuVars).then((response) => {
  const data = response.data;
  console.log(data.menuItems);
});
```

### Using `GetRestaurantMenu`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRestaurantMenuRef, GetRestaurantMenuVariables } from '@dataconnect/generated';

// The `GetRestaurantMenu` query requires an argument of type `GetRestaurantMenuVariables`:
const getRestaurantMenuVars: GetRestaurantMenuVariables = {
  restaurantId: ..., 
};

// Call the `getRestaurantMenuRef()` function to get a reference to the query.
const ref = getRestaurantMenuRef(getRestaurantMenuVars);
// Variables can be defined inline as well.
const ref = getRestaurantMenuRef({ restaurantId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRestaurantMenuRef(dataConnect, getRestaurantMenuVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.menuItems);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.menuItems);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateOrder
You can execute the `CreateOrder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createOrder(vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;

interface CreateOrderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
}
export const createOrderRef: CreateOrderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createOrder(dc: DataConnect, vars: CreateOrderVariables): MutationPromise<CreateOrderData, CreateOrderVariables>;

interface CreateOrderRef {
  ...
  (dc: DataConnect, vars: CreateOrderVariables): MutationRef<CreateOrderData, CreateOrderVariables>;
}
export const createOrderRef: CreateOrderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createOrderRef:
```typescript
const name = createOrderRef.operationName;
console.log(name);
```

### Variables
The `CreateOrder` mutation requires an argument of type `CreateOrderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateOrderVariables {
  studentId: UUIDString;
  restaurantId: UUIDString;
  totalAmount: number;
  status: string;
}
```
### Return Type
Recall that executing the `CreateOrder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateOrderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateOrderData {
  order_insert: Order_Key;
}
```
### Using `CreateOrder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createOrder, CreateOrderVariables } from '@dataconnect/generated';

// The `CreateOrder` mutation requires an argument of type `CreateOrderVariables`:
const createOrderVars: CreateOrderVariables = {
  studentId: ..., 
  restaurantId: ..., 
  totalAmount: ..., 
  status: ..., 
};

// Call the `createOrder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createOrder(createOrderVars);
// Variables can be defined inline as well.
const { data } = await createOrder({ studentId: ..., restaurantId: ..., totalAmount: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createOrder(dataConnect, createOrderVars);

console.log(data.order_insert);

// Or, you can use the `Promise` API.
createOrder(createOrderVars).then((response) => {
  const data = response.data;
  console.log(data.order_insert);
});
```

### Using `CreateOrder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createOrderRef, CreateOrderVariables } from '@dataconnect/generated';

// The `CreateOrder` mutation requires an argument of type `CreateOrderVariables`:
const createOrderVars: CreateOrderVariables = {
  studentId: ..., 
  restaurantId: ..., 
  totalAmount: ..., 
  status: ..., 
};

// Call the `createOrderRef()` function to get a reference to the mutation.
const ref = createOrderRef(createOrderVars);
// Variables can be defined inline as well.
const ref = createOrderRef({ studentId: ..., restaurantId: ..., totalAmount: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createOrderRef(dataConnect, createOrderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_insert);
});
```

## UpdateOrderStatus
You can execute the `UpdateOrderStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateOrderStatus(vars: UpdateOrderStatusVariables): MutationPromise<UpdateOrderStatusData, UpdateOrderStatusVariables>;

interface UpdateOrderStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateOrderStatusVariables): MutationRef<UpdateOrderStatusData, UpdateOrderStatusVariables>;
}
export const updateOrderStatusRef: UpdateOrderStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateOrderStatus(dc: DataConnect, vars: UpdateOrderStatusVariables): MutationPromise<UpdateOrderStatusData, UpdateOrderStatusVariables>;

interface UpdateOrderStatusRef {
  ...
  (dc: DataConnect, vars: UpdateOrderStatusVariables): MutationRef<UpdateOrderStatusData, UpdateOrderStatusVariables>;
}
export const updateOrderStatusRef: UpdateOrderStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateOrderStatusRef:
```typescript
const name = updateOrderStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateOrderStatus` mutation requires an argument of type `UpdateOrderStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateOrderStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateOrderStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateOrderStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateOrderStatusData {
  order_update?: Order_Key | null;
}
```
### Using `UpdateOrderStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateOrderStatus, UpdateOrderStatusVariables } from '@dataconnect/generated';

// The `UpdateOrderStatus` mutation requires an argument of type `UpdateOrderStatusVariables`:
const updateOrderStatusVars: UpdateOrderStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateOrderStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateOrderStatus(updateOrderStatusVars);
// Variables can be defined inline as well.
const { data } = await updateOrderStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateOrderStatus(dataConnect, updateOrderStatusVars);

console.log(data.order_update);

// Or, you can use the `Promise` API.
updateOrderStatus(updateOrderStatusVars).then((response) => {
  const data = response.data;
  console.log(data.order_update);
});
```

### Using `UpdateOrderStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateOrderStatusRef, UpdateOrderStatusVariables } from '@dataconnect/generated';

// The `UpdateOrderStatus` mutation requires an argument of type `UpdateOrderStatusVariables`:
const updateOrderStatusVars: UpdateOrderStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateOrderStatusRef()` function to get a reference to the mutation.
const ref = updateOrderStatusRef(updateOrderStatusVars);
// Variables can be defined inline as well.
const ref = updateOrderStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateOrderStatusRef(dataConnect, updateOrderStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.order_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.order_update);
});
```

