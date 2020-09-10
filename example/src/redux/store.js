import {createStore} from 'redux';
import reducers from './reducers';
import { setStore, useStateReducer } from 'use-redux-state-hook'

const store = createStore(useStateReducer(reducers));
setStore(store);
export default store;
