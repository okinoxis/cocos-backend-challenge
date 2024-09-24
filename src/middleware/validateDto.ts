import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { Request, Response, NextFunction } from "express";

export function validateDto(dtoClass: any) {
  return function (req: Request, res: Response, next: NextFunction) {
    const dtoObject = plainToInstance(dtoClass, req.body);
    validate(dtoObject).then((errors) => {
      if (errors.length > 0) {
        const validationErrors = errors
          .map((error) => Object.values(error.constraints))
          .flat();
        res.status(400).json({ errors: validationErrors });
      } else {
        req.body = dtoObject;
        next();
      }
    });
  };
}
