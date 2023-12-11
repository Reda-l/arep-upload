import { Test, TestingModule } from '@nestjs/testing';
import { BunnycdnService } from './bunnycdn.service';

describe('BunnycdnService', () => {
  let service: BunnycdnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BunnycdnService],
    }).compile();

    service = module.get<BunnycdnService>(BunnycdnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
