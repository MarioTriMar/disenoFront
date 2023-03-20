import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { GamesService } from '../games.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  private ws?: WebSocket

  matriz_1? : any
  matriz_2? : any
  respuesta_ws? : string

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
    
      this.partida_ready(respuesta);

      console.log("ws ......... ",this.ws)

    }, error =>{
      console.log(error)
    }
    )
  }

  private partida_ready(respuesta: any) {
    let ready = respuesta.ready;
    if (ready) {
      this.matriz_1 = respuesta.boards[1].digits!;
      this.matriz_2 = respuesta.boards[0].digits!;
    }
  }

  prepareWebSocket():WebSocket{
    let self = this
    this.ws=new WebSocket("ws://localhost/wsGames?httpSessionId="+sessionStorage.getItem("httpSessionId"))

    this.ws.onopen = function(){
      console.log("WS abierto")
    }

    this.ws.onmessage = function(event){
      console.log(JSON.parse(event.data))
      let info = event.data
      info = JSON.parse(info)
      self.matriz_1 = info.boards[0].digits
      self.matriz_2 = info.boards[1].digits
    }

    this.ws.onclose = function(){
      console.log("WS cerrado")
    }

    this.ws.onerror = function(event){
      console.log("WS error: " + JSON.stringify(event))
    }
    
    return this.ws
  }
  

}
