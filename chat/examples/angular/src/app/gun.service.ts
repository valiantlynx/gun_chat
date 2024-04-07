import { NgModule, Injectable } from '@angular/core';
import Gun from 'gun/gun';

@Injectable()
export class GunDb {
    readonly gun = Gun({ peers: ['https://gun-relay.valiantlynx.com/gun', 'http://localhost:8765/gun'] });
}
