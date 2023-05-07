import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
 

  constructor(private httpClient:HttpClient) { }

  requestGame(){
    return this.httpClient.get<any>("http://localhost:80/games/requestGame?juego=nm&player=" + sessionStorage.getItem("httpSessionId"));
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
  rendirse(info:any){
    return this.httpClient.put<any>("http://localhost:80/games/rendirse", info)
  }
  
}
