import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { GameComponent } from './components/game/game.component';
import { BackgroundComponent } from './components/background/background.component';
import { SelectionboxComponent } from './components/selectionbox/selectionbox.component';
import { ResourcesComponent } from './components/UI/resources/resources.component';
import { UpgradesComponent } from './components/UI/upgrades/upgrades.component';

@NgModule({
	declarations: [
		AppComponent,
		GameComponent,
		BackgroundComponent,
		SelectionboxComponent,
		ResourcesComponent,
		UpgradesComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
	],
	providers: [
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
