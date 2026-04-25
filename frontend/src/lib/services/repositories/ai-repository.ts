import { IHttpClient } from "../index"

export interface ChatRequestDto {
  message: string
  context?: string
}

export interface ChatResponseDto {
  reply?: string
  message?: string
}

export interface IAiRepository {
  chat(data: ChatRequestDto): Promise<ChatResponseDto>
}

export class AiRepository implements IAiRepository {
  constructor(private httpClient: IHttpClient) {}

  async chat(data: ChatRequestDto): Promise<ChatResponseDto> {
    const res = await this.httpClient.post<ChatResponseDto>('/ai/chat', data)
    return res.data
  }
}

let aiRepositoryInstance: IAiRepository | null = null;

export function getAiRepository(httpClient: IHttpClient): IAiRepository {
  if (!aiRepositoryInstance) {
    aiRepositoryInstance = new AiRepository(httpClient);
  }
  return aiRepositoryInstance;
}

export function setAiRepository(repository: IAiRepository): void {
  aiRepositoryInstance = repository;
}
