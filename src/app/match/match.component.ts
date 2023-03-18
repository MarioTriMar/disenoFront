import { Component, OnInit } from '@angular/core';
import { GamesService } from '../games.service';

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  matriz_1? : any
  matriz_2? : any 

  constructor(private gamesService:GamesService) { }

  ngOnInit(): void {
  }
  
  requestGame(){
    console.log(sessionStorage.getItem("player"))
    this.gamesService.requestGame()
    .subscribe(respuesta =>{
      sessionStorage.setItem("idMatch", respuesta.id)
      console.log(respuesta)
      this.gamesService.prepareWebSocket()
      let ready=respuesta.ready;
      
      if(ready){
        this.matriz_1=respuesta.boards[1].digits!
        this.matriz_2=respuesta.boards[0].digits!
      }else{
        while(!ready){
          if(sessionStorage.getItem("match")!=null){
            ready=true;
            console.log("Entra: ",sessionStorage.getItem("match")!)
            this.matriz_1=JSON.parse(sessionStorage.getItem("match")!).boards[0].digits!
            this.matriz_2=JSON.parse(sessionStorage.getItem("match")!).boards[1].digits!
          }else{
            console.log("no entra: ", sessionStorage.getItem("match")!)
          }
        }
      }
      
      
    }, error =>{
      console.log(error)
    }
    )
  }

  

}
