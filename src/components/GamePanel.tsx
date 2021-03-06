import React from 'react'
import styled from 'styled-components'
import {
  getActivePlayerColor,
  getGameId,
  getIsGameOver,
  getMoves,
  getCapturedFigures,
  getGameMode,
  getStatus,
} from '../redux/selectors'
import { connect } from 'react-redux'
import Color from '../models/color.model'
import Move from '../models/move.model'
import CapturedFigures from '../models/captured-figures.model'
import { undoLastMoveApiRequest } from '../redux/actions'
import GameMode from '../models/game.mode'
import { makeStyles } from '@material-ui/core/styles'
import { State } from '../models/state.model'
import { List } from 'immutable'

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.background.white};
  width: 20vmax;
  box-sizing: border-box;
  user-select: none;
  font-size: 1rem;
  margin: 0 0 0 3rem;
  transition: 'opacity 4s ease';

  @media screen and (max-width: 1024px) {
    width: 64vmin;
    margin: 3rem 0 0 0;
  }
`

const PanelContentWrapper = styled.div<{ isGame: boolean, isGameOver: boolean }>`
  flex: auto;
  opacity: ${props => (props.isGame && !props.isGameOver ? 1 : 0.3)};
`

const PanelHeader = styled.section`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`

const ActivePlayerColor = styled.div<{ isGame: boolean, isWhitePlayer: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 3rem;
  min-height: 3rem;
  border-radius: 30px;
  border: 1px solid ${props => props.theme.primary.main};
  margin: 0 1rem 1rem 0;
  transition: all 0.5s ease;
  opacity: ${props => (props.isGame ? 1 : 0)};
  background-color: ${props =>
    props.isWhitePlayer
      ? props.theme.background.white
      : props.theme.background.black};
`
const Player = styled.div<{ isWhitePlayer: boolean }>`
  font-size: 0.7rem;
  color: ${props =>
    props.isWhitePlayer
      ? props.theme.primary.main
      : props.theme.secondary.main};
`

const GameModeInfo = styled.div<{ isGame: boolean }>`
  font-size: 0.8rem;
  margin-top: 0.5rem;
  opacity: ${props => (props.isGame ? 1 : 0)};
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #919191;
`

const UndoButton = styled.button<{ isGame: boolean }>`
  /* temporary display none */
  display: none;
  border-radius: 5px;
  border-color: transparent;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  text-transform: uppercase;
  background-color: #dbdbdb;
  opacity: ${props => (props.isGame ? 1 : 0)};

  &:hover {
    background-color: #7d7c7c;
    color: #eeeded;
  }
`

const CapturedFiguresSection = styled.section``

const Icon = styled.img`
  width: 1.4rem;
`

const GameMovesSection = styled.section`
  flex: 1 1 0px;
  overflow-y: auto;
  padding: 0.5rem 0.1rem;

  @media screen and (max-width: 1024px) {
    overflow: visible;
  }
`

const PlayerMove = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.4rem;
  font-size: 0.9rem;
  font-weight: bold;

  &:first-child {
    margin-top: 0;
  }
`

const MoveColor = styled.div`
  min-width: 0.9rem;
  min-height: 0.9rem;
  border-radius: 20px;
  border: 1px solid ${props => props.theme.primary.main};
  display: inline-block;
`

const EndGameStatus = styled.div`
  color: red;
  font-size: 1.3rem;
  text-transform: uppercase;
  opacity: 1 !important;
  margin-bottom: 2rem;
`

const useStyles = makeStyles({
  index: {
    width: '1rem',
    margin: '0px 2rem 0 0',
    fontSize: '.7rem',
  },
  startingPointCoordinate: {
    width: '1rem',
    margin: '0px 1.6rem 0px 3rem',
  },
})

function GamePanel(props: {
  isGame: boolean
  status: string
  isGameOver: boolean
  gameMode: GameMode
  activePlayerColor: string
  moves: List<Move>
  capturedFigures: CapturedFigures
  undoMove: any
}) {
  const {
    isGame,
    status,
    isGameOver,
    gameMode,
    activePlayerColor,
    moves,
    capturedFigures,
    undoMove,
  } = props
  const isWhitePlayer = activePlayerColor === Color.white

  const classes = useStyles()
  const getBackgroundColor = (color: string) => ({
    backgroundColor: color.toLowerCase(),
  })

  return (
    <>
      <Panel>
        {isGameOver && <EndGameStatus>{status}</EndGameStatus>}
        <PanelContentWrapper isGame={isGame} isGameOver={isGameOver}>
          <PanelHeader>
            <ActivePlayerColor isGame={isGame} isWhitePlayer={isWhitePlayer}>
              <Player isWhitePlayer={isWhitePlayer}>
                {isWhitePlayer ? 'White' : 'Black'}
              </Player>
            </ActivePlayerColor>
            <UndoButton onClick={undoMove} isGame={isGame}>
              UNDO
            </UndoButton>
          </PanelHeader>
          <CapturedFiguresSection>
            <div>
              {capturedFigures.white.map((icon: string, index: number) => (
                <Icon src={icon} alt='' key={icon + index}></Icon>
              ))}
            </div>
            <div>
              {capturedFigures.black.map((icon: string, index: number) => (
                <Icon src={icon} alt='' key={icon + index}></Icon>
              ))}
            </div>
          </CapturedFiguresSection>
          <GameModeInfo isGame={isGame}>{gameMode}</GameModeInfo>
          <GameMovesSection>
            {moves.map((move: Move, index: number) => (
              <PlayerMove key={index}>
                <div className={classes.index}>{moves.size - index}</div>
                <MoveColor
                  style={getBackgroundColor(move.color as string)}></MoveColor>
                <div className={classes.startingPointCoordinate}>
                  {move.startingPointCoordinate}
                </div>
                <div>{move.endPointCoordinate}</div>
              </PlayerMove>
            ))}
          </GameMovesSection>
        </PanelContentWrapper>
      </Panel>
    </>
  )
}

const mapStateToProps = (state: State) => {
  const gameId = getGameId(state)
  const activePlayerColor = getActivePlayerColor(state)
  const status = getStatus(state)
  const isGameOver = getIsGameOver(state)
  const isGame = !!gameId
  const moves = getMoves(state)
  const capturedFigures = getCapturedFigures(state)
  const gameMode = getGameMode(state)
  return {
    activePlayerColor,
    isGame,
    moves,
    capturedFigures,
    status,
    isGameOver,
    gameMode,
  }
}
const mapDispatchToState = (dispatch: any) => {
  return {
    undoMove: () => undoLastMoveApiRequest(),
  }
}

export default connect(mapStateToProps, mapDispatchToState)(GamePanel as any)
