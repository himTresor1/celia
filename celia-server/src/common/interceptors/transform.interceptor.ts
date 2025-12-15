import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface ApiResponse<T> {
  message: string;
  data?: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      map((data) => {
        // If data already has a message field, preserve the structure
        if (data && typeof data === 'object' && 'message' in data) {
          // If it's already a properly formatted response with message and data, return as is
          if ('data' in data && Object.keys(data).length === 2) {
            return data as ApiResponse<T>;
          }
          
          // If it has message and other fields, extract message and put rest in data
          const { message, ...rest } = data as any;
          const restKeys = Object.keys(rest);
          
          // If there are other fields besides message, include them in data
          if (restKeys.length > 0) {
            return {
              message,
              data: rest,
            };
          }
          
          // If only message field exists, return it with no data
          return {
            message,
          };
        }

        // Generate appropriate message based on HTTP method and endpoint
        const message = this.generateMessage(method, url, data);

        return {
          message,
          data,
        };
      }),
    );
  }

  private generateMessage(method: string, url: string, data: any): string {
    const endpoint = url.split('?')[0].replace('/api/', '');

    switch (method) {
      case 'GET':
        if (endpoint.includes('me') || endpoint.includes('profile')) {
          return 'Profile retrieved successfully';
        }
        if (endpoint.includes('events')) {
          return 'Events retrieved successfully';
        }
        if (endpoint.includes('invitations')) {
          return 'Invitations retrieved successfully';
        }
        if (endpoint.includes('users')) {
          return 'Users retrieved successfully';
        }
        if (endpoint.includes('categories')) {
          return 'Categories retrieved successfully';
        }
        return 'Data retrieved successfully';

      case 'POST':
        if (endpoint.includes('register')) {
          return 'Account created successfully';
        }
        if (endpoint.includes('login')) {
          return 'Login successful';
        }
        if (endpoint.includes('events')) {
          return 'Event created successfully';
        }
        if (endpoint.includes('invitations/bulk')) {
          return data?.message || 'Invitations sent successfully';
        }
        if (endpoint.includes('invitations')) {
          return 'Invitation sent successfully';
        }
        if (endpoint.includes('join')) {
          return 'Successfully joined event';
        }
        return 'Resource created successfully';

      case 'PATCH':
      case 'PUT':
        if (endpoint.includes('profile') || endpoint.includes('users')) {
          return 'Profile updated successfully';
        }
        if (endpoint.includes('events')) {
          return 'Event updated successfully';
        }
        if (endpoint.includes('invitations')) {
          return 'Invitation updated successfully';
        }
        return 'Resource updated successfully';

      case 'DELETE':
        if (endpoint.includes('invitations')) {
          return 'Invitation deleted successfully';
        }
        if (endpoint.includes('events')) {
          return 'Event deleted successfully';
        }
        if (endpoint.includes('leave')) {
          return 'Successfully left event';
        }
        return 'Resource deleted successfully';

      default:
        return 'Operation completed successfully';
    }
  }
}
