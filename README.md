# AngularJsreport

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Install packages

To start a local development, run:

```bash
npm i pdfmake xlsx dayjs
# (optional but handy for types)
npm i -D @types/pdfmake
```

## Add New Fonts

Download font file `.tff` and store in project folder. Example. `public\fonts\Battambang-Regular.ttf`

Register font families on the SAME host

```js
const host: any = (window as any).pdfMake;
// define font name and point to font files
host.fonts = {
  Battambang: {
    normal: `${window.location.origin}/fonts/Battambang-Regular.ttf`,
    bold: `${window.location.origin}/fonts/Battambang-Bold.ttf`,
    italics: `${window.location.origin}/fonts/Battambang-Regular.ttf`,
    bolditalics: `${window.location.origin}/fonts/Battambang-Bold.ttf`,
    light: `${window.location.origin}/fonts/Battambang-Light.ttf`,
    thin: `${window.location.origin}/fonts/Battambang-Thin.ttf`,
    black: `${window.location.origin}/fonts/Battambang-Black.ttf`,
  },
};
```
## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
