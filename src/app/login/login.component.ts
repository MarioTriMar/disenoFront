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
  loginCorrecto:boolean = false

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
        this.loginCorrecto=true
        sessionStorage.setItem("player", this.name!)
        this.router.navigate(['/match'])
      },
      error=>{
        this.loginCorrecto=false
        this.message="Ha habido un error"
      }
    )
    
  }
  
}
