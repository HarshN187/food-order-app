import { SetMetadata } from '@nestjs/common';

export const COUNTRY_SCOPED_KEY = 'country_scoped';
export const CountryScoped = () => SetMetadata(COUNTRY_SCOPED_KEY, true);
