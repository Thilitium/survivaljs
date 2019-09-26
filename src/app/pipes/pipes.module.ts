import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerPipe } from './player.pipe';

@NgModule({
	declarations: [],
	imports: [
		CommonModule
	],
	exports: [
		PlayerPipe
	]
})
export class PipesModule { }
