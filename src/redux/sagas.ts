import MessageStatus from '../models/message-status.model'
import GameMode from '../models/game.mode'
import { call, put, takeLatest, select, all } from 'redux-saga/effects'
import { getGameId, getGameMode, getCurrentMoveStartingPoint, getIsGameOver } from './selectors'
import { setIsFetchingMove, forbiddenMove, makeFigureMove, setMessage, setIsFetchingGameId, startNewGame, makePlayerMoveApiRequest, makeComputerMoveApiRequest, startNewGameApiRequest } from './actions'
import { makeApiGetRequest, makeApiPostRequest } from '../helpers/api-helper'

function* makePlayerMove(action: any) {
  const { to } = action.payload
  const from = yield select(getCurrentMoveStartingPoint)
  if (from !== to) {
    yield put(setIsFetchingMove({ payload: true }))
    try {
      const game_id = yield select(getGameId)
      const gameMode = yield select(getGameMode)
      const urlPostMove = gameMode === GameMode.onePlayer ? '/one/move/player' : '/two/move'
      const { data } = yield call(makeApiPostRequest(urlPostMove), { from, to, game_id })

      if (data.status === 'error: invalid move!') {
        yield put(forbiddenMove())
      } else {
        const urlPostCheck = gameMode === GameMode.onePlayer ? '/one/check' : '/two/check'
        const { data } = yield call(makeApiPostRequest(urlPostCheck), { game_id })
        const { status } = data
        const isGameOver = yield select(getIsGameOver)
        yield put(makeFigureMove({ payload: { from, to, status } }))
        if (gameMode === GameMode.onePlayer && !isGameOver) {
          yield put(makeComputerMoveApiRequest({ payload: { game_id } }))
        }
      }

    }
    catch {
      const message = { content: 'Oops. Check internet connection', status: MessageStatus.error }
      yield put(setMessage({ payload: message }))
      yield put(setIsFetchingMove({ payload: false }))

    }
    yield put(setIsFetchingMove({ payload: false }))
  }
}

function* makeComputerMove(action: any) {
  try {
    const { data: moveData } = yield call(makeApiPostRequest('/one/move/ai'), action.payload)
    const { from, to } = moveData
    const { data: checkData } = yield call(makeApiPostRequest('/one/check'), action.payload)
    const { status } = checkData
    yield put(makeFigureMove({ payload: { from, to, status } }))
  }
  catch {
    const message = {
      content: 'Oops. Check internet connection',
      status: MessageStatus.error,
    }
    yield put(setMessage({ payload: message }))
  }
}

function* getNewGameId(action: any) {
  yield put(setIsFetchingGameId({ payload: true }))
  const { gameMode } = action.payload
  const url = gameMode === GameMode.onePlayer ? '/one' : '/two'
  try {
    const { data: { game_id } } = yield call(makeApiGetRequest(), url)
    yield put(startNewGame({ payload: game_id }))
  }
  catch {
    const message = { content: 'Problem with getting game id. Check you internet connection', status: MessageStatus.error }
    yield put(setMessage({ payload: message }))
  }
  yield put(setIsFetchingGameId({ payload: false }))
}

function* chessSaga() {
  yield takeLatest(makePlayerMoveApiRequest.type, makePlayerMove);
  yield takeLatest(makeComputerMoveApiRequest.type, makeComputerMove);
  yield takeLatest(startNewGameApiRequest.type, getNewGameId);
}

export default function* rootSaga() {
  yield all([
    chessSaga()
  ])
}
