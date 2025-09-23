
import type {Config} from 'jest';
import { TS_EXT_TO_TREAT_AS_ESM, ESM_TS_TRANSFORM_PATTERN } from 'ts-jest'

const config: Config = {
	extensionsToTreatAsEsm: [...TS_EXT_TO_TREAT_AS_ESM],
	// preset: "ts-jest",
	testRegex: "test/(.+)\\.test\\.(tsx?)$",
	transform: {
		[ESM_TS_TRANSFORM_PATTERN]: [
			'ts-jest',
			{
				useESM: true,
			},
		],
	},
};

export default config;
