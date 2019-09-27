import { ICreep } from './icreep';

export interface Barrack {
	level: number;
	respawnTime: number;
	creeps: Array<ICreep>;
}
