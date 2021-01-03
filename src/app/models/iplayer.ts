import { Position } from '../constants/enums'
import { ICoords } from './icoords'

export interface IPlayer {
	name: string;
	id: number;
	position: Position;
	coords: ICoords;
	alive: boolean;
	ia: boolean;
}
