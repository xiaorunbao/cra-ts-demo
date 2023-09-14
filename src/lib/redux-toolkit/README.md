# redux-toolkit

一套 redux 工具包

**注意:** 本文目前还只是零散的思考片段，不能作为写代码的依据

## 动态加载

将整个 store 切分为 slice，每个 slice 承载限定范围内的业务逻辑。

在`container`加载的时候，lazy 加载对应的 slice。

## 零碎的思考片段

### 异步 dispatch 是否有必要?

我们会遇到很多场景，比如 submit 成功后，关闭 modal。此时往往会想到使用异步 dispatch，例如

```js
  dispatch(
    create({
      body: {
        ...values,
      },
    })
  ).then((action) => {
    if (isFulfilled(action)) {
      closeSomeModal();
    }
  });
```

但这样的方式，会使得 container 中充满业务逻辑。

遵循的原则：

- 界面是状态的结果，`UI = f(state)`

modal 是否关闭，应该是 state 的映射，这个操作应该在 slice 中进行，改变 slice 中的 modal state。

```js
const slice = {
  state: {
    modalVisiblity: false,
  },
  methods: {
    toggleModal(){},
  },
  effects: {
    create: wrap(sdk.createSomthing),
    watchCreateSuccess() {
      yield take(successOf("create"));
      put(toggleModal(true));
    },
  }
}
```

如果有多个 promise 需要顺序执行，通常建议直接用纯函数将这些 promise 组成一个新的函数。

### 异步请求的三个阶段，数据应该如何存放在 redux 中

以前我们的处理办法是在每个 redux 节点中存放请求的状态以及数据结果，例如:

```js
{
  cats: {
    query: {...},
    total: 10,
    result: [],
    loading: true,
    success: false,
  },
  books: {
    query: {...},
    total: 10,
    result: [],
    loading: true,
    success: false,
  }
}
```

但是这样有个很大的缺点，数据的语义变得含糊而复杂，成为一种约定。
这个节点看起来就像是一种 api 的结果，如果哪一天 API 变了，或者变成 websocket 的形式推送数据了。
那么这个结构就会需要改变。

对于数据本身来说，更理想的形态应该是:

```js
{
  home: {
    catsTotal: 999,
    cats: [...],
    books: [...]
  }
}
```

对于 API 的状态，是否可以考虑分开来存放。例如:

```js
{
  api: {
    "home.listCats": {
      query: {...},
      loading: true,
      success: false,
      error: null,
    }
  }
}
```

### Action 的 type

action.type 代表了这类 Action 应该怎么样被 reducer 处理。

action.key 代表这个 Action 的 reducer 需要在对应的 state.key 处理。

整个 state 的结构可能是这样的。

```js
{
  app: {
    shoppingCart: [],
    DictDataA: [],
  },
  monitor: {
    cars: [],
    alerts: [],
  },
  @api: {
    "home/listCats": {
      query: {...},
      loading: true,
      success: false,
      error: null,
    }
  },
  @form: {
    "createSome": {},
  },
  @toggel: {
    "someModal": {
      open: false,
    },
  },
  @timer: {
    "someTimer": {},
  },
}
```

为了适配 redux-devTools，可以考虑用 `${key}/${type}` 作为最终的类型。

### slice 的调用方式

```js
const listCarsSlice = makeApiSlice("monitor", [sdk.listCars], schema);

listCarsSlice.actions.listCars;
listCarsSlice.selectors.listCars;

const monitorSlice = makeSlice("monitor", {
  state: {
    modalVisiblity: false,
    cars: [],
    drivers: [],
  },
  methods: {
    toggleModal(state){
      modalVisiblity = !state.modalVisiblity;
    },

    // 主要用于应对类似 graphQL 等灵活的 api 情况
    // 不能假定所有的 api 都是严格的 rest
    @watchLatest(listCarsSlice.actions.listCars.type)
    setCarsAndDrivers(state, payload){ 
      state.cars = payload.cars;
      state.drivers = payload.drivers;
    }
  }
}, (slice) => {
  function* onUpdate() {
    console.log("cars and drivers updated")
  }

  function* incrementAsync() {
    yield delay(1000)
    yield put({ type: 'INCREMENT' })
  }

  function* watchIncrementAsync() {
    yield takeEvery('INCREMENT_ASYNC', incrementAsync)
  }

  function* watchCarsUpdated() {
    yield takeEvery(slice.actionTypes.setCarsAndDrivers, onUpdate)
  }

  return [watchIncrementAsync, watchCarsUpdated];
})

const [{ loading, success, error }, { listCars }] = useSlice(listCarsSlice);
const [{ modalVisiblity, cars, drivers }, { toggleModal, setCarsAndDrivers }] = useSlice(monitorSlice);


listCars(..args)
console.log(cars);
```
