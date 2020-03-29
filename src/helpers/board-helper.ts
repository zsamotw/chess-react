import Color from "../models/color"
import MessageStatus from "../models/message-status"
import CapturedFigures from "../models/captured-figures"
import Figure from "../models/figure-model"
import { List } from "immutable"
import { Field } from "../models/field-model"

type Row = List<Field>

const parseMoveData = (from: string, to: string) => {
  const [fromFieldLetter, fromRowNumber] = from.split('')
  const [toFieldLetter, toRowNumber] = to.split('')
  return {
    fromRowIndex: mapNumberToIndex(fromRowNumber),
    fromFieldIndex: mapLetterToFieldIndex(fromFieldLetter),
    toRowIndex: mapNumberToIndex(toRowNumber),
    toFieldIndex: mapLetterToFieldIndex(toFieldLetter)
  }
}

const makeFigureMove = (from: string, to: string, board: List<Row>) => {
  const {
    fromRowIndex,
    fromFieldIndex,
    toRowIndex,
    toFieldIndex,
  } = parseMoveData(from, to)
  const fieldFrom = board.getIn([fromRowIndex, fromFieldIndex])
  const fieldTo = board.getIn([toRowIndex, toFieldIndex])
  const figure = fieldFrom.figure
  const nextEmptyField = {
    coordinates: fieldFrom.coordinates,
    figure: { type: 'Empty', icon: '', color: 'None' },
  }
  const nextNotEmptyField = { coordinates: fieldTo.coordinates, figure }
  const nextBoard = board
    .setIn([fromRowIndex, fromFieldIndex], nextEmptyField)
    .setIn([toRowIndex, toFieldIndex], nextNotEmptyField)
  return {nextBoard, possibleCapturedFigure: fieldTo.figure}
}

const checkCastling = (from: string, to: string, board: List<Row>) => {
  if (from === 'e1' && to === 'g1')
    return makeFigureMove('h1', 'f1', board)
  else if (from === 'e1' && to === 'c1')
    return makeFigureMove('a1', 'd1', board)
  else if (from === 'e8' && to === 'g8')
    return makeFigureMove('h8', 'f8', board)
  else if (from === 'e8' && to === 'c8')
    return makeFigureMove('a8', 'd8', board)
  else
    return {nextBoard: board}
}

const getBoardAfterMove = (from: string, to: string, board: List<Row>) => {
  const stateAfterFigureMove = makeFigureMove(from, to, board)
  const {nextBoard} = checkCastling(from, to, stateAfterFigureMove.nextBoard)
  return {nextBoard, possibleCapturedFigure: stateAfterFigureMove.possibleCapturedFigure}
}

const mapLetterToFieldIndex = (letter: string) => {
  switch (letter) {
    case 'a':
      return 0
    case 'b':
      return 1
    case 'c':
      return 2
    case 'd':
      return 3
    case 'e':
      return 4
    case 'f':
      return 5
    case 'g':
      return 6
    case 'h':
      return 7
  }
}

const mapNumberToIndex = (rowNumber: string) => 8 - parseInt(rowNumber)

const switchPlayerColor = (playerColor: Color) => playerColor === Color.white ? Color.black : Color.white

const getMessage = (apiStatus: string, from: string, to: string, currentPlayerColor: Color) => {
  switch (apiStatus) {
    case 'game continues':
      return { content: `${currentPlayerColor}: ${from} -> ${to}`, status: MessageStatus.success }
    case 'checkmate':
      return { content: `Game Over: ${currentPlayerColor} WIN`, status: MessageStatus.info }
    default:
      return { content: `${currentPlayerColor}: ${from} -> ${to}`, status: MessageStatus.success }
  }
}

const computeCapturedFigures = (figure: Figure, capturedFigures: CapturedFigures) => {
  if (figure.color === 'None') {
    return capturedFigures
  } else if (figure.color === 'Black') {
    return {...capturedFigures, black: capturedFigures.black.push(figure.icon)}
  } else {
    return {...capturedFigures, white: capturedFigures.white.push(figure.icon)}
  }
}

export { parseMoveData, getBoardAfterMove, switchPlayerColor, getMessage, computeCapturedFigures }
