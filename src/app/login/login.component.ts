import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { GamesService } from '../games.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  name?: string = "Ana"
  pwd?: string = "ana123"
  message?: string

  constructor(private router:Router, private accountService : AccountService, private gamesService:GamesService) { }

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
        console.log((respuesta))
        sessionStorage.setItem("httpSessionId", respuesta.httpSessionId!)
        sessionStorage.setItem("player", this.name!)
        sessionStorage.setItem("idPlayer", respuesta.user.id)
        
        this.router.navigate(['/inicio'])
      },
      error=>{
        alert("Error"+ error.error.message)
      }
    )
  }

  register(){
    this.router.navigate(['/register'])
  }

  
}
