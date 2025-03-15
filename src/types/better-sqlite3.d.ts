declare module 'better-sqlite3' {
  interface Database {
    prepare(sql: string): Statement;
    close(): void;
  }

  interface Statement {
    run(...params: any[]): any;
    all(...params: any[]): any[];
  }

  export default function(path: string): Database;
} 