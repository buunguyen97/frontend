# Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## 언어키 생성
ngx-translate-extract --input ./src --output ./src/assets/i18n/template.json
ngx-translate-extract --input ./src --output ./src/assets/i18n/ko-KR.json


## Devextreme 설치
* npm i devextreme-cli
* npm install devextreme@21.2.4 --save --save-exact
* npm install devextreme-angular@21.2.4 --save --save-exact
* npm i devextreme-themebuilder@21.2.4 --save --save-exact

 
## Docker 생성 및 실행
## https://seohyun0120.tistory.com/entry/Nodejs-%EC%9B%B9-%EC%95%B1%EC%9D%98-%EB%8F%84%EC%BB%A4%EB%9D%BC%EC%9D%B4%EC%A7%95
## https://wings2pc.tistory.com/entry/%EB%8F%84%EC%BB%A4Docker-Error-response-from-daemon-%ED%95%B4%EA%B2%B0-%EB%B0%A9%EB%B2%95
## docker login www.jflab.co.kr:5000
* docker build  -t www.concplay.co.kr:5000/frontend:poc1.0 .
* docker run  --name frontend -p 40000:80 -d www.concplay.co.kr:5000/frontend:poc1.0  
* docker run  --name frontend -p 80:80 -d www.concplay.co.kr:5000/frontend:poc1.0

* docker build --platform linux/amd64 -t www.concplay.co.kr:5000/frontend:dev .
* docker push www.concplay.co.kr:5000/frontend:dev
* docker run  --name frontend -p 50004:80 -d www.concplay.co.kr:5000/frontend:dev


## Typescript : 4.2.4(4.4.3는 현재 안됨, angular에서 지원 안함.)

## npm run build-themes
* theme 변경 후


## angular12 bug.
* angular.json 에서 다음과 같이 변경
```
 "optimization": true => 
               "optimization": {
                "scripts": true,
                "styles": {
                  "minify": true,
                  "inlineCritical": false
                },
                "fonts": {
                  "inline": true
                }
              }
```
* 그리고 ng bulid --prod 로 프로덕션으로 빌드해야 함.
** dev version
ng serve --configuration dev


---
-- 설치 순서(2021.10.29)
## Node  && NPM
* NODE : 16.10.0 ~~14.17.6~~
* NPM : npm install -g npm@7.24.1
* windows 일 경우 NVM 사용이 편함.

## Angular cli 설치npm install -g @angular/cli
* npm install -g @angular/cli@12.2.6

## Package 설치
* npm install


---
## Angular CLI 명령어..
* https://uxgjs.tistory.com/61
* 화면 생성 : ng g c [pages 포함한 경로(pages/poc/simulation)]
* 서비스 생성 : ng g s [pages 폴더명의 + 파일명까지 (pages/poc/simulation/simulation)]
* 메뉴달기
  * routing-module에 등록하기 
  * app-navigation에 메뉴등록

---

** Execute
node --max-old-space-size=8192 ./node_modules/@angular/cli/bin/ng serve --configuration dev
