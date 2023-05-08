import { Component, OnInit } from '@angular/core';
import { GamesService } from '../games.service';
import { Router } from '@angular/router';

declare let Stripe : any;

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {
  ready:boolean = false;
  puntos:number = 0;
  stateAddRow:boolean = false;
  rowsAdded:number = 0;
  private ws?: WebSocket
  perdido = false
  ganado = false
  matriz_1? : any
  matriz_2? : any 
  i_1?:number
  j_1?:number
  i_2?:number
  j_2?:number
  respuesta_ws? : string
  token? : string
  stripe = Stripe("pk_test_51MqBO8FClxgzl70eR7n8R66OOfIxgVuPIiaCM3AZDJBlQQmiUYISXuR0uIfOWL5TbLWOHcltJSzr3r4isyuVcBXw00Iuh8aPYv")
  selectedCells: {rowIndex: number, cellIndex: number}[] = [];

  constructor(private gamesService:GamesService, private router:Router) { }

  ngOnInit(): void {
    this.requestGame();
  }

  addRow(){
    if (this.rowsAdded < 3){

      let info={
        "idPartida":sessionStorage.getItem("idMatch"),
        "idJugador":sessionStorage.getItem("httpSessionId"),
      }
  
      this.gamesService.addRow(info).subscribe( respuesta =>{
        console.log(respuesta);
        this.matriz_1 = respuesta.boards.digits!;
      })

      this.rowsAdded++;

    } else {
      alert("Máximo de filas añadidas")
    }

  }

  rendirse(){
    this.perdido=true

    let info = {
      "idPartida":sessionStorage.getItem("idMatch"),
      "idJugador":sessionStorage.getItem("httpSessionId")
    }

    this.gamesService.rendirse(info).subscribe(respuesta =>{
      console.log(respuesta)
    }, error => {
      console.log(error)
    })
    this.finDelJuego()
  }
  
  requestGame(){
    console.log(sessionStorage.getItem("player"))
    this.gamesService.requestGame()
    .subscribe(respuesta =>{
      sessionStorage.setItem("idMatch", respuesta.id)
      console.log(respuesta)
      this.prepareWebSocket()
      this.partida_ready(respuesta);

    }, error =>{
      console.log(error)
    }
    )
  }
  isRowEmpty(row: number[]): boolean {
    return row.every(num => num === 0);
  }

  selectNumber(num: number, rowIndex: number, cellIndex: number) {
    if (num === 0) {
      return;
    }
    const cellIndexInSelectedCells = this.selectedCells.findIndex(cell => cell.rowIndex === rowIndex && cell.cellIndex === cellIndex);
    if (cellIndexInSelectedCells !== -1) {
      this.selectedCells.splice(cellIndexInSelectedCells, 1);
    } else {
      if (this.selectedCells.length === 2) {
        this.selectedCells = [];
      }
      this.selectedCells.push({rowIndex, cellIndex});
    }
  }
  
  isSelected(rowIndex: number, cellIndex: number): boolean {
    return this.selectedCells.some(cell => cell.rowIndex === rowIndex && cell.cellIndex === cellIndex);
  }

  private partida_ready(respuesta: any) {
    this.ready = respuesta.ready;
    if (this.ready) {
      this.deleteZeros(respuesta.boards[1].digits!,1, false)
      this.deleteZeros(respuesta.boards[0].digits!,2, false)      
    }
  }

  makeMovement(i1:number,j1:number,i2:number,j2:number){
    let valido=true
    if(this.sonAdyacentes(i1,j1,i2,j2)){
      this.puntos++;
    }else if(this.sonDiagonales(i1,j1,i2,j2)){
      this.puntos = this.puntos + 4;
    }else if(this.sonHorizontales(i1,j1,i2,j2)){
      this.puntos = this.puntos + 4;
    }else if(this.sonSerpientes(i1,j1,i2,j2)){
      //Sumamos en el método sonSerpientes
    }else if(this.sonVerticales(i1,j1,i2,j2)){
      this.puntos = this.puntos + 4;
    }else{
      valido=false
    }
    if(valido){
      let pos1={
        "i1":i1,
        "j1":j1
      }
      let pos2={
        "i2":i2,
        "j2":j2
      }
      let movement=[pos1,pos2]

      let info={
        "idPartida":sessionStorage.getItem("idMatch"),
        "idJugador":sessionStorage.getItem("httpSessionId"),
        "movement":movement,
        "board":this.matriz_1
      }
      
      console.log("info makemovement", info)

      this.gamesService.hacerMovimiento(info).subscribe(data=>{
        this.deleteZeros(data.boards.digits!, 1, true);
      },error=>{
        console.log(error)
      })
    }
  }

  prepareWebSocket():WebSocket{
    let self = this
    this.ws=new WebSocket("ws://localhost/wsGames?httpSessionId="+sessionStorage.getItem("httpSessionId"))

    this.ws.onopen = function(){
      console.log("WS abierto")
    }

    this.ws.onmessage = function(event){
      let info = event.data
      info = JSON.parse(info)

      console.log("info websocket",info)

      if (info.type=="matchReady"){
        console.log(info)
        self.ready = true
        self.deleteZeros(info.boards[0].digits,1, false)
        self.deleteZeros(info.boards[1].digits,2, false)
        self.quitarFichas(info.player)
      }else if(info.type=="movement"){
        self.deleteZeros(info.boards, 2, false)
      }else if(info.type=="addRow"){
        self.matriz_2 = info.boards
      }else if(info.type=="perdido"){
        self.perdido = true
        self.finDelJuego()
      }else if(info.type=="ganado"){
        self.ganado = true
        self.finDelJuego()
      }
    }

    this.ws.onclose = function(){
      console.log("WS cerrado")
    }

    this.ws.onerror = function(event){
      console.log("WS error: " + JSON.stringify(event))
    }
    
    return this.ws
  }
  quitarFichas(players: any) {
    this.gamesService.quitarFichas().subscribe(data=>{
      console.log(data)
    },error=>{
      console.log(error)
    })
  }

  deleteZeros(matriz: any, num: number, puntua:boolean){
    if (matriz.length != 0) {
      // Elimina filas con ceros de la matriz
      for (let i = matriz.length - 1; i >= 0; i--) {
        const row = matriz[i];
        const allZeros = row.every((value: any) => value === 0);
        if (allZeros) {  
          if (puntua){
            this.puntos = this.puntos +10;
          }
          matriz.splice(i, 1);
        }
      }
    }

    if (num == 1){
      this.matriz_1 = matriz;
    }else{
      this.matriz_2 = matriz;
    }

    if(this.matriz_1.length == 0){
      this.puntos = this.puntos + 150;
      this.win()
    }

  }

  finDelJuego() {
    setTimeout(() => {
        this.router.navigate(['/inicio']);
    }, 3000);
  }

  win() {
    let info={
      "idPartida":sessionStorage.getItem("idMatch"),
      "idJugador":sessionStorage.getItem("httpSessionId")
    }
    this.gamesService.win(info).subscribe(data=>{
      this.ganado=true
      this.finDelJuego()
    },error=>{
      console.log(error)
    })
  }

  movement(i:number,j:number, value:number){
    
    if(this.i_1==undefined && this.j_1==undefined){
      this.i_1=i
      this.j_1=j
      
    }else{
      this.i_2=i
      this.j_2=j
      console.log("i1: "+this.i_1+" j1: "+this.j_1+" value: "+this.matriz_1[this.i_1!][this.j_1!])
      console.log("i2: "+this.i_2+" j2: "+this.j_2+" value: "+this.matriz_1[this.i_2][this.j_2])
      if(this.matriz_1[this.i_2][this.j_2]==this.matriz_1[this.i_1!][this.j_1!] || 
        (this.matriz_1[this.i_2][this.j_2]+this.matriz_1[this.i_1!][this.j_1!])==10){
        this.makeMovement(this.i_1!,this.j_1!,this.i_2,this.j_2)
      }
      this.i_1=undefined
      this.i_2=undefined
      this.j_1=undefined
      this.j_2=undefined
    }
    
    
  }
  
  sonVerticales(i1:number,j1:number,i2:number,j2:number):boolean{
    let movValido=false
    if((i1!=i2) && (j1==j2)){
      if(i1<i2){
        let i=i1+1
        for(i;i<i2;i++){
          if(this.matriz_1[i][j1]!=0){
            movValido=false
            break
          }
          if(i==i2-1){
            movValido=true
          }
        }
      }else{
        let i=i1-1
        for(i;i>i2;i--){
          if(this.matriz_1[i][j1]!=0){
            movValido=false
            break
          }
          if(i==i2+1){
            movValido=true
          }
        }
      }
    }
    return movValido
  }
  sonSerpientes(i1:number,j1:number,i2:number,j2:number):boolean{
    let movValido=false
    let contador=0;
    if((i1<i2) && (j1!=j2)){
      let seguir=true
      
      let j=j1+1
      let i=i1
      for(i;i<=i2 && seguir;i++){
        for(j;j<=8;j++){
          if(i==i2 && j==j2){
            movValido=true
            if(contador>0){
              this.puntos = this.puntos + 4;
            }else{
              this.puntos = this.puntos + 2;
            }
            break
          }
          if(this.matriz_1[i][j]!=0){
            seguir=false
            break
          } else {
            contador++;
          }
        }
        j=0
      }
    }else if((i1>i2) && (j1!=j2)){
      let seguir=true
      let i=i1
      let j=j1-1
      for(i;i>=i2 && seguir;i--){
        for(j;j>=0;j--){
          if(i==i2 && j==j2){
            movValido=true
            if(contador>0){
              this.puntos = this.puntos + 4;
            }else{
              this.puntos = this.puntos + 2;
            }
            break
          }
          if(this.matriz_1[i][j]!=0){
            seguir=false
            break
          } else {
            contador++;
          }
        }
        j=8
      }
    }
    return movValido
  }
  sonHorizontales(i1:number,j1:number,i2:number,j2:number):boolean{
    let movValido=false
    if(i1==i2){
      if(j1<j2){
        let numEnMedio=Math.abs(j1+1 - j2)
        let contador=0
        let j=j1+1
        for(j;j<j2;j++){
          if(this.matriz_1[i1][j]!=0){
            break
          }
          contador++
        }
        console.log("Numero en medio: ", numEnMedio)
        if(contador==numEnMedio){
          movValido=true
        }

      }else{
        let numEnMedio=Math.abs(j2+1 - j1)
        let contador=0
        let j=j1-1
        for(j;j>j2;j--){
          if(this.matriz_1[i1][j]!=0){
            break
          }
          contador++
        }
        console.log("Numero en medio: ", numEnMedio)
        console.log("Contador: ", contador)
        if(contador==numEnMedio){
          movValido=true
        }
      }
      
    }
    return movValido
    
  }
  sonAdyacentes(i1:number,j1:number,i2:number,j2:number):boolean{
    const difFila = Math.abs(i1 - i2);
    const difColumna = Math.abs(j1 - j2);
    return (difFila === 1 && difColumna === 0) || (difFila === 0 && difColumna === 1 || difFila==1 && difColumna==1);
  }
  sonDiagonales(i1:number,j1:number,i2:number,j2:number):boolean{
    const difFila = Math.abs(i1 - i2);
    const difColumna = Math.abs(j1 - j2);
    let movValido=false
    if(difFila === difColumna){
      let numPorMedio=difColumna-1
      console.log("i1: "+i1+" j1: "+j1)
      console.log("i2: "+i2+" j2: "+j2)
      if(i1<i2){
        if(j1<j2){
          //Diagonal abajo derecha
          let i=i1+1
          let j=j1+1
          let contador=0
          /*
          Recorrer los numeros que estan entre medias, si son igual a 0 le sumo 1 al contador.
          */

          for(j;j<j2;j++,i++){
            if(this.matriz_1[i][j]!=0){
              break
            }
            contador++
          }
          /*
          Si el contador es igual a la cantidad de numeros que hay entre medias es un movimiento valido.
          */
          if(contador==numPorMedio){
            movValido=true
            
          }
        
        }else if(j1>j2){
          //Diagonal abajo izquierda
          let i=i1+1
          let j=j1-1
          let contador=0
          for(j;j>j2;j--, i++){
            if(this.matriz_1[i][j]!=0){
              break
            }
            contador++
          }
          if(contador==numPorMedio){
            movValido=true
            
          }
        }
      }else{
        if(j1<j2){
          //diagonal arriba derecha
          let i=i1-1
          let j=j1+1
          let contador=0
          for(j;j<j2;j++, i--){
            if(this.matriz_1[i][j]!=0){
              break
            }
            contador++
          }
          if(contador==numPorMedio){
            movValido=true
            
          }
        }else{
          //daigonal arriba izquierda
          let i=i1-1
          let j=j1-1
          let contador=0
          for(j;j>j2;j--,i--){
            if(this.matriz_1[i][j]!=0){
              break
            }
            contador++
          }
          if(contador==numPorMedio){
            movValido=true
            
          }
        }
      }
    
    }
    return movValido
    
  }
}
