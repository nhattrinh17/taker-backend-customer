import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest } from 'fastify';

export const UploadedFilesCustomer = createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
  const request: FastifyRequest = ctx.switchToHttp().getRequest();
  const files = await request.files();

  const fileProcessingPromises = [];

  for await (const fileData of files) {
    const processFile = async (fileData) => {
      const file = fileData.file;
      const fileName = fileData.filename; // Tên của file

      let buffer = Buffer.alloc(0);
      for await (const chunk of file) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      return { fileName, buffer, mimeType: fileData.mimetype, size: fileData.size };
    };

    fileProcessingPromises.push(processFile(fileData));
  }

  const uploadedFiles = await Promise.all(fileProcessingPromises);
  return uploadedFiles;
});
