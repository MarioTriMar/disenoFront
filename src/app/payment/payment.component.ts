import { Component, OnInit } from '@angular/core';

declare let Stripe: any;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {

  stripe = Stripe("pk_test_51MqB8XKhg9Z0Z1gk68sTt0VD6hXQWe654Ag0kEZjqtLqBEHYJlUaBl8dohhqFpmC7jmjm91P4QJyucc0FGIx7JpI007oMRBLzx");
  token: any;
  
  constructor() { }

  ngOnInit(): void {
  }

  
  pay() {
    let self = this
    let req = new XMLHttpRequest()
    req.open("GET", "http://localhost/payments/prepay?amount=1")
    req.onreadystatechange = function () {
      if (req.readyState == 4) {
        if (req.status == 200) {
          self.token = req.responseText
          self.showForm()
        } else {
          alert(req.statusText)
        }
      }
    }
    req.send()
  }

  showForm() {
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

    let card = elements.create("card", { style: style })
    card.mount("#card-element")
    card.on("change", function (event: any) {
      document.querySelector("button")!.disabled = event.empty;
      document.querySelector("#card-error")!.textContent =
        event.error ? event.error.message : "";
    });

    let self = this
    let form = document.getElementById("payment-form");
    form!.addEventListener("submit", function (event) {
      event.preventDefault();
      self.payWithCard(card);
    });

    form!.style.display = "block"
  }

  payWithCard(card: any) {
    let self = this
    this.stripe.confirmCardPayment(this.token, {
      payment_method: {
        card: card
      }
    }).then(function (response: any) {
      if (response.error) {
        console.log("ERROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOR")
        console.log(response.error)
        alert(response.error.message);
      } else {
        if (response.paymentIntent.status === 'succeeded') {
          alert("Pago exitoso");
        }
      }
    });
  }
}
