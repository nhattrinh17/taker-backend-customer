/* eslint-disable @typescript-eslint/ban-types */
import {
  registerDecorator,
  ValidationOptions,
  validate,
} from 'class-validator';
import {
  isValidPhone,
  LATITUDE_PATTERN,
  LONGITUDE_PATTERN,
} from '@common/index';
import { plainToClass } from 'class-transformer';

export function IsPhoneInVn(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsPhoneInVn',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isValidPhone(value);
        },
      },
    });
  };
}

export function IsLatitude(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsLatitude',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return LATITUDE_PATTERN.test(value);
        },
      },
    });
  };
}

export function IsLongitude(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsLongitude',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return LONGITUDE_PATTERN.test(value);
        },
      },
    });
  };
}

export function IsArrayOfInstancesOf(
  className,
  validationOptions?: ValidationOptions,
) {
  if (!validationOptions) {
    validationOptions = {};
  }

  if (!validationOptions.message) {
    validationOptions.message =
      'Value must be an array of valid(s) ' + className.name;
  }

  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsArrayOfInstancesOf',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      async: true,
      validator: {
        async validate(value: any): Promise<boolean> {
          if (!Array.isArray(value)) {
            return false;
          }
          const items = value;
          async function validateItem(item): Promise<boolean> {
            const object = plainToClass(className, item);
            const errors = await validate(object);
            return !errors.length;
          }
          const validations = await Promise.all(items.map(validateItem));
          // Si y'a au moins un false, on return false
          return validations.filter((isValidated) => !isValidated).length === 0;
        },
      },
    });
  };
}
