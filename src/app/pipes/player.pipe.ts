import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'player',
	pure: true
})
export class PlayerPipe implements PipeTransform {

	transform(value: Array<any>, numPlayer: number): Array<any> {
		const filtered: Array<any> = [];

		if (value && numPlayer) {
			value.forEach(v => {
				if (v.player === numPlayer) {
					filtered.push(v);
				}
			});
		}
		return filtered;
	}
}
