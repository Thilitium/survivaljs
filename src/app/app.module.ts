import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { BarrackComponent } from './components/barrack/barrack.component';
import { PlayerPipe } from './pipes/player.pipe';
import { BackgroundComponent } from './components/background/background.component';

@NgModule({
	declarations: [
		AppComponent,
		GameComponent,
		BarrackComponent,
		BackgroundComponent
	],
	imports: [
		BrowserModule,
		FormsModule
	],
	providers: [
		PlayerPipe
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
