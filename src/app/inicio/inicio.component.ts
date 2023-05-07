import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  usuario:any
  constructor(private router:Router, private userService:AccountService) { }

  ngOnInit(): void {
    this.cargarUsuario()
  }

  cargarUsuario(){
    this.userService.cargarUsuario().subscribe(data=>{
      this.usuario=data
      console.log(data)
    },error=>{
      console.log(error)
    })
  }
  pagar() {
    this.router.navigate(['/payment'])
  } 

  jugar(){
    if(parseInt(this.usuario.fichas)==0){
      alert("No tienes fichas")
    }else{
      this.router.navigate(['/match'])
    }
    
  }

  
  
}
