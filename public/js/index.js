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
let menuElem;

let score = 0;
let record;
try {
    record = parseInt(window.atob( localStorage.getItem('record') ));
    if(!record) throw Error;
} catch(e) {
    record = 0;
} 



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
const checkTouch = (dir, dx, dy ) => {
    switch(dir) {
        case 'up':
            return dy<0;
            break;
        case 'down':
            return dy>0;
            break;
        case 'right':
            return dx>0;
            break;
        case 'left':
            return dx<0;
            break;
    }
}

const writeScore = () => scoreElem.innerHTML = score 
const writeRecord = () => recordElem.innerHTML = 'Record: '+record;

function addPoint() {
    score++;
    writeScore();
    if(score > record) {
        record = score;
        localStorage.setItem('record', window.btoa(score)) ;
    }
    
}

function addArrow() {
    let newArrow = document.createElement('div');
    newArrow.classList.add('arrow');

    let dir = directions[randrange(0, directions.length-1)];
    newArrow.classList.add(dir);

    document.body.appendChild(newArrow);

    newArrow.style.top = -newArrow.clientHeight+'px';
    newArrow.style.left = randrange(margin, Ww-newArrow.clientWidth-margin)+'px';
    
    let xi, yi;
    newArrow.addEventListener(
        'touchstart',
        event => {
            let touches = event.changedTouches[0];
            xi = touches.pageX;
            yi = touches.pageY;
        }
    )
 

    newArrow.addEventListener(
        'touchend',
        event => {
            let touches = event.changedTouches[0];
            let xf = touches.pageX;
            let yf = touches.pageY;
            let dx = xf-xi;
            let dy = yf-yi;
            //console.log(xi, xf, dx, yi, yf, dy);
            if(checkTouch(dir, dx, dy)) {
                addPoint();
                removeArrow(event.target);
            }
        }
    )

    
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
    let rs4keysEv = document.querySelectorAll('.arrow:not(.destroy)'); //arrows for keys event
    let targetArrow = rs4keysEv[0];
    if( targetArrow.classList.contains(dir) ) {
        removeArrow(targetArrow);
        addPoint();
    }
}

function start() {
    closeMenu();
    score = 0;
    vr = vri;
    writeScore();
    writeRecord();
    addArrow();

    try{
        document.removeEventListener('keyup',onKeyPress); 
    } catch(e) {};
    document.addEventListener('keyup',onKeyPress); 

    window.requestAnimationFrame(frame);
}

function openMenu() {
    writeRecord();
    
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
        scoreElem = document.querySelector("#score");
        recordElem = document.querySelector("#menu-record");
        menuElem = document.querySelector('#menu');
        
        document.querySelector("#start").addEventListener( 'click', start );

        openMenu();
        
        //start();
               
    }
)

