import { Subject } from 'rxjs';

export class CustomEventEmitter<T> extends Subject<T> {
	constructor() {
		super();
	}

	emit(value: T) { super.next(value); }
}
