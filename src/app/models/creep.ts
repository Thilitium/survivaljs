export class Creep {
	speed = 1;
	maxSpeed = 1;
	range = 20;
	x = 0;
	y = 0;
	player = -1;
	target: Creep = null;
	width = 10;
	height = 10;
	health = 10;
	maxHealth = 10;
	attack = 3;
	attackSpeed = 1;
	value = 10;
	shooting = false;
	lastShotTime: Date = null;
}
