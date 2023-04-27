import { Component, OnInit } from '@angular/core';
import { GamesService } from '../games.service';

declare let Stripe : any;

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {
  private ws?: WebSocket
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
  constructor(private gamesService:GamesService) { }

  ngOnInit(): void {
  }

  addRow(){

    let info={
      "idPartida":sessionStorage.getItem("idMatch"),
      "idJugador":sessionStorage.getItem("httpSessionId"),
    }

    this.gamesService.addRow(info).subscribe( respuesta =>{
      console.log(respuesta);
      this.matriz_1 = respuesta.boards.digits!;
    })
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
    let ready = respuesta.ready;
    if (ready) {
      this.matriz_1 = respuesta.boards[1].digits!;
      this.matriz_2 = respuesta.boards[0].digits!;      
    }
  }

  makeMovement(i1:number,j1:number,i2:number,j2:number){
    let valido=true
    if(this.sonAdyacentes(i1,j1,i2,j2)){
      console.log("Movimiento adyacente valido")
    }else if(this.sonDiagonales(i1,j1,i2,j2)){
      console.log("Movimiento diagonal valido")
    }else if(this.sonHorizontales(i1,j1,i2,j2)){
      console.log("Movimiento horizontal valido")
    }else if(this.sonSerpientes(i1,j1,i2,j2)){
      console.log("Movimiento serpiente valido")
    }else if(this.sonVerticales(i1,j1,i2,j2)){
      console.log("Movimiento vertical valido")
    }else{
      console.log("Movimiento invalido")
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
      
      this.gamesService.hacerMovimiento(info).subscribe(data=>{
        console.log("data", data.boards.digits)
        this.matriz_1 = data.boards.digits!;
        //this.matriz_1 =this.deleteZeros(data.boards.digits, 1);
        console.log("*********", this.matriz_1)
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
      if (info.type=="matchReady"){
        self.matriz_1 = info.boards[0].digits
        self.matriz_2 = info.boards[1].digits
      }else if(info.type=="movement"){
        self.deleteZeros(info.boards, 2)
        console.log("MATRIZ CAMBIADA",info.boards)
      }else if(info.type=="addRow"){
        console.log(info.boards)
        self.matriz_2 = info.boards
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

  deleteZeros(matriz: any, num: number){
    if (matriz.length != 0) {
      // Elimina filas con ceros de la matriz
      for (let i = matriz.length - 1; i >= 0; i--) {
        const row = matriz[i];
        const allZeros = row.every((value: any) => value === 0);
        if (allZeros) {
          matriz.splice(i, 1);
        }
      }

      if (num == 1){
        this.matriz_1 = matriz;
      }else{
        this.matriz_2 = matriz;
      }
      
    }
  }

  pay(){
    let req=new XMLHttpRequest()
    let self=this
    req.open("GET", "http://localhost/payments/prepay?amount=100")
    req.onreadystatechange = function(){
      if(req.readyState==4){
        if(req.status==200){
          self.token=req.responseText
          self.showForm()
        }else{
          alert(req.statusText)
        }
      }
    }
    req.send()

  }

  showForm(){
    let elements = this.stripe.elements()
    let style = {
      base: {
        color: "#32325d", fontFamily: 'Arial, sans-serif',
        fontSmoothing: "antialiased", fontSize: "16px",
        "::placeholder": {
        color: "#32325d"
        }
      },
      invalid: {
        fontFamily: 'Arial, sans-serif', color: "#fa755a",
        iconColor: "#fa755a"
      }
    }
    let card = elements.create("card", { style : style })
    card.mount("#card-element")
    card.on("change", function(event : any) {
      document.querySelector("button")!.disabled = event.empty;
      document.querySelector("#card-error")!.textContent =
      event.error ? event.error.message : "";
    });
    let self = this
    let form = document.getElementById("payment-form");
    form!.addEventListener("submit", function(event) {
      event.preventDefault();
      self.payWithCard(card);
    });
    form!.style.display = "block"
  }

  payWithCard(card:any){
    let self = this
    this.stripe.confirmCardPayment(this.token, {
      payment_method: {
      card: card
      }
    }).then(function(response : any) {
      if (response.error) {
        alert(response.error.message);
      } else {
        if (response.paymentIntent.status === 'succeeded') {
          alert("Pago exitoso");
          self.paymentOk();

        }
      }
    });

  }
  paymentOk(){
    let req=new XMLHttpRequest()
    let self=this
    let payload={
      token:this.token
    }
    req.open("POST", "http://localhost/payments/paymentOk")
    req.setRequestHeader("Content-Type","application/json")
    req.onreadystatechange = function(){
      if(req.readyState==4){
        if(req.status==200){
          alert("Tu pago se ha completado")
        }else{
          alert(req.statusText)
        }
      }
    }
    req.send(JSON.stringify(payload))
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
    if((i1<i2) && (j1!=j2)){
      let seguir=true
      
      let j=j1+1
      let i=i1
      for(i;i<=i2 && seguir;i++){
        for(j;j<=8;j++){
          if(i==i2 && j==j2){
            movValido=true
            break
          }
          if(this.matriz_1[i][j]!=0){
            seguir=false
            break
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
            break
          }
          if(this.matriz_1[i][j]!=0){
            seguir=false
            break
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
