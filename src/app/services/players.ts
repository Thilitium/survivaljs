import { Position } from "../constants/enums";
import { IPlayer } from "../models/iplayer";

export class Players {
	private static players: IPlayer[] = [];

	public static pos(position: Position): IPlayer {
		return this.players.filter(p => p.position === position)[0];
	}

	public static id(id: number): IPlayer {
		return this.players.filter(p => p.id === id)[0];
	}

	public static add(player: IPlayer) {
		this.players.push(player);
	}

	public static getAll(): IPlayer[] {
		return this.players;
	}

	public static getActive(): IPlayer {
		//TODO: Proper active player management.
		return this.id(1);
	}
}
