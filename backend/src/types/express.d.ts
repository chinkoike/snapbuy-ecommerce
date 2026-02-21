import "express";

declare module "express-serve-static-core" {
  interface Request {
    auth?: {
      header: any;
      payload: {
        sub?: string;
        email?: string;
        [key: string]: any;
      };
      token?: string;
    };
  }
}
