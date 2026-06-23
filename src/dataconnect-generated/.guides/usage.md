# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateOrder, useUpdateOrderStatus, useListStudentOrders, useGetRestaurantMenu } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateOrder(createOrderVars);

const { data, isPending, isSuccess, isError, error } = useUpdateOrderStatus(updateOrderStatusVars);

const { data, isPending, isSuccess, isError, error } = useListStudentOrders(listStudentOrdersVars);

const { data, isPending, isSuccess, isError, error } = useGetRestaurantMenu(getRestaurantMenuVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createOrder, updateOrderStatus, listStudentOrders, getRestaurantMenu } from '@dataconnect/generated';


// Operation CreateOrder:  For variables, look at type CreateOrderVars in ../index.d.ts
const { data } = await CreateOrder(dataConnect, createOrderVars);

// Operation UpdateOrderStatus:  For variables, look at type UpdateOrderStatusVars in ../index.d.ts
const { data } = await UpdateOrderStatus(dataConnect, updateOrderStatusVars);

// Operation ListStudentOrders:  For variables, look at type ListStudentOrdersVars in ../index.d.ts
const { data } = await ListStudentOrders(dataConnect, listStudentOrdersVars);

// Operation GetRestaurantMenu:  For variables, look at type GetRestaurantMenuVars in ../index.d.ts
const { data } = await GetRestaurantMenu(dataConnect, getRestaurantMenuVars);


```