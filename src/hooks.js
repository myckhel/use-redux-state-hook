import { useCallback, useLayoutEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import storage from './store'
import { createSelector } from 'reselect'
import _ from 'lodash'

import {
  SET_REDUX_STATE,
  UNSUBSCRIBE_REDUX_STATE,
  SUBSCRIBE_REDUX_STATE,
  CLEANUP_REDUX_STATE,
  STATE_NAME
} from './constants'

const sel = (state) => state

const unique = () => new Date().getTime();

export const useMemoSelector = (selector, select = sel, eq = _.isEqual) =>
  useSelector(createSelector(selector, select), eq)

export const useReduxState = (stateName, initState) => {
  const store = useRef(storage.store).current
  const name = useRef(stateName || unique()).current;
  const dispatch = useDispatch()

  const action = useCallback(
    (payload) => ({ type: SET_REDUX_STATE, payload, name }),
    [name]
  )
  const cleanUpAction = useCallback(
    (payload) => ({ type: CLEANUP_REDUX_STATE, payload, name }),
    [name]
  )

  const stateSubscriptionAction = useCallback(
    (payload) => ({
      type: SUBSCRIBE_REDUX_STATE,
      payload,
      name
    }),
    [name]
  )
  const stateUnSubscriptionAction = useCallback(
    (payload) => ({
      type: UNSUBSCRIBE_REDUX_STATE,
      payload,
      name
    }),
    [name]
  )

  const getInit = useCallback(() => {
    if (typeof initState === 'function') {
      return initState(getState());
    } else {
      return initState;
    }
  }, [initState, getState]);

  const setState = useCallback(
    (payload) =>
      dispatch(action(payload)),
    []
  )

  const selector = useCallback(
    (state) => {
      const storeState = state?.[STATE_NAME]?.[name]
      const initialState = getInit()
      return storeState !== undefined
        ? storeState
        : initialState !== undefined
        ? initialState
        : ''
    },
    [name]
  )

  const cleanup = useCallback(() => dispatch(cleanUpAction()), [cleanUpAction])

  const getState = useCallback(() => store?.getState()?.[STATE_NAME]?.[name], [
    name
  ])

  const getSateSubscription = useCallback(
    () =>
      store?.getState()?.[STATE_NAME]?.redux_state_subscriptions?.[name] || 0,
    [name]
  )

  useLayoutEffect(() => {
    const subCount = getSateSubscription()
    const initialState = getInit()

    subCount < 1 && initialState !== undefined && setState(initialState)

    // subsribe to state
    dispatch(stateSubscriptionAction())

    return () => {
      dispatch(stateUnSubscriptionAction())
    }
  }, [])

  return { selector, setState, getState, action, cleanup }
}
