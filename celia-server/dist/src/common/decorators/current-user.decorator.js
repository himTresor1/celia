"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    let user = request.user;
    if (!user) {
        console.warn('[CurrentUser] request.user is null/undefined');
        console.warn('[CurrentUser] Request headers:', {
            authorization: request.headers?.authorization ? 'present' : 'missing',
        });
    }
    else {
        console.log('[CurrentUser] User object received:', {
            hasId: !!user.id,
            hasSub: !!user.sub,
            keys: Object.keys(user),
        });
    }
    if (user && !user.id && user.sub) {
        console.log('[CurrentUser] Setting user.id from user.sub:', user.sub);
        user.id = user.sub;
    }
    if (user && !user.id) {
        console.error('[CurrentUser] User object exists but has no id property!');
        console.error('[CurrentUser] User object:', JSON.stringify(user, null, 2));
        console.error('[CurrentUser] User object type:', typeof user);
        console.error('[CurrentUser] User object keys:', Object.keys(user || {}));
    }
    return user;
});
//# sourceMappingURL=current-user.decorator.js.map