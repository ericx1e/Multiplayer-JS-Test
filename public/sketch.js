var socket;
var x, y, xv, yv, size, angle, hp;
var map;
var width, height;
var bullets = [];

function reset() {
  x = 300;
  y = 300;
  xv = 0;
  yv = 0;
  size = 25;
  hp = 100;
}

function setup() {
  width = 1200;
  height = 600;
  const cv = createCanvas(width, height);
  cv.background(51);
  cv.position(100, 100);

  reset();

  map = [
    [0, height-100, width, 100],
    [0, 0, 25, height],
    [0, 0, width, 25],
    [width-25, 0, 25, height],
    [100, 100, 100, 25],
    [150, 300, 100, 25],
    [250, 400, 200, 25],
    [500, 350, 150, 25],
    [450, 200, 25, height],
    [375, 200, 200, 25],
    [750, 425, 450, 200],
  ];


  socket = io.connect('https://42b069f1.ngrok.io/');
  socket.on('player', newDrawing);
  socket.on('bullet', drawBullet);
  socket.on('background', drawBackground);
}

var otherPlayers = [];

function drawBackground() {
}

function newDrawing(data) {
  otherPlayers.push(data);
}

function drawBullet(data) {
  noStroke();
  fill(255, 100, 100);
  ellipse(data.x, data.y, 10, 10);
  if(colliding(data.x-5, data.y-5, 10, 10, x, y, size, size)) {
    hp-=5;
  }
}

const SPD = 0.5;
const BULLET_SPD = 15;

function draw() {

  if(hp <= 0) {
    reset();
  }
  fill(0, 25);
  rect(0, 0, width, height);
  map.forEach((item, i) => {
    fill(200);
    rect(item[0], item[1], item[2], item[3]);
  });

  // if(down) yv+=SPD;
  yv+=0.4;
  if(touchingPlatform()) {
    y-=yv;
    if(up && yv > 0) {
      yv = -10;
    } else {
      yv = 0;
    }
  }

  if(left) {
    x-=5;
    if(touchingPlatform()) {
      x+=5;
    }
  }
  // if(up) yv-=SPD;
  if(right) {
    x+=5;
    if(touchingPlatform()) {
      x-=5;
    }
  }

  x+=xv;
  y+=yv;
  // console.log(colliding());
  // console.log('Sending: ' +  x + ', ' + y);

  updateBullets();

  var data = {
    x: x,
    y: y,
    a: angle,
    hp: hp,
  }
  socket.emit('player', data);

  otherPlayers.forEach((item, i) => {
    colorMode(RGB, 255);
    fill(150);
    rect(item.x+size/2-25, item.y-size/2, 50, 5);
    colorMode(HSB, 255);
    fill(item.hp, 255, 255);
    rect(item.x+size/2-25, item.y-size/2, item.hp/2, 5);
    colorMode(RGB, 255);
    fill(255, 100, 100);
    rect(item.x, item.y, size, size);
    translate(item.x+size/2, item.y+size/2, size, size);
    rotate(item.a);
    rect(0, -5, 25, 10);
    resetMatrix();
  });


  otherPlayers = [];

  angle = Math.atan2((mouseY - y),(mouseX - x));

  noStroke();
  colorMode(RGB, 255);
  fill(150);
  rect(x+size/2-25, y-size/2, 50, 5);
  colorMode(HSB, 255);
  fill(hp, 255, 255);
  rect(x+size/2-25, y-size/2, hp/2, 5);
  colorMode(RGB, 255);
  fill(100, 100, 255);
  rect(x, y, size, size);
  translate(x+size/2, y+size/2);
  rotate(angle);
  rect(0, -5, 25, 10);
  resetMatrix();
}

function touchingPlatform() {
  var flag = false;
  map.forEach((item, i) => {
    if(colliding(x, y, size, size, item[0], item[1], item[2], item[3])) {
      flag = true;
    }
    // if(x < item[0] + item[2] && x + size > item[0] && y < item[1] + item[3] && y + size > item[1]) {
    //   // console.log("BRUH");
    //   flag = true;
    // }
  });

  return flag;
}

function colliding(x, y, w, h, x1, y1, w1, h1) {
  return (x < x1 + w1 && x + w > x1 && y < y1 + h1 && y + h > y1);
}

function updateBullets() {
  bullets.forEach((item, i) => {
    noStroke();
    fill(100, 100, 255);
    ellipse(item.x, item.y, 10, 10);
    item.x += BULLET_SPD*Math.cos(item.a);
    item.y += BULLET_SPD*Math.sin(item.a);
    socket.emit('bullet', item);
    if(item.b <= 0) {
      bullets.splice(i, 1);
    }
    map.forEach((wall, j) => {
      if(colliding(item.x+BULLET_SPD*Math.cos(item.a), item.y+BULLET_SPD*Math.sin(item.a), 10, 10, wall[0], wall[1], wall[2], wall[3]) && item.x+BULLET_SPD*Math.cos(item.a) > wall[0] && item.x+BULLET_SPD*Math.cos(item.a) < wall[0] + wall[2] && (item.y < wall[1] || item.y > wall[1]+wall[3])) {
        item.a=-item.a;
        item.x += BULLET_SPD*Math.cos(item.a);
        item.y += BULLET_SPD*Math.sin(item.a);
        item.b--;
      }
      if(colliding(item.x+BULLET_SPD*Math.cos(item.a), item.y+BULLET_SPD*Math.sin(item.a), 10, 10, wall[0], wall[1], wall[2], wall[3]) && item.y+BULLET_SPD*Math.sin(item.a) > wall[1] && item.y+BULLET_SPD*Math.sin(item.a) < wall[1] + wall[3] && (item.x < wall[0] || item.x > wall[0]+wall[2])) {
        item.a=Math.PI-item.a;
        item.x += BULLET_SPD*Math.cos(item.a);
        item.y += BULLET_SPD*Math.sin(item.a);
        item.b--;
      }
      if(colliding(item.x-5, item.y-5, 10, 10, wall[0], wall[1], wall[2], wall[3])) {
        
      }
    });
  });

}

var left, right, up, down = false;

document.addEventListener('keydown', function(event) {
  if(event.key == 'a') {
    left = true;
  }
  else if(event.key == 'w') {
    up = true;
  }
  else if(event.key == 'd') {
    right = true;
  }
  else if(event.key == 's') {
    down = true;
  }
});

document.addEventListener('keyup', function(event) {
  if(event.key == 'a') {
    left = false;
  }
  else if(event.key == 'w') {
    up = false;
  }
  else if(event.key == 'd') {
    right = false;
  }
  else if(event.key == 's') {
    down = false;
  }
});

var lastShot = 0;

document.addEventListener('mousedown', function(event) {
  if(frameCount - lastShot >= 15) {
    lastShot = frameCount;
    var data = {
      x: x+size/2,
      y: y+size/2,
      a: angle,
      b: 3,
    }
    bullets.push(data);
  }
});


function mousePressed() {
}
