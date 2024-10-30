import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { FileService } from './file.service';
import { Response } from 'express';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('file')
export class FileController {

    constructor(
        private readonly fileService: FileService
    ) {}

    @Get('download/:filename')
    @ApiOperation({ summary: 'Get PDF by IDNP or predate by filename or contracte by codPachet' })
    @ApiResponse({ status: 200, description: 'Returns PDF file' })
    @ApiResponse({ status: 404, description: 'File not found' })
    @ApiParam({ name: 'filename', })
    async getPdf(
        @Param('filename') filename: string,
        @Res() res: Response
    ){
        try {
            const pdfBuffer = await this.fileService.getContractFile(filename);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline`);
            res.end(pdfBuffer);
        } catch (error) {
            throw new NotFoundException(`File not found: ${error.message}`);
        }
    }
}
