import { Component, OnInit } from '@angular/core';
import { GamesService } from '../games.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

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
      this.matriz=respuesta.boards[0].digits
      this.matriz_0=respuesta.boards[1].digits
      this.gamesService.prepareWebSocket()
    }, error =>{
      console.log(error)
    }
    )
  }

  

}
