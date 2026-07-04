import { ServiceUnavailableException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { PrismaService } from './prisma.service';

const disabledPrisma = {
  enabled: false,
  get db(): never {
    throw new ServiceUnavailableException(
      'Report history is not configured on this server.',
    );
  },
} as unknown as PrismaService;

const prismaWith = (report: {
  create?: jest.Mock;
  findMany?: jest.Mock;
  findUnique?: jest.Mock;
}) =>
  ({
    enabled: true,
    db: { report },
  }) as unknown as PrismaService;

describe('ReportsService', () => {
  describe('when history is not configured', () => {
    const service = new ReportsService(disabledPrisma);

    it('save() is a silent no-op returning null', async () => {
      await expect(
        service.save('github', 'octocat', { a: 1 }, 70),
      ).resolves.toBeNull();
    });

    it('list() and get() surface a 503', async () => {
      await expect(service.list()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
      await expect(service.get('x')).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });

  it('save() returns the created id and rounds the score', async () => {
    const create = jest.fn((args: { data: Record<string, unknown> }) => {
      void args;
      return Promise.resolve({ id: 'r1' });
    });
    const service = new ReportsService(prismaWith({ create }));

    const id = await service.save('cv', 'resume.pdf', { ok: true }, 71.6);

    expect(id).toBe('r1');
    expect(create.mock.calls[0][0].data).toMatchObject({
      source: 'cv',
      subject: 'resume.pdf',
      overallScore: 72,
    });
  });

  it('save() swallows database errors — analyses must never fail on history', async () => {
    const create = jest.fn().mockRejectedValue(new Error('db down'));
    const service = new ReportsService(prismaWith({ create }));

    await expect(service.save('github', 'octocat', {})).resolves.toBeNull();
  });

  it('get() maps a missing row to 404', async () => {
    const findUnique = jest.fn().mockResolvedValue(null);
    const service = new ReportsService(prismaWith({ findUnique }));

    await expect(service.get('missing')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('list() serializes dates and narrows the source type', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'r1',
        source: 'github',
        subject: 'octocat',
        overallScore: 70,
        createdAt: new Date('2026-07-01T00:00:00.000Z'),
      },
    ]);
    const service = new ReportsService(prismaWith({ findMany }));

    const reports = await service.list();

    expect(reports).toEqual([
      {
        id: 'r1',
        source: 'github',
        subject: 'octocat',
        overallScore: 70,
        createdAt: '2026-07-01T00:00:00.000Z',
      },
    ]);
  });
});
