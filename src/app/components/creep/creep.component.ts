import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICreep } from '../../models/icreep';
import { EventmanagerService } from 'src/app/services/eventmanager.service';

@Component({
	selector: 'app-creep',
	templateUrl: './creep.component.html',
	styleUrls: ['./creep.component.css']
})
export class CreepComponent implements OnInit {
	@Input() data: ICreep;

	public shootingDisplay = false;
	get pctHealth(): number {
		return this.data.health * 100 / this.data.maxHealth;
	}

	constructor(private events: EventmanagerService) {
		this.events.onCreepShot.subscribe(e => {
			if (e.creep === this.data) {
				this.shootingAnimation();
			}
		});
	}

	ngOnInit() {
	}

	shootingAnimation() {
		this.shootingDisplay = true;
		setTimeout(() => {
			this.shootingDisplay = false;
		}, 50);
	}
}
