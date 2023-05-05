import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MatchComponent } from './match/match.component';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
 

  private ws?: WebSocket
  constructor(private httpClient:HttpClient, private router:Router) { }

  requestGame(){
    return this.httpClient.get<any>("http://localhost:80/games/requestGame?juego=nm&player=" + sessionStorage.getItem("httpSessionId"));
  }
  prepareWebSocket(){
    this.ws=new WebSocket("ws://localhost/wsGames?httpSessionId="+
      sessionStorage.getItem("httpSessionId"))
    this.ws.onopen = function(){
      console.log("WS abierto")
    }

    this.ws.onmessage = function(event){
      console.log(JSON.parse(event.data))
      let pos=JSON.parse(event.data).player.indexOf(sessionStorage.getItem("httpSessionId"))
      console.log("Posicion 1 jugador: ",pos);
      sessionStorage.setItem("match", event.data)
      
      
    }

    this.ws.onclose = function(){
      console.log("WS cerrado")
    }
    this.ws.onerror = function(event){
      console.log("WS error: " + JSON.stringify(event))
    }
    
  }
  hacerMovimiento(info:any){
    return this.httpClient.put<any>("http://localhost:80/games/makeMovement",info)
  }
  win(info:any) {
    return this.httpClient.put<any>("http://localhost:80/games/win",info)
  }
  addRow(info:any){
    return this.httpClient.put<any>("http://localhost:80/games/addRow", info)
  }
}
