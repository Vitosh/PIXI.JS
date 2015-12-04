"use strict";
var counter = 0;
var count_seconds = 10;
var count_seconds_initial = 5;
var bStart = true;
var newDate = new Date;
var lastDate = new Date;
var bInError = false;
var gameOverScene;
var endMessage;
var disableButtons = false;
var Container = PIXI.Container,
    autoDetectRenderer = PIXI.autoDetectRenderer,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite,
    Text = PIXI.Text;

var stage = new Container(),
    renderer = autoDetectRenderer(1024, 1024);
document.body.appendChild(renderer.view);

renderer.view.style.border = "1px dashed black";
renderer.backgroundColor = "0xFFFFFF";
loader.add("logo64x64.png").add("box64x64.png").load(setup);

var cat = undefined,
    box = undefined,
    message = undefined,
    state = undefined,
    boxes = undefined,
    b = undefined;


function setup() {

  b = new Bump(PIXI);

  cat = new Sprite(resources["logo64x64.png"].texture);
  
  cat.x = 16;
  cat.y = 32;

  cat.vx = 0;
  cat.vy = 0;

  stage.addChild(cat);

  var numberOfBoxes = 9,
    spacing = 48,
    xOffset = 100,
    speed = 10,
    direction = 1

  boxes = [];

  for (var i = 0; i < numberOfBoxes; i++) {
    var box = new Sprite(resources["box64x64.png"].texture);
    var x = randomInt(110, 900);
    var y = randomInt(110, 900);
    box.touched = false;
    box.bFree = true;
    box.breakable = true;
    box.x = x;
    box.y = y;
    boxes.push(box);
    stage.addChild(box);
  }

  message = new Text("", { font: "18px sans-serif", fill: "black" });
  message.position.set(8, 8);
  stage.addChild(message);

  endMessage = new Text("", {font: "48px Futura"});
  endMessage.x = 120;
  endMessage.y = stage.height / 2 - 32;

  var left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40);

  //Left
  left.press = function () {
    if(disableButtons){
      //nothing
    }else{
      cat.vx = -5;
      cat.vy = 0;
    }
  };

  left.release = function () {
    if (!right.isDown && cat.vy === 0) {
      cat.vx = 0;
    }
  };

  //Up
  up.press = function () {
     if(disableButtons){
      //nothing
    }else{
      cat.vy = -5;
      cat.vx = 0;
    }
  };
  up.release = function () {
    if (!down.isDown && cat.vx === 0) {
      cat.vy = 0;
    }
  };

  //Right
  right.press = function () {
    if(disableButtons){
      //nothing
    }else{
      cat.vx = 5;
      cat.vy = 0;
    }
  };
  right.release = function () {
    if (!left.isDown && cat.vy === 0) {
      cat.vx = 0;
    }
  };

  //Down
  down.press = function () {
    if(disableButtons){
      //nothing
    }else{
      cat.vy = 5;
      cat.vx = 0;
    }
  };
  down.release = function () {
    if (!up.isDown && cat.vx === 0) {
      cat.vy = 0;
    }
  };

  //Set the game's current state to `play`
  state = play;

  //Start the game loop
  gameLoop();
}

function gameLoop() {

  requestAnimationFrame(gameLoop);

  if (count_seconds_initial<1){
  disableButtons = true;
  gameOverScene = new Container();
  stage.addChild(gameOverScene);
  endMessage.text = "The End!\rYou have collected " + counter + " boxes! :)\r New game in "+parseInt(count_seconds_initial+3)+" seconds!";

  gameOverScene.addChild(endMessage);
  gameOverScene.visible = true;
  }

  state();
  renderer.render(stage);
}

function play() {

  cat.x += cat.vx;
  cat.y += cat.vy;

  boxes.forEach(function(box){

    if (b.hitTestRectangle(cat,box)){

      if (box.bFree && box.touched && box.breakable){
        stage.removeChild(box);
        counter++;        
      }
      box.bFree = false;
      box.touched = true;

      if (counter>0){
        bInError = true;
        box.tint = 22222;
        box.breakable = false;
        renderer.backgroundColor = "0xFFFABC";
      } else {
        box.tint = 16724736;    
      }
    } else {
      box.bFree = true;
      box.tint = 16777215;
    }
  message.text = displayText(bInError);

  });
}

function displayText(bInError){

  var result = "";

  newDate = new Date;
  var bResult = Math.abs(lastDate.getSeconds() - newDate.getSeconds())>1;
  if (bInError){
    if (bResult){
      lastDate = new Date;
      count_seconds_initial--;
      if (count_seconds_initial<-2){
        //this is how we exit
        location.reload();
      }
    }    result = "Maximal touch is reached! You have " + (count_seconds_initial) + " seconds to collect all points!\r" 
                                                                                              + counter + " points";
  }else{
    result = "Try to go through the boxes just once."; 
  }
  return result;
};

//The `keyboard` helper function
function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener("keydown", key.downHandler.bind(key), false);
  window.addEventListener("keyup", key.upHandler.bind(key), false);

  //Return the key object
  return key;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}