# Esunny-ts-cra

Esunny typscripts cra 脚手架

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).


## Development

Create a .env.local file under repo root path. Find available environments in `src/config/env` or `.env`.

```.env.local
REACT_APP_TITLE=Esunny
```

Install pnpm first.

```shell
npm install -g pnpm
```

Start your trip.

```shell
pnpm install

# start development
pnpm start

# developing components
pnpm storybook
```

如果使用 vscode 文件右上角的 Run code 功能，还需要全局安装 `ts-node`

```sh
pnpm add -g ts-node
```

## Mock server

需要编写的文件 mock 文件在 `mock/api` 下， 使用 [json-server](https://www.npmjs.com/package/json-server) 包进行mock

有两种方式使用mock server

1. 直接执行 `pnpm start:mock`, mock server 会自动启动，此时 访问 `/api/xxx` 可直接对数据进行增删改查。 缺点是mock文件改变后不会热启动，需要重新执行 `pnpm start:mock`, 在开发中使用不太方便, 这种方法比较适合在展示时使用。

2. 执行 `pnpm start`, 同时打开另外一个终端执行 `pnpm dev:mock` 这样 mock-server 会单独启动，监听端口默认为 3001, 此时 访问 `http://localhost:3001/api/xxx` 可直接访问mock api。
这种方式下修改完mock文件会自动更新mock服务，比较适合开发中使用

## Tech Stack

- [x] CRA + typescript
- [x] pnpm
- [x] eslint + prettier
- [x] husky + commitlint
- [x] craco + antd
- [x] styled
- [x] react router + sidebar menu + Privilege
- [x] dynamic import
- [x] redux + saga
- [x] service + sdk
- [x] mock

### redux

对 redux 进行一些包装以达到以下目的:

- 易用，像 useState 一样
- 动态加载

[详细文档见](src/lib/redux-toolkit/README.md)

建议 global 数据，通过封装放在 features 里。

## Glance

```sh
├── packages                packages
├── build                   build output
├── docs                    project docs
├── public                  static assets
├── scripts                 utilities script for build, test etc
└── src
    ├── components          react components
    ├── config              config
    ├── features            business components, like user selectors
    ├── hooks               reusable react hooks
    ├── lib                 cross-project reusable lib
    │   ├── lang            language level extensions
    │   │   ├── http
    │   │   └── time
    ├── containers          business containers with or without states
    ├── layouts             layouts
    ├── routes              define all routes constants
    ├── services            fetch/handle data, pure js
    └── sdk                 initialize, re-export API client, with some utilities
```

## Contribute

- 从 `ynnuse-mss/esunny-ts-cra` fork 到自己名下
- git clone
- 本地代码迁出一个 feat/bug 分支，git checkout -b feat/charge-record-list
- 开发
- 当上游有更新时
  - git fetch upstream main:main
  - 合并到本地 git rebase main, `feat/charge-record-list` 这个分支就包含了上游工程的最新代码
- 提交 pull request
  - gh pr create
  - 根据提示，最后一步 `continue on browser`
  - 目标选择 `ynnuse-mss/esunny-ts-cra` main 分支

## 文件命名规则

文件名全部使用小写字母和连词线（all-lowercase-with-dashes）

参考[阮一峰老师的博文](https://www.ruanyifeng.com/blog/2017/02/filename-should-be-lowercase.html)

