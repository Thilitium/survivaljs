import { Position } from '../constants/enums'
import { Barrack } from './barrack'
import { ICoords } from './icoords'

export interface IPlayer {
	name: string;
	id: number;
	position: Position;
	coords: ICoords;
	alive: boolean;
	ia: boolean;
	barrack: Barrack;
	gold: number;
	color: string;
}
