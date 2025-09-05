// Allow importing any .js file as a module
declare module '*.js' {
  export const vfs: { [filename: string]: string };
}
