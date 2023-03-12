import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { GamesService } from '../games.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  name?: string = "Pepe"
  pwd?: string = "123"
  message?: string
  loginCorrecto:boolean = false

  constructor(private accountService : AccountService, private gamesService:GamesService) { }

  ngOnInit(): void {
  }
  login(){
    let info={
      name:this.name,
      pwd1:this.pwd
    }
    this.accountService.login(info).subscribe(
      respuesta => {
        this.message="Hola, "+ this.name
        this.loginCorrecto=true
      },
      error=>{
        this.loginCorrecto=false
        this.message="Ha habido un error"
      }
    )
  }
  requestGame(){
    this.gamesService.requestGame()
  }
}
