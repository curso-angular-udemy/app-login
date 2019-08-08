import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UsuarioModel } from '../models/usuario.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]
  // https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY] 
  url = "https://identitytoolkit.googleapis.com/v1/accounts"
  apiKey = environment.apiKey;
  userToken = '';

  constructor( private http: HttpClient) {
    this.getToken();
  }

  login(usuario: UsuarioModel): Observable<any> {
    const authData = {
      ...usuario,
      returnSecureToken: true
    };
    return this.http.post(`${this.url}:signInWithPassword?key=${this.apiKey}`, authData).pipe(
      map ((resp: any) => {
        this.saveToken(resp.idToken, resp.expiresIn);
        return resp;
      })
    );
  }

  signup(usuario: UsuarioModel) {
    const authData = {
      ...usuario,
      returnSecureToken: true
    };
    return this.http.post(`${this.url}:signUp?key=${this.apiKey}`, authData).pipe(
      map ((resp: any) => {
        this.saveToken(resp.idToken, resp.expiresIn);
        return resp;
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  private saveToken(idToken: string, expiresIn: number) {
    this.userToken = idToken;
    localStorage.setItem('token',  idToken);
    const hoy = new Date();
    hoy.setSeconds(expiresIn);
    localStorage.setItem('expira', hoy.getTime().toString())
  }

  private getToken() {
    if(localStorage.getItem('token')) {
      this.userToken = localStorage.getItem('token');
    } else {
      this.userToken = '';
    }
    return this.userToken;
  }

  estaAutenticado(): boolean {
    if (this.userToken.length < 2) {
      return false;
    }
    const expira = Number(localStorage.getItem('expira'));
    if (expira < new Date().getTime()) {
      return false;
    }
    return true;
  }
}
