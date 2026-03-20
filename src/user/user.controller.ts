import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly cloudinaryService: CloudinaryService

  ) { }


  @UseGuards(JwtAuthGuard)
  @Get('get-all-users')
  async findAll() {
    console.log("Admin fetching all users...");
    const users = await this.userService.findUsers();
    console.log(`Found ${users.length} users.`);
    return users;
  }




  // }
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: string) {
    return this.userService.updateRole(id, role);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Request() req,
    @Body('name') name?: string,
    @Body('email') email?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log(`Update request received for user ${req.user.id}:`, { name, email, file: !!file });
    let imageUrl;
    if (file) {
      const uploaded: any = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploaded?.secure_url || uploaded?.url;
      console.log(`Setting image URL to database: ${imageUrl}`);
    }
    const updatedUser = await this.userService.updateProfile(req.user.id, name, email, imageUrl);
    return {
      updatedUser,
      message: "profile updated successfully"
    };
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    const profileData = await this.userService.findProfile(req.user.id)
    return {
      profileData: profileData,
      message: "profile found successfully"
    }

  }
  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteProfile(@Request() req) {
    const log = await this.userService.deleteProfile(req.user.id);
    return {
      log: log,
      message: "profile deleted successfully"
    };
  }

}
