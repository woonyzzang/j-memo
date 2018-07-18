import React from 'react';
import ReactDOM from 'react-dom';

import {createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';

// import createLogger from 'redux-logger';
// import thunk from 'redux-thunk';

import reducers from './reducers';
// import {getAllMemoDirs} from './actions';

import App from './components/App';
import 'react-quill/dist/quill.snow.css';
import './scss/j-memo.scss';

// const middleware = [thunk];
//
// if (process.env.NODE_ENV !== 'production') {
//   middleware.push(createLogger);
// }

const store = createStore(
  reducers
  //applyMiddleware(...middleware)
);

//store.dispatch(getAllMemoDirs());

//const rootElement = document.getElementById('root');
//ReactDOM.render(<App />, rootElement);
ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
