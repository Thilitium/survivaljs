import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ICreep } from '../../models/icreep';
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { DrawEvent } from 'src/app/events/draw-event';
import { Subscription } from 'rxjs';
import { Basher } from 'src/app/models/creeps/basher';
import { Archer } from 'src/app/models/creeps/archer';
import { CreepType } from 'src/app/constants/enums';

@Component({
	selector: 'app-creep',
	templateUrl: './creep.component.html',
	styleUrls: ['./creep.component.css']
})
export class CreepComponent implements OnInit, OnDestroy {
	@Input() data: ICreep;
	@Input() color: string;

	private subscriptions: Array<Subscription> = [];
	private shootingDisplay = false;
	private get pctHealth(): number {
		return this.data.health / this.data.maxHealth;
	}

	constructor(private events: EventmanagerService) {
		this.subscriptions.push(this.events.onCreepShot.subscribe(e => {
			if (e.creep === this.data) {
				this.shootingAnimation();
			}
		}));
		this.subscriptions.push(this.events.onDraw2.subscribe((e) => this.draw(e)));
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
		// Black border (or yellow if attacking)
		e.ctx.fillStyle = this.shootingDisplay ? 'rgb(255, 255, 0)' : 'rgb(0, 0, 0)';
		e.ctx.beginPath();
		if (this.data.type == CreepType.Archer) {
		e.ctx.arc(this.data.x + this.data.width / 2, this.data.y + this.data.width / 2, (this.data.width) / 2, 0, 2 * Math.PI);
	} else if (this.data.type == CreepType.Basher) {
		e.ctx.rect(this.data.x, this.data.y, this.data.width, this.data.height);
	}
		e.ctx.fill();

		// Creep
		e.ctx.fillStyle = this.color;
		e.ctx.beginPath();
		if (this.data.type == CreepType.Archer) {
			e.ctx.arc(this.data.x + this.data.width / 2, this.data.y + this.data.width / 2, (this.data.width - 1) / 2, 0, 2 * Math.PI);
		} else if (this.data.type == CreepType.Basher) {
			e.ctx.rect(this.data.x + 1, this.data.y + 1, this.data.width - 2, this.data.height - 2);
		}

		e.ctx.fill();

		// Health bar border
		e.ctx.fillStyle = 'rgb(0, 0, 0)';
		e.ctx.fillRect(this.data.x, this.data.y - 7, this.data.width, 5);

		// Health bar background
		e.ctx.fillStyle = 'rgb(255, 0, 0)';
		e.ctx.fillRect(this.data.x + 1, this.data.y - 6, this.data.width - 2, 3);

		// Health bar
		e.ctx.fillStyle = 'rgb(0, 255, 0)';
		e.ctx.fillRect(this.data.x + 1, this.data.y - 6, this.pctHealth * (this.data.width - 2), 3);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(s => {
			s.unsubscribe();
		});
	}
}
