import { Component, OnInit } from '@angular/core';
import { GamesService } from '../games.service';

declare let Stripe : any;

@Component({
  selector: 'app-match',
  templateUrl: './match.component.html',
  styleUrls: ['./match.component.css']
})
export class MatchComponent implements OnInit {

  matriz_1? : any
  matriz_2? : any 
  token? : string
  stripe = Stripe("pk_test_51MqBO8FClxgzl70eR7n8R66OOfIxgVuPIiaCM3AZDJBlQQmiUYISXuR0uIfOWL5TbLWOHcltJSzr3r4isyuVcBXw00Iuh8aPYv")

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
}
