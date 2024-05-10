import { Controller, Sse } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Sse()
  startSpider() {
    return this.appService.startSpider();
  }
}
