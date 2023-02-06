import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
// import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
// import { Observable } from 'rxjs';
import { ImportStatus } from 'src/constant/type';
import { ImportHistory } from 'src/db/history-import.entity';
import AuthUser from 'src/decorators/auth-user.decorator';
import { ImportHistoryDto } from './dto/import-history.dto';
import { ImportHistoryService } from './import-history.service';

@Controller('api/import-history')
export class ImportHistoryController {
  constructor(private readonly importHistoryService: ImportHistoryService) {}

  @Post('create')
  createImportHistory(@Body() history: ImportHistoryDto): Promise<ImportHistory> {
    console.log('createImportHistory');
    return this.importHistoryService.create(history);
  }

  @Put(':id')
  updateStatus(@Param('id') id: string, status: ImportStatus): Promise<ImportHistory> {
    return this.importHistoryService.update(id, status);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  getAllHistory(
    @AuthUser() userId: number,
  ) {
    return this.importHistoryService.getAllHistoryByUser(userId);
  }
}