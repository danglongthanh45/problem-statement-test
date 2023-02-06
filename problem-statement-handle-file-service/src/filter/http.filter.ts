import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter
{
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse(),
            request = ctx.getRequest(),
            statusCode = exception.getStatus();
        
        return response.status(statusCode).json({
            status: statusCode,
            //createdBy: "HttpExceptionFilter",
            message: exception.message
        })
        
    }
}