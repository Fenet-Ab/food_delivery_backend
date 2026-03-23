import { Controller, Post, Body, Get, UseGuards, Req, Param, Patch } from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CreateSupportDto, ReplySupportDto } from './dto/create-support.dto';

@Controller('support')
export class SupportController {
  constructor(private supportService: SupportService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() dto: CreateSupportDto) {
    return this.supportService.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-messages')
  getUserMessages(@Req() req) {
    return this.supportService.findUserMessages(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  getAllMessages() {
    return this.supportService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/reply')
  reply(@Param('id') id: string, @Body() dto: ReplySupportDto) {
    return this.supportService.reply(id, dto);
  }
}
