'use strict';

/*
 r: arr, arrow abbreviation
*/

//costanti
const Ww = window.innerWidth;
const Wh = window.innerHeight;
const MinS = 75;  //Min size of arrow
const MaxS = 140; //Max size of arrow
const space = 75; //space in pixel before a new arrow will be create;
const margin = 10; //margin in wich the arrows spawn;
const directions = [
    'up', 'down', 'left', 'right',
    'up', 'down', 'left', 'right',
    'up', 'down', 'left', 'right'
];
const keysToArrows = { 
    'ArrowUp':'up', 
    'ArrowLeft':'left', 
    'ArrowRight':'right', 
    'ArrowDown':'down'
};
const range = 2; //range for touching error
const vri = 6.5; //arrows' initial velocity, [vr] = px/tick;

//variabili globali
let arrows = []; //list of arrows, shared so that it need less updates
let vr = 6.5; //arrows' velocity, [vr] = px/tick;
let ar = 0.0015; //arrows' acceleration;
let lastTick = 0; //last arrow();
let tick = 1;
let scoreElem;
let recordElem;
let lastElem;
let menuElem;
let started = false;
let playing = false;

let toTouch = 1/5; //arrow sesction to touch to eliminate

let score = 0;
let record;
try {
    record = parseInt(window.atob( localStorage.getItem('record') ));
    if(!record) throw Error;
} catch(e) {
    record = 0;
} 

let mode = undefined;

//funzioni
const getTop = r => {
    try {
        return Number.parseFloat(r.style.top)||15;
    }
    catch(e) {
        return 15;
    }
} 

const randrange = ( min, max ) => Math.floor(Math.random() * (max - min)) + min; //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random


const getDir = (delta) => {
    if(delta < -(MaxS*toTouch)) return -1;
    if(delta > +(MaxS*toTouch)) return 1;
    return 0;

}

const writeScore = () => scoreElem.innerHTML = score 
const writeRecord = () => recordElem.innerHTML = 'Best: '+record;
const writeLast = () => { 
    if(!started) lastElem.style.display = "none"
    else {
        lastElem.style.display = "block";
        lastElem.innerHTML = score+"<br>";
    }
}
function addPoint() {
    score++;
    writeScore();
    if(score > record) {
        record = score;
        localStorage.setItem('record', window.btoa(score)) ;
    }
    
}

function targetingArrow(event) {
    if(mode == undefined) mode = "touch";
    if(mode == "keyboard") return;
    let touches = event.changedTouches[0];
    event.target.dataset.ci = touches["page"+event.target.dataset.coord];
}

function movingOnArrow(event) {
    let touches = event.changedTouches[0];
    let cf = touches["page"+event.target.dataset.coord];
    let dc = cf-event.target.dataset.ci;
    
    if(getDir(dc) == event.target.dataset.dir) {
        
        addPoint();
        removeArrow(event.target);

        event.target.removeEventListener('touchstart', targetingArrow);
        event.target.removeEventListener('touchmove', movingOnArrow);
    }
}

function addArrow() {
    let newArrow = document.createElement('div');
    newArrow.classList.add('arrow');

    let dir = directions[randrange(0, directions.length-1)];
    newArrow.classList.add(dir);

    if(dir == "up" || dir == "down") {
        newArrow.dataset.coord = "Y";
        newArrow.dataset.dir = dir=="up" ? -1 : 1;
    }
    else {
        newArrow.dataset.coord = "X";
        newArrow.dataset.dir = dir=="left" ? -1 : 1;
    }

    document.body.appendChild(newArrow);

    newArrow.style.top = -newArrow.clientHeight+'px';
    newArrow.style.left = randrange(margin, Ww-newArrow.clientWidth-margin)+'px';
    
    
    
    
   
    if(mode == "touch"|| mode == undefined) {    
        newArrow.addEventListener('touchstart', targetingArrow );
        newArrow.addEventListener('touchmove', movingOnArrow );
    }

    
    arrows = document.querySelectorAll('.arrow');
    return newArrow;
}

function removeArrow(r) {
    try {
        r.classList.add('destroy');
        setTimeout(
            () => {
                try { 
                    document.body.removeChild(r);
                    arrows = document.querySelectorAll('.arrow');
                } catch(e) {}
            },
            200 
        );
        
    } catch(e) {}
    
}

function frame() {
    //let px = vr * (tick-lastTick);
    //console.log(px);
    if ( getTop(arrows[arrows.length-1]) >= 15/*px >= Rh+75*/ ) {
        addArrow();
       
        
        lastTick = tick;
    } 

    
    //console.log(vr);
    vr += ar;
    //ar = Math.sqrt(ar)/20;
    let toRemove = []
    for(let r of arrows) {
        try {
        r.style.top = getTop(r)+vr+'px';
        } catch(e) {}
        if(getTop(r) >= Wh) {
            toRemove.push(r);
        }
    }
    if(toRemove.length > 0) {
        /*toRemove*/arrows.forEach(r=>removeArrow(r));
        openMenu();
    }
    else {
        window.requestAnimationFrame(frame);
    }
    /*let r = document.querySelectorAll(".arrow")[0];
    r.style.top =getTop(r)+0.5+'px';*/
    tick++;
    
}

function onKeyPress(event) {

    
    let dir = keysToArrows[event.key];

          
    if(playing) {

        if(dir != undefined) {  
            if(mode == undefined) mode = "keyboard";
            if(mode == "touch") return;

            let rs4keysEv = document.querySelectorAll('.arrow:not(.destroy)'); //arrows for keys event
            if(rs4keysEv.length > 0) {
                let targetArrow = rs4keysEv[0];
                if( targetArrow.classList.contains(dir) ) {
                    removeArrow(targetArrow);
                    addPoint();
                }
            }
        }
    }
    else {
        if(event.key == "Enter") start();
    }
    
}

function start() {
    mode = undefined;
    started = true;
    playing = true;
    closeMenu();
    score = 0;
    vr = vri;
    writeScore();
    writeRecord();
    addArrow();


    window.requestAnimationFrame(frame);
}

function openMenu() {
    playing = false;
    writeRecord();
    writeLast();

    menuElem.classList.remove('closed');
    menuElem.classList.add('opened');
}
function closeMenu() {
    menuElem.classList.remove('opened');
    menuElem.classList.add('closed');
    
}

//main
window.addEventListener(
    'DOMContentLoaded',
    () => {

        started = false;
        playing = false;

        scoreElem = document.querySelector("#score");
        recordElem = document.querySelector("#menu-score #record");
        lastElem = document.querySelector("#menu-score #last");
        menuElem = document.querySelector('#menu');
        
        document.querySelector("#start").addEventListener( 'click', start );
        document.addEventListener('keydown',onKeyPress); 

        openMenu();
        
        //start();
               
    }
)

