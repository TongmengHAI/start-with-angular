# AngularJsreport

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Packages

To start a local development, run:

```bash
npm i jspdf jspdf-autotable exceljs file-saver dayjs
npm i --save-dev @types/file-saver
```
## Code scaffolding
Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
````

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


# Font Converter

This project allows you to convert `.ttf` font files into Base64 and use them directly in your application. 

Note: `jspdf` is not familiar well with `Khmer`( e.,g. សុវណ្ណ​ it shows សុវណណ in PDF)

## Add New Fonts

1. Download the font file (`.ttf` extension) you want to use and place it in the `public` folder (e.g., `public/fonts/Battambang-Regular.ttf"`).

2. Open `convert-font.js` and add the font path and output name:

   ```js
   toBase64("./public/fonts/Battambang-Regular.ttf", "BATTAMBANG_BASE64");
   ```

3. Create a file to store the output (e.g., `src/assets/fonts/fonts.ts`).

4. Run the following command to generate the base64-encoded font and save it to the file:
   ```
   node convert-font.js > src/assets/fonts/fonts.ts
   ```
5. After running the command, you will get an exported constant like this: ` 
export const BATTAMBANG_BASE64 = "data:font/ttf;base64,AAEA....";`. You can then import and use the generated base64 fonts in your code. Example:

    ```js
      import { BATTAMBANG_BASE64 } from "../../../assetsfonts/fonts";

      try {
        (doc as any).addFileToVFS("Battambang-Regular.ttf",BATTAMBANG_BASE64.split(",")[1]);
        
        (doc as any).addFont("Battambang-Regular.ttf", "battambang","normal");

      } catch {}
    ```
