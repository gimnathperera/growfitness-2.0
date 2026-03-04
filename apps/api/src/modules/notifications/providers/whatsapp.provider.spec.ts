import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WhatsAppProvider } from './whatsapp.provider';

const mockTwilioMessagesCreate = jest.fn();

jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: mockTwilioMessagesCreate,
    },
  })),
}));

describe('WhatsAppProvider', () => {
  let provider: WhatsAppProvider;
  let configGet: jest.Mock;

  function createModule(config: Record<string, string>) {
    configGet = jest.fn((key: string, defaultValue?: string) => config[key] ?? defaultValue ?? '');
    return Test.createTestingModule({
      providers: [
        WhatsAppProvider,
        {
          provide: ConfigService,
          useValue: { get: configGet },
        },
      ],
    }).compile();
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when WhatsApp is disabled', () => {
    beforeEach(async () => {
      const module: TestingModule = await createModule({
        WHATSAPP_ENABLED: 'false',
      });
      provider = module.get<WhatsAppProvider>(WhatsAppProvider);
    });

    it('should be defined', () => {
      expect(provider).toBeDefined();
    });

    it('send does not call Twilio and does not throw', async () => {
      await provider.send({ to: '+94771234567', message: 'Hi' });
      expect(mockTwilioMessagesCreate).not.toHaveBeenCalled();
    });
  });

  describe('when config is incomplete', () => {
    beforeEach(async () => {
      const module: TestingModule = await createModule({
        WHATSAPP_ENABLED: 'true',
        TWILIO_ACCOUNT_SID: '',
        TWILIO_AUTH_TOKEN: '',
        TWILIO_WHATSAPP_FROM: '',
      });
      provider = module.get<WhatsAppProvider>(WhatsAppProvider);
    });

    it('send mocks (logs) and does not call Twilio', async () => {
      await provider.send({ to: '+94771234567', message: 'Hi' });
      expect(mockTwilioMessagesCreate).not.toHaveBeenCalled();
    });
  });

  describe('when phone is invalid', () => {
    beforeEach(async () => {
      const module: TestingModule = await createModule({
        WHATSAPP_ENABLED: 'true',
        TWILIO_ACCOUNT_SID: 'sid',
        TWILIO_AUTH_TOKEN: 'token',
        TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886',
      });
      provider = module.get<WhatsAppProvider>(WhatsAppProvider);
    });

    it('send skips and does not call Twilio for empty phone', async () => {
      await provider.send({ to: '', message: 'Hi' });
      expect(mockTwilioMessagesCreate).not.toHaveBeenCalled();
    });

    it('send skips for invalid phone', async () => {
      await provider.send({ to: 'abc', message: 'Hi' });
      expect(mockTwilioMessagesCreate).not.toHaveBeenCalled();
    });
  });

  describe('when enabled and configured', () => {
    beforeEach(async () => {
      const module: TestingModule = await createModule({
        WHATSAPP_ENABLED: 'true',
        TWILIO_ACCOUNT_SID: 'sid',
        TWILIO_AUTH_TOKEN: 'token',
        TWILIO_WHATSAPP_FROM: 'whatsapp:+14155238886',
      });
      provider = module.get<WhatsAppProvider>(WhatsAppProvider);
    });

    it('send calls Twilio with correct params', async () => {
      mockTwilioMessagesCreate.mockResolvedValue({ sid: 'SM123' });
      await provider.send({ to: '+94771234567', message: 'Hello' });
      expect(mockTwilioMessagesCreate).toHaveBeenCalledTimes(1);
      expect(mockTwilioMessagesCreate).toHaveBeenCalledWith({
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+94771234567',
        body: 'Hello',
      });
    });

    it('send rethrows on Twilio API error', async () => {
      mockTwilioMessagesCreate.mockRejectedValue(new Error('Twilio error'));
      await expect(
        provider.send({ to: '+94771234567', message: 'Hi' })
      ).rejects.toThrow('Twilio error');
    });
  });
});
