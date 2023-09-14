import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';

import { history } from 'src/lib/history';
import { configureStore } from 'src/lib/redux-toolkit';

import App from './app';

const store = configureStore();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <Provider store={store}>
    <HistoryRouter history={history} basename="cra">
      <App />
    </HistoryRouter>
  </Provider>
);
