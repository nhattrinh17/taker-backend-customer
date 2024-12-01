import { applyDecorators } from '@nestjs/common';
import { ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import moment from 'moment-timezone';

export function BaseFilter() {
  return applyDecorators(
    ApiQuery({
      name: 'page',
      type: 'number',
      example: 1,
      description: 'Số thứ tự trang cần lấy dữ liệu, ví dụ: 1, 2, 3, ...',
    }),
    ApiQuery({
      name: 'limit',
      type: 'number',
      example: 10,
      description: 'Số bản ghi trên 1 trang, ví dụ: 10, 25, 50, 100, ...',
    }),

    ApiQuery({
      name: 'sort',
      type: 'string',
      required: false,
      description: 'Sắp xếp theo trường dữ liệu, ví dụ: createdAt, updatedAt, ...',
    }),
    ApiQuery({
      name: 'typeSort',
      type: 'string',
      required: false,
      description: 'Kiểu sắp xếp, ví dụ: ASC, DESC, ...',
    }),
  );
}

export function CommonGetResponse(responseArray?: boolean) {
  const decorators = [];
  if (responseArray)
    decorators.push(
      ApiOkResponse({
        description: 'The resource was returned successfully',
        schema: {
          type: 'object',
          properties: {
            pagination: {
              type: 'object',
              description: 'Pagination data',
            },
            data: {
              type: 'array',
              items: { type: 'object' },
              description: 'Array of item',
            },
          },
        },
      }),
    );
  else
    decorators.push(
      ApiOkResponse({
        description: 'The resource was returned successfully',
        schema: {
          type: 'object',
        },
      }),
    );

  decorators.push(
    ApiUnprocessableEntityResponse({
      description: 'Bad Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Bad request',
          },
          statusCode: {
            type: 'number',
            default: 422,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Unauthorized',
          },
          statusCode: {
            type: 'number',
            default: 401,
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Forbidden',
          },
          statusCode: {
            type: 'number',
            default: 403,
          },
        },
      },
    }),
  );
  return applyDecorators(...decorators);

  // return applyDecorators(
  //   ApiOkResponse({
  //     description: 'The resource was returned successfully',
  //     schema: responseArray
  //       ? {
  //           type: 'object',
  //           properties: {
  //             pagination: {
  //               type: 'object',
  //               properties: {
  //                 limit: { type: 'number' },
  //                 page: { type: 'number' },
  //                 total: { type: 'number' },
  //               },
  //             },
  //             data: {
  //               type: 'array',
  //               items: { type: 'object' },
  //             },
  //           },
  //         }
  //       : {
  //           type: 'object',
  //         },
  //   }),
  //   ApiUnprocessableEntityResponse({
  //     description: 'Bad Request',
  //     schema: {
  //       type: 'object',
  //       properties: {
  //         message: {
  //           type: 'string',
  //           default: 'Bad request',
  //         },
  //         statusCode: {
  //           type: 'number',
  //           default: 422,
  //         },
  //       },
  //     },
  //   }),
  //   ApiUnauthorizedResponse({
  //     description: 'Unauthorized Request',
  //     schema: {
  //       type: 'object',
  //       properties: {
  //         message: {
  //           type: 'string',
  //           default: 'Unauthorized',
  //         },
  //         statusCode: {
  //           type: 'number',
  //           default: 401,
  //         },
  //       },
  //     },
  //   }),
  //   ApiForbiddenResponse({
  //     description: 'Forbidden Request',
  //     schema: {
  //       type: 'object',
  //       properties: {
  //         message: {
  //           type: 'string',
  //           default: 'Forbidden',
  //         },
  //         statusCode: {
  //           type: 'number',
  //           default: 403,
  //         },
  //       },
  //     },
  //   }),
  // );
}

export function CommonPostResponse() {
  return applyDecorators(
    ApiCreatedResponse({
      description: 'Created Succesfully',
      schema: { type: 'object' },
    }),
    ApiUnprocessableEntityResponse({
      description: 'Bad Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Bad request',
          },
          statusCode: {
            type: 'number',
            default: 422,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Unauthorized',
          },
          statusCode: {
            type: 'number',
            default: 401,
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Forbidden',
          },
          statusCode: {
            type: 'number',
            default: 403,
          },
        },
      },
    }),
  );
}

export function CommonPatchResponse() {
  return applyDecorators(
    ApiOkResponse({
      description: 'The resource was updated successfully',
      schema: { type: 'object' },
    }),
    ApiUnprocessableEntityResponse({
      description: 'Bad Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Bad request',
          },
          statusCode: {
            type: 'number',
            default: 422,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Unauthorized',
          },
          statusCode: {
            type: 'number',
            default: 401,
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Forbidden',
          },
          statusCode: {
            type: 'number',
            default: 403,
          },
        },
      },
    }),
  );
}

export function CommonDeleteResponse() {
  return applyDecorators(
    ApiOkResponse({
      description: 'The resource was deleted successfully',
      schema: { type: 'object' },
    }),
    ApiUnprocessableEntityResponse({
      description: 'Bad Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Bad request',
          },
          statusCode: {
            type: 'number',
            default: 422,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Unauthorized',
          },
          statusCode: {
            type: 'number',
            default: 401,
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden Request',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            default: 'Forbidden',
          },
          statusCode: {
            type: 'number',
            default: 403,
          },
        },
      },
    }),
  );
}

export function ApiOperationCustom(resource: string, method: string, applyReponse = true, getOne = false) {
  const decorators = [];
  switch (method.toUpperCase()) {
    case 'POST':
      decorators.push(
        ApiOperation({
          summary: `Tạo mới ${resource}`,
          description: `API tạo mới ${resource}`,
        }),
      );
      if (applyReponse) decorators.push(CommonPostResponse());
      break;
    case 'GET':
      if (!getOne) {
        decorators.push(
          ApiOperation({
            summary: `Lấy danh sách ${resource}`,
            description: `API lấy danh sách ${resource}`,
          }),
        );
        if (applyReponse) decorators.push(CommonGetResponse(true));
      } else {
        decorators.push(
          ApiOperation({
            summary: `Lấy ${resource} theo ID`,
            description: `API lấy ${resource} theo ID`,
          }),
          ApiParam({
            name: 'id',
            description: `ID của ${resource}`,
          }),
        );
        if (applyReponse) decorators.push(CommonGetResponse());
      }
      break;
    case 'PATCH':
      decorators.push(
        ApiOperation({
          summary: `Cập nhật ${resource} theo ID`,
          description: `API cập nhật ${resource} theo ID`,
        }),
        ApiParam({
          name: 'id',
          description: `ID của ${resource}`,
        }),
      );
      if (applyReponse) decorators.push(CommonPatchResponse());
      break;
    case 'DELETE':
      decorators.push(
        ApiOperation({
          summary: `Xóa ${resource} theo ID`,
          description: `API xóa ${resource} theo ID`,
        }),
        ApiParam({
          name: 'id',
          description: `ID của ${resource}`,
        }),
      );
      if (applyReponse) decorators.push(CommonDeleteResponse());
      break;
    default:
      break;
  }
  return applyDecorators(...decorators);
}
