import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { companiesMocks } from '../companies/companies.mock';
import { userMocks } from '../users/users.mock';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockNotificationsRepository;
  let mockChannelsRepository;
  let mockHistoriesRepository;
  let mockUsersService;
  let mockCompaniesService;

  const USER_ALICE = '66937a17575c29023a09a8e1';
  const USER_BOB = '66937a17575c29023a09a8e2';
  const USER_CHARLIE = '66937a17575c29023a09a8e3';
  const USER_DAVID = '66937a17575c29023a09a8e4';
  const USER_ESTHER = '66937a17575c29023a09a8e5';
  const COMPANY_ACME = '66937d42575c29023a09a8e6';

  beforeEach(async () => {
    mockNotificationsRepository = {
      findOneByType: jest.fn(),
    };
    mockChannelsRepository = {
      findAll: jest.fn(),
    };
    mockHistoriesRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
    };
    mockUsersService = {
      findOne: jest.fn(),
    };
    mockCompaniesService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: 'NotificationsRepositoryInterface',
          useValue: mockNotificationsRepository,
        },
        {
          provide: 'ChannelsRepositoryInterface',
          useValue: mockChannelsRepository,
        },
        {
          provide: 'HistoriesRepositoryInterface',
          useValue: mockHistoriesRepository,
        },
        { provide: 'UsersServiceInterface', useValue: mockUsersService },
        {
          provide: 'CompaniesServiceInterface',
          useValue: mockCompaniesService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHistories', () => {
    it('should return histories for a user', async () => {
      const userId = USER_ALICE;
      const mockHistories = [{ id: 'history1' }, { id: 'history2' }];
      mockHistoriesRepository.findAll.mockResolvedValue(mockHistories);

      const result = await service.getHistories(userId);

      expect(result).toEqual(mockHistories);
      expect(mockHistoriesRepository.findAll).toHaveBeenCalledWith(userId);
    });
  });

  describe('create', () => {
    let userId = USER_ALICE;
    let companyId = COMPANY_ACME;
    let notificationType = 'happy-birthday';

    beforeEach(() => {
      jest.clearAllMocks();
      mockUsersService.findOne.mockReturnValue(userMocks[0]);
      mockCompaniesService.findOne.mockReturnValue(companiesMocks[0]);
      mockNotificationsRepository.findOneByType.mockResolvedValue({
        channels: [],
      });
      mockChannelsRepository.findAll.mockResolvedValue([]);
    });

    it('should throw an exception if user is not found', async () => {
      mockUsersService.findOne.mockReturnValue(null);

      await expect(
        service.create(userId, companyId, notificationType),
      ).rejects.toThrow(
        new HttpException('user not found', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an exception if company is not found', async () => {
      mockCompaniesService.findOne.mockReturnValue(null);

      await expect(
        service.create(userId, companyId, notificationType),
      ).rejects.toThrow(
        new HttpException('company not found', HttpStatus.BAD_REQUEST),
      );
    });

    it('should throw an exception if notification type is not found', async () => {
      mockNotificationsRepository.findOneByType.mockResolvedValue(null);

      await expect(
        service.create(userId, companyId, notificationType),
      ).rejects.toThrow(
        new HttpException(
          'notification type not found',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an exception if no matching channels are found', async () => {
      mockNotificationsRepository.findOneByType.mockResolvedValue({
        channels: [],
      });

      await expect(
        service.create(userId, companyId, notificationType),
      ).rejects.toThrow(
        new HttpException(
          'user and company not subscribed to channels for this notification',
          HttpStatus.UNPROCESSABLE_ENTITY,
        ),
      );
    });

    describe('happy birthday notification', () => {
      notificationType = 'happy-birthday';
      const mockNotification = {
        _id: '66937c6a575c29023a09b7f1',
        type: 'happy-birthday',
        channels: [
          { _id: '66937c6a575c29023a09a8e1' },
          { _id: '66937c6a575c29023a09a8e2' },
        ],
      };
      const spyLog = jest.spyOn(console, 'log');

      it('should create email & ui-only notification for Alice', async () => {
        userId = USER_ALICE;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e1', type: 'email' },
          { _id: '66937c6a575c29023a09a8e2', type: 'ui-only' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[0]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(2);
      });

      it('should only create email notification for Bob', async () => {
        userId = USER_BOB;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e1', type: 'email' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[1]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(1);
      });

      it('should only create ui-only notification for Charlie', async () => {
        userId = USER_CHARLIE;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e2', type: 'ui-only' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[2]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(1);
      });

      it('should not create notification for David', async () => {
        userId = USER_DAVID;
        const mockChannel = [];

        mockUsersService.findOne.mockReturnValue(userMocks[3]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(0);
      });

      it('should create email & ui-only notification using company config for Esther', async () => {
        userId = USER_ESTHER;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e1', type: 'email' },
          { _id: '66937c6a575c29023a09a8e2', type: 'ui-only' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[4]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(2);
      });
    });

    describe('monthly payslip notification', () => {
      notificationType = 'monthly-payslip';
      const mockNotification = {
        _id: '66937c6a575c29023a09b7f2',
        type: 'monthly-payslip',
        channels: [{ _id: '66937c6a575c29023a09a8e1' }],
      };
      const spyLog = jest.spyOn(console, 'log');

      it('should create email notification for Alice', async () => {
        userId = USER_ALICE;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e1', type: 'email' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[0]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(1);
      });

      it('should create email notification for Bob', async () => {
        userId = USER_BOB;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e1', type: 'email' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[1]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(1);
      });

      it('should not create email notification for Charlie', async () => {
        userId = USER_CHARLIE;
        const mockChannel = [];

        mockUsersService.findOne.mockReturnValue(userMocks[2]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(0);
      });

      it('should not create email notification for David', async () => {
        userId = USER_DAVID;
        const mockChannel = [];

        mockUsersService.findOne.mockReturnValue(userMocks[3]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(0);
      });

      it('should create email notification using company config for Esther', async () => {
        userId = USER_ESTHER;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e1', type: 'email' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[4]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(1);
      });
    });

    describe('leave balance reminder notification', () => {
      const notificationType = 'leave-balance-reminder';
      const mockNotification = {
        _id: '66937c6a575c29023a09b7f3',
        type: 'leave-balance-reminder',
        channels: [{ _id: '66937c6a575c29023a09a8e2' }],
      };
      const spyLog = jest.spyOn(console, 'log');

      it('should create ui-only notification for Alice', async () => {
        userId = USER_ALICE;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e2', type: 'ui-only' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[0]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(1);
      });

      it('should not create ui-only notification for Bob', async () => {
        userId = USER_BOB;
        const mockChannel = [];

        mockUsersService.findOne.mockReturnValue(userMocks[1]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(0);
      });

      it('should create ui-only notification for Charlie', async () => {
        userId = USER_CHARLIE;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e2', type: 'ui-only' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[2]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(1);
      });

      it('should not create ui-only notification for David', async () => {
        userId = USER_DAVID;
        const mockChannel = [];

        mockUsersService.findOne.mockReturnValue(userMocks[3]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(0);
      });

      it('should create ui-only notification using company config for Esther', async () => {
        userId = USER_ESTHER;
        const mockChannel = [
          { _id: '66937c6a575c29023a09a8e2', type: 'ui-only' },
        ];

        mockUsersService.findOne.mockReturnValue(userMocks[4]);
        mockNotificationsRepository.findOneByType.mockResolvedValue(
          mockNotification,
        );
        mockChannelsRepository.findAll.mockResolvedValue(mockChannel);
        mockHistoriesRepository.create.mockResolvedValue({});

        await expect(
          service.create(userId, companyId, notificationType),
        ).resolves.not.toThrow();
        expect(spyLog).toHaveBeenCalledTimes(1);
      });
    });
  });
});
