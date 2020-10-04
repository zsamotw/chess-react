import { configureStore } from '@reduxjs/toolkit'
import { gameReducers } from './reducers'
import createSagaMiddleware from 'redux-saga'
import rootSaga from './sagas'

const sagaMiddleware = createSagaMiddleware()
const store = configureStore({ reducer: gameReducers, middleware: [sagaMiddleware]  })
sagaMiddleware.run(rootSaga)

export default { store }