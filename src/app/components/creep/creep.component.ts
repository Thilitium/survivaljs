
import { EventmanagerService } from 'src/app/services/eventmanager.service';
import { DrawEvent } from 'src/app/events/draw-event';
import { Subscription } from 'rxjs';
import { CreepType, UiLayer } from 'src/app/constants/enums';
import { CreepBase } from 'src/app/models/creeps/creep-base';
import { MouseService } from 'src/app/services/mouse.service';
import { IDisposable } from 'src/app/models/idisposable';

export class CreepComponent extends CreepBase implements IDisposable {
	private events: EventmanagerService;
	private mouseService: MouseService;
	private subscriptions: Array<Subscription> = [];
	private shootingDisplay = false;
	private get pctHealth(): number {
		return this.health / this.maxHealth;
	}

	constructor() {
		super();

		this.mouseService = MouseService.get();
		this.events = EventmanagerService.get();

		this.subscriptions.push(this.events.onCreepShot.subscribe(e => {
			if (e.creep === this) {
				this.shootingAnimation();
			}
		}));
		//this.subscriptions.push(this.events.onDrawCreeps.subscribe((e) => this.draw(e)));
		this.subscriptions.push(
			this.events.onRequestDraw.subscribe(e => {
				this.events.onScheduleDraw.emit({
					action: (ctx) => this.draw({ctx: ctx}),
					frameId: e.frameId,
					layer: UiLayer.CREEPS
				});
			})
		)
	}

	public dispose(): void {
		this.subscriptions.forEach(s => {
			s.unsubscribe();
		});
	}

	shootingAnimation() {
		this.shootingDisplay = true;
		setTimeout(() => {
			this.shootingDisplay = false;
		}, 50);
	}

	public draw(e: DrawEvent) {
		var selected = false;

		// Range indicator and health bar if hovering the creep or if selected
		if (this.mouseService.hoveringCreep == this ||
			this.mouseService.selectedCreeps.indexOf(this) >= 0) {
			this.drawRangeIndicator(e.ctx);
			this.drawHealthBar(e.ctx);
			selected = true;
		}
		// Black border (or yellow if selected)
		e.ctx.fillStyle = selected ? 'rgb(255, 255, 0)' : 'rgb(0, 0, 0)';
		e.ctx.beginPath();
		if (this.type == CreepType.Archer) {
			e.ctx.arc(this.x + this.width / 2, this.y + this.width / 2, (this.width) / 2, 0, 2 * Math.PI);
		} else if (this.type === CreepType.Basher) {
			e.ctx.rect(this.x, this.y, this.width, this.height);
		}
		e.ctx.fill();
		e.ctx.closePath();
		e.ctx.restore();

		// Creep
		e.ctx.fillStyle = this.player.color;
		e.ctx.beginPath();
		if (this.type == CreepType.Archer) {
			e.ctx.arc(this.x + this.width / 2, this.y + this.width / 2, (this.width - 1) / 2, 0, 2 * Math.PI);
		} else if (this.type == CreepType.Basher) {
			e.ctx.rect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);
		}
		e.ctx.fill();
		e.ctx.closePath();
		e.ctx.restore();

		// Attacking animation
		if (this.shootingDisplay && this.target !== null) {
			e.ctx.strokeStyle = 'yellow';
			e.ctx.beginPath();
			e.ctx.moveTo(this.center().x, this.center().y);
			e.ctx.lineTo(this.target.center().x, this.target.center().y);
			e.ctx.stroke();
			e.ctx.closePath();
			e.ctx.restore();
		}
	}


	private drawRangeIndicator(ctx: CanvasRenderingContext2D) {
		if (this.range > 1) {
			ctx.beginPath();
			ctx.strokeStyle = 'rgb(226, 67, 215)'
			ctx.lineWidth = 1;
			ctx.arc(this.x + this.width / 2, this.y + this.width / 2, this.range, 0, 2 * Math.PI);
			ctx.stroke();
			ctx.closePath();
			ctx.restore();
		}
	}

	private drawHealthBar(ctx: CanvasRenderingContext2D) {
		// Health bar border
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fillRect(this.x, this.y - 7, this.width, 5);

		// Health bar background
		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.fillRect(this.x + 1, this.y - 6, this.width - 2, 3);

		// Health bar
		ctx.fillStyle = 'rgb(0, 255, 0)';
		ctx.fillRect(this.x + 1, this.y - 6, this.pctHealth * (this.width - 2), 3);
		ctx.restore();
	}
}
