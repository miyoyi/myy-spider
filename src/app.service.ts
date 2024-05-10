// import { Inject, Injectable } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
// import { EntityManager } from 'typeorm';
import { Job } from './entites/Job';
import { Observable, Subscriber } from 'rxjs';

let cache = null;

@Injectable()
export class AppService {
  async startSpider() {
    if (cache) {
      return cache;
    }
    async function getData(observer: Subscriber<Record<string, any>>) {
      const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
          width: 0,
          height: 0,
        },
      });

      const page = await browser.newPage();

      await page.goto(
        'https://www.zhipin.com/web/geek/job?query=前端&city=101230100',
      );

      await page.waitForSelector('.job-list-box');

      const totalPage = await page.$eval(
        '.options-pages a:nth-last-child(2)',
        (e: { textContent: string }) => {
          return parseInt(e.textContent);
        },
      );

      const allJobs = [];
      for (let i = 1; i <= totalPage; i++) {
        await page.goto(
          'https://www.zhipin.com/web/geek/job?query=前端&city=101230100&page=' +
            i,
        );

        await page.waitForSelector('.job-list-box');

        const jobs = await page.$eval(
          '.job-list-box',
          (el: { querySelectorAll: (arg0: string) => any }) => {
            return [...el.querySelectorAll('.job-card-wrapper')].map((item) => {
              return {
                job: {
                  name: item.querySelector('.job-name').textContent,
                  area: item.querySelector('.job-area').textContent,
                  salary: item.querySelector('.salary').textContent,
                },
                link: item.querySelector('a').href,
                company: {
                  name: item.querySelector('.company-name').textContent,
                },
              };
            });
          },
        );
        allJobs.push(...jobs);
      }

      for (let i = 0; i < allJobs.length; i++) {
        await page.goto(allJobs[i].link);

        try {
          await page.waitForSelector('.job-sec-text');

          const jd = await page.$eval(
            '.job-sec-text',
            (el: { textContent: any }) => {
              return el.textContent;
            },
          );
          allJobs[i].desc = jd;

          console.log(allJobs[i]);

          const job = new Job();

          job.name = allJobs[i].job.name;
          job.area = allJobs[i].job.area;
          job.salary = allJobs[i].job.salary;
          job.link = allJobs[i].link;
          job.company = allJobs[i].company.name;
          job.desc = allJobs[i].desc;
          observer.next({ data: job });
          // await this.entityManager.save(Job, job);
        } catch (e) {}
      }
      cache = allJobs;
    }
    return new Observable((observer) => {
      getData(observer);
    });
  }

  //   @Inject(EntityManager)
  //   private entityManager: EntityManager;
}
