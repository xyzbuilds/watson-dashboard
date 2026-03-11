declare module "better-sqlite3" {
  interface RunResult {
    changes: number;
    lastInsertRowid: bigint | number;
  }

  interface Statement<BindParameters extends unknown[] = unknown[], Result = unknown> {
    run(...params: BindParameters): RunResult;
    all(...params: BindParameters): Result[];
    get(...params: BindParameters): Result | undefined;
  }

  interface Database {
    exec(sql: string): this;
    prepare<BindParameters extends unknown[] = unknown[], Result = unknown>(sql: string): Statement<BindParameters, Result>;
  }

  interface DatabaseConstructor {
    new (filename: string): Database;
  }

  const Database: DatabaseConstructor;
  export = Database;
}
