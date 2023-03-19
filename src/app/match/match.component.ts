import { Component, OnInit } from '@angular/core';
import { GamesService } from '../games.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  private ws?: WebSocket

  matriz? : any
  matriz_0? : any 

  constructor(private gamesService:GamesService) { }

  ngOnInit(): void {
  }
  
  requestGame(){
    console.log(sessionStorage.getItem("player"))
    this.gamesService.requestGame()
    .subscribe(respuesta =>{
      sessionStorage.setItem("idMatch", respuesta.id)
      console.log(respuesta)
      this.prepareWebSocket()
      this.matriz=respuesta.boards[0].digits!
      this.matriz_0=respuesta.boards[1].digits!
      
    }, error =>{
      console.log(error)
    }
    )
  }

  prepareWebSocket(){
    this.ws=new WebSocket("ws://localhost/wsGames?httpSessionId="+
      sessionStorage.getItem("httpSessionId"))
    this.ws.onopen = function(){
      console.log("WS abierto")
    }

    this.ws.onmessage = function(event){
      console.log("Evento: ", event.data)
      sessionStorage.setItem("match", event.data)
    }

    this.ws.onclose = function(){
      console.log("WS cerrado")
    }
    this.ws.onerror = function(event){
      console.log("WS error: " + JSON.stringify(event))
    }
    
  }
  

}
