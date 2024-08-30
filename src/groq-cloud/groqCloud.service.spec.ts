import { Test, TestingModule } from '@nestjs/testing';
import { GroqCloudService } from './groqCloud.service';

describe('GroqCloudService', () => {
  let service: GroqCloudService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroqCloudService],
    }).compile();

    service = module.get<GroqCloudService>(GroqCloudService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
