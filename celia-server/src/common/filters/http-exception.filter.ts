import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An error occurred. Please try again.';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        
        // Handle validation errors (array of messages)
        if (Array.isArray(responseObj.message)) {
          message = responseObj.message.join(', ');
          errorDetails = {
            errors: responseObj.message,
            error: responseObj.error || 'Validation failed',
          };
        } else {
          message = responseObj.message || message;
          
          // Include error details if available
          if (responseObj.error || responseObj.errors) {
            errorDetails = {
              error: responseObj.error,
              errors: responseObj.errors,
            };
          }
        }
      }
    } else if (exception instanceof Error) {
      // Log unexpected errors
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
        `${request.method} ${request.url}`,
      );

      // Include error details in development mode
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        errorDetails = {
          name: exception.name,
          message: exception.message,
          stack: exception.stack,
        };
      }
    }

    // Log the error for debugging
    if (status >= 500) {
      this.logger.error(
        `Error ${status} on ${request.method} ${request.url}: ${message}`,
      );
    } else if (status >= 400) {
      this.logger.warn(
        `Client error ${status} on ${request.method} ${request.url}: ${message}`,
      );
    }

    const errorResponse: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Include error details if available
    if (errorDetails) {
      errorResponse.error = errorDetails;
    }

    response.status(status).json(errorResponse);
  }
}
