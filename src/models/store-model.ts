import { List } from 'immutable'
import Field from './field-model'

type Row = List<Field>

export default interface GameState {
  gameId: string | null
  board: any | List<Row>
  fromCoordinate: string
  toCoordinate: string
  message: string
}
