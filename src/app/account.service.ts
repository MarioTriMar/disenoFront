import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  

  constructor(private httpClient:HttpClient) { }

  register(info:any) {
    this.httpClient.post("http://localhost:80/users/register",info).subscribe(respuesta =>{
      alert(respuesta)
      console.log(respuesta)
    })
  }
  login(info:any):Observable<any>{
    return this.httpClient.put<any>("http://localhost:80/users/login",info)
  }
}
