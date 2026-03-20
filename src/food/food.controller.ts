import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FoodService } from './food.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('food')
export class FoodController {
  constructor(
    private readonly foodService: FoodService,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createFoodDto: CreateFoodDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    console.log("Admin creating food:", createFoodDto);
    let imageUrl = '';
    if (file) {
      const result: any = await this.cloudinaryService.uploadImage(file);
      imageUrl = result.secure_url || result.url;
    }
    const food = await this.foodService.create({ ...createFoodDto, image: imageUrl });
    return {
      food,
      message: "food created successfully"
    };
  }

  @Get()
  async findAll() {
    const list = await this.foodService.findAll();
    return {
      list,
      message: "food list fetched successfully"
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateFoodDto: UpdateFoodDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl = updateFoodDto.image;
    if (file) {
      const result: any = await this.cloudinaryService.uploadImage(file);
      imageUrl = result.secure_url || result.url;
    }
    const updated = await this.foodService.updateFood(id, { ...updateFoodDto, image: imageUrl });
    return {
      updated,
      message: "food updated successfully"
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    await this.foodService.remove(id);
    return {
      message: "food deleted successfully"
    };
  }
}
