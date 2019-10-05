import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICreep } from '../../models/icreep';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { DrawEvent } from 'src/app/events/draw-event';

@Component({
	selector: 'app-creep',
	templateUrl: './creep.component.html',
	styleUrls: ['./creep.component.css']
})
export class CreepComponent implements OnInit {
	@Input() data: ICreep;

	public shootingDisplay = false;
	get pctHealth(): number {
		return this.data.health / this.data.maxHealth;
	}

	constructor(private events: EventmanagerService) {
		this.events.onCreepShot.subscribe(e => {
			if (e.creep === this.data) {
				this.shootingAnimation();
			}
		});
		this.events.onDraw2.subscribe((e) => this.draw(e));
	}

	ngOnInit() {
	}

	shootingAnimation() {
		this.shootingDisplay = true;
		setTimeout(() => {
			this.shootingDisplay = false;
		}, 50);
	}

	private draw(e: DrawEvent) {
		// Black border
		e.ctx.fillStyle = 'rgb(0, 0, 0)';
		e.ctx.fillRect(this.data.x, this.data.y, this.data.width, this.data.height);

		// Creep
		e.ctx.fillStyle = this.data.player === 1 ? 'rgb(0, 0, 255)' : 'rgb(255, 0, 0)';
		e.ctx.fillRect(this.data.x + 1, this.data.y + 1, this.data.width - 2, this.data.height - 2);

		// Health bar border
		e.ctx.fillStyle = 'rgb(0, 0, 0)';
		e.ctx.fillRect(this.data.x, this.data.y - 7, this.data.width, 5);

		// Health bar
		e.ctx.fillStyle = 'rgb(0, 255, 0)';
		e.ctx.fillRect(this.data.x + 1, this.data.y - 6, this.pctHealth * (this.data.width - 2), 3);
	}
}
