import { CreepComponent } from "../components/creep/creep.component";

export class StoreService {

	private _creeps: CreepComponent;

	private static _instance = null;
	public static get(): StoreService{
		if(this._instance === null){
			this._instance = new this();
		}

		return this._instance;
	}

	private constructor(){

	}
}
