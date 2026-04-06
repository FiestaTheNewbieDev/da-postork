import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CodexYGOApi {
  constructor(private readonly httpService: HttpService) {}
}
