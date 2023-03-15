import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  private ws?: WebSocket
  constructor(private httpClient:HttpClient, private router:Router) { }

  requestGame(){

    return this.httpClient.get<any>("http://localhost:80/games/requestGame?juego=nm&player=" + sessionStorage.getItem("player"));
    
  }
  prepareWebSocket(){
    this.ws=new WebSocket("ws://localhost/wsGames")
    this.ws.onopen = function(){
      console.log("WS abierto")
    }

    this.ws.onmessage = function(event){
      console.log("Mensaje recibido: " + JSON.stringify(event.data))
    }

    this.ws.onclose = function(){
      console.log("WS cerrado")
    }
    this.ws.onerror = function(event){
      console.log("WS error: " + JSON.stringify(event))
    }
    
  }
}
