import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";
import { AuthService } from "../auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest<Request>();

    const token = this.extractToken(request);
    request.user = await this.authService.validateAccessToekn(token);
    return true;
  }

  protected extractToken(request: Request) {
    const { authorization } = request.headers;

    if (!authorization || authorization?.trim() == "")
      throw new UnauthorizedException("Not Logged in");

    const [bearer, token] = authorization.split(" ");
    if (bearer?.toLowerCase() !== "bearer" || !token || !isJWT(token))
      throw new UnauthorizedException("Not Logged in");

    return token;
  }
}

// authorization format
// {
//     authorization : "bearer kjasdklf.sdfsadlkfj.sdf"
// }
