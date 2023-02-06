import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";

@Catch()
export class FallbackExceptionFilter implements ExceptionFilter
{
    catch(exception: any, host: ArgumentsHost) {
        
        const ctx = host.switchToHttp(),
            reponse = ctx.getResponse();
        return reponse.status(500).json({
            statusCode: 500,
            //createdBy: "FallbackExceptionFilter",
            message: exception.message ? exception.message : 'Error ocurred'
        })
    }
}