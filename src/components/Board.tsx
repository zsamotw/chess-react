import React, { useEffect } from 'react'
import Rows from './Rows'
import GameState from '../models/store-model'
import {
  getBoard,
  getGameId,
  getMessage,
  getIsFetchingGameId,
  getIsGameOver,
} from '../redux/selectors'
import { connect } from 'react-redux'
import { Board as BoardModel } from '../models/board-model'
import styled from 'styled-components'
import { Record } from 'immutable'
import Snackbar from '@material-ui/core/Snackbar'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import { makeStyles } from '@material-ui/core/styles'
import Message from '../models/message'
import Alert from './Alert'
import Color from '../models/color'
import MessageStatus from '../models/message-status'
import GameDialog from './GameDialog'
import StartGameDialogContent from './StartGameDialogContent'

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const useStyles = makeStyles(theme => ({
  backdrop: {
    opacity: 0.6,
    zIndex: 10000
  },
}))

function Board(props: {
  board: BoardModel
  message: Message
  isGame: boolean
  isFetchingGameId: boolean
  activePlayerColor: Color
  isGameOver: boolean
}) {
  const { board, message, isGame, isFetchingGameId } = props

  const [openSnackBar, setOpenSnackBar] = React.useState(false)
  const [openDialog, setOpenDialog] = React.useState(false)
  const [openProgressBar, setOpenProgressBar] = React.useState(false)
  const [localMessage, setLocalMessage] = React.useState({
    content: '',
    status: undefined,
  } as Message)

  const handleCloseSnackBar = (
    event?: React.SyntheticEvent,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return
    }

    setOpenSnackBar(false)
  }

  type Severity = 'error' | 'warning' | 'info' | 'success' | undefined

  useEffect(() => {
    setOpenDialog(!isGame && !isFetchingGameId)
    setOpenProgressBar(isFetchingGameId)
    if (!!message.content && message !== localMessage) {
      console.log(isFetchingGameId);
      handleCloseSnackBar(undefined, '')
      setLocalMessage(message)
      setOpenSnackBar(true)
    }
  }, [message, localMessage, isGame, isFetchingGameId])

  const backDropClasses = useStyles()

  return (
    <BoardContainer>
      <Rows board={board} isGame={isGame} />
      <Backdrop className={backDropClasses.backdrop} open={openProgressBar}>
        <CircularProgress />
      </Backdrop>
      <GameDialog open={openDialog}>
        <StartGameDialogContent></StartGameDialogContent>
      </GameDialog>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        open={openSnackBar}
        autoHideDuration={3000}
        onClose={handleCloseSnackBar}>
        <Alert
          onClose={handleCloseSnackBar}
          severity={localMessage.status as Severity}>
          {localMessage.content}
        </Alert>
      </Snackbar>
    </BoardContainer>
  )
}

const mapStateToProps = (state: Record<GameState> & Readonly<GameState>) => {
  const board = getBoard(state)
  const gameId = getGameId(state)
  const message = getMessage(state)
  const isFetchingGameId = getIsFetchingGameId(state)
  const isGameOver = getIsGameOver(state)
  const isGame = !!gameId && !isGameOver
  return { board, isGame, message, isFetchingGameId }
}

export default connect(mapStateToProps)(Board as any)