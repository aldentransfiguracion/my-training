import { ByuAccountType, Prisma } from '../../prisma/client';
import { faker } from '@faker-js/faker';
import { Permission, Role } from '../../src/security';

type ByuAccount = {
  accountType: ByuAccountType;
  netId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  preferredFirstName: string;
  preferredLastName: string;
  byuId?: string;
  workerId?: string;
};

function generateDummyAccountData(accountType: ByuAccountType): ByuAccount {
  const base = {
    firstName: faker.person.firstName(),
    middleName: faker.person.middleName(),
    lastName: faker.person.lastName(),
    suffix: faker.person.suffix(),
    byuId: accountType === 'NonByu' ? undefined : faker.finance.accountNumber(9),
    accountType,
  };
  return {
    ...base,
    netId: `${base.firstName.toLowerCase()}${faker.number.int(100)}dummy`,
    preferredFirstName: base.firstName,
    preferredLastName: base.lastName,
    workerId: accountType === 'Employee' ? base.byuId : undefined,
  };
}

function getRandomAccountType() {
  const accountTypes = Object.values(ByuAccountType);
  return accountTypes[faker.number.int(accountTypes.length - 1)];
}

export default function generateDummyUserData(opts?: {
  accountType?: ByuAccountType;
  roles?: Role[];
  permissions?: Permission[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLogin?: Date | string | null;
}): Prisma.UserCreateInput {
  const acct = generateDummyAccountData(opts?.accountType ?? getRandomAccountType());
  return {
    ...acct,
    createdAt: opts?.createdAt ?? faker.date.past(),
    updatedAt: opts?.updatedAt ?? faker.date.recent(),
    lastLogin: opts?.lastLogin ?? faker.date.past(),
    roles: opts?.roles ?? [],
    permissions: opts?.permissions ?? [],
  };
}