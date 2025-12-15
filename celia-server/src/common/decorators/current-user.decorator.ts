import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    let user = request.user;
    
    // Log for debugging
    if (!user) {
      console.warn('[CurrentUser] request.user is null/undefined');
      console.warn('[CurrentUser] Request headers:', {
        authorization: request.headers?.authorization ? 'present' : 'missing',
      });
    } else {
      console.log('[CurrentUser] User object received:', {
        hasId: !!user.id,
        hasSub: !!user.sub,
        keys: Object.keys(user),
      });
    }
    
    // If user object doesn't have id but has sub (from JWT payload), use sub as id
    if (user && !user.id && user.sub) {
      console.log('[CurrentUser] Setting user.id from user.sub:', user.sub);
      user.id = user.sub;
    }
    
    // Final safety check - ensure id exists
    if (user && !user.id) {
      console.error('[CurrentUser] User object exists but has no id property!');
      console.error('[CurrentUser] User object:', JSON.stringify(user, null, 2));
      console.error('[CurrentUser] User object type:', typeof user);
      console.error('[CurrentUser] User object keys:', Object.keys(user || {}));
    }
    
    return user;
  },
);
