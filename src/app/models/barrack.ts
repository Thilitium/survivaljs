import { Creep } from './creep';

export interface Barrack {
	level: number;
	respawnTime: number;
	creeps: Array<Creep>;
}
