import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MainDto } from './dto/MainDto';
import { SemnaturaMdService } from './semnatura.md.service';

@ApiTags('Semnatura.md')
@Controller('semnatura.md')
export class SemnaturaMdController {

    constructor(private readonly service : SemnaturaMdService){}
    
    @Post()
    @ApiOperation({ summary: 'Scrape job listings' })
    @ApiResponse({ status: 200, description: 'Scrapes job listings', type: [MainDto] })
    @ApiResponse({ status: 404, description: 'Error occurred while scraping' })
    async getDataSE(@Body() mainDto: MainDto) {
      try {
        const result = await this.service.scrapeJobListings(mainDto);
        console.log(result);
        return result;
      } catch (error) {
        throw new NotFoundException(`An error occurred while scraping job listings: ${error.message}`);
      }
    }
}
