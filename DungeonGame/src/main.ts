import { RenderEngine } from './render/RenderEngine';
import './style.css'

var engine: RenderEngine;

function init(){
    let cnv = document.querySelector("#renderCanvas") as HTMLCanvasElement;
    engine = new RenderEngine(cnv);
    
    console.log("Initialization complete.")
}

init();